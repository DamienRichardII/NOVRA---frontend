/* =========================================================================
   NOVRA — Service SumUp

   Un seul endroit parle à SumUp. La clé secrète ne sort jamais d'ici et
   n'apparaît dans aucun journal : les erreurs remontées au navigateur sont
   volontairement génériques.

   Particularités de SumUp, qui expliquent la forme de ce fichier :
     • les montants sont en unités MAJEURES (10.10 = dix euros dix), là où
       nous travaillons en centiers entiers en interne ;
     • il n'y a pas de signature de webhook — la seule preuve de paiement est
       un appel serveur à GET /checkouts/{id} ;
     • return_url est l'adresse serveur notifiée, redirect_url celle où le
       payeur atterrit. Les deux ne se confondent pas.
   ========================================================================= */

const API = 'https://api.sumup.com/v0.1';
const TIMEOUT_MS = 15000;

export type SumUpStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export interface SumUpCheckout {
  id: string;
  checkout_reference: string;
  status: SumUpStatus;
  amount: number;
  currency: string;
  hosted_checkout_url?: string;
  transactions?: Array<{
    id?: string;
    transaction_code?: string;
    status?: string;
    amount?: number;
  }>;
}

export class SumUpError extends Error {
  constructor(message: string, readonly status: number, readonly detail?: unknown) {
    super(message);
    this.name = 'SumUpError';
  }
}

function apiKey(): string {
  const key = Deno.env.get('SUMUP_API_KEY');
  if (!key) throw new SumUpError('SUMUP_API_KEY absente de la configuration serveur.', 500);
  return key;
}

/* Un appel qui ne répond pas doit échouer franchement plutôt que de laisser
   le client attendre indéfiniment devant un bouton bloqué. */
async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(API + path, {
      ...init,
      signal: controller.signal,
      headers: {
        'Authorization': 'Bearer ' + apiKey(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(init.headers ?? {})
      }
    });
  } catch (e) {
    clearTimeout(timer);
    const aborted = (e as Error).name === 'AbortError';
    throw new SumUpError(aborted ? 'SumUp n\'a pas répondu à temps.' : 'SumUp est injoignable.', 504);
  }
  clearTimeout(timer);

  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  if (!response.ok) {
    /* Le corps de l'erreur est conservé pour le journal serveur, jamais
       renvoyé tel quel au navigateur : il peut contenir des détails de
       compte qui ne regardent pas le client. */
    throw new SumUpError('SumUp a refusé la requête.', response.status, body);
  }
  return body as T;
}

/* Centimes -> unités majeures. On arrondit à deux décimales et on repasse par
   un nombre : SumUp refuse les chaînes. Jamais de flottant dans le calcul
   métier, uniquement à cette frontière. */
export function centsToMajor(cents: number): number {
  return Math.round(cents) / 100;
}

export function majorToCents(amount: number): number {
  return Math.round(Number(amount) * 100);
}

export async function createCheckout(input: {
  reference: string;
  amountCents: number;
  currency?: string;
  description: string;
  returnUrl: string;    // notification serveur
  redirectUrl: string;  // retour du payeur dans son navigateur
  customerEmail?: string;
}): Promise<SumUpCheckout> {
  const merchant = Deno.env.get('SUMUP_MERCHANT_CODE');
  if (!merchant) throw new SumUpError('SUMUP_MERCHANT_CODE absent de la configuration serveur.', 500);

  /* La référence sert à retrouver la commande dans les outils SumUp :
     elle est limitée à 64 caractères à la création. */
  const reference = input.reference.slice(0, 64);

  return await call<SumUpCheckout>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      checkout_reference: reference,
      amount: centsToMajor(input.amountCents),
      currency: input.currency ?? 'EUR',
      merchant_code: merchant,
      description: input.description.slice(0, 100),
      pay_to_email: undefined,
      return_url: input.returnUrl,
      redirect_url: input.redirectUrl,
      hosted_checkout: { enabled: true }
    })
  });
}

/* La seule source de vérité sur un paiement. Le webhook ne prouve rien :
   n'importe qui peut appeler notre adresse de callback. */
export async function getCheckout(checkoutId: string): Promise<SumUpCheckout> {
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(checkoutId)) {
    throw new SumUpError('Identifiant de checkout invalide.', 400);
  }
  return await call<SumUpCheckout>('/checkouts/' + encodeURIComponent(checkoutId));
}

/* Le code de transaction n'existe qu'une fois le paiement abouti. */
export function transactionOf(checkout: SumUpCheckout) {
  const list = checkout.transactions ?? [];
  const success = list.find((t) => t.status === 'SUCCESSFUL') ?? list[list.length - 1];
  return {
    code: success?.transaction_code ?? null,
    id: success?.id ?? null,
    status: success?.status ?? null
  };
}
