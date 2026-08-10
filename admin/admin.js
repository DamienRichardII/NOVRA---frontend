/* =========================================================================
   NOVRA ADMIN — Cœur de l'application
   Authentification, rôles, navigation, thème, CMS Médias & Contenus,
   médiathèque. Seule la clé publiable est utilisée : la sécurité repose
   sur les règles RLS et les rôles enregistrés en base.
   ========================================================================= */

const sb = window.supabase.createClient(NOVRA_SUPABASE_URL, NOVRA_SUPABASE_ANON_KEY);

const app = {
  profile: null,
  view: 'dashboard',
  section: null,   // section publiée sélectionnée
  draft: null,     // brouillon en cours
  media: [],       // médias du brouillon
  slide: 0,        // média actif dans l'éditeur
  library: [],
  libFolder: '',
  libSelected: null
};

/* ------------------------------ Navigation ------------------------------ */
const NAV = [
  { group: 'Dashboard', items: [['dashboard', 'Dashboard', 'dashboard']] },
  { group: 'Commerce', items: [
    ['commandes', 'Commandes', 'orders', 24], ['produits', 'Produits', 'products'],
    ['collections', 'Collections', 'collections'], ['stocks', 'Stocks', 'stocks'],
    ['promotions', 'Promotions', 'promotions']] },
  { group: 'Clients', items: [
    ['clients', 'CRM Clients', 'crm'], ['avis', 'Avis', 'reviews', 12], ['sav', 'Retours / SAV', 'returns', 6]] },
  { group: 'Contenu', items: [
    ['contenus', 'Médias & Contenus', 'media'], ['mediatheque', 'Médiathèque', 'library']] },
  { group: 'Marketing', items: [
    ['newsletter', 'Newsletter', 'newsletter'], ['analytics', 'Analytics', 'analytics']] },
  { group: 'Système', items: [
    ['journal', "Journal d'activité", 'journal'], ['administrateurs', 'Administrateurs', 'admins'],
    ['parametres', 'Paramètres', 'settings']] }
];

const PAGES = {
  dashboard:      { title: 'Dashboard', sub: "Vue d'ensemble de votre activité e-commerce", actions: ['draft', 'theme', 'period'] },
  commandes:      { title: 'Commandes', sub: 'Gérez et suivez toutes vos commandes.', actions: ['preview', 'draft', 'theme', 'publish'] },
  produits:       { title: 'Produits', sub: 'Gérez votre catalogue produit, variantes, stocks et informations associées.', actions: ['preview', 'draft', 'theme', 'publish'] },
  collections:    { title: 'Collections', sub: 'Organisez vos produits en collections et gérez leur affichage.', actions: ['preview', 'draft', 'theme', 'publish'] },
  stocks:         { title: 'Stocks', sub: 'Gérez vos stocks, suivez les niveaux, les mouvements et anticipez vos réassorts.', actions: ['draft', 'theme', 'publish'] },
  promotions:     { title: 'Promotions', sub: 'Gérez vos codes promo, offres spéciales et bons de réduction.', actions: ['preview', 'draft', 'theme', 'newpromo'] },
  clients:        { title: 'CRM Clients', sub: 'Gérez vos clients, suivez leur activité et développez des relations durables.', actions: ['preview', 'draft', 'theme', 'publish'] },
  avis:           { title: 'Avis', sub: 'Modérez et publiez les avis laissés par vos clients.', actions: ['theme'] },
  sav:            { title: 'Retours / SAV', sub: 'Traitez les demandes de retour, échanges et remboursements.', actions: ['theme'] },
  contenus:       { title: 'Médias & Contenus', sub: "Gérez vos contenus et médias visuels. Modifiez photos, vidéos, légendes, CTA et l'ordre des sections du site sans toucher au code.", actions: ['preview', 'draft', 'theme', 'publish'] },
  mediatheque:    { title: 'Médiathèque', sub: 'Centralisez, organisez et gérez tous vos médias.', actions: ['theme', 'upload'] },
  newsletter:     { title: 'Newsletter', sub: 'Gérez vos abonnés, segments et campagnes.', actions: ['theme'] },
  analytics:      { title: 'Analytics', sub: 'Suivez vos performances et analysez les données clés de votre boutique.', actions: ['theme', 'export'] },
  journal:        { title: "Journal d'activité", sub: 'Historique des actions réalisées dans le back-office.', actions: ['theme'] },
  administrateurs:{ title: 'Administrateurs', sub: 'Gérez les accès, rôles et permissions de votre équipe.', actions: ['theme'] },
  parametres:     { title: 'Paramètres', sub: 'Gérez les paramètres généraux de votre boutique et personnalisez votre expérience.', actions: ['preview', 'draft', 'theme', 'save'] }
};

const ROLE_VIEWS = {
  super_admin: null,
  manager: ['dashboard','commandes','produits','collections','stocks','promotions','clients','contenus','mediatheque','analytics','journal'],
  marketing: ['dashboard','contenus','mediatheque','promotions','newsletter','analytics'],
  support: ['dashboard','clients','commandes','avis','sav']
};

function canEdit() {
  return app.profile && ['super_admin', 'manager', 'marketing'].indexOf(app.profile.role) !== -1;
}

async function logActivity(action, entity, entityId, detail) {
  try {
    await sb.from('activity_log').insert({
      actor_id: app.profile.id, actor_email: app.profile.email,
      action: action, entity: entity, entity_id: entityId, detail: detail || null
    });
  } catch (e) { /* le journal ne bloque jamais une action métier */ }
}

/* ================================= THÈME ================================ */
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('novra-admin-theme', theme);
}
function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  renderHeaderActions();
}

