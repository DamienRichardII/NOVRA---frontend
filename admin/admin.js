/* =========================================================================
   NOVRA ADMIN — logique du back-office
   Authentification Supabase, CMS Médias & Contenus, médiathèque, journal.
   Aucune clé secrète ici : seule la clé publiable est utilisée, la sécurité
   repose sur les règles RLS et les rôles enregistrés en base.
   ========================================================================= */

const sb = window.supabase.createClient(NOVRA_SUPABASE_URL, NOVRA_SUPABASE_ANON_KEY);

const state = {
  profile: null,
  pages: [],
  section: null,     // section publiée sélectionnée
  draft: null,       // brouillon en cours d'édition
  media: [],         // médias du brouillon
  viewport: 1440
};

/* ------------------------------- Utilitaires ---------------------------- */
function toast(message, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' is-' + kind : '');
  el.textContent = message;
  document.getElementById('toasts').appendChild(el);
  setTimeout(function () { el.remove(); }, 3400);
}

function esc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Les URL relatives héritées du dépôt restent affichables dans l'admin */
function mediaSrc(url) {
  if (!url) return '';
  return /^https?:/.test(url) ? url : '../' + url;
}

function canEdit() {
  return state.profile && ['super_admin', 'manager', 'marketing'].indexOf(state.profile.role) !== -1;
}

async function logActivity(action, entity, entityId, detail) {
  try {
    await sb.from('activity_log').insert({
      actor_id: state.profile.id, actor_email: state.profile.email,
      action: action, entity: entity, entity_id: entityId, detail: detail || null
    });
  } catch (e) { /* le journal ne doit jamais bloquer une action métier */ }
}

/* ============================ AUTHENTIFICATION =========================== */
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
  if (!email) { msg.textContent = 'Saisissez d\'abord votre adresse e-mail.'; msg.className = 'login-msg is-err'; return; }
  await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
  msg.textContent = 'Si ce compte existe, un e-mail de réinitialisation vient d\'être envoyé.';
  msg.className = 'login-msg is-ok';
});

document.getElementById('logout').addEventListener('click', async function () {
  await sb.auth.signOut();
  window.location.reload();
});

async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { showLogin(); return; }

  const { data: profile } = await sb.from('admin_profiles')
    .select('*').eq('id', session.user.id).maybeSingle();

  if (!profile || !profile.active) {
    await sb.auth.signOut();
    showLogin('Ce compte n\'est pas encore activé par un super administrateur.');
    return;
  }

  state.profile = profile;
  document.getElementById('login-view').hidden = true;
  document.getElementById('app-view').hidden = false;
  window.scrollTo(0, 0);
  document.getElementById('me-name').textContent = profile.full_name || profile.email;
  document.getElementById('me-role').textContent = ({
    super_admin: 'Super admin', manager: 'Chef de projet',
    marketing: 'Marketing', support: 'Support'
  })[profile.role] || profile.role;

  applyRoleVisibility();
  sb.from('admin_profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', profile.id);

  await loadTree();
  routeFromHash();
}

function showLogin(message) {
  document.getElementById('app-view').hidden = true;
  document.getElementById('login-view').hidden = false;
  if (message) {
    const msg = document.getElementById('login-msg');
    msg.textContent = message; msg.className = 'login-msg is-err';
  }
}

/* Masque les entrées de menu hors du périmètre du rôle */
const ROLE_VIEWS = {
  super_admin: null,
  manager: ['dashboard','contenus','mediatheque','produits','commandes','stocks','promotions','clients','analytics','journal'],
  marketing: ['dashboard','contenus','mediatheque','promotions','newsletter','analytics'],
  support: ['dashboard','clients','commandes','avis','sav']
};

function applyRoleVisibility() {
  const allowed = ROLE_VIEWS[state.profile.role];
  if (!allowed) return;
  document.querySelectorAll('.nav-item').forEach(function (a) {
    if (allowed.indexOf(a.dataset.view) === -1) a.hidden = true;
  });
}

