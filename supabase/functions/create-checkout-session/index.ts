/* =========================================================================
   NOVRA — Ouverture d'une session de paiement Stripe

   Règle absolue : rien de ce que le navigateur envoie n'est cru sur parole.
   Les prix, les stocks et les remises sont relus dans la base. Le client
   n'envoie que des références et des quantités.

   Variables d'environnement attendues :
     STRIPE_SECRET_KEY   — clé secrète Stripe (sk_test_… puis sk_live_…)
     NOVRA_SITE_URL      — adresse publique du site, sans barre finale
   SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournies automatiquement.
   ========================================================================= */

import Stripe from 'npm:stripe@^22';
import { createClient } from 'npm:@supabase/supabase-js@^2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const SITE = (Deno.env.get('NOVRA_SITE_URL') ?? 'https://novra-frontend.vercel.app').replace(/\/+$/, '');

/* Les frais de port vivent ici, jamais dans le navigateur.
   « fulfilment » distingue ce qui change le parcours après la commande :
   une livraison s'expédie, un retrait se prépare puis s'annonce prêt. */
const SHIPPING = {
  standard: { label: 'Livraison standard', cents: 490, freeFrom: 8000, fulfilment: 'delivery' },
  express:  { label: 'Livraison express',  cents: 990, freeFrom: null, fulfilment: 'delivery' },
  relay:    { label: 'Point relais',       cents: 290, freeFrom: null, fulfilment: 'relay' },
  pickup:   { label: 'Retrait en boutique', cents: 0,  freeFrom: null, fulfilment: 'pickup' }
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function fail(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function reference() {
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'NVR-' + stamp + '-' + rand;
}

const cents = (euros: number) => Math.round(Number(euros) * 100);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('Méthode non autorisée.', 405);

  let payload: any;
  try { payload = await req.json(); }
  catch { return fail('Requête illisible.'); }

  const lines = Array.isArray(payload?.lines) ? payload.lines : [];
  const email = String(payload?.email ?? '').trim().toLowerCase();
  const method = String(payload?.shipping ?? 'standard');
  const promoCode = String(payload?.promo ?? '').trim().toUpperCase();
  const address = payload?.address ?? {};

  /* Clé fournie par le navigateur, stable pour un passage en caisse.
     Un double clic ou une reprise réseau retombe sur la même commande. */
  const idem = String(payload?.idempotency_key ?? '').slice(0, 64) || null;
  if (idem) {
    const { data: existing } = await db.from('orders')
      .select('id, reference, stripe_session_id, status')
      .eq('idempotency_key', idem).maybeSingle();

    if (existing && existing.status === 'pending' && existing.stripe_session_id) {
      try {
        const previous = await stripe.checkout.sessions.retrieve(existing.stripe_session_id);
        if (previous.status === 'open' && previous.url) {
          return new Response(JSON.stringify({ url: previous.url, reference: existing.reference, reused: true }), {
            headers: { ...CORS, 'Content-Type': 'application/json' }
          });
        }
      } catch { /* session introuvable ou expirée : on en ouvre une neuve */ }
    }
    if (existing && existing.status !== 'pending') {
      return fail('Cette commande a déjà été traitée. Consultez votre boîte mail ou la page de suivi.', 409);
    }
  }

  if (!lines.length) return fail('Votre panier est vide.');
  if (lines.length > 40) return fail('Trop d\'articles dans le panier.');
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return fail('Adresse e-mail invalide.');
  if (!Object.prototype.hasOwnProperty.call(SHIPPING, method)) return fail('Mode de réception inconnu.');

  const rule = SHIPPING[method as keyof typeof SHIPPING];

  /* Une livraison sans adresse complète n'arrivera jamais : on refuse tout
     de suite plutôt que d'encaisser puis de rappeler le client. */
  if (rule.fulfilment !== 'pickup') {
    const missing = ['address', 'zip', 'city'].filter((k) => !String(address?.[k] ?? '').trim());
    if (missing.length) return fail('Adresse de livraison incomplète.');
  }

  /* Le retrait n'est proposé que si la boutique est réellement renseignée. */
  if (rule.fulfilment === 'pickup') {
    const { data: store } = await db.from('store_settings').select('address, city').eq('id', true).maybeSingle();
    if (!store?.address || !store?.city) {
      return fail('Le retrait en boutique n\'est pas disponible pour le moment. Choisissez une livraison.');
    }
  }

  /* ------------------ Relecture du catalogue en base ------------------- */
  const slugs = [...new Set(lines.map((l: any) => String(l.slug ?? '')))];
  const { data: products, error: prodError } = await db
    .from('products')
    .select('id, slug, name, price, status, images, track_inventory, product_variants(id, color, size, stock)')
    .in('slug', slugs);

  if (prodError) return fail('Catalogue indisponible, réessayez dans un instant.', 503);

  const bySlug = new Map((products ?? []).map((p: any) => [p.slug, p]));

  const items: any[] = [];
  let subtotal = 0;

  for (const raw of lines) {
    const slug = String(raw?.slug ?? '');
    const qty = Math.floor(Number(raw?.qty ?? 0));
    const color = raw?.color ? String(raw.color) : null;
    const size = raw?.size ? String(raw.size) : null;

    if (!Number.isFinite(qty) || qty < 1 || qty > 20) return fail('Quantité invalide.');

    const product: any = bySlug.get(slug);
    if (!product) return fail('Un article de votre panier n\'existe plus.');
    if (product.status !== 'active') return fail(`« ${product.name} » n'est plus en vente.`);

    const variant = (product.product_variants ?? []).find((v: any) =>
      (v.color ?? null) === color && (v.size ?? null) === size);
    if (!variant) return fail(`Cette déclinaison de « ${product.name} » n'existe pas.`);

    if (product.track_inventory && variant.stock < qty) {
      return fail(variant.stock === 0
        ? `« ${product.name} » (${[color, size].filter(Boolean).join(' / ')}) est en rupture.`
        : `Il ne reste que ${variant.stock} exemplaire(s) de « ${product.name} » (${[color, size].filter(Boolean).join(' / ')}).`);
    }

    const unit = cents(product.price);
    subtotal += unit * qty;

    items.push({
      product_id: product.id,
      variant_id: variant.id,
      product_name: product.name,
      color, size, qty,
      unit_cents: unit,
      image: (product.images ?? [])[0] ?? null
    });
  }

  /* ---------------------------- Livraison ------------------------------ */
  const shippingCents = (rule.freeFrom !== null && subtotal >= rule.freeFrom) ? 0 : rule.cents;

  /* ------------------------- Code promotionnel ------------------------- */
  let discountCents = 0;
  let appliedCode: string | null = null;
  let freeShipping = false;

  if (promoCode) {
    const { data: promo } = await db.from('promotions').select('*').eq('code', promoCode).maybeSingle();
    const now = Date.now();
    const usable = promo
      && promo.active
      && (!promo.starts_at || new Date(promo.starts_at).getTime() <= now)
      && (!promo.ends_at || new Date(promo.ends_at).getTime() >= now)
      && (promo.max_uses === null || promo.used_count < promo.max_uses)
      && subtotal >= cents(promo.min_amount);

    /* Un code invalide n'annule pas la commande : il est simplement ignoré. */
    if (usable) {
      appliedCode = promo.code;
      if (promo.kind === 'percent')      discountCents = Math.round(subtotal * Number(promo.value) / 100);
      else if (promo.kind === 'amount')  discountCents = Math.min(subtotal, cents(promo.value));
      else if (promo.kind === 'free_shipping') freeShipping = true;
    }
  }

  const finalShipping = freeShipping ? 0 : shippingCents;
  const total = Math.max(0, subtotal - discountCents) + finalShipping;

  if (total < 50) return fail('Montant trop faible pour être encaissé.');

  /* ------------------- Enregistrement de la commande ------------------- */
  const ref = reference();
  const { data: order, error: orderError } = await db.from('orders').insert({
    reference: ref,
    idempotency_key: idem,
    email,
    status: 'pending',
    subtotal: subtotal / 100,
    shipping: finalShipping / 100,
    discount: discountCents / 100,
    total: total / 100,
    shipping_method: rule.label,
    fulfilment: rule.fulfilment,
    payment_method: 'Carte bancaire (Stripe)',
    promo_code: appliedCode,
    address: rule.fulfilment === 'pickup'
      ? {
          firstname: address?.firstname ?? null,
          lastname: address?.lastname ?? null,
          phone: address?.phone ?? null
        }
      : {
          address: address?.address ?? null,
          address2: address?.address2 ?? null,
          zip: address?.zip ?? null,
          city: address?.city ?? null,
          country: address?.country ?? 'France',
          firstname: address?.firstname ?? null,
          lastname: address?.lastname ?? null,
          phone: address?.phone ?? null
        }
  }).select('id, reference').single();

  if (orderError || !order) return fail('La commande n\'a pas pu être enregistrée.', 500);

  const { error: itemsError } = await db.from('order_items').insert(items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    variant_id: i.variant_id,
    product_name: i.product_name,
    color: i.color,
    size: i.size,
    unit_price: i.unit_cents / 100,
    qty: i.qty,
    line_total: (i.unit_cents * i.qty) / 100
  })));

  if (itemsError) {
    await db.from('orders').delete().eq('id', order.id);
    return fail('Le détail de la commande n\'a pas pu être enregistré.', 500);
  }

  /* --------------------------- Session Stripe -------------------------- */
  try {
    const lineItems = items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: 'eur',
        unit_amount: i.unit_cents,
        product_data: {
          name: i.product_name,
          description: [i.color, i.size && i.size !== 'TU' ? 'Taille ' + i.size : null]
            .filter(Boolean).join(' · ') || undefined,
          images: i.image && /^https?:/.test(i.image) ? [i.image] : (i.image ? [SITE + '/' + i.image] : undefined)
        }
      }
    }));

    /* La remise passe par un coupon à usage unique : Stripe l'affiche
       explicitement au client au lieu de fausser le prix des articles. */
    let discounts;
    if (discountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountCents, currency: 'eur', duration: 'once',
        name: 'Code ' + appliedCode, max_redemptions: 1
      });
      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'fr',
      customer_email: email,
      client_reference_id: order.reference,
      line_items: lineItems,
      discounts,
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: finalShipping === 0 ? rule.label + ' — offerte' : rule.label,
          fixed_amount: { amount: finalShipping, currency: 'eur' }
        }
      }],
      payment_intent_data: { metadata: { order_reference: order.reference } },
      metadata: { order_reference: order.reference, order_id: order.id },
      success_url: SITE + '/confirmation.html?session={CHECKOUT_SESSION_ID}',
      cancel_url: SITE + '/checkout.html?paiement=annule',
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    });

    await db.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);

    return new Response(JSON.stringify({ url: session.url, reference: order.reference }), {
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    /* Stripe a refusé : la commande en attente ne doit pas rester orpheline.
       La clé est libérée pour que le client puisse réessayer immédiatement. */
    await db.from('orders').update({ status: 'cancelled', idempotency_key: null }).eq('id', order.id);
    console.error('Stripe checkout.sessions.create', e);
    return fail('Le paiement est momentanément indisponible. Réessayez dans quelques minutes.', 502);
  }
});