/* ============================ AUTHENTIFICATION ========================== */
document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const msg = document.getElementById('login-msg');
  const btn = document.getElementById('login-submit');
  msg.textContent = ''; msg.className = 'login-msg';
  btn.disabled = true; btn.textContent = 'Connexion…';

  const { error } = await sb.auth.signInWithPassword({
    email: document.getElementById('login-email').value.trim(),
    password: document.getElementById('login-password').value
  });

  btn.disabled = false; btn.textContent = 'Se connecter';
  if (error) {
    msg.textContent = 'Identifiants incorrects ou compte non activé.';
    msg.className = 'login-msg is-err';
    return;
  }
  boot();
});

document.getElementById('forgot-password').addEventListener('click', async function () {
  const email = document.getElementById('login-email').value.trim();
  const msg = document.getElementById('login-msg');
  if (!email) { msg.textContent = "Saisissez d'abord votre adresse e-mail."; msg.className = 'login-msg is-err'; return; }
  await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
  msg.textContent = 'Si ce compte existe, un e-mail de réinitialisation vient d\'être envoyé.';
  msg.className = 'login-msg is-ok';
});

document.getElementById('logout').addEventListener('click', async function () {
  await sb.auth.signOut();
  window.location.reload();
});

function showLogin(message) {
  document.getElementById('app-view').hidden = true;
  document.getElementById('login-view').hidden = false;
  if (message) {
    const msg = document.getElementById('login-msg');
    msg.textContent = message; msg.className = 'login-msg is-err';
  }
}

async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { showLogin(); return; }

  const { data: profile } = await sb.from('admin_profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (!profile || !profile.active) {
    await sb.auth.signOut();
    showLogin("Ce compte n'est pas activé par un super administrateur.");
    return;
  }

  app.profile = profile;
  document.getElementById('login-view').hidden = true;
  document.getElementById('app-view').hidden = false;
  window.scrollTo(0, 0);

  document.getElementById('me-avatar').textContent = initials(profile.full_name || profile.email);
  document.getElementById('me-name').textContent = profile.full_name || profile.email;
  document.getElementById('me-role').textContent = ({
    super_admin: 'Super admin', manager: 'Chef de projet', marketing: 'Marketing', support: 'Support'
  })[profile.role] || profile.role;

  sb.from('admin_profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', profile.id);

  renderSidebar();
  route();
}

/* ============================ GABARIT / ROUTAGE ========================= */
function renderSidebar() {
  const allowed = ROLE_VIEWS[app.profile.role];
  document.getElementById('sb-nav').innerHTML = NAV.map(function (g) {
    const items = g.items.filter(function (it) { return !allowed || allowed.indexOf(it[0]) !== -1; });
    if (!items.length) return '';
    return '<p class="sb-group">' + esc(g.group) + '</p>' + items.map(function (it) {
      return '<a class="sb-item" href="#' + it[0] + '" data-view="' + it[0] + '">' +
        icon(it[2]) + '<span class="grow">' + esc(it[1]) + '</span>' +
        (it[3] ? '<span class="badge-count">' + it[3] + '</span>' : '') + '</a>';
    }).join('');
  }).join('');
}

function renderHeaderActions() {
  const cfg = PAGES[app.view] || PAGES.dashboard;
  const dark = document.documentElement.dataset.theme !== 'light';
  const parts = {
    preview: '<a class="btn" href="../index.html" target="_blank" rel="noopener">' + icon('eye', 'icon-sm') + '<span>Prévisualiser</span></a>',
    draft: '<button class="btn" type="button" id="hdr-draft">' + icon('save', 'icon-sm') + '<span>Enregistrer brouillon</span></button>',
    theme: '<div class="theme-switch">' + '<span>Thème</span>' + icon('moon', 'icon-sm') +
      '<button class="theme-track" type="button" id="hdr-theme" role="switch" aria-checked="' + (!dark) + '" aria-label="Basculer le thème"></button>' +
      icon('sun', 'icon-sm') + '<span>' + (dark ? 'Mode sombre' : 'Mode clair') + '</span></div>',
    publish: '<button class="btn btn-primary" type="button" id="hdr-publish">' + icon('publish', 'icon-sm') + '<span>Publier</span></button>',
    save: '<button class="btn btn-primary" type="button" id="hdr-publish">' + icon('check', 'icon-sm') + '<span>Enregistrer</span></button>',
    newpromo: '<button class="btn btn-primary" type="button">' + icon('plus', 'icon-sm') + '<span>Nouvelle promotion</span></button>',
    upload: '<label class="btn btn-primary">' + icon('upload', 'icon-sm') + '<span>Téléverser</span>' +
      '<input type="file" id="hdr-upload" accept="image/*,video/mp4,video/webm" multiple hidden></label>',
    export: '<button class="btn" type="button">' + icon('download', 'icon-sm') + '<span>Exporter</span></button>',
    period: '<button class="btn" type="button">' + icon('calendar', 'icon-sm') + '<span>18 mai – 24 mai 2025</span>' + icon('chevronD', 'icon-sm') + '</button>'
  };
  document.getElementById('header-actions').innerHTML = cfg.actions.map(function (a) { return parts[a] || ''; }).join('');

  const th = document.getElementById('hdr-theme');
  if (th) th.addEventListener('click', toggleTheme);
  const dr = document.getElementById('hdr-draft');
  if (dr) dr.addEventListener('click', function () {
    if (app.view === 'contenus' && app.section) saveDraft(); else toast('Aucune modification à enregistrer.');
  });
  const pb = document.getElementById('hdr-publish');
  if (pb) pb.addEventListener('click', function () {
    if (app.view === 'contenus' && app.section) publishSection(); else toast('Rien à publier sur cet écran.');
  });
  const up = document.getElementById('hdr-upload');
  if (up) up.addEventListener('change', async function (e) {
    for (const f of e.target.files) await uploadFile(f);
    e.target.value = ''; loadLibrary();
  });
}