/* ================================ ROUTAGE =============================== */
function routeFromHash() {
  const view = (location.hash || '#contenus').slice(1);
  const target = document.getElementById('view-' + view);
  if (!target) { location.hash = '#contenus'; return; }

  document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('is-active'); });
  target.classList.add('is-active');
  document.querySelectorAll('.nav-item').forEach(function (a) {
    a.classList.toggle('is-active', a.dataset.view === view);
  });
  const link = document.querySelector('.nav-item[data-view="' + view + '"]');
  document.getElementById('view-title').textContent = link ? link.textContent : 'NOVRA Admin';
  document.getElementById('sidebar').classList.remove('is-open');

  if (view === 'mediatheque') loadMediaLibrary();
  if (view === 'journal') loadJournal();
  if (view === 'dashboard') loadDashboard();
  if (view === 'administrateurs') loadAdmins();
}
window.addEventListener('hashchange', routeFromHash);
document.getElementById('menu-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('is-open');
});

/* ========================= MÉDIAS & CONTENUS ============================ */
async function loadTree() {
  const { data, error } = await sb.from('pages')
    .select('id,page_key,label,path,sort_order,page_sections(id,section_key,section_type,status,sort_order,locked)')
    .order('sort_order');
  if (error) { toast('Chargement impossible : ' + error.message, 'err'); return; }

  const { data: drafts } = await sb.from('section_drafts').select('section_id');
  const draftIds = (drafts || []).map(function (d) { return d.section_id; });

  state.pages = data;
  document.getElementById('cms-tree').innerHTML = data.map(function (page) {
    const sections = (page.page_sections || []).sort(function (a, b) { return a.sort_order - b.sort_order; });
    return '<p class="tree-page">' + esc(page.label) + '</p>' +
      sections.map(function (s) {
        const cls = draftIds.indexOf(s.id) !== -1 ? 'is-draft' : (s.status === 'published' ? '' : 'is-off');
        return '<button type="button" class="tree-item" data-section="' + s.id + '">' +
          '<span>' + esc(s.section_key) + '</span><span class="dot ' + cls + '"></span></button>';
      }).join('');
  }).join('');

  document.querySelectorAll('.tree-item').forEach(function (btn) {
    btn.addEventListener('click', function () { openSection(btn.dataset.section); });
  });
}

async function openSection(sectionId) {
  document.querySelectorAll('.tree-item').forEach(function (b) {
    b.classList.toggle('is-active', b.dataset.section === sectionId);
  });

  const { data: section } = await sb.from('page_sections')
    .select('*, section_media(*)').eq('id', sectionId).single();
  const { data: draft } = await sb.from('section_drafts')
    .select('payload').eq('section_id', sectionId).maybeSingle();

  state.section = section;
  /* Le brouillon prime dans l'éditeur ; le site public ignore ce contenu */
  const base = draft ? draft.payload : section;
  state.draft = {
    eyebrow: base.eyebrow, title: base.title, subtitle: base.subtitle,
    description: base.description, caption: base.caption,
    cta1_label: base.cta1_label, cta1_url: base.cta1_url, cta1_blank: !!base.cta1_blank,
    cta2_label: base.cta2_label, cta2_url: base.cta2_url, cta2_blank: !!base.cta2_blank,
    text_position: base.text_position || 'bottom-left',
    text_align: base.text_align || 'left',
    status: base.status || 'published'
  };
  state.media = (draft && draft.payload.media ? draft.payload.media : (section.section_media || []))
    .slice().sort(function (a, b) { return a.sort_order - b.sort_order; });

  document.getElementById('draft-flag').hidden = !draft;
  renderEditor();
  renderPreview();
  document.getElementById('cms-editor').classList.add('is-open');
}

