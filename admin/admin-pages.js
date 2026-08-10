/* =========================================================================
   NOVRA ADMIN — Écrans
   Les modules déjà reliés à Supabase (contenus, médiathèque, journal,
   administrateurs) affichent les données réelles. Les modules commerciaux
   ne disposent pas encore de tables : leurs écrans sont bâtis sur des
   données de démonstration explicitement signalées.
   ========================================================================= */

/* --------------------- Jeu de démonstration commerciale ------------------ */
const DEMO = {
  revenue: [12400, 18200, 15100, 30300, 19800, 21600, 28430],
  days: ['18 mai', '19 mai', '20 mai', '21 mai', '22 mai', '23 mai', '24 mai'],
  orders: [
    { id: '#10524', client: 'Laurent Moreau', mail: 'laurent.m@example.com', date: '24 mai 2025', hour: '10:18', total: 319, items: 2, pay: 'Carte bancaire', payMeta: '•••• 4242', ship: 'Chronopost', shipDate: '24 mai 2025', status: 'Payée', tone: 'success' },
    { id: '#10523', client: 'Emma Dubois', mail: 'emma.d@example.com', date: '24 mai 2025', hour: '09:52', total: 129, items: 1, pay: 'PayPal', payMeta: '', ship: 'Colissimo', shipDate: '26 mai 2025', status: 'En préparation', tone: 'warning' },
    { id: '#10522', client: 'Yanis Bernard', mail: 'yanis.b@example.com', date: '24 mai 2025', hour: '09:21', total: 79, items: 1, pay: 'Apple Pay', payMeta: '', ship: 'Colissimo', shipDate: '26 mai 2025', status: 'Payée', tone: 'success' },
    { id: '#10521', client: 'Sophie Martin', mail: 'sophie.m@example.com', date: '23 mai 2025', hour: '18:43', total: 249, items: 2, pay: 'Carte bancaire', payMeta: '•••• 5678', ship: 'Chronopost', shipDate: '24 mai 2025', status: 'Expédiée', tone: 'info' },
    { id: '#10520', client: 'Lucas Petit', mail: 'lucas.p@example.com', date: '23 mai 2025', hour: '16:11', total: 59, items: 1, pay: 'PayPal', payMeta: '', ship: 'Colissimo', shipDate: '25 mai 2025', status: 'Livrée', tone: 'success' },
    { id: '#10519', client: 'Chloé Richard', mail: 'chloe.r@example.com', date: '23 mai 2025', hour: '13:05', total: 189, items: 2, pay: 'Carte bancaire', payMeta: '•••• 1111', ship: 'Chronopost', shipDate: '24 mai 2025', status: 'En préparation', tone: 'warning' },
    { id: '#10518', client: 'Thomas Leroy', mail: 'thomas.l@example.com', date: '22 mai 2025', hour: '21:36', total: 99, items: 1, pay: 'Apple Pay', payMeta: '', ship: 'Colissimo', shipDate: '24 mai 2025', status: 'Remboursée', tone: 'danger' }
  ],
  customers: [
    { name: 'Alexandre Diallo', mail: 'alex.diallo@email.com', tel: '+33 6 12 34 56 78', spent: 1890, orders: 12, avg: 157.5, last: '23 mai 2025', seg: 'VIP', tone: 'warning' },
    { name: 'Sarah Martin', mail: 'sarah.martin@email.com', tel: '+33 6 23 45 67 89', spent: 980, orders: 7, avg: 140, last: '21 mai 2025', seg: 'Actif', tone: 'success' },
    { name: 'Julien Bernard', mail: 'julien.bernard@email.com', tel: '+33 6 34 56 78 90', spent: 650, orders: 5, avg: 130, last: '19 mai 2025', seg: 'Actif', tone: 'success' },
    { name: 'Camille Petit', mail: 'camille.petit@email.com', tel: '+33 6 45 67 89 01', spent: 320, orders: 3, avg: 106.67, last: '17 mai 2025', seg: 'Nouveau', tone: 'info' },
    { name: 'Yanis Leroy', mail: 'yanis.leroy@email.com', tel: '+33 6 56 78 90 12', spent: 2150, orders: 15, avg: 143.33, last: '16 mai 2025', seg: 'VIP', tone: 'warning' },
    { name: 'Inès Dupont', mail: 'ines.dupont@email.com', tel: '+33 6 67 89 01 23', spent: 785, orders: 6, avg: 130.83, last: '14 mai 2025', seg: 'Actif', tone: 'success' },
    { name: 'Mathis Moreau', mail: 'mathis.moreau@email.com', tel: '+33 6 78 90 12 34', spent: 450, orders: 4, avg: 112.5, last: '12 mai 2025', seg: 'Nouveau', tone: 'info' },
    { name: 'Léa Rousseau', mail: 'lea.rousseau@email.com', tel: '+33 6 89 01 23 45', spent: 1120, orders: 8, avg: 140, last: '11 mai 2025', seg: 'Actif', tone: 'success' }
  ],
  promos: [
    { code: 'NOVRA10', desc: '-10% sur tout le site', type: 'Pourcentage', red: '-10 %', from: '20 mai 2025', to: '20 juin 2025', limit: '500 utilisations', left: 'reste 312', used: 188, status: 'Active', tone: 'success' },
    { code: 'FIRSTORDER', desc: '-15% première commande', type: 'Pourcentage', red: '-15 %', from: '15 mai 2025', to: '31 août 2025', limit: '1 000 utilisations', left: 'reste 812', used: 188, status: 'Active', tone: 'success' },
    { code: 'SUMMER20', desc: '-20% sur la collection été', type: 'Pourcentage', red: '-20 %', from: '1 juin 2025', to: '31 juil. 2025', limit: '300 utilisations', left: 'reste 142', used: 158, status: 'Planifiée', tone: 'warning' }
  ],
  movements: [
    { ico: 'cart', tone: 'g', title: 'Réassort fournisseur', sub: 'Veste Performance Pro - Noir - L', sku: 'NOV-VPP-BLK-L', qty: '+20', when: "Aujourd'hui 10:24", by: 'Par Mahamé' },
    { ico: 'bag', tone: 'r', title: 'Commande client', sub: 'Short Training - Noir - M', sku: 'NOV-SHT-BLK-M', qty: '−1', when: "Aujourd'hui 09:42", by: 'Par Système' },
    { ico: 'returns', tone: 'b', title: 'Retour client', sub: 'T-shirt Essential - Blanc - L', sku: 'NOV-TSE-WHT-L', qty: '+1', when: 'Hier 18:15', by: 'Par Système' },
    { ico: 'cart', tone: 'g', title: 'Réassort fournisseur', sub: 'Casquette NOVRA - Noir', sku: 'NOV-CAP-BLK', qty: '+50', when: 'Hier 16:03', by: 'Par Mahamé' },
    { ico: 'bag', tone: 'r', title: 'Commande client', sub: 'Veste Performance Pro - Noir - M', sku: 'NOV-VPP-BLK-M', qty: '−1', when: 'Hier 14:22', by: 'Par Système' }
  ]
};

/* Le catalogue réel du site alimente Produits et Stocks */
function catalogue() { return (typeof products !== 'undefined' && products.length) ? products : []; }