async function route() {
  const view = (location.hash || '#dashboard').slice(1);
  if (!PAGES[view]) { location.hash = '#dashboard'; return; }

  const allowed = ROLE_VIEWS[app.profile.role];
  if (allowed && allowed.indexOf(view) === -1) {
    toast('Votre rôle ne donne pas accès à cette section.', 'err');
    location.hash = '#dashboard'; return;
  }

  app.view = view;
  const cfg = PAGES[view];
  document.getElementById('page-title').textContent = cfg.title;
  document.getElementById('page-sub').textContent = cfg.sub;
  document.querySelectorAll('.sb-item').forEach(function (a) {
    a.classList.toggle('is-active', a.dataset.view === view);
  });
  document.getElementById('sidebar').classList.remove('is-open');
  renderHeaderActions();

  const host = document.getElementById('admin-content');
  host.innerHTML = '<div class="card"><div class="card-pad"><div class="skeleton skel-line" style="width:40%"></div>' +
    '<div class="skeleton skel-line"></div><div class="skeleton skel-line" style="width:70%"></div></div></div>';

  const render = {
    dashboard: pageDashboard, commandes: pageOrders, produits: pageProducts,
    collections: pageCollections, stocks: pageStocks, promotions: pagePromotions,
    clients: pageCrm, avis: pageReviews, sav: pageSav, analytics: pageAnalytics,
    newsletter: pageNewsletter, parametres: pageSettings,
    administrateurs: pageAdmins, journal: pageJournal,
    contenus: pageContents, mediatheque: pageLibrary
  }[view];

  const html = await render();
  host.innerHTML = html;
  window.scrollTo(0, 0);

  if (view === 'contenus') afterContents();
  if (view === 'mediatheque') afterLibrary();
  if (view === 'dashboard') loadDashboardActivity();
  if (view === 'administrateurs') afterAdmins();
}

window.addEventListener('hashchange', route);
document.getElementById('menu-toggle').addEventListener('click', function () {
  const sb = document.getElementById('sidebar');
  const open = sb.classList.toggle('is-open');
  this.setAttribute('aria-expanded', String(open));
});

/* Activité récente du tableau de bord (données réelles) */
async function loadDashboardActivity() {
  const { data } = await sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(6);
  const box = document.getElementById('dash-activity-body');
  if (!box) return;
  if (!data || !data.length) { box.innerHTML = '<div class="empty-state">Aucune activité pour le moment.</div>'; return; }
  const labels = { publish: 'a publié une section', save_draft: 'a enregistré un brouillon', upload_media: 'a téléversé un média', restore_version: 'a restauré une version' };
  box.innerHTML = data.map(function (l) {
    return '<div class="feed-row"><span class="feed-ico kpi-ico g" style="width:26px;height:26px">' + icon('check', 'icon-sm') + '</span>' +
      '<span class="grow">' + esc(l.actor_email) + ' ' + (labels[l.action] || esc(l.action)) + '</span>' +
      '<time>' + dateTimeFR(l.created_at) + '</time></div>';
  }).join('');
}

/* ========================== MÉDIAS & CONTENUS =========================== */
async function pageContents() {
  const { data: pages, error } = await sb.from('pages')
    .select('id,page_key,label,path,sort_order,page_sections(id,section_key,section_type,status,sort_order,locked)')
    .order('sort_order');
  if (error) return '<div class="card"><div class="empty-state">Chargement impossible : ' + esc(error.message) + '</div></div>';

  const { data: drafts } = await sb.from('section_drafts').select('section_id');
  const draftIds = (drafts || []).map(function (d) { return d.section_id; });
  app.pages = pages;

  const tree = pages.map(function (p) {
    const sections = (p.page_sections || []).sort(function (a, b) { return a.sort_order - b.sort_order; });
    return '<div class="tree-page">' + icon(p.page_key === 'home' ? 'home' : 'folder', 'icon-sm') + esc(p.label) + '</div>' +
      sections.map(function (s) {
        const cls = draftIds.indexOf(s.id) !== -1 ? 'is-draft' : (s.status === 'published' ? '' : 'is-off');
        return '<button type="button" class="tree-item" data-section="' + s.id + '">' +
          '<span class="grip">' + icon('grip', 'icon-sm') + '</span><span class="grow">' + esc(s.section_key) + '</span>' +
          '<i class="dot ' + cls + '"></i></button>';
      }).join('');
  }).join('');

  return '<div class="cms-grid">' +
    '<section class="card cms-tree-card">' +
      '<div class="card-head"><h3>Arbre du site</h3><div style="display:flex;gap:6px">' +
        '<button class="btn btn-icon btn-sm" type="button" aria-label="Rechercher">' + icon('search', 'icon-sm') + '</button>' +
        '<button class="btn btn-icon btn-sm" type="button" aria-label="Ajouter">' + icon('plus', 'icon-sm') + '</button></div></div>' +
      '<div class="tree" id="cms-tree">' + tree + '</div>' +
    '</section>' +
    '<section class="card" id="cms-center"><div class="empty-state">Sélectionnez une section dans l\'arbre du site.</div></section>' +
    '<aside class="card" id="cms-editor"><div class="empty-state">Aucune section sélectionnée.</div></aside>' +
  '</div>';
}

