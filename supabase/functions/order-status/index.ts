/* =========================================================================
   NOVRA — Consultation d'une commande par le client

   Deux façons d'y accéder, toutes deux sans compte :
     • ?ref=NVR-…&t=<jeton>               au retour du paiement SumUp
     • ?reference=NVR-…&email=…           depuis la page de suivi

   Le jeton est tiré de 24 octets aléatoires : il n'est pas devinable et
   n'ouvre que la commande à laquelle il appartient.

   La table orders reste fermée au visiteur anonyme, et c'est voulu. Cette
   fonction ne renvoie que la commande demandée, sans identifiant interne et
   avec l'adresse e-mail partiellement masquée : la page peut être rouverte
   depuis un historique de navigation ou un lien transféré.
   ========================================================================= */

import { createClient } from 'npm:@supabase/supabase-js@^2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const SELECT =
  'id, reference, status, fulfilment, subtotal, shipping, discount, total, promo_code, ' +
  'shipping_method, payment_method, carrier, tracking_number, tracking_url, email, address, ' +
  'created_at, paid_at, shipped_at, ready_at, completed_at, payment_failed_at, payment_expired_at, ' +
  'order_items(product_name, color, size, qty, unit_price, line_total)';

function maskEmail(value: string) {
  const [user, domain] = String(value).split('@');
  if (!domain) return '';
  return user.slice(0, 2) + '•'.repeat(Math.max(1, user.length - 2)) + '@' + domain;
}

/* L'adresse complète n'est renvoyée qu'au retour direct du paiement : c'est
   le seul moment où l'on est certain d'avoir le client devant l'écran. */
function trimAddress(address: any, full: boolean) {
  if (!address) return null;
  if (full) return address;
  return { city: address.city ?? null, zip: address.zip ?? null, country: address.country ?? null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const params = new URL(req.url).searchParams;
  const token = (params.get('t') ?? '').trim();
  const ref = (params.get('ref') ?? '').trim().toUpperCase();
  const reference = (params.get('reference') ?? '').trim().toUpperCase();
  const email = (params.get('email') ?? '').trim().toLowerCase();

  let query = db.from('orders').select(SELECT);
  let fullAddress = false;

  if (token && ref) {
    /* Retour de paiement : le jeton fait foi. La référence est exigée en
       plus pour qu'un jeton copié ne serve pas à balayer la table. */
    if (!/^[a-f0-9]{48}$/.test(token)) return json({ error: 'Jeton de consultation invalide.' }, 400);
    if (!/^NVR-\d{6}-[A-Z0-9]{4}$/.test(ref)) return json({ error: 'Référence de commande invalide.' }, 400);
    query = query.eq('access_token', token).eq('reference', ref);
    fullAddress = true;
  } else if (reference && email) {
    if (!/^NVR-\d{6}-[A-Z0-9]{4}$/.test(reference)) {
      return json({ error: 'Ce numéro de commande n\'a pas le bon format. Il ressemble à NVR-260901-A1B2.' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return json({ error: 'Adresse e-mail invalide.' }, 400);
    query = query.eq('reference', reference).eq('email', email);
  } else {
    return json({ error: 'Indiquez votre numéro de commande et votre adresse e-mail.' }, 400);
  }

  const { data: order, error } = await query.maybeSingle();

  if (error) return json({ error: 'Lecture impossible.' }, 500);
  /* Même message que la commande n'existe pas ou que l'e-mail ne corresponde
     pas : rien ne doit permettre de deviner qu'une référence est valide. */
  if (!order) return json({ error: 'Aucune commande ne correspond à ces informations.' }, 404);

  const { data: events } = await db
    .from('order_events')
    .select('status, label, created_at')
    .eq('order_id', order.id)
    .order('created_at');

  /* Les informations de retrait ne partent que si le client est concerné. */
  let store = null;
  if (order.fulfilment === 'pickup') {
    const { data } = await db.from('store_settings')
      .select('name, address, zip, city, phone, email, hours, pickup_note').eq('id', true).maybeSingle();
    store = data ?? null;
  }

  return json({
    reference: order.reference,
    status: order.status,
    paid: !['pending', 'cancelled', 'payment_failed', 'payment_expired'].includes(order.status),
    cancelled: order.status === 'cancelled',
    failed: order.status === 'payment_failed',
    expired: order.status === 'payment_expired',
    fulfilment: order.fulfilment,
    email: maskEmail(order.email),
    address: trimAddress(order.address, fullAddress),
    store,
    shipping_method: order.shipping_method,
    payment_method: order.payment_method,
    carrier: order.carrier,
    tracking_number: order.tracking_number,
    tracking_url: order.tracking_url,
    promo_code: order.promo_code,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    created_at: order.created_at,
    paid_at: order.paid_at,
    shipped_at: order.shipped_at,
    ready_at: order.ready_at,
    completed_at: order.completed_at,
    payment_failed_at: order.payment_failed_at,
    payment_expired_at: order.payment_expired_at,
    items: order.order_items,
    events: events ?? []
  });
});