/* ================================ DASHBOARD ============================== */
function pageDashboard() {
  const kpis =
    kpiCard({ label: "Chiffre d'affaires", value: '28 430,00 €', icon: 'trend', tone: 'g', sub: 'vs 11 mai – 17 mai 2025' }) +
    kpiCard({ label: 'Commandes', value: '324', delta: 14.2, icon: 'cart', tone: 'b', sub: 'vs 11 mai – 17 mai 2025' }) +
    kpiCard({ label: 'Panier moyen', value: '87,75 €', delta: 6.7, icon: 'bag', tone: 'v', sub: 'vs 11 mai – 17 mai 2025' }) +
    kpiCard({ label: 'Nouveaux clients', value: '58', delta: 20, icon: 'user', tone: 'b', sub: 'vs 11 mai – 17 mai 2025' }) +
    kpiCard({ label: 'Retours en cours', value: '12', delta: -7.7, icon: 'returns', tone: 'a', sub: 'vs 11 mai – 17 mai 2025' });

  const top = catalogue().slice(0, 5).map(function (p, i) {
    return '<tr><td><div class="cell-main"><img class="thumb" src="' + esc(mediaSrc(p.images[0])) + '" alt="">' +
      '<div><div class="t-title">' + esc(p.name) + '</div><div class="t-sub">SKU : NOV-' + esc(p.id.slice(0, 3).toUpperCase()) + '-' + (100 + i) + '</div></div></div></td>' +
      '<td class="right">' + (56 - i * 8) + '</td><td class="right nowrap">' + money(p.price * (56 - i * 8)) + '</td></tr>';
  }).join('');

  const lowStock = catalogue().slice(0, 5).map(function (p, i) {
    const q = [6, 9, 12, 15, 18][i];
    return '<tr><td><div class="cell-main"><img class="thumb" src="' + esc(mediaSrc(p.images[0])) + '" alt="">' +
      '<div><div class="t-title">' + esc(p.name) + '</div><div class="t-sub">' + esc(p.categoryLabel) + '</div></div></div></td>' +
      '<td class="right">' + q + '</td><td class="right">' + badge(q < 8 ? 'Critique' : 'Faible', q < 8 ? 'danger' : 'warning') + '</td></tr>';
  }).join('');

  const orders = DEMO.orders.slice(0, 5).map(function (o) {
    return '<tr><td class="nowrap">' + esc(o.id) + '</td><td>' + esc(o.client) + '</td>' +
      '<td class="nowrap muted">' + esc(o.date) + ' · ' + esc(o.hour) + '</td>' +
      '<td class="right nowrap">' + money(o.total) + '</td><td class="right">' + badge(o.status, o.tone) + '</td></tr>';
  }).join('');

  const clients = DEMO.customers.slice(0, 5).map(function (c) {
    return '<div class="list-row"><span class="avatar">' + initials(c.name) + '</span>' +
      '<span class="grow"><span class="name">' + esc(c.name) + '</span><span class="sub">' + esc(c.mail) + '</span></span>' +
      '<span class="dim nowrap">' + c.orders + '</span><strong class="nowrap">' + money(c.spent) + '</strong></div>';
  }).join('');

  const cats = [
    { label: 'Vêtements', value: 12840, pct: '45,1 %', color: '#4f6bed' },
    { label: 'Accessoires', value: 6540, pct: '23,0 %', color: '#e0a33e' },
    { label: 'Chaussures', value: 5430, pct: '19,1 %', color: '#3fb984' },
    { label: 'Équipements', value: 2820, pct: '9,9 %', color: '#8b7ce8' },
    { label: 'Autres', value: 800, pct: '2,8 %', color: '#5c6068' }
  ];

  const marketing = [
    { label: 'Sessions', value: '12 845', d: '+ 12,4%', up: true },
    { label: 'Taux de conversion', value: '2,52 %', d: '+ 8,1%', up: true },
    { label: 'Coût / acquisition', value: '18,35 €', d: '- 6,3%', up: false },
    { label: 'ROAS', value: '4,21', d: '+ 15,7%', up: true }
  ].map(function (m) {
    return '<div class="mk-cell"><span>' + m.label + '</span><strong>' + m.value + '</strong>' +
      '<span class="' + (m.up ? 'pos' : 'neg') + '">' + m.d + '</span>' +
      sparkline([3, 5, 4, 7, 6, 8, 7, 9], { fill: true, color: m.up ? 'var(--green)' : 'var(--red)' }) + '</div>';
  }).join('');

  const quick = [
    ['products', 'Ajouter un produit', '#produits'], ['collections', 'Créer une collection', '#collections'],
    ['gift', 'Nouvelle promotion', '#promotions'], ['send', 'Envoyer newsletter', '#newsletter'],
    ['users', 'Ajouter un client', '#clients']
  ].map(function (q) { return '<a class="qa" href="' + q[2] + '">' + icon(q[0]) + '<span>' + q[1] + '</span></a>'; }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag('Chiffres commerciaux de démonstration — le module Commandes n\'est pas encore relié à la base.') + '</div>' +
    '<div class="kpi-row" style="margin-bottom:18px">' + kpis + '</div>' +

    '<div class="grid-main g-1-1-1" style="grid-template-columns:2.1fr 1.35fr 1.35fr;margin-bottom:18px">' +
      '<section class="card chart-card">' +
        cardHead("Évolution du chiffre d'affaires", '<span class="chip">7 derniers jours ' + icon('chevronD', 'icon-sm') + '</span>') +
        '<div class="chart-box"><div class="chart-value">28 430,00 € ' + badge('+ 18,6 %', 'success', true) +
        ' <span class="dim" style="font-size:12px;font-weight:400">vs période précédente</span></div>' +
        lineChart(DEMO.revenue, DEMO.days, { color: 'var(--green)' }) + '</div>' +
      '</section>' +

      '<section class="card">' + cardHead('Top produits') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th class="right">Ventes</th><th class="right">CA généré</th></tr></thead><tbody>' + top + '</tbody></table></div>' +
        '<div class="card-foot"><a class="card-link" href="#produits">Voir tous les produits ' + icon('arrowR', 'icon-sm') + '</a></div>' +
      '</section>' +

      '<section class="card">' + cardHead('Stocks à surveiller') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th class="right">Stock</th><th class="right">Statut</th></tr></thead><tbody>' + lowStock + '</tbody></table></div>' +
        '<div class="card-foot"><a class="card-link" href="#stocks">Voir tous les stocks ' + icon('arrowR', 'icon-sm') + '</a></div>' +
      '</section>' +
    '</div>' +

    '<div class="grid-main g-1-1-1" style="margin-bottom:18px">' +
      '<section class="card">' + cardHead('Dernières commandes', '<a class="card-link" href="#commandes">Voir toutes</a>') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Commande</th><th>Client</th><th>Date</th><th class="right">Montant</th><th class="right">Statut</th></tr></thead><tbody>' + orders + '</tbody></table></div>' +
      '</section>' +
      '<section class="card">' + cardHead('Derniers clients', '<a class="card-link" href="#clients">Voir tous</a>') +
        '<div class="card-pad">' + clients + '</div>' +
      '</section>' +
      '<section class="card">' + cardHead('Top catégories', '<a class="card-link" href="#analytics">Voir toutes</a>') +
        '<div class="donut-wrap">' + donut(cats, '28 430 €', 'Total') +
        '<div class="legend">' + cats.map(function (c) {
          return '<div class="legend-row"><i style="background:' + c.color + '"></i><span class="grow">' + c.label + '</span>' +
            '<strong>' + money(c.value) + '</strong><span class="dim">' + c.pct + '</span></div>';
        }).join('') + '</div></div>' +
      '</section>' +
    '</div>' +

    '<div class="grid-main g-1-1-1">' +
      '<section class="card">' + cardHead('Performance marketing', '<a class="card-link" href="#analytics">Voir le rapport</a>') +
        '<div class="mk-grid" style="grid-template-columns:repeat(2,1fr)">' + marketing + '</div></section>' +
      '<section class="card">' + cardHead('Actions rapides') + '<div class="qa-grid" style="grid-template-columns:repeat(3,1fr)">' + quick + '</div></section>' +
      '<section class="card" id="dash-activity">' + cardHead('Activité récente', '<a class="card-link" href="#journal">Voir tout</a>') +
        '<div id="dash-activity-body"><div class="card-pad"><div class="skeleton skel-line"></div><div class="skeleton skel-line" style="width:70%"></div></div></div></section>' +
    '</div>';
}

/* ================================ COMMANDES ============================== */
function pageOrders() {
  const rows = DEMO.orders.map(function (o, i) {
    return '<tr data-order="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td class="nowrap">' + esc(o.id) + '</td>' +
      '<td><div class="t-title">' + esc(o.client) + '</div><div class="t-sub">' + esc(o.mail) + '</div></td>' +
      '<td class="nowrap"><div>' + esc(o.date) + '</div><div class="t-sub">' + esc(o.hour) + '</div></td>' +
      '<td class="nowrap"><div>' + money(o.total) + '</div><div class="t-sub">' + o.items + ' article' + (o.items > 1 ? 's' : '') + '</div></td>' +
      '<td class="nowrap"><div>' + esc(o.pay) + '</div><div class="t-sub">' + esc(o.payMeta) + '</div></td>' +
      '<td class="nowrap"><div>' + esc(o.ship) + '</div><div class="t-sub">' + esc(o.shipDate) + '</div></td>' +
      '<td>' + badge(o.status, o.tone) + '</td>' +
      '<td><div style="display:flex;gap:4px"><button class="btn btn-icon btn-sm" type="button" aria-label="Voir">' + icon('eye', 'icon-sm') + '</button>' +
      '<button class="btn btn-icon btn-sm" type="button" aria-label="Actions">' + icon('more', 'icon-sm') + '</button></div></td></tr>';
  }).join('');

  const pending = DEMO.orders.filter(function (o) { return o.status === 'En préparation'; }).map(function (o) {
    return '<div class="list-row"><span class="name nowrap">' + esc(o.id) + '</span>' +
      '<span class="grow name">' + esc(o.client) + '</span><span class="nowrap">' + money(o.total) + '</span>' + badge(o.status, o.tone) + '</div>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag() + '</div>' +
    '<div class="filterbar">' +
      '<div><label>Statut</label>' + select('f-status', ['Tous les statuts', 'Nouvelle', 'Payée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée', 'Remboursée']) + '</div>' +
      '<div><label>Paiement</label>' + select('f-pay', ['Tous les paiements', 'Carte bancaire', 'PayPal', 'Apple Pay']) + '</div>' +
      '<div><label>Livraison</label>' + select('f-ship', ['Toutes les livraisons', 'Chronopost', 'Colissimo', 'Point relais']) + '</div>' +
      '<div class="grow search">' + icon('search', 'icon-sm') + '<input class="input" type="search" placeholder="Rechercher une commande, un client…"></div>' +
      '<button class="btn" type="button">' + icon('download', 'icon-sm') + 'Exporter</button>' +
    '</div>' +

    '<div class="grid-main" style="grid-template-columns:1fr 420px;align-items:start">' +
      '<div class="stack">' +
        '<section class="card"><div class="table-wrap"><table class="table"><thead><tr>' +
          '<th>Commande</th><th>Client</th><th>Date</th><th>Total</th><th>Paiement</th><th>Livraison</th><th>Statut</th><th>Actions</th>' +
          '</tr></thead><tbody id="orders-body">' + rows + '</tbody></table></div>' +
          '<div class="pagination"><span class="dim">Affichage de 1 à 7 sur 124 commandes</span>' + pager(4, 1) + '</div></section>' +

        '<div class="grid-main g-1-1-1">' +
          '<section class="card">' + cardHead('Commandes du jour') +
            '<div class="card-pad"><div class="chart-value">18 <span class="dim" style="font-size:13px;font-weight:400">commandes</span> ' +
            badge('+20%', 'success', true) + '</div>' + sparkline([4, 6, 5, 9, 7, 11, 9, 14, 12, 18], { fill: true, height: 60 }) + '</div></section>' +
          '<section class="card">' + cardHead('Commandes en attente') +
            '<div class="card-pad">' + pending + '</div>' +
            '<div class="card-foot"><a class="card-link" href="#commandes">Voir toutes les commandes en attente ' + icon('arrowR', 'icon-sm') + '</a></div></section>' +
          '<section class="card">' + cardHead('Aperçu des commandes', '<span class="chip">7 derniers jours</span>') +
            '<div class="card-pad">' +
              ['Total commandes|124|+15%|1', "Chiffre d'affaires|12 430,00 €|+18,6%|1", 'Panier moyen|100,24 €|+3,2%|1', 'Taux de conversion|2,45 %|-0,4%|0']
              .map(function (r) { const c = r.split('|');
                return '<div class="list-row"><span class="grow name muted">' + c[0] + '</span><strong>' + c[1] + '</strong>' +
                  '<span class="' + (c[3] === '1' ? 'pos' : 'neg') + '">' + c[2] + '</span></div>'; }).join('') +
            '</div></section>' +
        '</div>' +
      '</div>' +
      '<aside class="panel" id="order-panel">' + orderPanel(0) + '</aside>' +
    '</div>';
}

function orderPanel(i) {
  const o = DEMO.orders[i];
  const items = [
    { name: 'Veste Performance Pro', variant: 'Noir • L', qty: 1, price: 189, img: catalogue()[5] ? catalogue()[5].images[0] : '' },
    { name: 'Casquette NOVRA', variant: 'Noir', qty: 1, price: 49, img: catalogue()[3] ? catalogue()[3].images[0] : '' }
  ];
  return '<div class="panel-head"><div><div class="dim" style="font-size:12px">Commande</div>' +
      '<h2 style="display:flex;align-items:center;gap:10px">' + esc(o.id) + ' ' + badge(o.status, o.tone) + '</h2>' +
      '<div class="dim" style="font-size:12px">' + esc(o.date) + ' à ' + esc(o.hour) + '</div></div>' +
      '<button class="btn btn-icon btn-sm" type="button" aria-label="Fermer">' + icon('close', 'icon-sm') + '</button></div>' +
    '<div class="panel-body">' +
      '<div class="form-section-title" style="margin-top:0">Client</div>' +
      '<div class="list-row"><span class="avatar">' + initials(o.client) + '</span>' +
        '<span class="grow"><span class="name">' + esc(o.client) + '</span><span class="sub">' + esc(o.mail) + '</span>' +
        '<span class="sub">06 12 34 56 78</span></span>' +
        '<a class="btn btn-sm" href="#clients">Voir le client</a></div>' +

      '<div class="form-section-title">Résumé de la commande</div>' +
      items.map(function (it) {
        return '<div class="list-row"><img class="thumb" src="' + esc(mediaSrc(it.img)) + '" alt="">' +
          '<span class="grow"><span class="name">' + esc(it.name) + '</span><span class="sub">' + esc(it.variant) + '</span></span>' +
          '<span class="dim">' + it.qty + '</span><strong>' + money(it.price) + '</strong></div>';
      }).join('') +
      '<div class="list-row"><span class="grow muted">Sous-total</span><span>' + money(238) + '</span></div>' +
      '<div class="list-row"><span class="grow muted">Livraison<br><span class="sub">' + esc(o.ship) + '</span></span><span>' + money(5) + '</span></div>' +
      '<div class="list-row" style="border-bottom:0"><strong class="grow" style="font-size:15px">Total</strong>' +
        '<strong style="font-size:17px">' + money(243) + '</strong><span class="dim">TTC</span></div>' +

      '<div class="form-section-title">Informations</div>' +
      '<div class="list-row"><span class="grow muted">Paiement</span><span>' + esc(o.pay) + ' ' + esc(o.payMeta) + '</span></div>' +
      '<div class="list-row"><span class="grow muted">Livraison</span><span>' + esc(o.ship) + '<br><span class="sub">N° CHRO123456789FR</span></span></div>' +
      '<div class="list-row" style="border-bottom:0"><span class="grow muted">Adresse</span>' +
        '<span class="right">' + esc(o.client) + '<br><span class="sub">12 rue de la Paix<br>75002 Paris, France</span></span></div>' +
    '</div>' +
    '<div class="panel-foot"><button class="btn btn-block" type="button">' + icon('print', 'icon-sm') + 'Imprimer</button>' +
      '<button class="btn btn-block" type="button">' + icon('refresh', 'icon-sm') + 'Rembourser</button></div>';
}

/* ================================= PRODUITS ============================== */
function pageProducts() {
  const list = catalogue();
  const rows = list.map(function (p, i) {
    const stock = [42, 67, 120, 28, 54, 73, 98, 31, 12, 45, 60][i] || 40;
    return '<tr data-product="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td><input type="checkbox" aria-label="Sélectionner"></td>' +
      '<td><div class="cell-main"><img class="thumb" src="' + esc(mediaSrc(p.images[0])) + '" alt="">' +
        '<div><div class="t-title">' + esc(p.name) + '</div><div class="t-sub">SKU : NOV-' + esc(p.id.slice(0, 3).toUpperCase()) + '-' + String(100 + i) + '</div></div></div></td>' +
      '<td class="muted">' + esc(p.gender === 'unisexe' ? 'Unisexe' : p.gender.charAt(0).toUpperCase() + p.gender.slice(1)) + '</td>' +
      '<td class="nowrap">' + money(p.price) + '</td><td>' + stock + '</td>' +
      '<td>' + badge('Publié', 'success') + '</td>' +
      '<td>' + (p.newProduct ? badge('Nouveau', 'neutral', true) : (p.featured ? badge('Best-seller', 'warning', true) : '')) + '</td>' +
      '<td><div style="display:flex;gap:4px"><button class="btn btn-icon btn-sm" type="button" aria-label="Éditer">' + icon('edit', 'icon-sm') + '</button>' +
      '<button class="btn btn-icon btn-sm" type="button" aria-label="Actions">' + icon('more', 'icon-sm') + '</button></div></td></tr>';
  }).join('');

  return '<div class="filterbar">' +
      '<div class="grow search">' + icon('search', 'icon-sm') + '<input class="input" type="search" placeholder="Rechercher un produit, SKU…"></div>' +
      '<div><label>Catégorie</label>' + select('p-cat', ['Toutes'].concat(CATEGORIES.filter(function (c) { return c.key !== 'all'; }).map(function (c) { return c.label; }))) + '</div>' +
      '<div><label>Collection</label>' + select('p-col', ['Toutes', 'Homme', 'Femme', 'Accessoires', 'Performance']) + '</div>' +
      '<div><label>Stock</label>' + select('p-stock', ['Tous', 'En stock', 'Stock faible', 'Rupture']) + '</div>' +
      '<div><label>Statut</label>' + select('p-status', ['Tous', 'Publié', 'Brouillon']) + '</div>' +
      '<button class="btn" type="button">Réinitialiser</button>' +
      '<button class="btn btn-primary" type="button">' + icon('plus', 'icon-sm') + 'Ajouter un produit</button>' +
    '</div>' +

    '<div class="grid-main" style="grid-template-columns:1fr 480px;align-items:start">' +
      '<section class="card">' +
        '<div class="card-head"><h3>' + list.length + ' produits trouvés</h3></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr>' +
          '<th style="width:36px"><input type="checkbox" aria-label="Tout sélectionner"></th>' +
          '<th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Tags</th><th>Actions</th>' +
        '</tr></thead><tbody id="products-body">' + rows + '</tbody></table></div>' +
        '<div class="pagination"><span class="dim">Afficher 10 par page</span>' + pager(3, 1) + '</div>' +
      '</section>' +
      '<aside class="panel" id="product-panel">' + productPanel(0) + '</aside>' +
    '</div>';
}

function productPanel(i) {
  const p = catalogue()[i];
  if (!p) return '<div class="empty-state">Aucun produit.</div>';
  return '<div class="panel-head"><h2>Éditer le produit</h2>' +
      '<a class="btn btn-sm" href="../product.html?id=' + esc(p.id) + '" target="_blank" rel="noopener">' + icon('external', 'icon-sm') + 'Voir la page produit</a></div>' +
    '<div class="panel-body">' +
      '<div class="field-row">' +
        field('Nom du produit *', input('pd-name', p.name)) +
        field('SKU *', input('pd-sku', 'NOV-' + p.id.slice(0, 3).toUpperCase() + '-' + String(100 + i))) +
      '</div>' +
      '<div class="field-row">' +
        field('Catégorie *', select('pd-cat', CATEGORIES.filter(function (c) { return c.key !== 'all'; }).map(function (c) { return c.label; }), p.categoryLabel)) +
        field('Collection', select('pd-col', ['Homme', 'Femme', 'Accessoires', 'Performance'], p.gender === 'femme' ? 'Femme' : 'Homme')) +
      '</div>' +
      '<div class="field-row" style="grid-template-columns:1fr 1fr 1fr">' +
        field('Prix *', input('pd-price', p.price + ',00 €')) +
        field('Prix réduit', input('pd-sale', '', { placeholder: 'Ex : 199,00 €' })) +
        field('Coût d\'achat', input('pd-cost', Math.round(p.price * 0.48) + ',00 €')) +
      '</div>' +
      '<div class="field-row" style="grid-template-columns:1.2fr .9fr .9fr;align-items:end">' +
        field('Statut', select('pd-status', ['Publié', 'Brouillon'], 'Publié')) +
        '<div class="field"><label>Produit en vedette</label>' + toggle('pd-featured', p.featured, 'Produit en vedette') + '</div>' +
        '<div class="field"><label>Nouveau</label>' + toggle('pd-new', p.newProduct, 'Nouveauté') + '</div>' +
      '</div>' +
      field('Description courte', '<textarea class="textarea" id="pd-desc">' + esc(p.description) + '</textarea>') +

      '<div class="form-section-title">Médias</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<div class="dropzone" style="flex-direction:column;text-align:center">' + icon('upload') +
          '<div><strong>Glissez-déposez vos images</strong><small>JPG, PNG, WebP — max 10 Mo</small></div></div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
          p.images.slice(0, 5).map(function (src) {
            return '<img src="' + esc(mediaSrc(src)) + '" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px">';
          }).join('') +
          '<button class="btn" type="button" style="aspect-ratio:1;height:auto;flex-direction:column;gap:4px">' + icon('plus', 'icon-sm') + '<span style="font-size:11px">Ajouter</span></button>' +
        '</div>' +
      '</div>' +

      '<div class="form-section-title">Variantes</div>' +
      '<div class="lbl">Tailles</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
        p.sizes.map(function (s) { return '<span class="chip is-active">' + esc(s) + '</span>'; }).join('') +
        '<button class="btn btn-sm" type="button">' + icon('plus', 'icon-sm') + '</button></div>' +
      '<div class="lbl">Couleurs</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
        p.colors.map(function (c) {
          return '<span class="chip"><i style="width:12px;height:12px;border-radius:50%;background:' + colorSwatch(c) + ';display:inline-block"></i>' + esc(c) + '</span>';
        }).join('') + '<button class="btn btn-sm" type="button">' + icon('plus', 'icon-sm') + '</button></div>' +
      '<div class="lbl">Stock par variante</div>' +
      '<label class="toggle-row" style="padding-top:4px"><span><strong>Gérer le stock globalement</strong></span>' + toggle('pd-globalstock', true, 'Stock global') + '</label>' +
    '</div>' +
    '<div class="panel-foot"><button class="btn btn-danger" type="button">Supprimer</button>' +
      '<button class="btn btn-block" type="button">Enregistrer brouillon</button>' +
      '<button class="btn btn-primary btn-block" type="button">Enregistrer &amp; publier</button></div>';
}

/* =============================== COLLECTIONS ============================= */
function pageCollections() {
  const cols = [
    { name: 'Homme', count: 7, order: 1, img: 'assets/web/tshirt-noir/dsc02335.jpg', status: 'Publiée', tone: 'success', desc: 'Toute la collection homme NOVRA.' },
    { name: 'Femme', count: 4, order: 2, img: 'assets/web/ensemble-rose/dsc02332.jpg', status: 'Publiée', tone: 'success', desc: 'Pièces techniques pensées pour elle.' },
    { name: 'Accessoires', count: 1, order: 3, img: 'assets/web/casquette/dsc02352.jpg', status: 'Publiée', tone: 'success', desc: 'Casquettes, bobs et équipements.' },
    { name: 'Nouveautés', count: 7, order: 4, img: 'assets/web/veste-noir/dsc02364.jpg', status: 'Publiée', tone: 'success', desc: 'Les dernières arrivées.' },
    { name: 'T-shirts', count: 2, order: 5, img: 'assets/web/tshirt-blanc/dsc02413.jpg', status: 'Publiée', tone: 'success', desc: 'La base du vestiaire.' },
    { name: 'Ensembles', count: 4, order: 6, img: 'assets/web/ensemble-menthe/dsc02317.jpg', status: 'Publiée', tone: 'success', desc: 'Ensembles training complets.' },
    { name: 'Shorts', count: 0, order: 7, img: 'assets/web/ensemble-corail/dsc02376.jpg', status: 'Brouillon', tone: 'warning', desc: 'Bientôt disponible.' },
    { name: 'Leggings', count: 0, order: 8, img: 'assets/web/ensemble-rose/dsc02334.jpg', status: 'Brouillon', tone: 'warning', desc: 'Bientôt disponible.' }
  ];
  const rows = cols.map(function (c, i) {
    return '<tr data-collection="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td><span class="grip">' + icon('grip', 'icon-sm') + '</span></td>' +
      '<td><div class="cell-main"><img class="thumb" src="' + esc(mediaSrc(c.img)) + '" alt="">' +
        '<div><div class="t-title">' + esc(c.name) + '</div><div class="t-sub">' + esc(c.desc) + '</div></div></div></td>' +
      '<td class="right">' + c.count + '</td><td class="right dim">' + c.order + '</td>' +
      '<td>' + badge(c.status, c.tone) + '</td>' +
      '<td>' + toggle('col-' + i, c.status === 'Publiée', 'Visibilité ' + c.name) + '</td>' +
      '<td><button class="btn btn-icon btn-sm" type="button" aria-label="Éditer">' + icon('edit', 'icon-sm') + '</button></td></tr>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag('Collections dérivées du catalogue réel — la table dédiée sera créée avec le module Commerce.') + '</div>' +
    '<div class="grid-main" style="grid-template-columns:1fr 440px;align-items:start">' +
      '<section class="card">' +
        cardHead('Toutes les collections', '<button class="btn btn-primary btn-sm" type="button">' + icon('plus', 'icon-sm') + 'Nouvelle collection</button>') +
        '<div class="table-wrap"><table class="table"><thead><tr><th style="width:36px"></th><th>Collection</th>' +
        '<th class="right">Produits</th><th class="right">Ordre</th><th>Statut</th><th>Visible</th><th></th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div></section>' +

      '<aside class="panel">' +
        '<div class="panel-head"><h2>Éditer la collection</h2></div>' +
        '<div class="panel-body">' +
          '<div class="seg" style="margin-bottom:18px"><button type="button" class="is-active">Informations</button>' +
            '<button type="button">Produits</button><button type="button">Ordre et affichage</button></div>' +
          field('Nom de la collection', input('c-name', 'Homme')) +
          field('Slug', input('c-slug', 'homme')) +
          field('Description', '<textarea class="textarea">Toute la collection homme NOVRA.</textarea>') +
          '<div class="media-slot"><span>Image de couverture</span><div class="row">' +
            '<img class="prev" src="' + esc(mediaSrc('assets/web/tshirt-noir/dsc02335.jpg')) + '" alt="">' +
            '<button class="btn btn-sm" type="button">Remplacer</button></div></div>' +
          '<div class="field-row">' + field('Ordre', input('c-order', '1', { type: 'number' })) +
            field('Statut', select('c-status', ['Publiée', 'Brouillon'])) + '</div>' +
          '<label class="toggle-row"><span><strong>Visible sur le site</strong><small>La collection apparaît dans la navigation</small></span>' +
            toggle('c-visible', true, 'Visible sur le site') + '</label>' +
        '</div>' +
        '<div class="panel-foot"><button class="btn btn-danger" type="button">Supprimer</button>' +
          '<button class="btn btn-primary btn-block" type="button">Enregistrer</button></div>' +
      '</aside>' +
    '</div>';
}

/* ================================= STOCKS ================================ */
function pageStocks() {
  const variants = [];
  catalogue().forEach(function (p) {
    p.sizes.slice(0, 2).forEach(function (s, k) {
      variants.push({ p: p, size: s, color: p.colors[0], stock: [0, 3, 12, 4, 18, 22, 9, 0][variants.length % 8], seuil: 5 });
    });
  });
  const rows = variants.slice(0, 8).map(function (v) {
    const st = v.stock === 0 ? ['Rupture', 'danger'] : (v.stock <= v.seuil ? ['Stock faible', 'warning'] : ['En stock', 'success']);
    return '<tr><td><div class="cell-main"><img class="thumb" src="' + esc(mediaSrc(v.p.images[0])) + '" alt="">' +
      '<div><div class="t-title">' + esc(v.p.name) + '</div><div class="t-sub">' + esc(v.p.categoryLabel) + '</div></div></div></td>' +
      '<td>' + esc(v.size) + '</td>' +
      '<td><span style="display:inline-flex;align-items:center;gap:7px"><i style="width:11px;height:11px;border-radius:50%;background:' + colorSwatch(v.color) + ';display:inline-block"></i>' + esc(v.color) + '</span></td>' +
      '<td class="dim nowrap">NOV-' + esc(v.p.id.slice(0, 3).toUpperCase()) + '-' + esc(v.size) + '</td>' +
      '<td><strong class="' + (v.stock === 0 ? 'neg' : (v.stock <= v.seuil ? '' : 'pos')) + '">' + v.stock + '</strong></td>' +
      '<td class="dim">' + v.seuil + '</td><td>' + badge(st[0], st[1]) + '</td>' +
      '<td><div style="display:flex;align-items:center;gap:4px">' +
        '<button class="btn btn-icon btn-sm" type="button" aria-label="Retirer">−</button>' +
        '<input class="input" style="width:56px;height:32px;text-align:center" value="' + v.stock + '" aria-label="Stock">' +
        '<button class="btn btn-icon btn-sm" type="button" aria-label="Ajouter">+</button></div></td></tr>';
  }).join('');

  const moves = DEMO.movements.map(function (m) {
    return '<div class="feed-row"><span class="feed-ico kpi-ico ' + m.tone + '" style="width:30px;height:30px">' + icon(m.ico, 'icon-sm') + '</span>' +
      '<span class="grow"><strong>' + esc(m.title) + '</strong><div class="t-sub">' + esc(m.sub) + '</div><div class="t-sub">SKU : ' + esc(m.sku) + '</div></span>' +
      '<span class="right"><strong class="' + (m.qty.charAt(0) === '+' ? 'pos' : 'neg') + '">' + esc(m.qty) + '</strong>' +
      '<div class="t-sub">' + esc(m.when) + '</div><div class="t-sub">' + esc(m.by) + '</div></span></div>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag('Variantes issues du catalogue réel, quantités de démonstration.') + '</div>' +
    '<div class="kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">' +
      kpiCard({ label: 'Ruptures de stock', value: '<span class="neg">8</span>', icon: 'xcircle', tone: 'r', sub: 'Produits à 0 en stock' }) +
      kpiCard({ label: 'Stocks faibles', value: '<span style="color:var(--amber-text)">23</span>', icon: 'alert', tone: 'a', sub: 'Produits sous le seuil' }) +
      kpiCard({ label: 'À réassortir', value: '<span class="pos">15</span>', icon: 'cart', tone: 'g', sub: 'Produits à réapprovisionner' }) +
      kpiCard({ label: 'Mouvements (7 jours)', value: '<span style="color:var(--blue-text)">128</span>', icon: 'trend', tone: 'b', sub: 'Entrées et sorties de stock' }) +
    '</div>' +

    '<div class="grid-main" style="grid-template-columns:1fr 400px;align-items:start">' +
      '<section class="card">' +
        '<div class="card-head"><h3>Stocks par produit / variante</h3><div style="display:flex;gap:10px">' +
          '<button class="btn btn-sm" type="button">' + icon('filter', 'icon-sm') + 'Filtres</button>' +
          '<div class="search">' + icon('search', 'icon-sm') + '<input class="input" style="height:32px" type="search" placeholder="Rechercher un produit, SKU…"></div>' +
          '<button class="btn btn-sm" type="button">' + icon('download', 'icon-sm') + 'Exporter</button></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Produit / Variante</th><th>Taille</th><th>Couleur</th>' +
          '<th>SKU</th><th>Stock actuel</th><th>Seuil</th><th>Statut</th><th>Action</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table></div>' +
        '<div class="pagination"><span class="dim">1–8 sur ' + variants.length + ' variantes</span>' + pager(5, 1) + '</div></section>' +

      '<aside class="card">' + cardHead('Mouvements récents', '<a class="card-link" href="#journal">Voir tout</a>') +
        '<div>' + moves + '</div>' +
        '<div class="card-foot"><a class="card-link" href="#journal">Voir tous les mouvements ' + icon('arrowR', 'icon-sm') + '</a></div></aside>' +
    '</div>';
}

/* =============================== PROMOTIONS ============================== */
function pagePromotions() {
  const rows = DEMO.promos.map(function (p, i) {
    return '<tr' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td><input type="checkbox" aria-label="Sélectionner"></td>' +
      '<td><div class="t-title">' + esc(p.code) + '</div><div class="t-sub">' + esc(p.desc) + '</div></td>' +
      '<td>' + badge(p.type, 'success', true) + '</td><td>' + esc(p.red) + '</td>' +
      '<td class="nowrap"><div>' + esc(p.from) + '</div><div class="t-sub">→ ' + esc(p.to) + '</div></td>' +
      '<td class="nowrap"><div>' + esc(p.limit) + '</div><div class="t-sub">' + esc(p.left) + '</div></td>' +
      '<td class="nowrap"><div>' + p.used + '</div><div class="t-sub">utilisations</div></td>' +
      '<td>' + badge(p.status, p.tone) + '</td>' +
      '<td><button class="btn btn-icon btn-sm" type="button" aria-label="Actions">' + icon('more', 'icon-sm') + '</button></td></tr>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag() + '</div>' +
    '<div class="grid-main" style="grid-template-columns:1fr 500px;align-items:start">' +
      '<section class="card">' +
        '<div class="card-head"><h3>Toutes les promotions <span class="badge-count">' + DEMO.promos.length + '</span></h3>' +
          '<div class="search">' + icon('search', 'icon-sm') + '<input class="input" style="height:34px" type="search" placeholder="Rechercher une promotion"></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th style="width:36px"><input type="checkbox" aria-label="Tout sélectionner"></th>' +
          '<th>Code</th><th>Type</th><th>Réduction</th><th>Période</th><th>Limite</th><th>Usage</th><th>Statut</th><th></th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table></div>' +
        '<div class="pagination"><span class="dim">Afficher 10 résultats par page</span>' + pager(1, 1) + '</div></section>' +

      '<aside class="panel">' +
        '<div class="panel-head"><h2>Éditer la promotion</h2><button class="btn btn-icon btn-sm" type="button" aria-label="Fermer">' + icon('close', 'icon-sm') + '</button></div>' +
        '<div class="panel-body">' +
          '<div class="form-section-title" style="margin-top:0">Informations générales</div>' +
          '<div class="field-row">' + field('Code promo *', input('pr-code', 'NOVRA10')) +
            field('Type de réduction', select('pr-type', ['Pourcentage', 'Montant fixe', 'Livraison offerte'])) + '</div>' +
          '<div class="field-row">' + field('Pourcentage de réduction', input('pr-pct', '10')) +
            field('Montant fixe', input('pr-amount', '', { placeholder: '€' })) + '</div>' +
          '<label class="toggle-row"><span><strong>Livraison offerte</strong><small>Active la livraison gratuite avec ce code</small></span>' +
            toggle('pr-ship', false, 'Livraison offerte') + '</label>' +

          '<div class="form-section-title">Période de validité</div>' +
          '<div class="field-row">' + field('Date de début', input('pr-from', '2025-05-20', { type: 'date' })) +
            field('Date de fin', input('pr-to', '2025-06-20', { type: 'date' })) + '</div>' +

          '<div class="form-section-title">Conditions d\'utilisation</div>' +
          '<div class="field-row">' + field('Minimum de commande', input('pr-min', '50')) +
            field('Collections concernées', '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
              ['Homme', 'Femme', 'Accessoires'].map(function (c) { return '<span class="chip is-active">' + c + ' ' + icon('close', 'icon-sm') + '</span>'; }).join('') + '</div>') + '</div>' +

          '<div class="form-section-title">Limites et utilisation</div>' +
          '<div class="field-row">' + field('Limite d\'utilisations', input('pr-limit', '500')) +
            field('Utilisations par client', input('pr-per', '1')) + '</div>' +

          '<label class="toggle-row"><span><strong>Statut</strong><small>La promotion est active et utilisable sur le site</small></span>' +
            toggle('pr-status', true, 'Promotion active') + '</label>' +
        '</div>' +
        '<div class="panel-foot"><button class="btn btn-danger" type="button">' + icon('trash', 'icon-sm') + 'Supprimer</button>' +
          '<button class="btn btn-primary btn-block" type="button">Enregistrer les modifications</button></div>' +
      '</aside>' +
    '</div>';
}

/* ================================== CRM ================================== */
function pageCrm() {
  const rows = DEMO.customers.map(function (c, i) {
    return '<tr data-customer="' + i + '"' + (i === 0 ? ' class="is-selected"' : '') + '>' +
      '<td><div class="cell-main"><span class="avatar">' + initials(c.name) + '</span><span class="t-title">' + esc(c.name) + '</span></div></td>' +
      '<td class="muted">' + esc(c.mail) + '</td><td class="muted nowrap">' + esc(c.tel) + '</td>' +
      '<td class="nowrap">' + money(c.spent) + '</td><td class="right">' + c.orders + '</td>' +
      '<td class="nowrap">' + money(c.avg) + '</td><td class="nowrap muted">' + esc(c.last) + '</td>' +
      '<td>' + badge(c.seg, c.tone) + '</td></tr>';
  }).join('');
  const c = DEMO.customers[0];

  return '<div style="margin-bottom:18px">' + demoFlag() + '</div>' +
    '<div class="kpi-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:18px">' +
      kpiCard({ label: 'Nouveaux clients', value: '128', delta: 18.5, icon: 'user', tone: 'g', sub: 'vs période précédente' }) +
      kpiCard({ label: 'Clients actifs', value: '2 847', delta: 12.3, icon: 'users', tone: 'g', sub: 'vs période précédente' }) +
      kpiCard({ label: 'Clients fidèles', value: '642', delta: 9.1, icon: 'star', tone: 'g', sub: 'vs période précédente' }) +
    '</div>' +

    '<div class="grid-main" style="grid-template-columns:1fr 460px;align-items:start">' +
      '<section class="card">' +
        '<div class="card-head"><div class="search">' + icon('search', 'icon-sm') +
          '<input class="input" style="height:34px;min-width:280px" type="search" placeholder="Rechercher un client (nom, email, téléphone…)"></div>' +
          '<div style="display:flex;gap:10px"><button class="btn btn-sm" type="button">' + icon('filter', 'icon-sm') + 'Filtres</button>' +
          '<button class="btn btn-sm" type="button">' + icon('download', 'icon-sm') + 'Exporter</button></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th>' +
          '<th>Total dépensé</th><th class="right">Commandes</th><th>Panier moyen</th><th>Dernière commande</th><th>Segment</th></tr></thead>' +
          '<tbody id="crm-body">' + rows + '</tbody></table></div>' +
        '<div class="pagination"><span class="dim">Affichage de 1 à 8 sur 124 résultats</span>' + pager(4, 1) + '</div></section>' +

      '<aside class="panel">' +
        '<div class="panel-head"><h2>Détails du client</h2><button class="btn btn-icon btn-sm" type="button" aria-label="Fermer">' + icon('close', 'icon-sm') + '</button></div>' +
        '<div class="panel-body">' +
          '<div style="display:flex;gap:14px;align-items:center;margin-bottom:18px">' +
            '<span class="avatar avatar-lg">' + initials(c.name) + '</span>' +
            '<div><div style="display:flex;align-items:center;gap:8px"><strong style="font-size:16px">' + esc(c.name) + '</strong>' + badge('VIP', 'warning') + '</div>' +
            '<div class="sub muted">' + esc(c.mail) + '</div><div class="sub muted">' + esc(c.tel) + '</div>' +
            '<div class="sub dim">Client depuis le 12 mars 2024</div></div></div>' +
          '<div class="dl" style="padding:14px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:16px">' +
            '<div><span>Total dépensé</span><strong>' + money(c.spent) + '</strong></div>' +
            '<div><span>Commandes</span><strong>' + c.orders + '</strong></div>' +
            '<div><span>Panier moyen</span><strong>' + money(c.avg) + '</strong></div>' +
            '<div><span>Dernière</span><strong>' + esc(c.last) + '</strong></div></div>' +

          '<div class="card-head" style="padding:0 0 10px;border:0"><h3>Notes internes</h3>' +
            '<button class="btn btn-sm" type="button">' + icon('edit', 'icon-sm') + 'Éditer</button></div>' +
          '<p class="muted" style="margin:0 0 16px;font-size:12px">Client très fidèle. Apprécie les collections premium et les éditions limitées. Privilégier les avant-premières et offres exclusives.</p>' +

          '<div class="card-head" style="padding:0 0 10px;border:0"><h3>Produits achetés</h3><a class="card-link" href="#produits">Voir tout</a></div>' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px">' +
            catalogue().slice(0, 4).map(function (p) {
              return '<div><img src="' + esc(mediaSrc(p.images[0])) + '" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:8px">' +
                '<div class="sub" style="margin-top:5px">' + esc(p.name) + '</div><div class="sub dim">' + money(p.price) + '</div></div>';
            }).join('') + '</div>' +

          '<div class="card-head" style="padding:0 0 10px;border:0"><h3>Historique des commandes</h3><a class="card-link" href="#commandes">Voir tout</a></div>' +
          DEMO.orders.slice(0, 5).map(function (o) {
            return '<div class="list-row"><i style="width:7px;height:7px;border-radius:50%;background:var(--green);flex:none"></i>' +
              '<span class="dim nowrap">' + esc(o.date) + '</span><span class="grow name">Commande ' + esc(o.id) + '</span>' +
              '<span class="nowrap">' + money(o.total) + '</span>' + badge('Payée', 'success') + '</div>';
          }).join('') +

          '<div class="form-section-title">Segment client</div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
            '<button class="btn" type="button" style="border-color:var(--blue);color:var(--blue-text)">Nouveau</button>' +
            '<button class="btn" type="button" style="border-color:var(--green);color:var(--green-text)">Actif</button>' +
            '<button class="btn" type="button" style="border-color:var(--amber);color:var(--amber-text)">VIP</button></div>' +
          '<p class="dim" style="font-size:11px;margin-top:10px">Les segments aident à personnaliser la communication et les offres.</p>' +
        '</div></aside>' +
    '</div>';
}

/* ================================ ANALYTICS ============================== */
function pageAnalytics() {
  const spark = function (c) { return sparkline([5, 7, 6, 9, 7, 10, 8, 11, 9, 12], { fill: false, color: c || 'var(--text-3)', height: 34 }); };
  const kpis =
    '<div class="kpi">' + '<div class="kpi-top"><div><div class="kpi-label">Chiffre d\'affaires</div>' +
      '<div class="kpi-value">28 430,00 €' + badge('↑ 18,6%', 'success', true) + '</div></div>' +
      '<span class="kpi-ico g">' + icon('euro') + '</span></div><div class="kpi-sub">vs 11 980,00 €</div>' + spark() + '</div>' +
    '<div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Commandes</div>' +
      '<div class="kpi-value">312' + badge('↑ 15,2%', 'success', true) + '</div></div><span class="kpi-ico b">' + icon('cart') + '</span></div>' +
      '<div class="kpi-sub">vs 271</div>' + spark() + '</div>' +
    '<div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Panier moyen</div>' +
      '<div class="kpi-value">91,12 €' + badge('↑ 2,9%', 'success', true) + '</div></div><span class="kpi-ico v">' + icon('bag') + '</span></div>' +
      '<div class="kpi-sub">vs 88,54 €</div>' + spark() + '</div>' +
    '<div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Taux de conversion</div>' +
      '<div class="kpi-value">2,45 %' + badge('↑ 0,4 pt', 'success', true) + '</div></div><span class="kpi-ico a">' + icon('target') + '</span></div>' +
      '<div class="kpi-sub">vs 2,05 %</div>' + spark() + '</div>' +
    '<div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Nouveaux clients</div>' +
      '<div class="kpi-value">128' + badge('↑ 11,4%', 'success', true) + '</div></div><span class="kpi-ico g">' + icon('user') + '</span></div>' +
      '<div class="kpi-sub">vs 115</div>' + spark() + '</div>';

  const funnel = [
    { label: 'Visites', value: '12 764', pct: '100%', w: 100, c: '#4f6bed' },
    { label: 'Ajouts au panier', value: '1 842', pct: '14,4%', w: 78, c: '#5f7bf0' },
    { label: 'Initiation de commande', value: '984', pct: '7,7%', w: 56, c: '#8ba3f5' },
    { label: 'Achats', value: '312', pct: '2,4%', w: 34, c: '#b9c8fa' }
  ].map(function (f) {
    return '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">' +
      '<div style="width:' + f.w + '%;height:44px;background:' + f.c + ';border-radius:4px;flex:none;opacity:.85"></div>' +
      '<div style="flex:1"><div class="sub dim">' + f.label + '</div><strong>' + f.value + '</strong></div>' +
      '<span class="dim">' + f.pct + '</span></div>';
  }).join('');

  const channels = [
    { label: 'Direct', value: 10907, pct: '38,4%', color: '#4f6bed' },
    { label: 'Recherche organique', value: 7853, pct: '27,6%', color: '#3fb984' },
    { label: 'Réseaux sociaux', value: 4604, pct: '16,2%', color: '#e0a33e' },
    { label: 'Email', value: 2471, pct: '8,7%', color: '#e06c6c' },
    { label: 'Référents', value: 1736, pct: '6,1%', color: '#8b7ce8' },
    { label: 'Autres', value: 855, pct: '3,0%', color: '#5c6068' }
  ];

  const listCard = function (title, head, rows) {
    return '<section class="card">' + cardHead(title, '<a class="card-link" href="#analytics">Voir tout</a>') +
      '<div class="table-wrap"><table class="table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  };

  return '<div style="margin-bottom:18px">' + demoFlag('Données analytiques de démonstration — aucune sonde de mesure n\'est encore installée sur le site public.') + '</div>' +
    '<div class="filterbar"><button class="btn" type="button">' + icon('calendar', 'icon-sm') + '18 mai 2025 – 24 mai 2025</button>' +
      select('a-cmp', ['vs période précédente', 'vs année précédente']) +
      '<span class="grow"></span><span class="dim">' + icon('refresh', 'icon-sm') + ' Actualisation : il y a 5 min</span>' +
      '<button class="btn" type="button">' + icon('download', 'icon-sm') + 'Exporter</button></div>' +

    '<div class="kpi-row" style="margin-bottom:18px">' + kpis + '</div>' +

    '<div class="grid-main g-1-1-1" style="grid-template-columns:1.7fr 1.15fr 1.15fr;margin-bottom:18px">' +
      '<section class="card">' + cardHead("Évolution du chiffre d'affaires", '<span class="chip">Par jour ' + icon('chevronD', 'icon-sm') + '</span>') +
        '<div class="chart-box">' + lineChart(DEMO.revenue, DEMO.days, { color: 'var(--green)' }) + '</div></section>' +
      '<section class="card">' + cardHead('Entonnoir de conversion') + '<div class="card-pad">' + funnel +
        '<div class="list-row" style="border-bottom:0"><span class="grow muted">Taux de conversion global</span>' +
        '<strong style="font-size:16px">2,45%</strong>' + badge('↑ 0,4 pt', 'success', true) + '</div></div></section>' +
      '<section class="card">' + cardHead('Répartition par canal') +
        '<div class="donut-wrap">' + donut(channels, '28 430 €', 'Total') +
        '<div class="legend">' + channels.map(function (c) {
          return '<div class="legend-row"><i style="background:' + c.color + '"></i><span class="grow">' + c.label + '</span>' +
            '<span class="dim">' + c.pct + '</span><strong>' + money(c.value) + '</strong></div>';
        }).join('') + '</div></div></section>' +
    '</div>' +

    '<div class="grid-main g-5">' +
      listCard('Top produits', '<th>Produit</th><th class="right">Ventes</th><th class="right">CA généré</th>',
        catalogue().slice(0, 5).map(function (p, i) {
          return '<tr><td><div class="cell-main"><img class="thumb" src="' + esc(mediaSrc(p.images[0])) + '" alt=""><span>' + esc(p.name) + '</span></div></td>' +
            '<td class="right">' + (58 - i * 7) + '</td><td class="right nowrap">' + money(p.price * (58 - i * 7)) + '</td></tr>';
        }).join('')) +
      listCard('Top catégories', '<th>Catégorie</th><th class="right">CA généré</th><th class="right">Part</th>',
        [['Homme', 16842, '59,2%'], ['Femme', 7350, '25,9%'], ['Accessoires', 2986, '10,5%'], ['Collections', 1252, '4,4%']]
          .map(function (r) { return '<tr><td>' + r[0] + '</td><td class="right nowrap">' + money(r[1]) + '</td><td class="right dim">' + r[2] + '</td></tr>'; }).join('')) +
      listCard('Pages les plus vues', '<th>Page</th><th class="right">Vues</th><th class="right">Rebond</th>',
        [['/', 4521, '41,2%'], ['/marketplace.html', 2341, '38,7%'], ['/marketplace.html?gender=femme', 1784, '36,9%'], ['/product.html', 1236, '29,3%'], ['/about.html', 987, '53,8%']]
          .map(function (r) { return '<tr><td class="dim">' + esc(r[0]) + '</td><td class="right">' + num(r[1]) + '</td><td class="right dim">' + r[2] + '</td></tr>'; }).join('')) +
      listCard('Clics CTA', '<th>CTA</th><th class="right">Clics</th><th class="right">CTR</th>',
        [['SHOP', 1842, '14,4%'], ['NOTRE MISSION', 1267, '9,9%'], ['DÉCOUVRIR', 892, '7,0%'], ['AJOUT RAPIDE', 624, '4,9%'], ['TOUT AFFICHER', 512, '4,0%']]
          .map(function (r) { return '<tr><td>' + r[0] + '</td><td class="right">' + num(r[1]) + '</td><td class="right dim">' + r[2] + '</td></tr>'; }).join('')) +
      listCard('Visiteurs par pays', '<th>Pays</th><th class="right">Sessions</th>',
        [['France', 6284], ['Belgique', 1247], ['Suisse', 742], ['Canada', 612], ['Maroc', 512]]
          .map(function (r) { return '<tr><td>' + r[0] + '</td><td class="right">' + num(r[1]) + '</td></tr>'; }).join('')) +
    '</div>';
}

/* ================================ PARAMÈTRES ============================= */
function pageSettings() {
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
  const rows = [
    ['Veste Performance Pro', 'Alexandre Diallo', 5, 'Qualité au rendez-vous, coupe parfaite.', '23 mai 2025', 'Publié', 'success'],
    ['Casquette NOVRA', 'Sarah Martin', 4, 'Très bonne casquette, un peu grande.', '22 mai 2025', 'Publié', 'success'],
    ['Short Training', 'Julien Bernard', 5, 'Léger et confortable, je recommande.', '21 mai 2025', 'En attente', 'warning'],
    ['T-shirt Performance Noir', 'Camille Petit', 3, 'Bien mais taille petit.', '20 mai 2025', 'En attente', 'warning'],
    ['Pantalon Tech', 'Yanis Leroy', 5, 'Excellent rapport qualité-prix.', '19 mai 2025', 'Publié', 'success']
  ].map(function (r, i) {
    return '<tr' + (i === 0 ? ' class="is-selected"' : '') + '><td class="t-title">' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td>' +
      '<td class="nowrap" style="color:var(--amber-text)">' + '★'.repeat(r[2]) + '<span class="dim">' + '☆'.repeat(5 - r[2]) + '</span></td>' +
      '<td class="muted">' + esc(r[3]) + '</td><td class="dim nowrap">' + esc(r[4]) + '</td>' +
      '<td>' + badge(r[5], r[6]) + '</td>' +
      '<td><div style="display:flex;gap:4px"><button class="btn btn-icon btn-sm" type="button" aria-label="Approuver">' + icon('check', 'icon-sm') + '</button>' +
      '<button class="btn btn-icon btn-sm" type="button" aria-label="Masquer">' + icon('eye', 'icon-sm') + '</button></div></td></tr>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag() + '</div>' +
    '<div class="kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">' +
      kpiCard({ label: 'Note moyenne', value: '4,7 / 5', icon: 'star', tone: 'a', sub: 'sur 248 avis' }) +
      kpiCard({ label: 'Avis publiés', value: '236', icon: 'check', tone: 'g', sub: '95 % du total' }) +
      kpiCard({ label: 'En attente', value: '12', icon: 'alert', tone: 'a', sub: 'à modérer' }) +
      kpiCard({ label: 'Signalés', value: '0', icon: 'shield', tone: 'g', sub: 'aucun signalement' }) +
    '</div>' +
    '<section class="card">' +
      '<div class="card-head"><h3>Tous les avis</h3><div style="display:flex;gap:10px">' +
        select('r-status', ['Tous les statuts', 'Publié', 'En attente', 'Masqué']) +
        select('r-note', ['Toutes les notes', '5 étoiles', '4 étoiles', '3 étoiles et moins']) + '</div></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Produit</th><th>Client</th><th>Note</th>' +
      '<th>Commentaire</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="pagination"><span class="dim">1–5 sur 248 avis</span>' + pager(3, 1) + '</div></section>';
}

function pageSav() {
  const steps = ['Demande reçue', 'En cours', 'Acceptée', 'Produit reçu', 'Remboursé'];
  const rows = [
    ['#RET-042', '#10518', 'Thomas Leroy', 'Veste Coupe-Vent Noire', 'Taille trop petite', '22 mai 2025', 'Demande reçue', 'info'],
    ['#RET-041', '#10502', 'Inès Dupont', 'Ensemble Training Menthe', 'Article non conforme', '21 mai 2025', 'En cours', 'warning'],
    ['#RET-040', '#10487', 'Mathis Moreau', 'Casquette Performance', 'Changement d\'avis', '19 mai 2025', 'Acceptée', 'success'],
    ['#RET-039', '#10455', 'Léa Rousseau', 'Polo Tech', 'Défaut de couture', '17 mai 2025', 'Remboursé', 'success'],
    ['#RET-038', '#10441', 'Romain Petit', 'Pantalon Tech', 'Taille trop grande', '15 mai 2025', 'Refusé', 'danger']
  ].map(function (r, i) {
    return '<tr' + (i === 0 ? ' class="is-selected"' : '') + '><td class="nowrap">' + esc(r[0]) + '</td>' +
      '<td class="nowrap dim">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td class="muted">' + esc(r[3]) + '</td>' +
      '<td class="muted">' + esc(r[4]) + '</td><td class="dim nowrap">' + esc(r[5]) + '</td><td>' + badge(r[6], r[7]) + '</td></tr>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag() + '</div>' +
    '<div class="kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">' +
      kpiCard({ label: 'Demandes ouvertes', value: '6', icon: 'returns', tone: 'a', sub: 'à traiter' }) +
      kpiCard({ label: 'En cours de traitement', value: '3', icon: 'refresh', tone: 'b', sub: 'produits en transit' }) +
      kpiCard({ label: 'Remboursements du mois', value: '1 240,00 €', icon: 'euro', tone: 'r', sub: '12 dossiers' }) +
      kpiCard({ label: 'Délai moyen', value: '3,2 j', icon: 'trend', tone: 'g', sub: 'de la demande au remboursement' }) +
    '</div>' +
    '<div class="grid-main" style="grid-template-columns:1fr 400px;align-items:start">' +
      '<section class="card">' + cardHead('Demandes de retour') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Retour</th><th>Commande</th><th>Client</th>' +
        '<th>Produit</th><th>Motif</th><th>Date</th><th>Statut</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<aside class="panel"><div class="panel-head"><h2>Suivi du retour #RET-042</h2></div>' +
        '<div class="panel-body">' +
          steps.map(function (s, i) {
            return '<div class="list-row"><i style="width:9px;height:9px;border-radius:50%;flex:none;background:' +
              (i === 0 ? 'var(--green)' : 'var(--border-2)') + '"></i><span class="grow name">' + s + '</span>' +
              (i === 0 ? '<span class="dim">22 mai 2025</span>' : '<span class="dim">—</span>') + '</div>';
          }).join('') +
          '<div class="form-section-title">Action</div>' +
          field('Statut', select('sav-status', steps.concat(['Refusé']))) +
          field('Note interne', '<textarea class="textarea" placeholder="Ajouter une note…"></textarea>') +
        '</div>' +
        '<div class="panel-foot"><button class="btn btn-block" type="button">Proposer un échange</button>' +
          '<button class="btn btn-primary btn-block" type="button">Rembourser</button></div></aside>' +
    '</div>';
}

function pageNewsletter() {
  const rows = [
    ['alex.diallo@email.com', 'Client', '12 mars 2024', 'Actif'], ['sarah.martin@email.com', 'Client', '2 avr. 2024', 'Actif'],
    ['contact@presse-sport.fr', 'Prospect', '18 avr. 2025', 'Actif'], ['julien.bernard@email.com', 'Client', '3 mai 2025', 'Actif'],
    ['camille.petit@email.com', 'Prospect', '17 mai 2025', 'Désabonné']
  ].map(function (r) {
    return '<tr><td>' + esc(r[0]) + '</td><td>' + badge(r[1], r[1] === 'Client' ? 'success' : 'info') + '</td>' +
      '<td class="dim nowrap">' + esc(r[2]) + '</td><td>' + badge(r[3], r[3] === 'Actif' ? 'success' : 'neutral') + '</td></tr>';
  }).join('');

  return '<div style="margin-bottom:18px">' + demoFlag('Abonnés de démonstration — le formulaire du site n\'est pas encore relié à un service d\'envoi.') + '</div>' +
    '<div class="kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">' +
      kpiCard({ label: 'Abonnés', value: '3 482', delta: 8.4, icon: 'users', tone: 'g', sub: 'dont 2 140 clients' }) +
      kpiCard({ label: "Taux d'ouverture", value: '38,2 %', delta: 2.1, icon: 'newsletter', tone: 'b', sub: 'dernière campagne' }) +
      kpiCard({ label: 'Taux de clic', value: '6,4 %', delta: 0.8, icon: 'target', tone: 'v', sub: 'dernière campagne' }) +
      kpiCard({ label: 'Désabonnements', value: '0,3 %', delta: -0.1, icon: 'returns', tone: 'a', sub: '30 derniers jours' }) +
    '</div>' +
    '<div class="grid-main" style="grid-template-columns:1fr 380px;align-items:start">' +
      '<section class="card">' +
        '<div class="card-head"><h3>Abonnés</h3><div style="display:flex;gap:10px">' +
          select('nl-seg', ['Tous', 'Clients', 'Prospects']) +
          '<button class="btn btn-sm" type="button">' + icon('download', 'icon-sm') + 'Exporter CSV</button></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Email</th><th>Source</th><th>Inscrit le</th><th>Statut</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '<div class="pagination"><span class="dim">1–5 sur 3 482 abonnés</span>' + pager(4, 1) + '</div></section>' +
      '<aside class="card">' + cardHead('Intégration') +
        '<div class="card-pad"><p class="muted" style="margin-top:0">Aucun prestataire d\'emailing n\'est connecté. ' +
        'Les inscriptions du site public sont validées côté navigateur mais ne sont pas encore stockées.</p>' +
        '<div class="lbl">Prestataires prévus</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + ['Brevo', 'Resend', 'Mailchimp'].map(function (p) { return '<span class="chip">' + p + '</span>'; }).join('') + '</div>' +
        '</div></aside>' +
    '</div>';
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

  return '<div class="grid-main" style="grid-template-columns:1fr 360px;align-items:start">' +
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