function afterContents() {
  document.querySelectorAll('#cms-tree .tree-item').forEach(function (b) {
    b.addEventListener('click', function () { openSection(b.dataset.section); });
  });
  const first = document.querySelector('#cms-tree .tree-item');
  if (first) first.click();
}

async function openSection(id) {
  document.querySelectorAll('#cms-tree .tree-item').forEach(function (b) {
    b.classList.toggle('is-active', b.dataset.section === id);
  });

  const { data: section } = await sb.from('page_sections').select('*, section_media(*), pages(label)').eq('id', id).single();
  const { data: draft } = await sb.from('section_drafts').select('payload').eq('section_id', id).maybeSingle();

  app.section = section;
  const base = draft ? draft.payload : section;
  app.hasDraft = !!draft;
  app.draft = {
    eyebrow: base.eyebrow, title: base.title, subtitle: base.subtitle,
    description: base.description, caption: base.caption,
    cta1_label: base.cta1_label, cta1_url: base.cta1_url, cta1_blank: !!base.cta1_blank,
    cta2_label: base.cta2_label, cta2_url: base.cta2_url, cta2_blank: !!base.cta2_blank,
    text_position: base.text_position || 'bottom-left',
    text_align: base.text_align || 'left',
    status: base.status || 'published'
  };
  app.media = ((draft && draft.payload.media) ? draft.payload.media : (section.section_media || []))
    .slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
  app.slide = 0;

  renderCenter();
  renderEditor();
}

