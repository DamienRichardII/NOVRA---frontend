/* =========================================================================
   NOVRA — Création d'une commande et ouverture du paiement SumUp

   Règle absolue : rien de ce que le navigateur envoie n'est cru sur parole.
   Il n'envoie que des références et des quantités. Les prix, les stocks, les
   remises et les frais de port sont relus dans la base et recalculés ici.

   Variables d'environnement :
     SUMUP_API_KEY         clé secrète — ne sort jamais du serveur
     SUMUP_MERCHANT_CODE   identifiant de commerçant
     SUMUP_WEBHOOK_URL     adresse notifiée par SumUp (return_url)
     NOVRA_SITE_URL        site public, pour le retour du payeur
   SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectées par la plateforme.
   ========================================================================= */

import { createClient } from 'npm:@supabase/supabase-js@^2';
import { z } from 'npm:zod@^3';
import { createCheckout, SumUpError } from '../_shared/sumup.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const SITE = (Deno.env.get('NOVRA_SITE_URL') ?? 'https://novra-frontend.vercel.app').replace(/\/+$/, '');
const WEBHOOK = Deno.env.get('SUMUP_WEBHOOK_URL') ??
  (Deno.env.get('SUPABASE_URL') ?? '') + '/functions/v1/sumup-webhook';

/* Les frais de port vivent ici, jamais dans le navigateur. */
const SHIPPING = {
  standard: { label: 'Livraison standard',  cents: 490, freeFrom: 8000, fulfilment: 'delivery' },
  express:  { label: 'Livraison express',   cents: 990, freeFrom: null, fulfilment: 'delivery' },
  relay:    { label: 'Point relais',        cents: 290, freeFrom: null, fulfilment: 'relay' },
  pickup:   { label: 'Retrait en boutique', cents: 0,   freeFrom: null, fulfilment: 'pickup' }
} as const;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/* ---------------------------- Validation ------------------------------- */
const Line = z.object({
  slug: z.string().min(1).max(120),
  color: z.string().max(60).nullish(),
  size: z.string().max(20).nullish(),
  qty: z.number().int().positive().max(20)
});

const Address = z.object({
  firstname: z.string().max(80).nullish(),
  lastname: z.string().max(80).nullish(),
  phone: z.string().max(30).nullish(),
  address: z.string().max(200).nullish(),
  address2: z.string().max(200).nullish(),
  zip: z.string().max(20).nullish(),
  city: z.string().max(120).nullish(),
  country: z.string().max(60).nullish()
});

const Payload = z.object({
  lines: z.array(Line).min(1).max(40),
  email: z.string().email().max(180),
  shipping: z.enum(['standard', 'express', 'relay', 'pickup']),
  promo: z.string().max(40).optional().default(''),
  idempotency_key: z.string().max(64).optional().default(''),
  address: Address.optional().default({}),
  billing: Address.nullish()
});

/* --------------------------- Utilitaires -------------------------------- */
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

const fail = (message: string, status = 400, code?: string) =>
  json({ error: message, code }, status);

/* Journal serveur : suffisamment détaillé pour diagnostiquer, jamais renvoyé
   au client et jamais porteur d'un secret. */
function logError(scope: string, e: unknown) {
  const detail = e instanceof SumUpError ? { status: e.status, detail: e.detail } : String(e);
  console.error(JSON.stringify({ scope, detail }));
}