/* ------------------------------- Éditeur -------------------------------- */
function renderEditor() {
  const s = state.section, d = state.draft;
  const isSlideshow = s.section_type === 'slideshow' || state.media.length > 1;
  const isVideo = state.media.length && state.media[0].media_type === 'video';

  document.getElementById('cms-editor').innerHTML =
    '<div class="fieldset"><h3>Section — ' + esc(s.section_key) + '</h3>' +
      '<div class="field"><label for="f-status">Statut</label><select id="f-status">' +
        ['published:Publié', 'draft:Brouillon', 'disabled:Désactivé'].map(function (o) {
          const v = o.split(':');
          return '<option value="' + v[0] + '"' + (d.status === v[0] ? ' selected' : '') + '>' + v[1] + '</option>';
        }).join('') +
      '</select></div>' +
      '<div class="field"><label for="f-eyebrow">Surtitre</label><input id="f-eyebrow" value="' + esc(d.eyebrow) + '"></div>' +
      '<div class="field"><label for="f-title">Titre</label><input id="f-title" value="' + esc(d.title) + '"></div>' +
      '<div class="field"><label for="f-subtitle">Sous-titre</label><input id="f-subtitle" value="' + esc(d.subtitle) + '"></div>' +
      '<div class="field"><label for="f-description">Description</label><textarea id="f-description">' + esc(d.description) + '</textarea></div>' +
      '<div class="field"><label for="f-caption">Légende</label><input id="f-caption" value="' + esc(d.caption) + '"></div>' +
      '<div class="field-row">' +
        '<div class="field"><label for="f-position">Position du texte</label><select id="f-position">' +
          ['top-left','top-center','top-right','center','bottom-left','bottom-center','bottom-right'].map(function (p) {
            return '<option' + (d.text_position === p ? ' selected' : '') + '>' + p + '</option>';
          }).join('') + '</select></div>' +
        '<div class="field"><label for="f-align">Alignement</label><select id="f-align">' +
          ['left','center','right'].map(function (p) {
            return '<option' + (d.text_align === p ? ' selected' : '') + '>' + p + '</option>';
          }).join('') + '</select></div>' +
      '</div>' +
    '</div>' +

    '<div class="fieldset"><h3>Boutons</h3>' +
      '<div class="field"><label for="f-cta1">CTA 1 — texte</label><input id="f-cta1" value="' + esc(d.cta1_label) + '"></div>' +
      '<div class="field"><label for="f-cta1url">CTA 1 — lien</label><input id="f-cta1url" value="' + esc(d.cta1_url) + '"></div>' +
      '<div class="field"><label for="f-cta2">CTA 2 — texte</label><input id="f-cta2" value="' + esc(d.cta2_label) + '"></div>' +
      '<div class="field"><label for="f-cta2url">CTA 2 — lien</label><input id="f-cta2url" value="' + esc(d.cta2_url) + '"></div>' +
    '</div>' +

    '<div class="fieldset"><h3>' + (isSlideshow ? 'Diaporama' : (isVideo ? 'Vidéo' : 'Visuel')) + '</h3>' +
      '<div id="media-rows">' + renderMediaRows() + '</div>' +
      (canEdit() ? '<label class="btn btn-sm btn-block" style="margin-top:10px">Ajouter un média' +
        '<input type="file" id="add-media" accept="image/*,video/mp4" hidden></label>' : '') +
      (isSlideshow ? '<div class="field-row" style="margin-top:12px">' +
        '<div class="field"><label for="f-duration">Durée d\'une slide (s)</label>' +
          '<input type="number" id="f-duration" min="2" max="120" value="' + ((state.media[0] || {}).duration_ms || 30000) / 1000 + '"></div>' +
        '<div class="field"><label for="f-transition">Transition (ms)</label>' +
          '<input type="number" id="f-transition" min="200" max="4000" step="100" value="' + ((state.media[0] || {}).transition_ms || 1300) + '"></div>' +
      '</div>' : '') +
    '</div>' +

    '<div class="fieldset"><h3>Historique</h3><div id="versions"></div></div>' +

    (canEdit() ? '<div class="editor-actions">' +
      '<button class="btn btn-block" type="button" id="save-draft">Enregistrer le brouillon</button>' +
      '<button class="btn btn-primary btn-block" type="button" id="publish">Publier</button>' +
    '</div>' : '<p class="empty">Votre rôle ne permet pas de modifier les contenus.</p>');

  bindEditor();
  loadVersions();
}