function renderCenter() {
  const s = app.section, d = app.draft;
  const m = app.media[app.slide] || app.media[0];
  const isSlideshow = app.media.filter(function (x) { return x.active !== false; }).length > 1;

  const frame = function (kind) {
    if (!m) return '<div class="pv-frame ' + kind + '"></div>';
    const mob = kind === 'mobile';
    const url = mediaSrc((mob && m.mobile_url) ? m.mobile_url : m.desktop_url);
    const fx = mob ? m.focal_x_mobile : m.focal_x_desktop;
    const fy = mob ? m.focal_y_mobile : m.focal_y_desktop;
    const inner = m.media_type === 'video'
      ? '<video src="' + esc(url) + '" muted autoplay loop playsinline></video>'
      : '<img src="' + esc(url) + '" alt="" data-focal="' + kind + '" style="object-position:' + fx + '% ' + fy + '%">';
    return '<div class="pv-frame ' + kind + '">' + inner +
      (m.media_type !== 'video' ? '<span class="focal-dot" style="left:' + fx + '%;top:' + fy + '%"></span>' : '') +
      '<div class="pv-overlay">' +
        (d.eyebrow ? '<span class="pv-eyebrow">' + esc(d.eyebrow) + '</span>' : '') +
        (d.title ? '<span class="pv-title">' + esc(d.title) + '</span>' : '') +
        (d.description ? '<span class="pv-desc">' + esc(d.description) + '</span>' : '') +
        (d.cta1_label ? '<span><span class="pv-cta">' + esc(d.cta1_label) + ' →</span></span>' : '') +
      '</div></div>';
  };

  document.getElementById('cms-center').innerHTML =
    '<div class="preview-head">' + esc(s.pages ? s.pages.label : '') + '<span class="sep">' + icon('chevronR', 'icon-sm') + '</span>' +
      '<strong>' + esc(s.section_key) + '</strong>' + badge('Section sélectionnée', 'success', true) + '</div>' +
    '<div class="previews">' +
      '<div class="pv-col"><span>Desktop — 1440 px et +</span>' + frame('desktop') +
        (isSlideshow ? '<div class="pv-dots">' + app.media.map(function (x, i) {
          return '<i class="' + (i === app.slide ? 'is-on' : '') + '"></i>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="pv-col"><span>Mobile — 375 px</span>' + frame('mobile') + '</div>' +
    '</div>' +
    (isSlideshow ? slideshowBar() : '');

  document.querySelectorAll('[data-focal]').forEach(function (img) {
    img.addEventListener('click', function (e) {
      if (!canEdit() || !m) return;
      const r = img.getBoundingClientRect();
      const x = Math.round(((e.clientX - r.left) / r.width) * 100);
      const y = Math.round(((e.clientY - r.top) / r.height) * 100);
      if (img.dataset.focal === 'mobile') { m.focal_x_mobile = x; m.focal_y_mobile = y; }
      else { m.focal_x_desktop = x; m.focal_y_desktop = y; }
      renderCenter(); renderEditor();
    });
  });
  bindSlideshowBar();
}

function slideshowBar() {
  const first = app.media[0] || {};
  return '<div class="slideshow-bar">' +
    '<div><div class="lbl">Diaporama — ' + esc(app.section.section_key) + '</div>' +
      '<div class="slide-thumbs">' + app.media.map(function (m, i) {
        return '<button type="button" class="slide-thumb ' + (i === app.slide ? 'is-active' : '') + (m.active === false ? ' is-off' : '') +
          '" data-slide="' + i + '"><img src="' + esc(mediaSrc(m.desktop_url)) + '" alt=""><b>' + (i + 1) + '</b></button>';
      }).join('') + '</div></div>' +
    '<div><div class="field-row">' +
      field('Durée par slide', select('ss-dur', [['3000', '3 s'], ['10000', '10 s'], ['15000', '15 s'], ['30000', '30 s'], ['60000', '60 s']], first.duration_ms || 30000)) +
      field('Transition', select('ss-tr', [['600', '0,6 s'], ['1200', '1,2 s'], ['1300', '1,3 s'], ['1500', '1,5 s']], first.transition_ms || 1300)) +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:12px"><span class="lbl" style="margin:0">Boucle</span>' +
      toggle('ss-loop', true, 'Boucle du diaporama') + '<span class="dim">Active</span>' +
      '<button class="btn btn-sm" type="button" id="ss-manage" style="margin-left:auto">Gérer le diaporama</button></div>' +
    '</div></div>';
}

function bindSlideshowBar() {
  document.querySelectorAll('[data-slide]').forEach(function (b) {
    b.addEventListener('click', function () { app.slide = +b.dataset.slide; renderCenter(); renderEditor(); });
  });
  const dur = document.getElementById('ss-dur');
  if (dur) dur.addEventListener('change', function () { app.media.forEach(function (m) { m.duration_ms = +dur.value; }); });
  const tr = document.getElementById('ss-tr');
  if (tr) tr.addEventListener('change', function () { app.media.forEach(function (m) { m.transition_ms = +tr.value; }); });
  const mg = document.getElementById('ss-manage');
  if (mg) mg.addEventListener('click', function () { document.getElementById('cms-editor').scrollIntoView({ behavior: 'smooth' }); });
}

function renderEditor() {
  const d = app.draft, m = app.media[app.slide];
  const positions = [['top-left','Haut gauche'],['top-center','Haut centre'],['top-right','Haut droite'],
    ['center','Centre'],['bottom-left','Bas gauche'],['bottom-center','Bas centre'],['bottom-right','Bas droite']];

  const mediaSlot = function (label, url, meta, key) {
    return '<div class="media-slot"><span>' + esc(label) + '</span><div class="row">' +
      (url ? '<img class="prev" src="' + esc(mediaSrc(url)) + '" alt="">' : '<div class="prev"></div>') +
      '<div><button class="btn btn-sm" type="button" data-replace="' + key + '">Remplacer</button>' +
      (meta ? '<small>' + esc(meta) + '</small>' : '') + '</div></div></div>';
  };

  const focalPick = function (label, kind) {
    if (!m || m.media_type === 'video') return '';
    const fx = kind === 'mobile' ? m.focal_x_mobile : m.focal_x_desktop;
    const fy = kind === 'mobile' ? m.focal_y_mobile : m.focal_y_desktop;
    return '<div class="media-slot"><span>' + esc(label) + '</span>' +
      '<div class="focal-pick" data-focal="' + kind + '"><img src="' + esc(mediaSrc(m.desktop_url)) + '" alt="" style="object-position:' + fx + '% ' + fy + '%">' +
      '<span class="focal-dot" style="left:' + fx + '%;top:' + fy + '%"></span></div>' +
      '<small class="dim">' + fx + ' % / ' + fy + ' %</small></div>';
  };

  document.getElementById('cms-editor').innerHTML =
    '<div class="card-head"><h3>Éditer la section — ' + esc(app.section.section_key) + '</h3></div>' +
    '<div class="card-pad"><div class="editor-grid">' +
      '<div>' +
        field('Statut *', select('f-status', [['published', 'Publié'], ['draft', 'Brouillon'], ['disabled', 'Désactivé']], d.status)) +
        field('Surtitre', input('f-eyebrow', d.eyebrow || ''), (d.eyebrow || '').length + ' / 30') +
        field('Titre', input('f-title', d.title || ''), (d.title || '').length + ' / 60') +
        field('Sous-titre', '<textarea class="textarea" id="f-subtitle" style="min-height:58px">' + esc(d.subtitle) + '</textarea>', (d.subtitle || '').length + ' / 100') +
        field('Légende', '<textarea class="textarea" id="f-description" style="min-height:58px">' + esc(d.description) + '</textarea>', (d.description || '').length + ' / 150') +
        '<div class="field-row">' +
          field('CTA 1 (texte)', input('f-cta1', d.cta1_label || '')) +
          field('Lien CTA 1', input('f-cta1url', d.cta1_url || '')) + '</div>' +
        '<div class="field-row">' +
          field('CTA 2 (texte)', input('f-cta2', d.cta2_label || '')) +
          field('Lien CTA 2', input('f-cta2url', d.cta2_url || '')) + '</div>' +
        '<div class="field-row">' +
          field('Position du texte', select('f-position', positions, d.text_position)) +
          field('Alignement', '<div class="seg" id="f-align">' + ['left', 'center', 'right'].map(function (a) {
            return '<button type="button" data-align="' + a + '" class="' + (d.text_align === a ? 'is-active' : '') + '">' + icon('align', 'icon-sm') + '</button>';
          }).join('') + '</div>') + '</div>' +
      '</div>' +

      '<div><div class="lbl">Médias</div>' +
        (m ? mediaSlot('Image desktop', m.desktop_url, m.media_type === 'video' ? 'Vidéo MP4' : 'JPG', 'desktop') : '') +
        (m ? mediaSlot('Image mobile', m.mobile_url || m.desktop_url, 'JPG', 'mobile') : '') +
        (m && m.poster_desktop_url ? mediaSlot('Poster', m.poster_desktop_url, 'JPG', 'poster') : '') +
        focalPick('Point focal desktop', 'desktop') +
        focalPick('Point focal mobile', 'mobile') +
        (canEdit() ? '<label class="btn btn-sm btn-block">' + icon('plus', 'icon-sm') + 'Ajouter un média' +
          '<input type="file" id="add-media" accept="image/*,video/mp4" hidden></label>' : '') +
      '</div>' +
    '</div>' +

    '<div class="editor-status" style="border-top:1px solid var(--border);padding-top:14px;margin-top:14px">' +
      '<div class="grp">Actif ' + toggle('f-active', d.status !== 'disabled', 'Section active') + '</div>' +
      '<div class="grp">Brouillon / Publié ' + toggle('f-published', d.status === 'published', 'Publié') +
        '<span>' + (app.hasDraft ? badge('Brouillon en attente', 'warning') : badge('Publié', 'success')) + '</span></div>' +
      '<div class="dim" style="width:100%;font-size:11px">Dernière modification : ' +
        (app.section.updated_at ? dateTimeFR(app.section.updated_at) : '—') + '</div>' +
    '</div>' +

    (canEdit()
      ? '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-block" type="button" id="ed-draft">Enregistrer le brouillon</button>' +
        '<button class="btn btn-primary btn-block" type="button" id="ed-publish">' + icon('publish', 'icon-sm') + 'Publier</button></div>'
      : '<p class="empty-state">Votre rôle ne permet pas de modifier les contenus.</p>') +
    '</div>';

  bindEditor();
}

function bindEditor() {
  const map = { 'f-status': 'status', 'f-eyebrow': 'eyebrow', 'f-title': 'title', 'f-subtitle': 'subtitle',
    'f-description': 'description', 'f-cta1': 'cta1_label', 'f-cta1url': 'cta1_url',
    'f-cta2': 'cta2_label', 'f-cta2url': 'cta2_url', 'f-position': 'text_position' };
  Object.keys(map).forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { app.draft[map[id]] = el.value; renderCenter(); });
  });

  const align = document.getElementById('f-align');
  if (align) align.addEventListener('click', function (e) {
    const b = e.target.closest('[data-align]');
    if (!b) return;
    app.draft.text_align = b.dataset.align;
    align.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
    renderCenter();
  });

  document.querySelectorAll('#cms-editor .focal-pick').forEach(function (box) {
    box.addEventListener('click', function (e) {
      const m = app.media[app.slide];
      if (!m || !canEdit()) return;
      const r = box.getBoundingClientRect();
      const x = Math.round(((e.clientX - r.left) / r.width) * 100);
      const y = Math.round(((e.clientY - r.top) / r.height) * 100);
      if (box.dataset.focal === 'mobile') { m.focal_x_mobile = x; m.focal_y_mobile = y; }
      else { m.focal_x_desktop = x; m.focal_y_desktop = y; }
      renderCenter(); renderEditor();
    });
  });

  document.querySelectorAll('[data-replace]').forEach(function (b) {
    b.addEventListener('click', function () {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*,video/mp4';
      inp.onchange = async function () {
        if (!inp.files.length) return;
        const up = await uploadFile(inp.files[0]);
        if (!up) return;
        const m = app.media[app.slide];
        if (b.dataset.replace === 'mobile') m.mobile_url = up.url;
        else if (b.dataset.replace === 'poster') m.poster_desktop_url = up.url;
        else { m.desktop_url = up.url; m.media_type = up.mime.indexOf('video') === 0 ? 'video' : 'image'; }
        renderCenter(); renderEditor();
        toast('Média remplacé dans le brouillon', 'ok');
      };
      inp.click();
    });
  });

  const add = document.getElementById('add-media');
  if (add) add.addEventListener('change', async function () {
    if (!add.files.length) return;
    const up = await uploadFile(add.files[0]);
    if (!up) return;
    app.media.push({
      media_type: up.mime.indexOf('video') === 0 ? 'video' : 'image',
      desktop_url: up.url, mobile_url: null, poster_desktop_url: null, poster_mobile_url: null,
      alt_text: '', caption: '', focal_x_desktop: 50, focal_y_desktop: 50,
      focal_x_mobile: 50, focal_y_mobile: 50, sort_order: app.media.length,
      active: true, duration_ms: 30000, transition_ms: 1300
    });
    app.slide = app.media.length - 1;
    renderCenter(); renderEditor();
    toast('Média ajouté au brouillon', 'ok');
  });

  const dr = document.getElementById('ed-draft');
  if (dr) dr.addEventListener('click', saveDraft);
  const pb = document.getElementById('ed-publish');
  if (pb) pb.addEventListener('click', publishSection);

  const act = document.getElementById('f-active');
  if (act) act.addEventListener('change', function () {
    app.draft.status = act.checked ? 'published' : 'disabled';
    const sel = document.getElementById('f-status'); if (sel) sel.value = app.draft.status;
  });
}

