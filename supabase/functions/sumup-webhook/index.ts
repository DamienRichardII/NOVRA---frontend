/* =========================================================================
   NOVRA — Notification SumUp

   SumUp ne signe pas ses appels : n'importe qui peut frapper cette adresse.
   Le corps reçu n'est donc JAMAIS une preuve de paiement. Il ne sert qu'à
   apprendre quel checkout a bougé ; la vérité est ensuite demandée à SumUp
   par un appel serveur à GET /checkouts/{id}, avec notre clé secrète.

   Tout est journalisé dans payment_events avant traitement, pour pouvoir
   comprendre après coup ce qui s'est passé.
   ========================================================================= */

import { createClient } from 'npm:@supabase/supabase-js@^2';
import { getCheckout, transactionOf, SumUpError } from '../_shared/sumup.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

/* SumUp envoie l'identifiant sous des noms différents selon l'événement.
   On accepte les formes connues plutôt que d'en supposer une seule. */
function extractCheckoutId(body: any, url: URL): string | null {
  const candidates = [
    body?.id, body?.checkout_id, body?.checkoutId,
    body?.payload?.id, body?.payload?.checkout_id,
    body?.data?.id, body?.data?.checkout_id,
    body?.resource_id, body?.object?.id,
    url.searchParams.get('checkout_id'), url.searchParams.get('id')
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(c)) return c;
  }
  return null;
}

function extractReference(body: any): string | null {
  const r = body?.checkout_reference ?? body?.payload?.checkout_reference ?? body?.reference;
  return typeof r === 'string' ? r : null;
}

Deno.serve(async (req) => {
  /* SumUp n'attend qu'un accusé de réception. On répond 200 dans presque
     tous les cas : renvoyer une erreur pousserait SumUp à réessayer alors
     que le problème vient parfois de nous. Les seules erreurs renvoyées
     sont celles qu'un nouvel essai peut résoudre. */
  const url = new URL(req.url);
  let body: any = {};

  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    body = {};
  }

  const checkoutId = extractCheckoutId(body, url);
  const eventType = body?.event_type ?? body?.type ?? null;

  const { data: event } = await db.from('payment_events').insert({
    provider: 'sumup',
    provider_event_type: eventType,
    provider_checkout_id: checkoutId,
    payload: body ?? {}
  }).select('id').single();

  const finish = async (patch: Record<string, unknown>, status = 200) => {
    if (event?.id) await db.from('payment_events').update({ processed_at: new Date().toISOString(), ...patch }).eq('id', event.id);
    return new Response(JSON.stringify({ received: true }), {
      status, headers: { 'Content-Type': 'application/json' }
    });
  };

  if (!checkoutId) {
    /* Sans identifiant, on ne peut rien vérifier. On garde la trace et on
       accuse réception : réessayer ne changerait rien. */
    console.warn('sumup-webhook : aucun identifiant de checkout', JSON.stringify({ eventType, reference: extractReference(body) }));
    return await finish({ error: 'identifiant de checkout absent' });
  }

  /* ------------------ La seule preuve : l'API SumUp --------------------- */
  let verified;
  try {
    verified = await getCheckout(checkoutId);
  } catch (e) {
    const detail = e instanceof SumUpError ? { status: e.status, detail: e.detail } : String(e);
    console.error('sumup-webhook : vérification impossible', JSON.stringify({ checkoutId, detail }));
    /* Panne passagère chez SumUp : on demande un nouvel essai. */
    return await finish({ error: 'vérification impossible' }, 503);
  }

  const tx = transactionOf(verified);

  const { data: result, error } = await db.rpc('apply_payment_result', {
    p_checkout_id: checkoutId,
    p_verified_status: verified.status,
    p_transaction_code: tx.code,
    p_transaction_id: tx.id,
    p_failure_reason: verified.status === 'FAILED' ? (tx.status ?? 'refusé par la banque') : null
  });

  if (error) {
    console.error('sumup-webhook : application impossible', JSON.stringify({ checkoutId, error: error.message }));
    return await finish({ verified_status: verified.status, error: error.message }, 500);
  }

  /* L'événement est rattaché à la commande pour que le diagnostic parte
     d'un paiement et non d'un identifiant SumUp isolé. */
  const { data: order } = await db.from('orders')
    .select('id').eq('sumup_checkout_id', checkoutId).maybeSingle();

  console.log('sumup-webhook', JSON.stringify({ checkoutId, status: verified.status, result }));

  return await finish({
    verified_status: verified.status,
    order_id: order?.id ?? null,
    error: (result as any)?.ok === false ? (result as any)?.reason : null
  });
});
