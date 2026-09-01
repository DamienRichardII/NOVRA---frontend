/* =========================================================================
   NOVRA ADMIN — Écrans
   Tous les modules lisent Supabase. Aucune donnée n'est inventée : tant
   qu'aucune vente n'a été enregistrée, les écrans affichent des zéros
   sincères et expliquent ce qui manque plutôt que des chiffres factices.
   ========================================================================= */

/* ------------------------- Cache de session ---------------------------- */
const store = { products: null, variants: null, orders: null, customers: null, promos: null, moves: null, stats: null };

function storeReset() {
  Object.keys(store).forEach(function (k) { store[k] = null; });
}

async function loadStats() {
  if (store.stats) return store.stats;
  const { data, error } = await sb.rpc('admin_dashboard_stats');
  if (error) { toast('Statistiques indisponibles : ' + error.message, 'err'); return {}; }
  store.stats = data || {};
  return store.stats;
}

async function loadProducts() {
  if (store.products) return store.products;
  const { data, error } = await sb.from('products')
    .select('*, product_variants(id,sku,color,size,stock,low_stock_at)')
    .order('sort_order');
  if (error) { toast('Catalogue indisponible : ' + error.message, 'err'); return []; }
  store.products = data || [];
  return store.products;
}

async function loadOrders() {
  if (store.orders) return store.orders;
  const { data, error } = await sb.from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false }).limit(200);
  if (error) { toast('Commandes indisponibles : ' + error.message, 'err'); return []; }
  store.orders = data || [];
  return store.orders;
}

async function loadCustomers() {
  if (store.customers) return store.customers;
  const { data, error } = await sb.from('customers').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) { toast('Clients indisponibles : ' + error.message, 'err'); return []; }
  store.customers = data || [];
  return store.customers;
}

async function loadPromos() {
  if (store.promos) return store.promos;
  const { data, error } = await sb.from('promotions').select('*').order('created_at', { ascending: false });
  if (error) { toast('Promotions indisponibles : ' + error.message, 'err'); return []; }
  store.promos = data || [];
  return store.promos;
}

async function loadMovements() {
  if (store.moves) return store.moves;
  const { data, error } = await sb.from('stock_movements')
    .select('*, product_variants(sku,color,size,products(name))')
    .order('created_at', { ascending: false }).limit(40);
  if (error) return [];
  store.moves = data || [];
  return store.moves;
}

/* --------------------------- Petits utilitaires ------------------------- */
function productStock(p) {
  return (p.product_variants || []).reduce(function (s, v) { return s + (v.stock || 0); }, 0);
}

function firstImage(p) {
  const imgs = p.images || [];
  return imgs.length ? mediaSrc(imgs[0]) : '';
}

const ORDER_LABELS = {
  pending: ['Paiement en attente', 'warning'], paid: ['Payée', 'success'],
  preparing: ['En préparation', 'warning'], shipped: ['Expédiée', 'info'],
  delivered: ['Livrée', 'success'],
  ready_for_pickup: ['Prête au retrait', 'info'], picked_up: ['Retirée', 'success'],
  cancelled: ['Annulée', 'danger'], refunded: ['Remboursée', 'danger']
};
function orderBadge(status) {
  const s = ORDER_LABELS[status] || [status, 'info'];
  return badge(s[0], s[1]);
}