async function saveDraft() {
  if (!app.section) return;
  const payload = Object.assign({}, app.draft, {
    media: app.media.map(function (m, i) { return Object.assign({}, m, { sort_order: i }); })
  });
  const { error } = await sb.from('section_drafts').upsert({
    section_id: app.section.id, payload: payload,
    updated_at: new Date().toISOString(), updated_by: app.profile.id
  });
  if (error) { toast('Enregistrement impossible : ' + error.message, 'err'); return; }
  app.hasDraft = true;
  await logActivity('save_draft', 'page_section', app.section.id);
  toast('Brouillon enregistré', 'ok');
  renderEditor();
  const dot = document.querySelector('.tree-item.is-active .dot');
  if (dot) dot.className = 'dot is-draft';
}

async function publishSection() {
  if (!app.section) return;
  if (!confirmAction('Publier cette section ? Elle sera immédiatement visible sur le site public.')) return;
  await saveDraft();
  const { error } = await sb.rpc('publish_section', { p_section_id: app.section.id });
  if (error) { toast('Publication impossible : ' + error.message, 'err'); return; }
  toast('Contenu publié', 'ok');
  const dot = document.querySelector('.tree-item.is-active .dot');
  if (dot) dot.className = 'dot';
  openSection(app.section.id);
}

