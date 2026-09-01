/* =========================================================================
   NOVRA — Affichage d'une commande

   Une seule source de rendu pour la page de confirmation et la page de
   suivi : les deux montrent exactement la même chose, ce qui évite qu'un
   client voie deux versions différentes de sa commande.
   ========================================================================= */

function ovMoney(n) {
  return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function ovEsc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ovDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

/* Deux cycles de vie distincts : ce qui part chez le client et ce qu'il
   vient chercher. Aucun statut inutile, seulement ceux qu'il attend. */
const OV_STEPS = {
  delivery: [
    ['pending',   'Commande reçue'],
    ['paid',      'Paiement confirmé'],
    ['preparing', 'En préparation'],
    ['shipped',   'Expédiée'],
    ['delivered', 'Livrée']
  ],
  relay: [
    ['pending',   'Commande reçue'],
    ['paid',      'Paiement confirmé'],
    ['preparing', 'En préparation'],
    ['shipped',   'Expédiée vers le point relais'],
    ['delivered', 'Disponible en point relais']
  ],
  pickup: [
    ['pending',          'Commande reçue'],
    ['paid',             'Paiement confirmé'],
    ['preparing',        'En préparation'],
    ['ready_for_pickup', 'Prête à être retirée'],
    ['picked_up',        'Retirée']
  ]
};

function ovLabel(order) {
  const steps = OV_STEPS[order.fulfilment] || OV_STEPS.delivery;
  const found = steps.find(function (s) { return s[0] === order.status; });
  if (found) return found[1];
  if (order.status === 'cancelled') return 'Annulée';
  if (order.status === 'refunded') return 'Remboursée';
  return order.status;
}

function ovTimeline(order) {
  if (order.status === 'cancelled') {
    return '<p class="lead">Cette commande a été annulée. Si un montant a été débité, il vous est restitué ' +
      'automatiquement par votre banque sous quelques jours.</p>';
  }

  const steps = OV_STEPS[order.fulfilment] || OV_STEPS.delivery;
  const current = steps.findIndex(function (s) { return s[0] === order.status; });

  /* Un événement daté prime sur la théorie : c'est l'historique réel. */
  const dates = {};
  (order.events || []).forEach(function (e) { if (!dates[e.status]) dates[e.status] = e.created_at; });

  return '<ol class="timeline">' + steps.map(function (s, i) {
    const done = current >= 0 && i <= current;
    const cls = (done ? 'is-done' : '') + (i === current ? ' is-current' : '');
    return '<li class="' + cls + '"><strong>' + ovEsc(s[1]) + '</strong>' +
      (dates[s[0]] ? '<small>' + ovDate(dates[s[0]]) + '</small>' : '') + '</li>';
  }).join('') + '</ol>';
}

function ovItems(order) {
  return (order.items || []).map(function (i) {
    const meta = [i.color, i.size && i.size !== 'TU' ? 'Taille ' + i.size : null].filter(Boolean).join(' / ');
    return '<div class="summary-line" style="grid-template-columns:1fr auto">' +
      '<div><h4>' + ovEsc(i.product_name) + '</h4><span>' + ovEsc(meta) +
        (meta ? ' · ' : '') + ovMoney(i.unit_price) + ' × ' + i.qty + '</span></div>' +
      '<strong>' + ovMoney(i.line_total) + '</strong></div>';
  }).join('');
}

function ovTotals(order) {
  return '<div style="margin-top:18px">' +
    '<div class="total-row"><span>Sous-total</span><span>' + ovMoney(order.subtotal) + '</span></div>' +
    (Number(order.discount) > 0
      ? '<div class="total-row"><span>Remise' + (order.promo_code ? ' (' + ovEsc(order.promo_code) + ')' : '') +
        '</span><span>− ' + ovMoney(order.discount) + '</span></div>' : '') +
    '<div class="total-row"><span>' + ovEsc(order.shipping_method || 'Livraison') + '</span><span>' +
      (Number(order.shipping) === 0 ? 'Offerte' : ovMoney(order.shipping)) + '</span></div>' +
    '<div class="total-row is-total"><span>Total payé</span><span>' + ovMoney(order.total) + '</span></div>' +
    '<p class="dim" style="font-size:.78rem;color:var(--grey-500);margin-top:10px">' +
      ovEsc(order.payment_method || 'Carte bancaire') + '</p>' +
  '</div>';
}

/* Livraison : l'adresse. Retrait : où venir, quand, et avec quoi. */
function ovFulfilment(order) {
  if (order.fulfilment === 'pickup') {
    const s = order.store;
    if (!s) return '';
    const hours = Array.isArray(s.hours) ? s.hours : [];
    return '<div class="order-block"><h3>Retrait en boutique</h3>' +
      '<p><strong>' + ovEsc(s.name || 'Boutique NOVRA') + '</strong></p>' +
      '<p>' + ovEsc([s.address, s.zip, s.city].filter(Boolean).join(', ')) + '</p>' +
      (s.phone ? '<p>' + ovEsc(s.phone) + '</p>' : '') +
      (hours.length ? '<ul style="list-style:none;padding:0;margin:12px 0 0">' + hours.map(function (h) {
        return '<li style="display:flex;justify-content:space-between;gap:20px;font-size:.84rem;padding:3px 0;color:var(--grey-600)">' +
          '<span style="color:var(--black)">' + ovEsc(h.day || '') + '</span><span>' + ovEsc(h.hours || '') + '</span></li>';
      }).join('') + '</ul>' : '') +
      '<p style="margin-top:14px;font-size:.82rem;color:var(--grey-500)">' +
        ovEsc(s.pickup_note || 'Présentez votre numéro de commande ' + order.reference + ' au comptoir.') + '</p>' +
    '</div>';
  }

  const a = order.address || {};
  const label = order.fulfilment === 'relay' ? 'Livraison en point relais' : 'Adresse de livraison';
  const parts = [
    [a.firstname, a.lastname].filter(Boolean).join(' '),
    a.address, a.address2,
    [a.zip, a.city].filter(Boolean).join(' '),
    a.country
  ].filter(Boolean);

  return '<div class="order-block"><h3>' + label + '</h3>' +
    (parts.length
      ? parts.map(function (p) { return '<p>' + ovEsc(p) + '</p>'; }).join('')
      : '<p class="dim" style="color:var(--grey-500)">Adresse enregistrée avec la commande.</p>') +
    (order.carrier || order.tracking_number
      ? '<p style="margin-top:12px">' +
        (order.carrier ? '<strong>' + ovEsc(order.carrier) + '</strong> · ' : '') +
        (order.tracking_number ? ovEsc(order.tracking_number) : '') + '</p>' +
        (order.tracking_url ? '<p><a class="link-underline" href="' + ovEsc(order.tracking_url) +
          '" target="_blank" rel="noopener">Suivre le colis chez le transporteur</a></p>' : '')
      : '') +
  '</div>';
}

/* Vue complète, partagée par la confirmation et le suivi. */
function ovRender(order, opts) {
  const o = opts || {};
  return '<div class="order-track">' +
    '<div class="order-head">' +
      (o.title ? '<h1 class="display-3" style="margin:0 0 10px">' + ovEsc(o.title) + '</h1>' : '') +
      (o.intro ? '<p class="lead" style="margin:0 0 16px">' + o.intro + '</p>' : '') +
      '<span class="order-state ' + (order.cancelled ? 'is-cancelled' : 'is-done') + '">' + ovEsc(ovLabel(order)) + '</span>' +
      '<p class="order-ref">' + ovEsc(order.reference) + '</p>' +
      '<p style="font-size:.82rem;color:var(--grey-500);margin:6px 0 0">Commandée le ' + ovDate(order.created_at) + '</p>' +
    '</div>' +

    ovTimeline(order) +

    '<div class="order-block"><h3>Votre commande</h3>' + ovItems(order) + ovTotals(order) + '</div>' +
    ovFulfilment(order) +

    '<div class="order-actions">' +
      (o.trackLink !== false
        ? '<a class="btn" href="suivi.html?reference=' + encodeURIComponent(order.reference) + '">Suivre ma commande</a>'
        : '') +
      '<a class="btn btn-outline" href="marketplace.html">Retourner à la boutique</a>' +
    '</div>' +
  '</div>';
}
