/* =========================================================================
   NOVRA ADMIN — Briques d'interface réutilisables
   Icônes Lucide (tracés inline), composants, formatage, toasts.
   ========================================================================= */

/* --------------------------------- Icônes -------------------------------- */
const ICO = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  orders: '<path d="M2 7h20l-2 12H4L2 7z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>',
  products: '<path d="M20.6 12.6 12 21.2 3.4 12.6a5.5 5.5 0 1 1 7.8-7.8l.8.8.8-.8a5.5 5.5 0 1 1 7.8 7.8z"/>',
  collections: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
  stocks: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  promotions: '<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="m9 12 2 2 4-4"/>',
  crm: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><path d="M17 11h5M19.5 8.5v5"/>',
  reviews: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  returns: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  media: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  library: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l4-4 4 4 3-3 7 7"/><circle cx="8" cy="8" r="1.5"/>',
  newsletter: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  analytics: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="4" width="3" height="14"/>',
  admins: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><circle cx="18" cy="8" r="3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 8 2.6h.1A2 2 0 1 1 12 1v.1A1.7 1.7 0 0 0 15 2.6"/>',
  journal: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.6 6.7A17 17 0 0 0 2 12s4 6 10 6a9.6 9.6 0 0 0 4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  'arrow-up': '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  publish: '<path d="M12 3v14"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  chevronR: '<path d="m9 18 6-6-6-6"/>',
  chevronL: '<path d="m15 18-6-6 6-6"/>',
  chevronD: '<path d="m6 9 6 6 6-6"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V21H3z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.5 12h11L21 7H6"/>',
  bag: '<path d="M6 7h12l-1 13H7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
  euro: '<path d="M17 5a7 7 0 1 0 0 14"/><path d="M3 10h9M3 14h9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><circle cx="18" cy="8" r="3"/><path d="M22 21c0-3-1.5-5-4-5"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
  xcircle: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  shield: '<path d="M12 3l8 4v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z"/><path d="m9 12 2 2 4-4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  gift: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8S9 3 7 5s5 3 5 3zM12 8s3-5 5-3-5 3-5 3z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  tag: '<path d="M20.6 13.4 13 21l-9-9V4h8l8.6 8.6a1.9 1.9 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  external: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="2"/><path d="M6 14h12v7H6z"/>',
  align: '<path d="M3 6h18M3 12h12M3 18h16"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>'
};

function icon(name, cls) {
  return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[name] || '') + '</svg>';
}