/* ============================== MÉDIATHÈQUE ============================= */
async function uploadFile(file) {
  if (!canEdit()) { toast('Votre rôle ne permet pas de téléverser.', 'err'); return null; }
  if (file.size > 200 * 1024 * 1024) { toast('Fichier trop lourd (200 Mo maximum).', 'err'); return null; }
  if (file.size > 8 * 1024 * 1024 && file.type.indexOf('image') === 0 &&
      !confirmAction('Cette image pèse ' + Math.round(file.size / 1048576) + ' Mo et ralentira le site. Continuer ?')) return null;

  const now = new Date();
  const path = 'campaigns/' + now.getFullYear() + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' +
    Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');

  const { error } = await sb.storage.from(NOVRA_MEDIA_BUCKET).upload(path, file, { upsert: false });
  if (error) { toast('Téléversement impossible : ' + error.message, 'err'); return null; }

  const { data: pub } = sb.storage.from(NOVRA_MEDIA_BUCKET).getPublicUrl(path);
  await sb.from('media_library').insert({
    storage_path: path, public_url: pub.publicUrl, file_name: file.name,
    folder: file.type.indexOf('video') === 0 ? 'videos' : 'campagnes',
    mime_type: file.type, bytes: file.size, created_by: app.profile.id
  });
  await logActivity('upload_media', 'media_library', path, { bytes: file.size });
  toast('Média téléversé', 'ok');
  return { url: pub.publicUrl, mime: file.type };
}

const FOLDERS = [['', 'Tous les médias'], ['produits', 'Produits'], ['campagnes', 'Campagnes'],
  ['boutique-physique', 'Boutique physique'], ['videos', 'Vidéos'], ['logos', 'Logos'], ['autres', 'Non classés']];

async function pageLibrary() {
  const { data } = await sb.from('media_library').select('*').order('created_at', { ascending: false }).limit(300);
  app.library = data || [];
  const counts = {};
  app.library.forEach(function (m) { counts[m.folder] = (counts[m.folder] || 0) + 1; });
  const totalBytes = app.library.reduce(function (s, m) { return s + (m.bytes || 0); }, 0);

  return '<div class="media-grid-page">' +
    '<section class="card">' +
      '<div class="card-head"><h3>Dossiers</h3><button class="btn btn-icon btn-sm" type="button" aria-label="Nouveau dossier">' + icon('plus', 'icon-sm') + '</button></div>' +
      '<div style="padding:8px" id="folders">' + FOLDERS.map(function (f) {
        const n = f[0] ? (counts[f[0]] || 0) : app.library.length;
        return '<button type="button" class="folder-row" data-folder="' + f[0] + '">' + icon('folder', 'icon-sm') +
          '<span class="grow">' + f[1] + '</span><span class="badge-count">' + n + '</span></button>';
      }).join('') + '</div>' +
      '<div class="card-foot"><div class="lbl" style="margin-bottom:6px">Espace utilisé</div>' +
        '<div class="progress"><i style="width:' + Math.min(100, (totalBytes / (1024 * 1024 * 1024)) * 100).toFixed(1) + '%"></i></div>' +
        '<small class="dim">' + (totalBytes / 1048576).toFixed(1) + ' Mo utilisés</small></div>' +
    '</section>' +

    '<section class="stack">' +
      '<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:14px">' +
        '<label class="dropzone" id="dropzone">' + icon('upload', 'icon-lg') +
          '<div><strong>Glissez-déposez vos fichiers ici</strong><small>ou cliquez pour parcourir — JPG, PNG, WEBP, MP4 · max 200 Mo</small></div>' +
          '<input type="file" id="lib-upload" accept="image/*,video/mp4,video/webm" multiple hidden></label>' +
        '<div class="card card-pad" style="display:flex;align-items:center;gap:10px">' +
          '<div class="search grow">' + icon('search', 'icon-sm') + '<input class="input" id="lib-search" type="search" placeholder="Rechercher un média…"></div>' +
          '<button class="btn btn-icon" type="button" aria-label="Filtres">' + icon('filter', 'icon-sm') + '</button></div>' +
      '</div>' +
      '<div class="card card-pad"><div class="lbl" id="lib-count"></div><div class="mlib-grid" id="lib-grid"></div></div>' +
    '</section>' +

    '<aside class="panel" id="lib-panel"><div class="empty-state">Sélectionnez un média pour voir ses informations.</div></aside>' +
  '</div>';
}

function afterLibrary() {
  renderLibGrid();
  document.querySelectorAll('#folders .folder-row').forEach(function (b) {
    b.addEventListener('click', function () {
      app.libFolder = b.dataset.folder;
      document.querySelectorAll('#folders .folder-row').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      renderLibGrid();
    });
  });
  document.getElementById('lib-search').addEventListener('input', renderLibGrid);

  const up = document.getElementById('lib-upload');
  up.addEventListener('change', async function () {
    for (const f of up.files) await uploadFile(f);
    up.value = ''; loadLibrary();
  });
  const dz = document.getElementById('dropzone');
  ['dragenter', 'dragover'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('is-over'); });
  });
  dz.addEventListener('drop', async function (e) {
    for (const f of e.dataTransfer.files) await uploadFile(f);
    loadLibrary();
  });
}

async function loadLibrary() {
  const { data } = await sb.from('media_library').select('*').order('created_at', { ascending: false }).limit(300);
  app.library = data || [];
  if (app.view === 'mediatheque') renderLibGrid();
}

