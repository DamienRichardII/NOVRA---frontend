/* =========================================================================
   NOVRA — Réception des événements Stripe

   C'est Stripe, et lui seul, qui fait foi sur le paiement. Le retour du
   navigateur ne prouve rien : un client peut fermer l'onglet avant d'être
   redirigé, ou forger l'adresse de confirmation. La commande n'est donc
   marquée payée qu'ici, après vérification de la signature.

   Variables d'environnement attendues :
     STRIPE_SECRET_KEY              — clé secrète Stripe
     STRIPE_WEBHOOK_SIGNING_SECRET  — secret de signature du webhook (whsec_…)
   ========================================================================= */

import Stripe from 'npm:stripe@^22';
import { createClient } from 'npm:@supabase/supabase-js@^2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');
/* Deno impose l'API Web Crypto : la vérification doit être asynchrone. */
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

async function logEvent(action: string, entityId: string | null, detail: unknown) {
  try {
    await db.from('activity_log').insert({
      actor_email: 'stripe@webhook', action, entity: 'orders',
      entity_id: entityId, detail: detail as never
    });
  } catch { /* le journal ne doit jamais faire échouer un paiement */ }
}

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  if (!signature) return new Response('Signature absente.', { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    );
  } catch (e) {
    /* Signature invalide : la requête ne vient pas de Stripe. */
    console.error('Signature refusée', (e as Error).message);
    return new Response('Signature invalide.', { status: 400 });
  }

  try {
    switch (event.type) {

      /* ---------------- Paiement abouti : la commande est ferme --------- */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        /* Un paiement différé (virement, SEPA) reste en attente : on ne
           décrémente le stock qu'une fois les fonds confirmés. */
        if (session.payment_status !== 'paid') {
          await logEvent('stripe_pending', null, { session: session.id, status: session.payment_status });
          break;
        }

        const { data, error } = await db.rpc('mark_order_paid', {
          p_session_id: session.id,
          p_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          p_customer_name: session.customer_details?.name ?? null,
          p_customer_phone: session.customer_details?.phone ?? null
        });

        if (error) {
          console.error('mark_order_paid', error);
          /* On renvoie une erreur : Stripe réessaiera. */
          return new Response('Traitement impossible.', { status: 500 });
        }
        await logEvent('stripe_paid', session.id, data);
        break;
      }

      /* -------- Paiement différé finalement encaissé (SEPA, virement) --- */
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { data, error } = await db.rpc('mark_order_paid', {
          p_session_id: session.id,
          p_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          p_customer_name: session.customer_details?.name ?? null,
          p_customer_phone: session.customer_details?.phone ?? null
        });
        if (error) return new Response('Traitement impossible.', { status: 500 });
        await logEvent('stripe_paid', session.id, data);
        break;
      }

      /* ------------- Abandon, expiration ou échec : on annule ----------- */
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await db.rpc('cancel_pending_order', { p_session_id: session.id });
        await logEvent('stripe_cancelled', session.id, { type: event.type });
        break;
      }

      /* ------------------------- Remboursement ------------------------- */
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
        if (pi) {
          await db.from('orders')
            .update({ status: charge.amount_refunded >= charge.amount ? 'refunded' : 'paid' })
            .eq('stripe_payment_intent', pi);
          await logEvent('stripe_refunded', pi, { amount: charge.amount_refunded });
        }
        break;
      }

      default:
        /* Les autres événements sont acceptés sans traitement : Stripe ne
           doit pas les rejouer indéfiniment. */
        break;
    }
  } catch (e) {
    console.error('Webhook', event.type, e);
    return new Response('Erreur interne.', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