/* ------------------------------- Formatage ------------------------------- */
function esc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function money(n) {
  return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function num(n) { return (Number(n) || 0).toLocaleString('fr-FR'); }
function delta(v) {
  const s = v >= 0 ? '+' : '';
  return '<span class="kpi-delta ' + (v >= 0 ? 'pos' : 'neg') + '">' + s + v.toFixed(1).replace('.', ',') + ' %</span>';
}
function dateFR(d) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
function dateTimeFR(d) { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
}
/* Les URL héritées du dépôt sont relatives à la racine du site */
function mediaSrc(url) { return !url ? '' : (/^https?:/.test(url) ? url : '../' + url); }

/* ------------------------------ Composants ------------------------------- */
function badge(label, kind, plain) {
  return '<span class="badge badge-' + kind + (plain ? ' badge-plain' : '') + '">' + esc(label) + '</span>';
}
function kpiCard(o) {
  return '<div class="kpi">' +
    '<div class="kpi-top"><div>' +
      '<div class="kpi-label">' + esc(o.label) + '</div>' +
      '<div class="kpi-value">' + o.value + (o.delta !== undefined ? delta(o.delta) : '') + '</div>' +
    '</div><span class="kpi-ico ' + (o.tone || 'g') + '">' + icon(o.icon) + '</span></div>' +
    (o.sub ? '<div class="kpi-sub">' + esc(o.sub) + '</div>' : '') +
  '</div>';
}
function cardHead(title, right) {
  return '<div class="card-head"><h3>' + esc(title) + '</h3>' + (right || '') + '</div>';
}
function toggle(id, checked, label) {
  return '<label class="toggle"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' +
    '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span></span></label>';
}
function field(label, control, hint) {
  return '<div class="field"><label>' + esc(label) + (hint ? '<span class="dim">' + esc(hint) + '</span>' : '') + '</label>' + control + '</div>';
}
function input(id, value, opts) {
  const o = opts || {};
  return '<input class="input" id="' + id + '" type="' + (o.type || 'text') + '" value="' + esc(value) + '"' +
    (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') +
    (o.disabled ? ' disabled' : '') + '>';
}
function select(id, options, current) {
  return '<select class="select" id="' + id + '">' + options.map(function (o) {
    const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
    return '<option value="' + esc(v) + '"' + (String(current) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
  }).join('') + '</select>';
}
function demoFlag(text) {
  return '<div class="demo-flag">' + icon('info', 'icon-sm') + (text || 'Données de démonstration — ce module sera relié à la base lors de sa mise en service.') + '</div>';
}
function pager(pages, current) {
  let out = '<div class="pager"><button type="button">' + icon('chevronL', 'icon-sm') + '</button>';
  for (let i = 1; i <= pages; i++) out += '<button type="button" class="' + (i === current ? 'is-active' : '') + '">' + i + '</button>';
  return out + '<button type="button">' + icon('chevronR', 'icon-sm') + '</button></div>';
}

/* Courbe SVG légère — aucune bibliothèque externe */
function sparkline(values, opts) {
  const o = opts || {};
  const w = o.width || 100, h = o.height || 40, pad = 2;
  const max = Math.max.apply(null, values), min = Math.min.apply(null, values);
  const span = (max - min) || 1;
  const pts = values.map(function (v, i) {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  const color = o.color || 'var(--green)';
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
    (o.fill ? '<polygon points="' + pts.join(' ') + ' ' + (w - pad) + ',' + h + ' ' + pad + ',' + h +
      '" fill="' + color + '" opacity=".12"/>' : '') +
    '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
}

/* Graphique linéaire avec axes et points */
function lineChart(values, labels, opts) {
  const o = opts || {};
  const w = 700, h = 240, l = 42, b = 26, t = 10, r = 8;
  const max = Math.ceil(Math.max.apply(null, values) / 10000) * 10000 || 40000;
  const px = function (i) { return l + (i / (values.length - 1)) * (w - l - r); };
  const py = function (v) { return t + (1 - v / max) * (h - t - b); };
  let grid = '', ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const v = (max / ticks) * i, y = py(v);
    grid += '<line x1="' + l + '" y1="' + y + '" x2="' + (w - r) + '" y2="' + y + '" stroke="var(--border)" stroke-width="1"/>' +
      '<text x="' + (l - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10" fill="var(--text-3)">' +
      (v >= 1000 ? (v / 1000) + 'K' : v) + '</text>';
  }
  const pts = values.map(function (v, i) { return px(i) + ',' + py(v); }).join(' ');
  const dots = values.map(function (v, i) {
    return '<circle cx="' + px(i) + '" cy="' + py(v) + '" r="3.5" fill="var(--surface)" stroke="' + (o.color || 'var(--green)') + '" stroke-width="1.8"/>';
  }).join('');
  const xl = labels.map(function (lb, i) {
    return '<text x="' + px(i) + '" y="' + (h - 6) + '" text-anchor="middle" font-size="10" fill="var(--text-3)">' + esc(lb) + '</text>';
  }).join('');
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;display:block">' + grid +
    '<polygon points="' + pts + ' ' + px(values.length - 1) + ',' + py(0) + ' ' + px(0) + ',' + py(0) +
    '" fill="' + (o.color || 'var(--green)') + '" opacity=".10"/>' +
    '<polyline points="' + pts + '" fill="none" stroke="' + (o.color || 'var(--green)') + '" stroke-width="2" stroke-linejoin="round"/>' +
    dots + xl + '</svg>';
}

/* Anneau de répartition */
function donut(segments, centerTop, centerSub) {
  const total = segments.reduce(function (s, x) { return s + x.value; }, 0) || 1;
  const R = 60, C = 2 * Math.PI * R;
  let offset = 0;
  const arcs = segments.map(function (s) {
    const len = (s.value / total) * C;
    const el = '<circle cx="80" cy="80" r="' + R + '" fill="none" stroke="' + s.color + '" stroke-width="22" ' +
      'stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" ' +
      'transform="rotate(-90 80 80)"/>';
    offset += len;
    return el;
  }).join('');
  return '<svg viewBox="0 0 160 160" style="width:160px;height:160px;flex:none">' + arcs +
    '<text x="80" y="76" text-anchor="middle" font-size="15" font-weight="600" fill="var(--text)">' + esc(centerTop) + '</text>' +
    '<text x="80" y="94" text-anchor="middle" font-size="10" fill="var(--text-3)">' + esc(centerSub) + '</text></svg>';
}

/* -------------------------------- Toasts --------------------------------- */
function toast(message, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' is-' + kind : '');
  el.innerHTML = icon(kind === 'err' || kind === 'warn' ? 'alert' : 'check', 'icon-sm') + '<span>' + esc(message) + '</span>';
  document.getElementById('toasts').appendChild(el);
  setTimeout(function () { el.remove(); }, 3400);
}

/* --------------------------- Confirmation nette --------------------------- */
function confirmAction(message) { return window.confirm(message); }