function renderLibGrid() {
  const q = (document.getElementById('lib-search') || {}).value || '';
  const list = app.library.filter(function (m) {
    return (!app.libFolder || m.folder === app.libFolder) &&
           (!q || m.file_name.toLowerCase().indexOf(q.toLowerCase()) !== -1);
  });
  document.getElementById('lib-count').textContent = list.length + ' média' + (list.length > 1 ? 's' : '');
  document.getElementById('lib-grid').innerHTML = list.map(function (m, i) {
    const isVideo = (m.mime_type || '').indexOf('video') === 0;
    return '<div class="mlib-item" data-media="' + i + '">' +
      '<div class="ph">' + (isVideo
        ? '<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--text-2)">' + icon('play', 'icon-lg') + '</div>'
        : '<img src="' + esc(mediaSrc(m.public_url)) + '" alt="" loading="lazy">') + '</div>' +
      '<div class="meta"><strong>' + esc(m.file_name) + '</strong>' +
        '<small>' + esc(m.folder) + (m.bytes ? ' · ' + Math.round(m.bytes / 1024) + ' Ko' : '') + '</small></div></div>';
  }).join('') || '<div class="empty-state">Aucun média dans ce dossier.</div>';

  document.querySelectorAll('[data-media]').forEach(function (el) {
    el.addEventListener('click', function () {
      document.querySelectorAll('[data-media]').forEach(function (x) { x.classList.toggle('is-active', x === el); });
      renderLibPanel(list[+el.dataset.media]);
    });
  });
}

function renderLibPanel(m) {
  const isVideo = (m.mime_type || '').indexOf('video') === 0;
  document.getElementById('lib-panel').innerHTML =
    '<div class="panel-head"><h2 style="font-size:13px;font-weight:500">' + esc(m.file_name) + '</h2>' +
      '<button class="btn btn-icon btn-sm" type="button" aria-label="Fermer">' + icon('close', 'icon-sm') + '</button></div>' +
    '<div class="panel-body">' +
      (isVideo ? '<video src="' + esc(mediaSrc(m.public_url)) + '" controls style="width:100%;border-radius:8px"></video>'
               : '<img src="' + esc(mediaSrc(m.public_url)) + '" alt="" style="width:100%;border-radius:8px">') +
      '<p class="dim" style="font-size:11px;margin:10px 0 16px">' +
        (m.width ? m.width + ' × ' + m.height + ' · ' : '') + esc((m.mime_type || '').split('/')[1] || '') +
        (m.bytes ? ' · ' + (m.bytes / 1048576).toFixed(1) + ' Mo' : '') + ' · ' + dateFR(m.created_at) + '</p>' +
      field('Texte alternatif (alt)', '<textarea class="textarea" id="lib-alt" style="min-height:56px">' + esc(m.alt_text) + '</textarea>') +
      '<div class="lbl">Dossier</div>' + select('lib-folder-sel', FOLDERS.filter(function (f) { return f[0]; }), m.folder) +
      (m.is_local ? '<p class="dim" style="font-size:11px;margin-top:12px">Fichier historique du dépôt : il ne peut pas être supprimé depuis l\'administration.</p>' : '') +
      '<div class="form-section-title">URL du fichier</div>' +
      '<div style="display:flex;gap:8px"><input class="input" value="' + esc(m.public_url) + '" readonly>' +
        '<button class="btn btn-icon" type="button" id="lib-copy" aria-label="Copier">' + icon('copy', 'icon-sm') + '</button></div>' +
    '</div>' +
    '<div class="panel-foot">' +
      '<button class="btn btn-block" type="button" id="lib-save">Enregistrer</button>' +
      (m.is_local ? '' : '<button class="btn btn-danger" type="button" id="lib-del">' + icon('trash', 'icon-sm') + 'Supprimer</button>') +
    '</div>';

  document.getElementById('lib-copy').addEventListener('click', function () {
    navigator.clipboard.writeText(m.public_url); toast('URL copiée dans le presse-papiers', 'ok');
  });
  document.getElementById('lib-save').addEventListener('click', async function () {
    const { error } = await sb.from('media_library').update({
      alt_text: document.getElementById('lib-alt').value,
      folder: document.getElementById('lib-folder-sel').value
    }).eq('id', m.id);
    if (error) { toast('Enregistrement impossible : ' + error.message, 'err'); return; }
    toast('Média mis à jour', 'ok'); loadLibrary();
  });
  const del = document.getElementById('lib-del');
  if (del) del.addEventListener('click', async function () {
    if (!confirmAction('Supprimer définitivement « ' + m.file_name + ' » ? Les sections qui l\'utilisent afficheront une image manquante.')) return;
    await sb.storage.from(NOVRA_MEDIA_BUCKET).remove([m.storage_path]);
    await sb.from('media_library').delete().eq('id', m.id);
    await logActivity('delete_media', 'media_library', m.storage_path);
    toast('Média supprimé', 'ok');
    document.getElementById('lib-panel').innerHTML = '<div class="empty-state">Sélectionnez un média.</div>';
    loadLibrary();
  });
}

/* ========================== ADMINISTRATEURS ============================= */
function afterAdmins() {
  const btn = document.getElementById('add-invite');
  if (!btn) return;
  btn.addEventListener('click', async function () {
    const mail = document.getElementById('inv-mail').value.trim().toLowerCase();
    const role = document.getElementById('inv-role').value;
    if (!mail) { toast('Saisissez une adresse e-mail.', 'err'); return; }
    const { error } = await sb.from('admin_invitations').upsert({ email: mail, role: role });
    if (error) { toast('Action réservée au super administrateur.', 'err'); return; }
    toast('Adresse pré-autorisée. Créez le compte depuis Supabase → Authentication.', 'ok');
    document.getElementById('inv-mail').value = '';
  });
}

/* --------------------------------- Boot --------------------------------- */
sb.auth.onAuthStateChange(function (event) { if (event === 'SIGNED_OUT') showLogin(); });
boot();