function dateFR(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* Message affiché quand une table est encore vide : il dit pourquoi. */
function emptyBlock(title, text, link, linkLabel) {
  return '<div class="empty-state" style="padding:38px 20px;text-align:center">' +
    '<strong style="display:block;font-size:15px;margin-bottom:6px">' + esc(title) + '</strong>' +
    '<span class="dim" style="display:block;max-width:460px;margin:0 auto 14px">' + esc(text) + '</span>' +
    (link ? '<a class="btn btn-sm" href="' + link + '">' + esc(linkLabel || 'Y aller') + '</a>' : '') +
  '</div>';
}

/* Renvoie undefined — et non null — pour qu'aucune pastille de variation
   ne soit affichée tant qu'il n'y a pas de période de référence. */
function pct(now, before) {
  if (!before) return undefined;
  return Math.round(((now - before) / before) * 1000) / 10;
}

/* ================================ DASHBOARD ============================== */
async function pageDashboard() {
  const s = await loadStats();
  const prods = await loadProducts();

  const rev = Number(s.revenue_30d || 0);
  const orders30 = Number(s.orders_30d || 0);
  const avg = orders30 ? rev / orders30 : 0;

  const kpis =
    kpiCard({ label: "Chiffre d'affaires (30 j)", value: money(rev), delta: pct(rev, Number(s.revenue_prev30 || 0)), icon: 'trend', tone: 'g', sub: '30 derniers jours' }) +
    kpiCard({ label: 'Commandes (30 j)', value: String(orders30), icon: 'cart', tone: 'b', sub: String(s.orders_total || 0) + ' au total' }) +
    kpiCard({ label: 'Panier moyen', value: money(avg), icon: 'bag', tone: 'v', sub: orders30 ? 'Sur 30 jours' : 'Aucune vente enregistrée' }) +
    kpiCard({ label: 'Clients', value: String(s.customers || 0), icon: 'user', tone: 'b', sub: String(s.customers_30d || 0) + ' nouveaux ce mois' }) +
    kpiCard({ label: 'Références en rupture', value: String(s.stock_out || 0), icon: 'alert', tone: 'a', sub: String(s.stock_low || 0) + ' en stock faible' });

  /* Courbe : uniquement si des ventes existent. */
  const daily = s.daily || [];
  const values = daily.map(function (d) { return Number(d.revenue || 0); });
  const labels = daily.map(function (d) { return new Date(d.d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); });
  const hasRevenue = values.some(function (v) { return v > 0; });

  const chart = hasRevenue
    ? '<div class="chart-box"><div class="chart-value">' + money(rev) + '</div>' + lineChart(values, labels, { color: 'var(--green)' }) + '</div>'
    : emptyBlock('Aucune vente pour le moment',
        "La courbe s'affichera dès la première commande payée. Le module de paiement n'est pas encore branché sur le site.");

  /* Top produits réel, sinon le catalogue par ordre d'affichage. */
  const tops = s.top_products || [];
  const top = tops.length
    ? tops.map(function (t) {
        return '<tr><td><div class="t-title">' + esc(t.name) + '</div></td>' +
          '<td class="right">' + t.qty + '</td><td class="right nowrap">' + money(t.revenue) + '</td></tr>';
      }).join('')
    : prods.slice(0, 5).map(function (p) {
        return '<tr><td><div class="cell-main">' + (firstImage(p) ? '<img class="thumb" src="' + esc(firstImage(p)) + '" alt="">' : '') +
          '<div><div class="t-title">' + esc(p.name) + '</div><div class="t-sub">' + esc(p.category) + '</div></div></div></td>' +
          '<td class="right dim">—</td><td class="right nowrap dim">—</td></tr>';
      }).join('');

  /* Stocks à surveiller : les variantes réellement basses. */
  const low = [];
  prods.forEach(function (p) {
    (p.product_variants || []).forEach(function (v) {
      if (v.stock <= v.low_stock_at) low.push({ p: p, v: v });
    });
  });
  low.sort(function (a, b) { return a.v.stock - b.v.stock; });

  const lowRows = low.slice(0, 6).map(function (r) {
    return '<tr><td><div class="cell-main">' + (firstImage(r.p) ? '<img class="thumb" src="' + esc(firstImage(r.p)) + '" alt="">' : '') +
      '<div><div class="t-title">' + esc(r.p.name) + '</div><div class="t-sub">' + esc((r.v.color || '') + ' · ' + (r.v.size || '')) + '</div></div></div></td>' +
      '<td class="right">' + r.v.stock + '</td><td class="right">' + badge(r.v.stock === 0 ? 'Rupture' : 'Faible', r.v.stock === 0 ? 'danger' : 'warning') + '</td></tr>';
  }).join('');

  const recent = (await loadOrders()).slice(0, 5);
  const ordersHtml = recent.length
    ? '<div class="table-wrap"><table class="table"><thead><tr><th>Commande</th><th>Client</th><th>Date</th><th class="right">Montant</th><th class="right">Statut</th></tr></thead><tbody>' +
      recent.map(function (o) {
        return '<tr><td class="nowrap">' + esc(o.reference) + '</td><td>' + esc(o.email) + '</td>' +
          '<td class="nowrap muted">' + dateFR(o.created_at) + '</td>' +
          '<td class="right nowrap">' + money(o.total) + '</td><td class="right">' + orderBadge(o.status) + '</td></tr>';
      }).join('') + '</tbody></table></div>'
    : emptyBlock('Aucune commande', "Les commandes apparaîtront ici dès que le paiement en ligne sera activé.");

  const clients = (await loadCustomers()).slice(0, 5);
  const clientsHtml = clients.length
    ? '<div class="card-pad">' + clients.map(function (c) {
        const name = ((c.first_name || '') + ' ' + (c.last_name || '')).trim() || c.email;
        return '<div class="list-row"><span class="avatar">' + initials(name) + '</span>' +
          '<span class="grow"><span class="name">' + esc(name) + '</span><span class="sub">' + esc(c.email) + '</span></span></div>';
      }).join('') + '</div>'
    : emptyBlock('Aucun client', 'Les comptes clients seront créés automatiquement à la première commande.');

  /* Répartition du catalogue par catégorie — donnée réelle, pas du CA. */
  const byCat = {};
  prods.forEach(function (p) { byCat[p.category] = (byCat[p.category] || 0) + 1; });
  const palette = ['#4f6bed', '#e0a33e', '#3fb984', '#8b7ce8', '#5c6068', '#d2607a', '#4aa8c0'];
  const cats = Object.keys(byCat).map(function (k, i) {
    return { label: k, value: byCat[k], color: palette[i % palette.length],
             pct: Math.round((byCat[k] / prods.length) * 100) + ' %' };
  });

  const quick = [
    ['products', 'Voir le catalogue', '#produits'], ['stocks', 'Saisir les stocks', '#stocks'],
    ['media', 'Modifier le site', '#contenus'], ['library', 'Médiathèque', '#mediatheque'],
    ['promotions', 'Créer une promotion', '#promotions'], ['analytics', 'Analytics', '#analytics']
  ].map(function (q) { return '<a class="qa" href="' + q[2] + '">' + icon(q[0]) + '<span>' + q[1] + '</span></a>'; }).join('');

  return '<div class="kpi-row mb-18">' + kpis + '</div>' +

    '<div class="grid-main g-dash-top mb-18">' +
      '<section class="card chart-card">' + cardHead("Évolution du chiffre d'affaires", '<span class="chip">30 derniers jours</span>') + chart + '</section>' +

      '<section class="card">' + cardHead(tops.length ? 'Top produits' : 'Catalogue') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th class="right">Ventes</th><th class="right">CA généré</th></tr></thead><tbody>' + top + '</tbody></table></div>' +
        '<div class="card-foot"><a class="card-link" href="#produits">Voir tous les produits</a></div>' +
      '</section>' +

      '<section class="card">' + cardHead('Stocks à surveiller') +
        (low.length
          ? '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th class="right">Stock</th><th class="right">Statut</th></tr></thead><tbody>' + lowRows + '</tbody></table></div>'
          : emptyBlock('Stocks non renseignés', 'Saisissez les quantités disponibles pour activer les alertes de réassort.', '#stocks', 'Saisir les stocks')) +
        '<div class="card-foot"><a class="card-link" href="#stocks">Voir tous les stocks</a></div>' +
      '</section>' +
    '</div>' +

    '<div class="grid-main g-1-1-1 mb-18">' +
      '<section class="card">' + cardHead('Dernières commandes', '<a class="card-link" href="#commandes">Voir toutes</a>') + ordersHtml + '</section>' +
      '<section class="card">' + cardHead('Derniers clients', '<a class="card-link" href="#clients">Voir tous</a>') + clientsHtml + '</section>' +
      '<section class="card">' + cardHead('Catalogue par catégorie') +
        (cats.length
          ? '<div class="donut-wrap">' + donut(cats, String(prods.length), 'produits') +
            '<div class="legend">' + cats.map(function (c) {
              return '<div class="legend-row"><i style="background:' + c.color + '"></i><span class="grow">' + esc(c.label) + '</span>' +
                '<strong>' + c.value + '</strong><span class="dim">' + c.pct + '</span></div>';
            }).join('') + '</div></div>'
          : emptyBlock('Catalogue vide', 'Aucun produit enregistré en base.')) +
      '</section>' +
    '</div>' +

    '<div class="grid-main g-side">' +
      '<section class="card" id="dash-activity">' + cardHead('Activité récente', '<a class="card-link" href="#journal">Voir tout</a>') +
        '<div id="dash-activity-body"><div class="card-pad"><div class="skeleton skel-line"></div><div class="skeleton skel-line" style="width:70%"></div></div></div></section>' +
      '<section class="card">' + cardHead('Actions rapides') + '<div class="qa-grid g-2">' + quick + '</div></section>' +
    '</div>';
}

/* ================================ COMMANDES ============================== */
/* Deux parcours après paiement : ce qui part chez le client, ce qu'il vient
   chercher. Chaque étape n'est proposée que si elle a un sens à ce moment. */
const NEXT_STATUS = {
  delivery: { paid: 'preparing', preparing: 'shipped', shipped: 'delivered' },
  relay:    { paid: 'preparing', preparing: 'shipped', shipped: 'delivered' },
  pickup:   { paid: 'preparing', preparing: 'ready_for_pickup', ready_for_pickup: 'picked_up' }
};

const STATUS_ACTION = {
  preparing:        'Mettre en préparation',
  shipped:          'Marquer comme expédiée',
  delivered:        'Marquer comme livrée',
  ready_for_pickup: 'Prête à être retirée',
  picked_up:        'Marquer comme retirée'
};

const FULFILMENT_LABEL = {
  delivery: ['Livraison à domicile', 'truck'],
  relay:    ['Point relais', 'truck'],
  pickup:   ['Retrait en boutique', 'bag']
};

const ORDER_FILTERS = [
  ['', 'Toutes'], ['todo', 'À traiter'], ['paid', 'Payées'], ['preparing', 'En préparation'],
  ['shipped', 'Expédiées'], ['ready_for_pickup', 'Prêtes au retrait'],
  ['delivered', 'Livrées'], ['picked_up', 'Retirées'], ['cancelled', 'Annulées'], ['refunded', 'Remboursées']
];

function filteredOrders(orders) {
  const f = app.orderFilter || '';
  if (!f) return orders;
  if (f === 'todo') return orders.filter(function (o) { return ['paid', 'preparing', 'ready_for_pickup'].indexOf(o.status) !== -1; });
  return orders.filter(function (o) { return o.status === f; });
}

async function pageOrders() {
  const all = await loadOrders();

  if (!all.length) {
    return '<section class="card">' + cardHead('Commandes') +
      emptyBlock('Aucune commande enregistrée',
        "Les commandes apparaîtront ici dès le premier paiement encaissé. " +
        "Rien n'est simulé : tant qu'aucun client n'a payé, cet écran reste vide.") +
      '</section>';
  }

  const orders = filteredOrders(all);
  app.orderList = orders;

  const counts = {};
  all.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
  const todo = (counts.paid || 0) + (counts.preparing || 0) + (counts.ready_for_pickup || 0);

  const chips = ORDER_FILTERS.map(function (f) {
    const n = f[0] === '' ? all.length : f[0] === 'todo' ? todo : (counts[f[0]] || 0);
    if (!n && f[0]) return '';
    return '<button type="button" class="chip' + ((app.orderFilter || '') === f[0] ? ' is-active' : '') +
      '" data-order-filter="' + f[0] + '">' + f[1] + ' <b>' + n + '</b></button>';
  }).join('');

  const rows = orders.map(function (o, i) {
    const ful = FULFILMENT_LABEL[o.fulfilment] || FULFILMENT_LABEL.delivery;
    const a = o.address || {};
    const name = [a.firstname, a.lastname].filter(Boolean).join(' ') || o.email;
    return '<tr data-order="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td class="c-main nowrap">' + esc(o.reference) + '</td>' +
      '<td data-l="Client"><div class="t-title">' + esc(name) + '</div><div class="t-sub">' + esc(o.email) + '</div></td>' +
      '<td data-l="Réception"><span class="nowrap">' + icon(ful[1], 'icon-sm') + ' ' + esc(ful[0]) + '</span></td>' +
      '<td data-l="Date" class="nowrap muted">' + dateFR(o.created_at) + '</td>' +
      '<td data-l="Articles" class="right">' + (o.order_items || []).length + '</td>' +
      '<td data-l="Montant" class="right nowrap">' + money(o.total) + '</td>' +
      '<td data-l="Statut">' + orderBadge(o.status) + '</td></tr>';
  }).join('');

  const revenue = all.filter(function (o) { return ['paid', 'preparing', 'shipped', 'ready_for_pickup', 'delivered', 'picked_up'].indexOf(o.status) !== -1; })
                     .reduce(function (s, o) { return s + Number(o.total); }, 0);

  return '<div class="kpi-row mb-18">' +
      kpiCard({ label: 'À traiter', value: String(todo), icon: 'alert', tone: todo ? 'a' : 'g', sub: 'Payées ou en cours' }) +
      kpiCard({ label: 'Commandes', value: String(all.length), icon: 'cart', tone: 'b' }) +
      kpiCard({ label: 'Encaissé', value: money(revenue), icon: 'euro', tone: 'g' }) +
      kpiCard({ label: 'Annulées', value: String((counts.cancelled || 0) + (counts.refunded || 0)), icon: 'xcircle', tone: 'r' }) +
    '</div>' +
    '<div class="grid-main g-side">' +
      '<section class="card">' +
        cardHead('Commandes', '<span class="badge-count">' + orders.length + '</span>') +
        '<div class="card-pad" style="padding-bottom:0;display:flex;gap:6px;flex-wrap:wrap">' + chips + '</div>' +
        (orders.length
          ? '<div class="table-wrap"><table class="table"><thead><tr><th>Commande</th><th>Client</th><th>Réception</th><th>Date</th>' +
            '<th class="right">Articles</th><th class="right">Montant</th><th>Statut</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
          : emptyBlock('Aucune commande dans ce filtre', 'Choisissez un autre filtre ci-dessus.')) +
      '</section>' + orderPanel(0) + '</div>';
}

function orderPanel(i) {
  const o = (app.orderList || [])[i];
  if (!o) return '<aside class="panel"><div class="panel-body">' + emptyBlock('Aucune commande sélectionnée', '') + '</div></aside>';

  app.orderIndex = i;
  const ful = FULFILMENT_LABEL[o.fulfilment] || FULFILMENT_LABEL.delivery;
  const a = o.address || {};
  const name = [a.firstname, a.lastname].filter(Boolean).join(' ');

  const items = (o.order_items || []).map(function (it) {
    return '<div class="list-row"><span class="grow"><span class="name">' + esc(it.product_name) + '</span>' +
      '<span class="sub">' + esc([it.color, it.size].filter(Boolean).join(' / ')) +
      ' · ' + money(it.unit_price) + ' × ' + it.qty + '</span></span>' +
      '<strong class="nowrap">' + money(it.line_total) + '</strong></div>';
  }).join('');

  /* Une seule action mise en avant : la suivante dans le parcours. */
  const next = (NEXT_STATUS[o.fulfilment] || NEXT_STATUS.delivery)[o.status];
  const closed = ['delivered', 'picked_up', 'cancelled', 'refunded'].indexOf(o.status) !== -1;

  const shipBlock = (o.fulfilment !== 'pickup' && ['preparing', 'shipped', 'delivered'].indexOf(o.status) !== -1)
    ? '<div class="lbl" style="margin-top:18px">Suivi du colis</div>' +
      '<div class="field-row">' +
        field('Transporteur', input('o-carrier', o.carrier || '', { placeholder: 'Colissimo' })) +
        field('N° de suivi', input('o-tracking', o.tracking_number || '', { placeholder: '6A12345678901' })) + '</div>' +
      field('Lien de suivi', input('o-trackurl', o.tracking_url || '', { placeholder: 'https://…' })) +
      (canEdit() ? '<button class="btn btn-sm btn-block" type="button" id="o-save-tracking">Enregistrer le suivi</button>' : '')
    : '';

  return '<aside class="panel">' +
    '<div class="panel-head"><h2>' + esc(o.reference) + '</h2>' + orderBadge(o.status) + '</div>' +
    '<div class="panel-body">' +

      '<div class="lbl">Mode de réception</div>' +
      '<p>' + icon(ful[1], 'icon-sm') + ' ' + esc(ful[0]) + '</p>' +
      (o.fulfilment === 'pickup'
        ? '<p class="dim" style="font-size:11px">Le client vient chercher sa commande en boutique.</p>'
        : (a.address
            ? '<p class="dim">' + esc([a.address, a.address2, a.zip, a.city, a.country].filter(Boolean).join(', ')) + '</p>'
            : '<p class="dim">Adresse non renseignée.</p>')) +

      '<div class="lbl" style="margin-top:18px">Client</div>' +
      (name ? '<p>' + esc(name) + '</p>' : '') +
      '<p class="dim">' + esc(o.email) + '</p>' +
      (a.phone ? '<p class="dim">' + esc(a.phone) + '</p>' : '') +

      '<div class="lbl" style="margin-top:18px">Articles</div>' + (items || '<p class="dim">Aucune ligne.</p>') +

      '<div class="lbl" style="margin-top:18px">Montants</div>' +
      '<div class="total-row"><span>Sous-total</span><span>' + money(o.subtotal) + '</span></div>' +
      (Number(o.discount) ? '<div class="total-row"><span>Remise' + (o.promo_code ? ' (' + esc(o.promo_code) + ')' : '') + '</span><span>− ' + money(o.discount) + '</span></div>' : '') +
      '<div class="total-row"><span>' + esc(o.shipping_method || 'Livraison') + '</span><span>' + (Number(o.shipping) === 0 ? 'Offerte' : money(o.shipping)) + '</span></div>' +
      '<div class="total-row is-total"><span>Total</span><span>' + money(o.total) + '</span></div>' +
      '<p class="dim" style="font-size:11px;margin-top:6px">' + esc(o.payment_method || '—') +
        (o.paid_at ? ' · payée le ' + dateTimeFR(o.paid_at) : '') + '</p>' +

      shipBlock +

      (o.status === 'pending'
        ? '<p class="dim" style="margin-top:18px;font-size:11px">Paiement non confirmé. Cette commande passera d\'elle-même en ' +
          '« Payée » dès que Stripe l\'aura validée, ou sera annulée automatiquement.</p>' : '') +
    '</div>' +

    (canEdit() && !closed
      ? '<div class="panel-foot">' +
          (next ? '<button class="btn btn-primary btn-block" type="button" id="o-advance" data-next="' + next + '">' +
            icon('check', 'icon-sm') + esc(STATUS_ACTION[next]) + '</button>' : '') +
          (o.status !== 'pending' ? '<button class="btn btn-danger" type="button" id="o-cancel">Annuler</button>' : '') +
        '</div>'
      : '') +
  '</aside>';
}

async function setOrderStatus(id, status) {
  const { error } = await sb.from('orders').update({ status: status }).eq('id', id);
  if (error) { toast('Statut non modifié : ' + error.message, 'err'); return false; }
  await logActivity('order_status', 'orders', id, { status: status });
  store.orders = null; store.stats = null;
  toast('Commande mise à jour. Le client peut la suivre en ligne.', 'ok');
  return true;
}

function afterOrders() {
  document.querySelectorAll('[data-order-filter]').forEach(function (b) {
    b.addEventListener('click', function () { app.orderFilter = b.dataset.orderFilter; route(); });
  });

  document.querySelectorAll('[data-order]').forEach(function (tr) {
    tr.addEventListener('click', function () {
      const panel = document.querySelector('.panel');
      if (panel) panel.outerHTML = orderPanel(+tr.dataset.order);
      wirePanel();
      bindOrderPanel();
    });
  });

  bindOrderPanel();
}

function bindOrderPanel() {
  const o = (app.orderList || [])[app.orderIndex || 0];
  if (!o) return;

  const adv = document.getElementById('o-advance');
  if (adv) adv.addEventListener('click', async function () {
    adv.disabled = true;
    if (await setOrderStatus(o.id, adv.dataset.next)) route(); else adv.disabled = false;
  });

  const cancel = document.getElementById('o-cancel');
  if (cancel) cancel.addEventListener('click', async function () {
    if (!confirmAction('Annuler cette commande ? Le remboursement éventuel se fait depuis Stripe.')) return;
    if (await setOrderStatus(o.id, 'cancelled')) route();
  });

  const save = document.getElementById('o-save-tracking');
  if (save) save.addEventListener('click', async function () {
    save.disabled = true;
    const { error } = await sb.from('orders').update({
      carrier: document.getElementById('o-carrier').value.trim() || null,
      tracking_number: document.getElementById('o-tracking').value.trim() || null,
      tracking_url: document.getElementById('o-trackurl').value.trim() || null
    }).eq('id', o.id);
    save.disabled = false;
    if (error) { toast('Suivi non enregistré : ' + error.message, 'err'); return; }
    await logActivity('order_tracking', 'orders', o.id);
    store.orders = null;
    toast('Informations de suivi enregistrées', 'ok');
    route();
  });
}

/* ================================ PRODUITS =============================== */
async function pageProducts() {
  const prods = await loadProducts();

  if (!prods.length) {
    return '<section class="card">' + cardHead('Produits') +
      emptyBlock('Catalogue vide', 'Aucun produit en base de données.') + '</section>';
  }

  const rows = prods.map(function (p, i) {
    const stock = productStock(p);
    return '<tr data-product="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td class="c-main"><div class="cell-main">' + (firstImage(p) ? '<img class="thumb" src="' + esc(firstImage(p)) + '" alt="">' : '') +
        '<div><div class="t-title">' + esc(p.name) + '</div><div class="t-sub">' + esc(p.slug) + '</div></div></div></td>' +
      '<td data-l="Catégorie">' + esc(p.category) + '</td>' +
      '<td data-l="Genre" class="dim">' + esc(p.gender || '—') + '</td>' +
      '<td data-l="Prix" class="right nowrap">' + money(p.price) + '</td>' +
      '<td data-l="Variantes" class="right">' + (p.product_variants || []).length + '</td>' +
      '<td data-l="Stock" class="right">' + (stock ? stock : badge('À saisir', 'warning')) + '</td>' +
      '<td data-l="Statut">' + badge(p.status === 'active' ? 'Actif' : p.status === 'draft' ? 'Brouillon' : 'Archivé',
        p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'info') + '</td></tr>';
  }).join('');

  const active = prods.filter(function (p) { return p.status === 'active'; }).length;
  const stock = prods.reduce(function (s, p) { return s + productStock(p); }, 0);

  return '<div class="kpi-row mb-18">' +
      kpiCard({ label: 'Produits', value: String(prods.length), icon: 'products', tone: 'b' }) +
      kpiCard({ label: 'En ligne', value: String(active), icon: 'check', tone: 'g' }) +
      kpiCard({ label: 'Variantes', value: String(prods.reduce(function (s, p) { return s + (p.product_variants || []).length; }, 0)), icon: 'collections', tone: 'v' }) +
      kpiCard({ label: 'Unités en stock', value: String(stock), icon: 'stocks', tone: stock ? 'g' : 'a' }) +
    '</div>' +
    '<div class="grid-main g-side">' +
      '<section class="card">' +
        cardHead('Catalogue', '<span class="badge-count">' + prods.length + '</span>') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th>Catégorie</th><th>Genre</th>' +
        '<th class="right">Prix</th><th class="right">Variantes</th><th class="right">Stock</th><th>Statut</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
      '</section>' + productPanel(0) + '</div>';
}

function productPanel(i) {
  const p = (store.products || [])[i];
  if (!p) return '';

  const gallery = (p.images || []).slice(0, 6).map(function (src) {
    return '<img class="thumb" src="' + esc(mediaSrc(src)) + '" alt="" style="width:52px;height:52px">';
  }).join('');

  const variants = (p.product_variants || []).slice().sort(function (a, b) {
    return (a.color || '').localeCompare(b.color || '') || (a.size || '').localeCompare(b.size || '');
  }).map(function (v) {
    return '<tr><td class="dim">' + esc(v.sku) + '</td><td>' + esc(v.color || '—') + '</td>' +
      '<td>' + esc(v.size || '—') + '</td><td class="right">' + v.stock + '</td></tr>';
  }).join('');

  return '<aside class="panel">' +
    '<div class="panel-head"><h2>' + esc(p.name) + '</h2></div>' +
    '<div class="panel-body">' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' + gallery + '</div>' +
      field('Nom', input('p-name', p.name, { disabled: true })) +
      '<div class="field-row">' + field('Prix', input('p-price', String(p.price), { type: 'number', disabled: true })) +
        field('Catégorie', input('p-cat', p.category, { disabled: true })) + '</div>' +
      field('Description', '<textarea class="textarea" id="p-desc" disabled>' + esc(p.description || '') + '</textarea>') +
      '<p class="dim" style="font-size:11px;margin:-6px 0 16px">Les fiches produits sont encore servies par le fichier ' +
        'catalogue du site. Modifier un nom ou un prix ici ne changerait pas la boutique : ces champs restent donc en lecture seule ' +
        'tant que le site public ne lit pas la base.</p>' +
      '<div class="lbl">Variantes et stock</div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>SKU</th><th>Couleur</th><th>Taille</th><th class="right">Stock</th></tr></thead>' +
      '<tbody>' + variants + '</tbody></table></div>' +
      '<p class="dim" style="margin-top:12px;font-size:11px">Les quantités se modifient depuis l\'écran Stocks : elles sont bien enregistrées en base.</p>' +
    '</div></aside>';
}

function afterProducts() {
  document.querySelectorAll('[data-product]').forEach(function (tr) {
    tr.addEventListener('click', function () {
      const panel = document.querySelector('.panel');
      if (panel) panel.outerHTML = productPanel(+tr.dataset.product);
      wirePanel();
    });
  });
}

/* ============================== COLLECTIONS ============================== */
async function pageCollections() {
  const prods = await loadProducts();

  /* Les collections sont les catégories réellement présentes au catalogue. */
  const map = {};
  prods.forEach(function (p) {
    if (!map[p.category]) map[p.category] = { name: p.category, count: 0, img: '' };
    map[p.category].count++;
    if (!map[p.category].img) map[p.category].img = firstImage(p);
  });
  const cols = Object.keys(map).map(function (k) { return map[k]; })
    .sort(function (a, b) { return b.count - a.count; });

  const rows = cols.map(function (c, i) {
    return '<tr>' +
      '<td class="c-main"><div class="cell-main">' + (c.img ? '<img class="thumb" src="' + esc(c.img) + '" alt="">' : '') +
        '<div><div class="t-title">' + esc(c.name) + '</div><div class="t-sub">Catégorie du catalogue</div></div></div></td>' +
      '<td data-l="Produits" class="right">' + c.count + '</td>' +
      '<td data-l="Ordre" class="right dim">' + (i + 1) + '</td>' +
      '<td data-l="Statut">' + badge('En ligne', 'success') + '</td></tr>';
  }).join('');

  return '<section class="card">' +
    cardHead('Collections', '<span class="badge-count">' + cols.length + '</span>') +
    (cols.length
      ? '<div class="table-wrap"><table class="table"><thead><tr><th>Collection</th><th class="right">Produits</th>' +
        '<th class="right">Ordre</th><th>Statut</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="card-foot"><span class="dim" style="font-size:11px">Les collections suivent les catégories des produits. ' +
        'Pour en créer une nouvelle, ajoutez une catégorie sur un produit.</span></div>'
      : emptyBlock('Aucune collection', 'Les collections se construisent à partir des catégories du catalogue.')) +
    '</section>';
}

/* Le suivi des stocks décide si une vente est refusée quand la quantité
   tombe à zéro. Tant qu'il est éteint, la boutique vend sans compter. */
function inventoryBanner(prods, total) {
  const tracked = prods.filter(function (p) { return p.track_inventory; }).length;
  const all = prods.length;

  if (tracked === all && all > 0) {
    return '<div class="demo-flag mb-18" style="border-color:var(--green)">' + icon('check', 'icon-sm') +
      'Suivi des stocks actif : une taille en rupture ne peut plus être commandée sur le site.' +
      (canEdit() ? ' <button class="btn btn-sm" type="button" id="track-off" style="margin-left:auto">Désactiver</button>' : '') +
    '</div>';
  }

  return '<div class="demo-flag mb-18">' + icon('alert', 'icon-sm') +
    '<span>Le suivi des stocks est <strong>désactivé</strong>' + (tracked ? ' pour ' + (all - tracked) + ' produit(s)' : '') +
    ' : la boutique accepte les commandes même à zéro. ' +
    (total === 0
      ? 'Saisissez d\'abord les quantités ci-dessous, puis activez le suivi.'
      : 'Activez-le une fois vos quantités vérifiées.') + '</span>' +
    (canEdit() ? '<button class="btn btn-sm btn-primary" type="button" id="track-on" style="margin-left:auto;flex:none">Activer le suivi</button>' : '') +
  '</div>';
}

/* ================================= STOCKS ================================ */
async function pageStocks() {
  const prods = await loadProducts();
  const moves = await loadMovements();

  const all = [];
  prods.forEach(function (p) {
    (p.product_variants || []).forEach(function (v) { all.push({ p: p, v: v }); });
  });
  all.sort(function (a, b) { return a.v.stock - b.v.stock; });

  const total = all.reduce(function (s, r) { return s + r.v.stock; }, 0);
  const out = all.filter(function (r) { return r.v.stock === 0; }).length;
  const low = all.filter(function (r) { return r.v.stock > 0 && r.v.stock <= r.v.low_stock_at; }).length;
  const value = all.reduce(function (s, r) { return s + r.v.stock * Number(r.p.price); }, 0);

  const rows = all.slice(0, 120).map(function (r) {
    return '<tr data-variant="' + esc(r.v.id) + '">' +
      '<td class="c-main"><div class="cell-main">' + (firstImage(r.p) ? '<img class="thumb" src="' + esc(firstImage(r.p)) + '" alt="">' : '') +
        '<div><div class="t-title">' + esc(r.p.name) + '</div><div class="t-sub">' + esc(r.v.sku) + '</div></div></div></td>' +
      '<td data-l="Couleur">' + esc(r.v.color || '—') + '</td>' +
      '<td data-l="Taille">' + esc(r.v.size || '—') + '</td>' +
      '<td data-l="Stock" class="right"><input class="input stock-input" type="number" min="0" value="' + r.v.stock +
        '" data-stock-for="' + esc(r.v.id) + '" style="width:84px;text-align:right"' + (canEdit() ? '' : ' disabled') + '></td>' +
      '<td data-l="Statut">' + badge(r.v.stock === 0 ? 'Rupture' : r.v.stock <= r.v.low_stock_at ? 'Faible' : 'En stock',
        r.v.stock === 0 ? 'danger' : r.v.stock <= r.v.low_stock_at ? 'warning' : 'success') + '</td></tr>';
  }).join('');

  const movesHtml = moves.length
    ? moves.map(function (m) {
        const v = m.product_variants || {};
        const prod = v.products || {};
        return '<div class="list-row"><span class="grow"><span class="name">' + esc(prod.name || v.sku || '—') + '</span>' +
          '<span class="sub">' + esc(m.reason) + ' · ' + dateTimeFR(m.created_at) + '</span></span>' +
          '<strong class="nowrap ' + (m.delta > 0 ? 'pos' : 'neg') + '">' + (m.delta > 0 ? '+' : '') + m.delta + '</strong></div>';
      }).join('')
    : '<p class="dim" style="padding:14px">Aucun mouvement enregistré. Chaque correction de stock sera tracée ici.</p>';

  return '<div class="kpi-row mb-18">' +
      kpiCard({ label: 'Unités en stock', value: String(total), icon: 'stocks', tone: total ? 'g' : 'a' }) +
      kpiCard({ label: 'Valeur du stock', value: money(value), icon: 'euro', tone: 'v' }) +
      kpiCard({ label: 'Stock faible', value: String(low), icon: 'alert', tone: 'a' }) +
      kpiCard({ label: 'Ruptures', value: String(out), icon: 'xcircle', tone: 'r' }) +
    '</div>' +
    inventoryBanner(prods, total) +
    '<div class="grid-main g-side">' +
      '<section class="card">' + cardHead('Toutes les références', '<span class="badge-count">' + all.length + '</span>') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th>Couleur</th><th>Taille</th>' +
        '<th class="right">Stock</th><th>Statut</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</section>' +
      '<aside class="panel"><div class="panel-head"><h2>Derniers mouvements</h2></div>' +
        '<div class="panel-body">' + movesHtml + '</div></aside>' +
    '</div>';
}

/* Enregistrement d'un stock modifié : la valeur et le mouvement associé. */
async function saveStock(variantId, next, previous) {
  const delta = next - previous;
  if (!delta) return;
  const { error } = await sb.from('product_variants').update({ stock: next }).eq('id', variantId);
  if (error) { toast('Stock non enregistré : ' + error.message, 'err'); return false; }
  await sb.from('stock_movements').insert({
    variant_id: variantId, delta: delta, reason: 'Correction manuelle', created_by: app.profile.id
  });
  await logActivity('update_stock', 'product_variants', variantId, { delta: delta });
  store.products = null; store.moves = null; store.stats = null;
  toast('Stock mis à jour (' + (delta > 0 ? '+' : '') + delta + ')', 'ok');
  return true;
}

async function setInventoryTracking(on) {
  const { error } = await sb.from('products').update({ track_inventory: on }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) { toast('Modification impossible : ' + error.message, 'err'); return; }
  await logActivity(on ? 'inventory_on' : 'inventory_off', 'products', null);
  store.products = null; store.stats = null;
  toast(on ? 'Suivi des stocks activé : les ruptures bloquent désormais la vente.'
           : 'Suivi des stocks désactivé.', 'ok');
  route();
}

function afterStocks() {
  const on = document.getElementById('track-on');
  if (on) on.addEventListener('click', function () {
    if (confirmAction('Activer le suivi des stocks ? Toute taille à zéro deviendra impossible à commander sur le site.')) setInventoryTracking(true);
  });
  const off = document.getElementById('track-off');
  if (off) off.addEventListener('click', function () {
    if (confirmAction('Désactiver le suivi ? La boutique acceptera des commandes sur des articles en rupture.')) setInventoryTracking(false);
  });

  document.querySelectorAll('[data-stock-for]').forEach(function (inp) {
    const before = Number(inp.value);
    inp.addEventListener('change', async function () {
      const next = Math.max(0, Math.round(Number(inp.value) || 0));
      inp.value = next;
      const ok = await saveStock(inp.dataset.stockFor, next, before);
      if (!ok) inp.value = before;
      else route();
    });
  });
}

/* =============================== PROMOTIONS ============================== */
async function pagePromotions() {
  const promos = await loadPromos();

  const rows = promos.map(function (p) {
    const now = Date.now();
    const started = !p.starts_at || new Date(p.starts_at).getTime() <= now;
    const ended = p.ends_at && new Date(p.ends_at).getTime() < now;
    const state = !p.active ? ['Désactivée', 'info'] : ended ? ['Terminée', 'danger'] : !started ? ['Planifiée', 'warning'] : ['Active', 'success'];
    const red = p.kind === 'percent' ? '− ' + p.value + ' %' : p.kind === 'amount' ? '− ' + money(p.value) : 'Livraison offerte';
    return '<tr data-promo="' + esc(p.id) + '">' +
      '<td class="c-main"><div class="t-title">' + esc(p.code) + '</div><div class="t-sub">' + esc(p.label || '') + '</div></td>' +
      '<td data-l="Réduction" class="nowrap">' + red + '</td>' +
      '<td data-l="Période" class="dim nowrap">' + (p.starts_at ? dateFR(p.starts_at) : '—') + ' → ' + (p.ends_at ? dateFR(p.ends_at) : '—') + '</td>' +
      '<td data-l="Utilisations" class="right">' + p.used_count + (p.max_uses ? ' / ' + p.max_uses : '') + '</td>' +
      '<td data-l="Statut">' + badge(state[0], state[1]) + '</td>' +
      (canEdit() ? '<td data-l="Actions"><button class="btn btn-icon btn-sm" type="button" data-promo-del="' + esc(p.id) + '" aria-label="Supprimer">' + icon('trash', 'icon-sm') + '</button></td>' : '<td></td>') +
    '</tr>';
  }).join('');

  const form = canEdit() ? '<aside class="panel">' +
    '<div class="panel-head"><h2>Nouvelle promotion</h2></div>' +
    '<div class="panel-body">' +
      field('Code *', input('pr-code', '', { placeholder: 'NOVRA10' })) +
      field('Intitulé', input('pr-label', '', { placeholder: '-10 % sur tout le site' })) +
      '<div class="field-row">' +
        field('Type', select('pr-kind', [['percent', 'Pourcentage'], ['amount', 'Montant fixe'], ['free_shipping', 'Livraison offerte']], 'percent')) +
        field('Valeur', input('pr-value', '10', { type: 'number' })) + '</div>' +
      '<div class="field-row">' +
        field('Début', input('pr-start', '', { type: 'date' })) +
        field('Fin', input('pr-end', '', { type: 'date' })) + '</div>' +
      '<div class="field-row">' +
        field('Panier minimum', input('pr-min', '0', { type: 'number' })) +
        field('Utilisations max', input('pr-max', '', { type: 'number' })) + '</div>' +
    '</div>' +
    '<div class="panel-foot"><button class="btn btn-primary btn-block" type="button" id="pr-create">Créer la promotion</button></div>' +
  '</aside>' : '';

  return '<div class="grid-main g-side">' +
    '<section class="card">' +
      cardHead('Codes promo', '<span class="badge-count">' + promos.length + '</span>') +
      (promos.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th>Code</th><th>Réduction</th><th>Période</th>' +
          '<th class="right">Utilisations</th><th>Statut</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : emptyBlock('Aucun code promo', 'Créez votre premier code avec le formulaire ci-contre. Il sera immédiatement enregistré en base.')) +
    '</section>' + form + '</div>';
}

function afterPromotions() {
  const btn = document.getElementById('pr-create');
  if (btn) btn.addEventListener('click', async function () {
    const code = (document.getElementById('pr-code').value || '').trim().toUpperCase();
    if (!code) { toast('Le code est obligatoire.', 'err'); return; }
    const start = document.getElementById('pr-start').value;
    const end = document.getElementById('pr-end').value;
    const max = document.getElementById('pr-max').value;

    btn.disabled = true;
    const { error } = await sb.from('promotions').insert({
      code: code,
      label: document.getElementById('pr-label').value || null,
      kind: document.getElementById('pr-kind').value,
      value: Number(document.getElementById('pr-value').value) || 0,
      min_amount: Number(document.getElementById('pr-min').value) || 0,
      starts_at: start ? new Date(start).toISOString() : null,
      ends_at: end ? new Date(end + 'T23:59:59').toISOString() : null,
      max_uses: max ? Number(max) : null
    });
    btn.disabled = false;
    if (error) {
      toast(error.code === '23505' ? 'Ce code existe déjà.' : 'Création impossible : ' + error.message, 'err');
      return;
    }
    await logActivity('create_promotion', 'promotions', code);
    store.promos = null; store.stats = null;
    toast('Promotion créée', 'ok');
    route();
  });

  document.querySelectorAll('[data-promo-del]').forEach(function (b) {
    b.addEventListener('click', async function () {
      if (!confirmAction('Supprimer définitivement ce code promo ?')) return;
      const { error } = await sb.from('promotions').delete().eq('id', b.dataset.promoDel);
      if (error) { toast('Suppression impossible : ' + error.message, 'err'); return; }
      store.promos = null; store.stats = null;
      toast('Promotion supprimée', 'ok');
      route();
    });
  });
}

/* ================================== CRM ================================== */
async function pageCrm() {
  const customers = await loadCustomers();
  const orders = await loadOrders();

  const spend = {};
  orders.forEach(function (o) {
    if (!o.customer_id) return;
    if (!spend[o.customer_id]) spend[o.customer_id] = { total: 0, n: 0 };
    spend[o.customer_id].total += Number(o.total);
    spend[o.customer_id].n++;
  });

  if (!customers.length) {
    return '<section class="card">' + cardHead('Clients') +
      emptyBlock('Aucun client enregistré',
        "Les fiches clients seront créées automatiquement à la première commande. " +
        "Les inscriptions à la newsletter alimenteront également cette liste une fois le formulaire branché.") +
      '</section>';
  }

  const rows = customers.map(function (c) {
    const name = ((c.first_name || '') + ' ' + (c.last_name || '')).trim() || '—';
    const s = spend[c.id] || { total: 0, n: 0 };
    return '<tr>' +
      '<td class="c-main"><div class="cell-main"><span class="avatar">' + initials(name === '—' ? c.email : name) + '</span>' +
        '<div><div class="t-title">' + esc(name) + '</div><div class="t-sub">' + esc(c.email) + '</div></div></div></td>' +
      '<td data-l="Ville" class="dim">' + esc(c.city || '—') + '</td>' +
      '<td data-l="Commandes" class="right">' + s.n + '</td>' +
      '<td data-l="Total dépensé" class="right nowrap">' + money(s.total) + '</td>' +
      '<td data-l="Inscrit le" class="dim nowrap">' + dateFR(c.created_at) + '</td>' +
      '<td data-l="Newsletter">' + (c.newsletter ? badge('Oui', 'success') : badge('Non', 'info')) + '</td></tr>';
  }).join('');

  const totalSpent = Object.keys(spend).reduce(function (s, k) { return s + spend[k].total; }, 0);

  return '<div class="kpi-row mb-18">' +
      kpiCard({ label: 'Clients', value: String(customers.length), icon: 'users', tone: 'b' }) +
      kpiCard({ label: 'Inscrits newsletter', value: String(customers.filter(function (c) { return c.newsletter; }).length), icon: 'newsletter', tone: 'v' }) +
      kpiCard({ label: 'Chiffre d\'affaires client', value: money(totalSpent), icon: 'euro', tone: 'g' }) +
    '</div>' +
    '<section class="card">' + cardHead('Tous les clients', '<span class="badge-count">' + customers.length + '</span>') +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Client</th><th>Ville</th><th class="right">Commandes</th>' +
      '<th class="right">Total dépensé</th><th>Inscrit le</th><th>Newsletter</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '</section>';
}

/* =============================== ANALYTICS =============================== */
async function pageAnalytics() {
  const s = await loadStats();
  const prods = await loadProducts();

  const daily = s.daily || [];
  const values = daily.map(function (d) { return Number(d.revenue || 0); });
  const labels = daily.map(function (d) { return new Date(d.d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); });
  const hasRevenue = values.some(function (v) { return v > 0; });

  const rev = Number(s.revenue_30d || 0);
  const n = Number(s.orders_30d || 0);

  return '<div class="kpi-row mb-18">' +
      kpiCard({ label: "Chiffre d'affaires (30 j)", value: money(rev), delta: pct(rev, Number(s.revenue_prev30 || 0)), icon: 'trend', tone: 'g' }) +
      kpiCard({ label: 'Commandes (30 j)', value: String(n), icon: 'cart', tone: 'b' }) +
      kpiCard({ label: 'Panier moyen', value: money(n ? rev / n : 0), icon: 'bag', tone: 'v' }) +
      kpiCard({ label: 'Références actives', value: String(s.products_active || 0), icon: 'products', tone: 'b' }) +
    '</div>' +

    '<div class="grid-main g-side">' +
      '<section class="card">' + cardHead("Chiffre d'affaires", '<span class="chip">30 derniers jours</span>') +
        (hasRevenue
          ? '<div class="chart-box">' + lineChart(values, labels, { color: 'var(--green)' }) + '</div>'
          : emptyBlock('Pas encore de données de vente',
              "Les mesures d'audience et de conversion nécessitent un outil de mesure (Plausible, Matomo ou Google Analytics) " +
              "et un paiement en ligne actif. Aucune donnée n'est inventée ici.")) +
      '</section>' +
      '<aside class="panel"><div class="panel-head"><h2>Catalogue</h2></div>' +
        '<div class="panel-body">' +
          '<div class="total-row"><span>Produits</span><span>' + (s.products_total || 0) + '</span></div>' +
          '<div class="total-row"><span>En ligne</span><span>' + (s.products_active || 0) + '</span></div>' +
          '<div class="total-row"><span>Unités en stock</span><span>' + (s.stock_units || 0) + '</span></div>' +
          '<div class="total-row"><span>Stock faible</span><span>' + (s.stock_low || 0) + '</span></div>' +
          '<div class="total-row"><span>Ruptures</span><span>' + (s.stock_out || 0) + '</span></div>' +
          '<div class="total-row is-total"><span>Prix moyen</span><span>' +
            money(prods.length ? prods.reduce(function (a, p) { return a + Number(p.price); }, 0) / prods.length : 0) + '</span></div>' +
        '</div></aside>' +
    '</div>';
}

/* ================================ PARAMÈTRES ============================= */
const WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/* Coordonnées de la boutique physique. Tant qu'elles sont vides, l'option
   « Retrait en boutique » n'apparaît pas dans le tunnel de commande : mieux
   vaut ne rien proposer que d'annoncer un retrait impossible. */
function storeCard(s) {
  const hours = Array.isArray(s.hours) ? s.hours : [];
  const byDay = {};
  hours.forEach(function (h) { byDay[h.day] = h.hours; });

  const ready = Boolean(s.address && s.city);

  return '<section class="card settings-card">' +
    '<div class="card-head"><h3 style="display:flex;align-items:center;gap:9px">' + icon('home') + 'Boutique physique et retrait</h3>' +
      badge(ready ? 'Retrait actif' : 'Retrait indisponible', ready ? 'success' : 'warning') + '</div>' +
    '<div class="card-pad">' +
      (ready ? '' : '<p class="dim" style="margin-top:0;font-size:12px">Renseignez au minimum l\'adresse et la ville : ' +
        'l\'option de retrait apparaîtra alors automatiquement dans le tunnel de commande.</p>') +
      field('Nom affiché', input('st-name', s.name || '', { placeholder: 'Boutique NOVRA' })) +
      field('Adresse', input('st-address', s.address || '', { placeholder: '12 rue de la Paix' })) +
      '<div class="field-row">' +
        field('Code postal', input('st-zip', s.zip || '', { placeholder: '75002' })) +
        field('Ville', input('st-city', s.city || '', { placeholder: 'Paris' })) + '</div>' +
      '<div class="field-row">' +
        field('Téléphone', input('st-phone', s.phone || '', { placeholder: '01 23 45 67 89' })) +
        field('E-mail boutique', input('st-email', s.email || '', { type: 'email' })) + '</div>' +

      '<div class="lbl" style="margin-top:16px">Horaires d\'ouverture</div>' +
      '<p class="dim" style="font-size:11px;margin-top:-4px">Laissez vide un jour de fermeture : il ne sera pas affiché au client.</p>' +
      WEEK.map(function (d) {
        return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">' +
          '<span style="width:88px;font-size:12px">' + d + '</span>' +
          '<input class="input" id="st-h-' + d + '" value="' + esc(byDay[d] || '') + '" placeholder="10h – 19h" style="flex:1">' +
        '</div>';
      }).join('') +

      field('Consigne de retrait', '<textarea class="textarea" id="st-note" placeholder="Présentez votre numéro de commande au comptoir.">' +
        esc(s.pickup_note || '') + '</textarea>') +
    '</div>' +
    (canEdit()
      ? '<div class="card-foot"><button class="btn btn-primary" type="button" id="st-save">Enregistrer la boutique</button></div>'
      : '<div class="card-foot"><span class="dim">Votre rôle ne permet pas de modifier ces informations.</span></div>') +
  '</section>';
}

async function saveStore() {
  const hours = WEEK.map(function (d) {
    const v = (document.getElementById('st-h-' + d).value || '').trim();
    return v ? { day: d, hours: v } : null;
  }).filter(Boolean);

  const { error } = await sb.from('store_settings').update({
    name: document.getElementById('st-name').value.trim() || null,
    address: document.getElementById('st-address').value.trim() || null,
    zip: document.getElementById('st-zip').value.trim() || null,
    city: document.getElementById('st-city').value.trim() || null,
    phone: document.getElementById('st-phone').value.trim() || null,
    email: document.getElementById('st-email').value.trim() || null,
    pickup_note: document.getElementById('st-note').value.trim() || null,
    hours: hours,
    updated_at: new Date().toISOString()
  }).eq('id', true);

  if (error) { toast('Enregistrement impossible : ' + error.message, 'err'); return; }
  await logActivity('update_store', 'store_settings', null);
  store.settings = null;
  toast('Boutique enregistrée', 'ok');
  route();
}

function afterSettings() {
  const b = document.getElementById('st-save');
  if (b) b.addEventListener('click', function () { b.disabled = true; saveStore().finally(function () { b.disabled = false; }); });
}

async function pageSettings() {
  const { data } = await sb.from('store_settings').select('*').eq('id', true).maybeSingle();
  const s = data || {};

  const card = function (ico, title, body, foot) {
    return '<section class="card settings-card">' +
      '<div class="card-head"><h3 style="display:flex;align-items:center;gap:9px">' + icon(ico) + esc(title) + '</h3></div>' +
      '<div class="card-pad">' + body + '</div>' +
      (foot ? '<div class="card-foot">' + esc(foot) + '</div>' : '') + '</section>';
  };
  const tr = function (title, sub, id, on) {
    return '<label class="toggle-row"><span><strong>' + esc(title) + '</strong><small>' + esc(sub) + '</small></span>' + toggle(id, on, title) + '</label>';
  };

  return '<div class="settings-grid">' +
    storeCard(s) +
    card('settings', 'Général',
      field('Nom de la boutique', input('s-name', 'NOVRA')) +
      field('Email de contact', input('s-mail', 'contact@novra.com', { type: 'email' })) +
      field('Devise', select('s-cur', ['EUR (€) – Euro', 'CHF – Franc suisse'])) +
      field('Langue par défaut', select('s-lang', ['Français', 'English'])),
      'Ces informations apparaissent sur votre boutique.') +

    card('cart', 'E-commerce',
      field('Devise de la boutique', select('s-cur2', ['EUR (€) – Euro'])) +
      field('TVA par défaut (%)', input('s-vat', '20')) +
      field('Frais de livraison par défaut', input('s-ship', '4,90')) +
      field('Seuil livraison offerte', input('s-free', '80,00')),
      'Configurez vos options de vente et tarifs par défaut.') +

    card('search', 'SEO',
      field('Titre du site (meta title)', input('s-title', 'NOVRA')) +
      field('Description (meta description)', '<textarea class="textarea">NOVRA, vêtements et équipements sportifs conçus pour la performance.</textarea>') +
      '<div class="media-slot"><span>Image de partage (og:image)</span><div class="row">' +
        '<img class="prev" src="' + esc(mediaSrc('assets/novra-social-share-1200x630.png')) + '" alt="">' +
        '<div><button class="btn btn-sm" type="button">Remplacer</button><small>1200×630 · JPG ou PNG · 2 Mo max</small></div></div></div>',
      "Optimisez le référencement et l'apparence de partage.") +

    card('share', 'Réseaux sociaux',
      field('Instagram', input('s-ig', 'https://www.instagram.com/novra_officiel/')) +
      field('Facebook', input('s-fb', '')) +
      field('TikTok', input('s-tt', '')) +
      field('YouTube', input('s-yt', '')),
      'Vos réseaux sociaux affichés sur le site.') +

    card('truck', 'Livraison',
      field('Frais de livraison par défaut', input('s-ship2', '4,90')) +
      field('Livraison offerte à partir de', input('s-free2', '80,00')) +
      field('Délai de préparation', select('s-delay', ['24 h ouvrées', '1 à 2 jours ouvrés', '3 à 5 jours ouvrés'], '24 h ouvrées')) +
      field('Zones de livraison', select('s-zones', ['France, Belgique, Suisse, Luxembourg', 'France métropolitaine'])),
      'Gérez vos tarifs et zones de livraison.') +

    card('card', 'Paiement',
      '<div class="lbl">Méthodes de paiement activées</div>' +
      tr('Carte bancaire (Stripe)', '', 'pay-cb', false) +
      tr('PayPal', '', 'pay-pp', false) +
      tr('Apple Pay', '', 'pay-ap', false) +
      tr('Google Pay', '', 'pay-gp', false),
      'Aucun prestataire n\'est encore branché : le paiement reste une simulation.') +

    card('bell', 'Notifications',
      tr('Nouvelles commandes', 'Recevoir un email à chaque nouvelle commande', 'n-orders', true) +
      tr('Stock faible', 'Être notifié lorsque le stock est faible', 'n-stock', true) +
      tr('Avis clients', 'Recevoir un email pour les nouveaux avis', 'n-reviews', true) +
      tr('Newsletter', 'Recevoir les statistiques par email', 'n-news', false),
      'Choisissez les notifications à recevoir.') +

    card('shield', 'Sécurité',
      tr('Authentification à deux facteurs', 'Renforce la sécurité de votre compte', 'sec-2fa', false) +
      '<div class="toggle-row"><span><strong>Sessions actives</strong><small>Gérer les appareils connectés</small></span>' +
        '<button class="btn btn-sm" type="button">Voir</button></div>' +
      tr('Déconnexion automatique', 'Déconnecter après 30 min d\'inactivité', 'sec-auto', true) +
      tr('Alertes de connexion', 'Email en cas de nouvelle connexion', 'sec-alert', true),
      'Protégez votre compte et vos données.') +
  '</div>';
}

/* ============================ AVIS / SAV / NEWSLETTER ==================== */
function pageReviews() {
  return '<section class="card">' + cardHead('Avis clients') +
    emptyBlock('Aucun avis',
      "Le module d'avis n'est pas encore installé. Il nécessite une table dédiée et un formulaire sur la fiche produit. " +
      "Aucun avis fictif n'est affiché ici.") + '</section>';
}

/* ================================ RETOURS ================================ */
function pageSav() {
  return '<section class="card">' + cardHead('Retours et SAV') +
    emptyBlock('Aucune demande',
      "Les demandes de retour apparaîtront ici dès qu'une commande aura été passée et que le formulaire de retour sera en ligne.") +
    '</section>';
}

/* ============================== NEWSLETTER =============================== */
async function pageNewsletter() {
  const customers = await loadCustomers();
  const subs = customers.filter(function (c) { return c.newsletter; });

  return '<div class="kpi-row mb-18">' +
      kpiCard({ label: 'Abonnés', value: String(subs.length), icon: 'newsletter', tone: 'b' }) +
      kpiCard({ label: 'Contacts enregistrés', value: String(customers.length), icon: 'users', tone: 'v' }) +
    '</div>' +
    '<section class="card">' + cardHead('Abonnés à la newsletter', '<span class="badge-count">' + subs.length + '</span>') +
      (subs.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th>Adresse</th><th>Nom</th><th>Inscrit le</th></tr></thead><tbody>' +
          subs.map(function (c) {
            return '<tr><td>' + esc(c.email) + '</td><td class="dim">' +
              esc(((c.first_name || '') + ' ' + (c.last_name || '')).trim() || '—') + '</td>' +
              '<td class="dim nowrap">' + dateFR(c.created_at) + '</td></tr>';
          }).join('') + '</tbody></table></div>'
        : emptyBlock('Aucun abonné',
            "Le formulaire de newsletter du site n'est pas encore relié à la base : les adresses saisies ne sont enregistrées nulle part. " +
            "C'est le dernier branchement à faire avant la mise en ligne.")) +
    '</section>';
}
/* ============================= ADMINISTRATEURS =========================== */
async function pageAdmins() {
  const { data, error } = await sb.from('admin_profiles').select('*').order('created_at');
  if (error) return '<div class="card"><div class="empty-state">Cette page est réservée au super administrateur.</div></div>';

  const roles = { super_admin: 'Super admin', manager: 'Chef de projet', marketing: 'Marketing', support: 'Support' };
  const rows = (data || []).map(function (a) {
    return '<tr><td><div class="cell-main"><span class="avatar">' + initials(a.full_name || a.email) + '</span>' +
      '<div><div class="t-title">' + esc(a.full_name || '—') + '</div><div class="t-sub">' + esc(a.email) + '</div></div></div></td>' +
      '<td>' + badge(roles[a.role] || a.role, a.role === 'super_admin' ? 'warning' : 'info') + '</td>' +
      '<td>' + badge(a.active ? 'Actif' : 'Inactif', a.active ? 'success' : 'neutral') + '</td>' +
      '<td class="dim nowrap">' + (a.last_seen_at ? dateTimeFR(a.last_seen_at) : '—') + '</td>' +
      '<td class="dim nowrap">' + dateFR(a.created_at) + '</td></tr>';
  }).join('');

  return '<div class="grid-main g-side">' +
    '<section class="card">' + cardHead('Utilisateurs de l\'administration') +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th>' +
      '<th>Dernière connexion</th><th>Créé le</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
    '<aside class="card">' + cardHead('Inviter un administrateur') +
      '<div class="card-pad">' +
        '<p class="muted" style="margin-top:0">Les invitations se créent depuis Supabase → Authentication. ' +
        'Le rôle est attribué automatiquement si l\'adresse figure dans les pré-autorisations.</p>' +
        field('Adresse e-mail', input('inv-mail', '', { type: 'email', placeholder: 'prenom@novra.com' })) +
        field('Rôle', select('inv-role', [['manager', 'Chef de projet'], ['marketing', 'Marketing'], ['support', 'Support'], ['super_admin', 'Super admin']])) +
        '<button class="btn btn-primary btn-block" type="button" id="add-invite">' + icon('plus', 'icon-sm') + 'Pré-autoriser cette adresse</button>' +
      '</div></aside>' +
  '</div>';
}

/* ================================ JOURNAL ================================ */
async function pageJournal() {
  const { data } = await sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(150);
  const labels = { publish: 'Publication', save_draft: 'Brouillon enregistré', upload_media: 'Média téléversé', restore_version: 'Version restaurée' };
  const rows = (data || []).map(function (l) {
    return '<tr><td class="dim nowrap">' + dateTimeFR(l.created_at) + '</td>' +
      '<td><div class="cell-main"><span class="avatar">' + initials(l.actor_email) + '</span>' + esc(l.actor_email) + '</div></td>' +
      '<td>' + badge(labels[l.action] || l.action, l.action === 'publish' ? 'success' : 'info', true) + '</td>' +
      '<td class="dim">' + esc(l.entity || '—') + '</td></tr>';
  }).join('');
  return '<section class="card">' + cardHead("Journal d'activité") +
    (rows ? '<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Élément</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>'
          : '<div class="empty-state">Aucune activité enregistrée pour le moment.</div>') + '</section>';
}