function renderMediaRows() {
  if (!state.media.length) return '<p class="empty">Aucun média.</p>';
  return state.media.map(function (m, i) {
    return '<div class="slide-row' + (m.active ? '' : ' is-off') + '" data-i="' + i + '">' +
      (m.media_type === 'video'
        ? '<div class="name" style="width:56px">Vidéo</div>'
        : '<img src="' + esc(mediaSrc(m.desktop_url)) + '" alt="">') +
      '<div><div class="name">' + esc((m.desktop_url || '').split('/').pop()) + '</div>' +
        '<div class="name" style="color:var(--ink-3)">focal ' + m.focal_x_desktop + '/' + m.focal_y_desktop +
        ' · mob ' + m.focal_x_mobile + '/' + m.focal_y_mobile + '</div></div>' +
      '<div class="acts">' +
        '<button class="icon-sq" type="button" data-act="edit" title="Sélectionner">◎</button>' +
        '<button class="icon-sq" type="button" data-act="up" title="Monter">↑</button>' +
        '<button class="icon-sq" type="button" data-act="down" title="Descendre">↓</button>' +
        '<button class="icon-sq" type="button" data-act="toggle" title="Activer / désactiver">◐</button>' +
        '<button class="icon-sq" type="button" data-act="del" title="Retirer">✕</button>' +
      '</div></div>';
  }).join('');
}

let activeMediaIndex = 0;

function bindEditor() {
  const map = {
    'f-status': 'status', 'f-eyebrow': 'eyebrow', 'f-title': 'title', 'f-subtitle': 'subtitle',
    'f-description': 'description', 'f-caption': 'caption', 'f-cta1': 'cta1_label',
    'f-cta1url': 'cta1_url', 'f-cta2': 'cta2_label', 'f-cta2url': 'cta2_url',
    'f-position': 'text_position', 'f-align': 'text_align'
  };
  Object.keys(map).forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () { state.draft[map[id]] = el.value; renderPreview(); });
  });

  const dur = document.getElementById('f-duration');
  if (dur) dur.addEventListener('input', function () {
    state.media.forEach(function (m) { m.duration_ms = Math.max(2, +dur.value || 30) * 1000; });
  });
  const tr = document.getElementById('f-transition');
  if (tr) tr.addEventListener('input', function () {
    state.media.forEach(function (m) { m.transition_ms = +tr.value || 1300; });
  });

  const rows = document.getElementById('media-rows');
  if (rows) rows.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const i = +btn.closest('.slide-row').dataset.i;
    const act = btn.dataset.act;

    if (act === 'edit') { activeMediaIndex = i; renderPreview(); return; }
    if (act === 'up' && i > 0) { const t = state.media[i - 1]; state.media[i - 1] = state.media[i]; state.media[i] = t; }
    if (act === 'down' && i < state.media.length - 1) { const t = state.media[i + 1]; state.media[i + 1] = state.media[i]; state.media[i] = t; }
    if (act === 'toggle') state.media[i].active = !state.media[i].active;
    if (act === 'del') {
      if (!confirm('Retirer ce média de la section ? Le fichier reste dans la médiathèque.')) return;
      state.media.splice(i, 1);
    }
    state.media.forEach(function (m, k) { m.sort_order = k; });
    document.getElementById('media-rows').innerHTML = renderMediaRows();
    renderPreview();
  });

  const add = document.getElementById('add-media');
  if (add) add.addEventListener('change', async function () {
    if (!add.files.length) return;
    const uploaded = await uploadFile(add.files[0]);
    if (!uploaded) return;
    state.media.push({
      media_type: uploaded.mime.indexOf('video') === 0 ? 'video' : 'image',
      desktop_url: uploaded.url, mobile_url: null,
      poster_desktop_url: null, poster_mobile_url: null,
      alt_text: '', caption: '',
      focal_x_desktop: 50, focal_y_desktop: 50, focal_x_mobile: 50, focal_y_mobile: 50,
      sort_order: state.media.length, active: true, duration_ms: 30000, transition_ms: 1300
    });
    document.getElementById('media-rows').innerHTML = renderMediaRows();
    renderPreview();
    toast('Média ajouté au brouillon');
  });

  const save = document.getElementById('save-draft');
  if (save) save.addEventListener('click', saveDraft);
  const pub = document.getElementById('publish');
  if (pub) pub.addEventListener('click', publishSection);
}

