/* =========================================================================
   NOVRA — Résumé d'une commande après retour de Stripe

   La page de confirmation ne peut pas lire la table orders : les règles RLS
   l'interdisent au visiteur anonyme, et c'est voulu. Cette fonction renvoie
   uniquement ce qui concerne la session de paiement présentée, et rien
   d'autre : ni adresse complète, ni identifiant interne.
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const sessionId = new URL(req.url).searchParams.get('session') ?? '';
  /* Un identifiant de session Stripe est long et imprévisible : il fait
     office de jeton. On refuse tout ce qui n'y ressemble pas. */
  if (!/^cs_[a-zA-Z0-9_]{20,}$/.test(sessionId)) return json({ error: 'Référence de paiement invalide.' }, 400);

  const { data: order, error } = await db
    .from('orders')
    .select('reference, status, subtotal, shipping, discount, total, shipping_method, email, created_at, order_items(product_name, color, size, qty, line_total)')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (error) return json({ error: 'Lecture impossible.' }, 500);
  if (!order) return json({ error: 'Commande introuvable.' }, 404);

  /* L'adresse e-mail est partiellement masquée : la page peut être ouverte
     depuis un lien partagé ou un historique de navigation. */
  const [user, domain] = String(order.email).split('@');
  const masked = user.slice(0, 2) + '•'.repeat(Math.max(1, user.length - 2)) + '@' + domain;

  return json({
    reference: order.reference,
    status: order.status,
    paid: order.status !== 'pending' && order.status !== 'cancelled',
    email: masked,
    created_at: order.created_at,
    shipping_method: order.shipping_method,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    items: order.order_items
  });
});