function reference() {
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  return 'NVR-' + stamp + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

const cents = (euros: unknown) => Math.round(Number(euros) * 100);

/* ------------------------------ Handler --------------------------------- */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Méthode non autorisée.', 405);

  let raw: unknown;
  try { raw = await req.json(); }
  catch { return fail('Requête illisible.'); }

  const parsed = Payload.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail('Données invalides : ' + first.path.join('.') + ' — ' + first.message, 422, 'VALIDATION');
  }
  const input = parsed.data;
  const email = input.email.trim().toLowerCase();
  const rule = SHIPPING[input.shipping];

  /* ------------------ Anti double commande ------------------------------
     Le navigateur fournit une clé stable pour un passage en caisse. Un
     double clic, un rechargement ou une reprise réseau retombent sur la
     même commande et rouvrent la même page de paiement. */
  const idem = input.idempotency_key || null;

  /* Renvoie la commande déjà ouverte pour cette clé, si elle existe et si son
     checkout est prêt. Le checkout est posé juste après la création : deux
     requêtes strictement simultanées peuvent arriver avant, d'où les essais. */
  async function reuseExisting(tries = 1): Promise<Response | null> {
    for (let i = 0; i < tries; i++) {
      const { data: existing } = await db.from('orders')
        .select('id, reference, status, access_token, sumup_checkout_id, payments(hosted_checkout_url)')
        .eq('idempotency_key', idem).maybeSingle();

      if (!existing) return null;

      if (existing.status !== 'pending') {
        return fail('Cette commande a déjà été traitée. Consultez la page de suivi.', 409, 'ALREADY_PROCESSED');
      }

      /* L'adresse est celle que SumUp a renvoyée, jamais une reconstruction :
         elle ne se déduit pas de l'identifiant du checkout. */
      const url = (existing.payments as any[])?.[0]?.hosted_checkout_url;
      if (url) {
        return json({
          reference: existing.reference,
          access_token: existing.access_token,
          checkout_id: existing.sumup_checkout_id,
          checkout_url: url,
          reused: true
        });
      }
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 900));
    }
    return fail('Votre commande est en cours d\'ouverture. Patientez quelques secondes puis réessayez.', 409, 'IN_PROGRESS');
  }

  if (idem) {
    const reused = await reuseExisting();
    if (reused) return reused;
  }

  /* ------------------- Adresse et mode de réception ---------------------- */
  if (rule.fulfilment !== 'pickup') {
    const missing = (['address', 'zip', 'city'] as const)
      .filter((k) => !String(input.address?.[k] ?? '').trim());
    if (missing.length) return fail('Adresse de livraison incomplète : ' + missing.join(', ') + '.', 422, 'ADDRESS');
  } else {
    const { data: store } = await db.from('store_settings').select('address, city').eq('id', true).maybeSingle();
    if (!store?.address || !store?.city) {
      return fail('Le retrait en boutique n\'est pas disponible. Choisissez une livraison.', 409, 'PICKUP_CLOSED');
    }
  }

  /* --------------------- Relecture du catalogue -------------------------- */
  const slugs = [...new Set(input.lines.map((l) => l.slug))];
  const { data: products, error: catalogueError } = await db
    .from('products')
    .select('id, slug, name, price, status, images, track_inventory, product_variants(id, color, size, stock)')
    .in('slug', slugs);

  if (catalogueError) {
    logError('catalogue', catalogueError);
    return fail('Catalogue indisponible, réessayez dans un instant.', 503, 'CATALOGUE');
  }

  const bySlug = new Map((products ?? []).map((p: any) => [p.slug, p]));
  const items: Array<Record<string, unknown>> = [];
  let subtotal = 0;

  for (const line of input.lines) {
    const product: any = bySlug.get(line.slug);
    if (!product) return fail('Un article de votre panier n\'existe plus.', 409, 'PRODUCT_GONE');
    if (product.status !== 'active') return fail(`« ${product.name} » n'est plus en vente.`, 409, 'PRODUCT_INACTIVE');

    const color = line.color ?? null;
    const size = line.size ?? null;
    const variant = (product.product_variants ?? [])
      .find((v: any) => (v.color ?? null) === color && (v.size ?? null) === size);
    if (!variant) return fail(`Cette déclinaison de « ${product.name} » n'existe pas.`, 409, 'VARIANT_GONE');

    if (product.track_inventory && variant.stock < line.qty) {
      const label = [color, size].filter(Boolean).join(' / ');
      return fail(
        variant.stock === 0
          ? `« ${product.name} » (${label}) est en rupture.`
          : `Il ne reste que ${variant.stock} exemplaire(s) de « ${product.name} » (${label}).`,
        409, 'OUT_OF_STOCK');
    }

    const unit = cents(product.price);
    subtotal += unit * line.qty;
    items.push({
      product_id: product.id, variant_id: variant.id, product_name: product.name,
      color, size, qty: line.qty, unit_cents: unit
    });
  }

  /* ---------------------------- Remise ----------------------------------- */
  const shippingCents = (rule.freeFrom !== null && subtotal >= rule.freeFrom) ? 0 : rule.cents;
  let discountCents = 0;
  let appliedCode: string | null = null;
  let freeShipping = false;

  const promoCode = input.promo.trim().toUpperCase();
  if (promoCode) {
    const { data: promo } = await db.from('promotions').select('*').eq('code', promoCode).maybeSingle();
    const now = Date.now();
    const usable = promo && promo.active
      && (!promo.starts_at || new Date(promo.starts_at).getTime() <= now)
      && (!promo.ends_at || new Date(promo.ends_at).getTime() >= now)
      && (promo.max_uses === null || promo.used_count < promo.max_uses)
      && subtotal >= cents(promo.min_amount);

    /* Un code invalide n'annule pas la commande : il est ignoré. */
    if (usable) {
      appliedCode = promo.code;
      if (promo.kind === 'percent') discountCents = Math.round(subtotal * Number(promo.value) / 100);
      else if (promo.kind === 'amount') discountCents = Math.min(subtotal, cents(promo.value));
      else if (promo.kind === 'free_shipping') freeShipping = true;
    }
  }

  const finalShipping = freeShipping ? 0 : shippingCents;
  const totalCents = Math.max(0, subtotal - discountCents) + finalShipping;
  if (totalCents < 50) return fail('Montant trop faible pour être encaissé.', 422, 'AMOUNT_TOO_LOW');

  /* -------------------- Enregistrement de la commande -------------------- */
  const ref = reference();
  const address = rule.fulfilment === 'pickup'
    ? { firstname: input.address.firstname ?? null, lastname: input.address.lastname ?? null, phone: input.address.phone ?? null }
    : {
        address: input.address.address ?? null, address2: input.address.address2 ?? null,
        zip: input.address.zip ?? null, city: input.address.city ?? null,
        country: input.address.country ?? 'France',
        firstname: input.address.firstname ?? null, lastname: input.address.lastname ?? null,
        phone: input.address.phone ?? null
      };

  const { data: order, error: orderError } = await db.from('orders').insert({
    reference: ref,
    idempotency_key: idem,
    email,
    status: 'pending',
    subtotal: subtotal / 100,
    shipping: finalShipping / 100,
    discount: discountCents / 100,
    total: totalCents / 100,
    shipping_method: rule.label,
    fulfilment: rule.fulfilment,
    payment_method: 'Carte bancaire (SumUp)',
    promo_code: appliedCode,
    sumup_checkout_reference: ref,
    address,
    billing_address: input.billing ?? null
  }).select('id, reference, access_token').single();

  if (orderError || !order) {
    /* 23505 = violation d'unicité. Deux requêtes strictement simultanées ont
       passé la vérification avant que l'une n'ait inséré : c'est l'index qui
       a tranché. Le perdant ne renvoie pas une erreur, il rejoint la commande
       gagnante — c'est exactement ce qu'attend un client qui a double-cliqué. */
    if (orderError?.code === '23505' && idem) {
      const reused = await reuseExisting(6);
      if (reused) return reused;
    }
    logError('order_insert', orderError);
    return fail('La commande n\'a pas pu être enregistrée.', 500, 'ORDER_INSERT');
  }

  const { error: itemsError } = await db.from('order_items').insert(items.map((i: any) => ({
    order_id: order.id, product_id: i.product_id, variant_id: i.variant_id,
    product_name: i.product_name, color: i.color, size: i.size,
    unit_price: i.unit_cents / 100, qty: i.qty, line_total: (i.unit_cents * i.qty) / 100
  })));

  if (itemsError) {
    logError('items_insert', itemsError);
    await db.from('orders').delete().eq('id', order.id);
    return fail('Le détail de la commande n\'a pas pu être enregistré.', 500, 'ITEMS_INSERT');
  }

  const { data: payment, error: paymentError } = await db.from('payments').insert({
    order_id: order.id, provider: 'sumup', status: 'pending',
    checkout_reference: ref, amount_cents: totalCents, currency: 'EUR'
  }).select('id').single();

  if (paymentError || !payment) {
    logError('payment_insert', paymentError);
    await db.from('orders').delete().eq('id', order.id);
    return fail('Le paiement n\'a pas pu être préparé.', 500, 'PAYMENT_INSERT');
  }

  /* --------------------------- Checkout SumUp ---------------------------- */
  try {
    const checkout = await createCheckout({
      reference: ref,
      amountCents: totalCents,
      description: 'Commande NOVRA ' + ref,
      returnUrl: WEBHOOK,
      redirectUrl: SITE + '/confirmation.html?ref=' + encodeURIComponent(ref) + '&t=' + order.access_token,
      customerEmail: email
    });

    const url = checkout.hosted_checkout_url ?? ('https://checkout.sumup.com/pay/' + checkout.id);

    await db.from('payments')
      .update({ sumup_checkout_id: checkout.id, hosted_checkout_url: url })
      .eq('id', payment.id);
    await db.from('orders')
      .update({ sumup_checkout_id: checkout.id })
      .eq('id', order.id);

    return json({
      reference: order.reference,
      access_token: order.access_token,
      checkout_id: checkout.id,
      checkout_url: url
    });

  } catch (e) {
    logError('sumup_create_checkout', e);
    /* SumUp a refusé : la commande en attente ne doit pas rester orpheline,
       et la clé est libérée pour que le client puisse réessayer. */
    await db.from('orders')
      .update({ status: 'payment_failed', payment_failed_at: new Date().toISOString(), idempotency_key: null })
      .eq('id', order.id);
    await db.from('payments').update({ status: 'failed', failed_at: new Date().toISOString() }).eq('id', payment.id);

    const status = e instanceof SumUpError && e.status === 504 ? 504 : 502;
    return fail('Le paiement est momentanément indisponible. Réessayez dans quelques minutes.', status, 'PROVIDER');
  }
});