/* ----------------------------- Prévisualisation -------------------------- */
document.querySelectorAll('.seg button').forEach(function (b) {
  b.addEventListener('click', function () {
    document.querySelectorAll('.seg button').forEach(function (x) { x.classList.remove('is-active'); });
    b.classList.add('is-active');
    state.viewport = +b.dataset.vp;
    renderPreview();
  });
});

function renderPreview() {
  const stage = document.getElementById('preview-stage');
  if (!state.section) { stage.innerHTML = ''; return; }

  const isMobile = state.viewport <= 768;
  const m = state.media[activeMediaIndex] || state.media[0];
  const w = Math.min(state.viewport, stage.clientWidth - 32);
  const scale = w / state.viewport;
  const h = Math.round((state.viewport <= 390 ? 560 : state.viewport <= 768 ? 520 : 660) * scale);
  const d = state.draft;

  const focalX = m ? (isMobile ? m.focal_x_mobile : m.focal_x_desktop) : 50;
  const focalY = m ? (isMobile ? m.focal_y_mobile : m.focal_y_desktop) : 50;
  const url = m ? mediaSrc((isMobile && m.mobile_url) ? m.mobile_url : m.desktop_url) : '';

  stage.innerHTML =
    '<div class="preview-frame" id="preview-frame" style="width:' + Math.round(w) + 'px;height:' + h + 'px">' +
      (m && m.media_type === 'video'
        ? '<video src="' + esc(url) + '" muted autoplay loop playsinline></video>'
        : (url ? '<img id="preview-img" src="' + esc(url) + '" alt="" style="object-position:' + focalX + '% ' + focalY + '%">' : '')) +
      (m && m.media_type !== 'video' ? '<span class="focal-dot" style="left:' + focalX + '%;top:' + focalY + '%"></span>' : '') +
      '<div class="preview-overlay" style="text-align:' + esc(d.text_align) + '">' +
        (d.eyebrow ? '<span class="pv-eyebrow">' + esc(d.eyebrow) + '</span>' : '') +
        (d.title ? '<span class="pv-title">' + esc(d.title) + '</span>' : '') +
        (d.description ? '<span class="pv-desc">' + esc(d.description) + '</span>' : '') +
        (d.cta1_label ? '<span><span class="pv-cta">' + esc(d.cta1_label) + '</span></span>' : '') +
      '</div>' +
    '</div>';

  const img = document.getElementById('preview-img');
  if (img && canEdit()) {
    img.addEventListener('click', function (e) {
      const r = img.getBoundingClientRect();
      const x = Math.round(((e.clientX - r.left) / r.width) * 100);
      const y = Math.round(((e.clientY - r.top) / r.height) * 100);
      if (isMobile) { m.focal_x_mobile = x; m.focal_y_mobile = y; }
      else { m.focal_x_desktop = x; m.focal_y_desktop = y; }
      document.getElementById('media-rows').innerHTML = renderMediaRows();
      renderPreview();
    });
  }
}

/* ------------------------- Brouillon / publication ----------------------- */
async function saveDraft() {
  const payload = Object.assign({}, state.draft, {
    media: state.media.map(function (m, i) { return Object.assign({}, m, { sort_order: i }); })
  });
  const { error } = await sb.from('section_drafts').upsert({
    section_id: state.section.id, payload: payload,
    updated_at: new Date().toISOString(), updated_by: state.profile.id
  });
  if (error) { toast('Enregistrement impossible : ' + error.message, 'err'); return; }
  document.getElementById('draft-flag').hidden = false;
  await logActivity('save_draft', 'page_section', state.section.id);
  await loadTree();
  document.querySelector('.tree-item[data-section="' + state.section.id + '"]').classList.add('is-active');
  toast('Brouillon enregistré', 'ok');
}

async function publishSection() {
  if (!confirm('Publier cette section ? Elle sera immédiatement visible sur le site public.')) return;
  await saveDraft();
  const { error } = await sb.rpc('publish_section', { p_section_id: state.section.id });
  if (error) { toast('Publication impossible : ' + error.message, 'err'); return; }
  document.getElementById('draft-flag').hidden = true;
  toast('Contenu publié', 'ok');
  await loadTree();
  openSection(state.section.id);
}

/* ------------------------------- Versions -------------------------------- */
async function loadVersions() {
  const box = document.getElementById('versions');
  if (!box) return;
  const { data } = await sb.from('content_versions')
    .select('id,created_at,created_by').eq('section_id', state.section.id)
    .order('created_at', { ascending: false }).limit(8);

  if (!data || !data.length) { box.innerHTML = '<p class="empty">Aucune version archivée.</p>'; return; }
  box.innerHTML = data.map(function (v) {
    return '<div class="slide-row"><div></div><div class="name">' +
      new Date(v.created_at).toLocaleString('fr-FR') + '</div>' +
      '<div class="acts"><button class="btn btn-sm" type="button" data-restore="' + v.id + '">Restaurer</button></div></div>';
  }).join('');

  box.querySelectorAll('[data-restore]').forEach(function (b) {
    b.addEventListener('click', async function () {
      if (!confirm('Restaurer cette version ? Elle sera chargée en brouillon, rien ne sera publié sans votre validation.')) return;
      const { error } = await sb.rpc('restore_version', { p_version_id: b.dataset.restore });
      if (error) { toast('Restauration impossible : ' + error.message, 'err'); return; }
      toast('Version restaurée en brouillon', 'ok');
      openSection(state.section.id);
    });
  });
}

/* ============================== MÉDIATHÈQUE ============================= */
async function uploadFile(file) {
  const max = 200 * 1024 * 1024;
  if (file.size > max) { toast('Fichier trop lourd (200 Mo maximum).', 'err'); return null; }
  if (file.size > 8 * 1024 * 1024 && file.type.indexOf('image') === 0) {
    if (!confirm('Cette image pèse ' + Math.round(file.size / 1048576) + ' Mo. Elle ralentira le site. Continuer ?')) return null;
  }

  const now = new Date();
  const path = 'campaigns/' + now.getFullYear() + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' +
    Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');

  const { error } = await sb.storage.from(NOVRA_MEDIA_BUCKET).upload(path, file, { upsert: false });
  if (error) { toast('Téléversement impossible : ' + error.message, 'err'); return null; }

  const { data: pub } = sb.storage.from(NOVRA_MEDIA_BUCKET).getPublicUrl(path);
  await sb.from('media_library').insert({
    storage_path: path, public_url: pub.publicUrl, file_name: file.name,
    folder: file.type.indexOf('video') === 0 ? 'videos' : 'campagnes',
    mime_type: file.type, bytes: file.size, created_by: state.profile.id
  });
  await logActivity('upload_media', 'media_library', path, { bytes: file.size });
  return { url: pub.publicUrl, mime: file.type };
}

document.getElementById('media-upload').addEventListener('change', async function (e) {
  for (const file of e.target.files) { await uploadFile(file); }
  e.target.value = '';
  toast('Téléversement terminé', 'ok');
  loadMediaLibrary();
});

async function loadMediaLibrary() {
  const search = document.getElementById('media-search').value.trim();
  const folder = document.getElementById('media-folder').value;
  let q = sb.from('media_library').select('*').order('created_at', { ascending: false }).limit(120);
  if (folder) q = q.eq('folder', folder);
  if (search) q = q.ilike('file_name', '%' + search + '%');

  const { data } = await q;
  document.getElementById('media-grid').innerHTML = (data || []).map(function (m) {
    const isVideo = (m.mime_type || '').indexOf('video') === 0;
    return '<div class="media-item">' +
      (isVideo ? '<div style="aspect-ratio:4/3;display:grid;place-items:center;background:#101114;color:#fff">Vidéo</div>'
               : '<img src="' + esc(mediaSrc(m.public_url)) + '" alt="" loading="lazy">') +
      '<div class="meta"><strong>' + esc(m.file_name) + '</strong><span>' + esc(m.folder) +
        (m.bytes ? ' · ' + Math.round(m.bytes / 1024) + ' Ko' : '') + (m.is_local ? ' · dépôt' : '') + '</span></div>' +
      '<div class="acts"><button class="btn btn-sm" type="button" data-copy="' + esc(m.public_url) + '">Copier l\'URL</button></div>' +
    '</div>';
  }).join('') || '<p class="empty">Aucun média.</p>';

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(b.dataset.copy);
      toast('URL copiée');
    });
  });
}
document.getElementById('media-search').addEventListener('input', loadMediaLibrary);
document.getElementById('media-folder').addEventListener('change', loadMediaLibrary);

/* ============================ JOURNAL / DIVERS ========================== */
async function loadJournal() {
  const { data } = await sb.from('activity_log').select('*')
    .order('created_at', { ascending: false }).limit(100);
  document.querySelector('#journal-table tbody').innerHTML =
    '<tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Élément</th></tr>' +
    (data || []).map(function (l) {
      return '<tr><td>' + new Date(l.created_at).toLocaleString('fr-FR') + '</td><td>' +
        esc(l.actor_email) + '</td><td>' + esc(l.action) + '</td><td>' + esc(l.entity) + '</td></tr>';
    }).join('');
}

async function loadDashboard() {
  const { count: sections } = await sb.from('page_sections').select('*', { count: 'exact', head: true });
  const { count: drafts } = await sb.from('section_drafts').select('*', { count: 'exact', head: true });
  const { count: medias } = await sb.from('media_library').select('*', { count: 'exact', head: true });
  const { data: last } = await sb.from('activity_log').select('*')
    .order('created_at', { ascending: false }).limit(6);

  document.getElementById('dashboard-body').innerHTML =
    '<div class="notice">Les indicateurs commerciaux (chiffre d\'affaires, commandes, clients) ' +
    'apparaîtront ici dès que le module Commandes sera connecté. Aucune donnée fictive n\'est affichée.</div>' +
    '<div class="kpi-grid" style="margin-top:18px">' +
      '<div class="kpi"><span>Sections éditoriales</span><strong>' + (sections || 0) + '</strong></div>' +
      '<div class="kpi"><span>Brouillons en attente</span><strong>' + (drafts || 0) + '</strong></div>' +
      '<div class="kpi"><span>Médias</span><strong>' + (medias || 0) + '</strong></div>' +
    '</div>' +
    '<h2 style="font-family:var(--display);text-transform:uppercase;margin:24px 0 12px">Dernières actions</h2>' +
    '<table class="table"><tbody>' + (last || []).map(function (l) {
      return '<tr><td>' + new Date(l.created_at).toLocaleString('fr-FR') + '</td><td>' +
        esc(l.actor_email) + '</td><td>' + esc(l.action) + '</td></tr>';
    }).join('') + '</tbody></table>';
}

async function loadAdmins() {
  const { data, error } = await sb.from('admin_profiles').select('*').order('created_at');
  const body = document.getElementById('admins-body');
  if (error) { body.innerHTML = '<p class="empty">Réservé au super administrateur.</p>'; return; }
  body.innerHTML = '<table class="table"><tbody><tr><th>Email</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th></tr>' +
    (data || []).map(function (a) {
      return '<tr><td>' + esc(a.email) + '</td><td>' + esc(a.role) + '</td><td>' +
        (a.active ? 'Actif' : 'Inactif') + '</td><td>' +
        (a.last_seen_at ? new Date(a.last_seen_at).toLocaleString('fr-FR') : '—') + '</td></tr>';
    }).join('') + '</tbody></table>' +
    '<p class="hint">Pour inviter un administrateur : créez le compte depuis Supabase → Authentication → Invite, ' +
    'puis activez-le et attribuez son rôle ici (module d\'invitation intégré prévu en phase suivante).</p>';
}

/* --------------------------------- Boot --------------------------------- */
sb.auth.onAuthStateChange(function (event) {
  if (event === 'SIGNED_OUT') showLogin();
});
boot();
