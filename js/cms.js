/* =========================================================================
   NOVRA — Pont CMS côté site public
   Lit le contenu PUBLIÉ dans Supabase et l'applique aux sections existantes.

   Principe de sécurité d'affichage : le HTML livré reste la source de repli.
   Si Supabase est indisponible, lent ou vide, la page conserve exactement
   son contenu actuel — rien ne disparaît jamais.
   ========================================================================= */

const CMS_CACHE_KEY = 'novra_cms_v1';
/* 60 s : assez court pour qu'une publication soit visible presque tout de
   suite, assez long pour éviter une requête à chaque page consultée. */
const CMS_CACHE_TTL = 60 * 1000;

function cmsPageKey() {
  const map = { home: 'home', shop: 'shop', about: 'mission', contact: 'contact' };
  return map[document.body.dataset.page] || null;
}

/* ------------------------------ Chargement ------------------------------ */
function cmsFetch(pageKey) {
  const query = 'pages?page_key=eq.' + pageKey +
    '&select=page_key,page_sections(section_key,section_type,status,sort_order,' +
    'eyebrow,title,subtitle,description,caption,cta1_label,cta1_url,cta1_blank,' +
    'cta2_label,cta2_url,cta2_blank,text_position,text_align,' +
    'section_media(media_type,desktop_url,mobile_url,poster_desktop_url,poster_mobile_url,' +
    'alt_text,caption,focal_x_desktop,focal_y_desktop,focal_x_mobile,focal_y_mobile,' +
    'sort_order,active,duration_ms,transition_ms))';
  return novraRest(query).then(function (rows) {
    return rows && rows[0] ? rows[0] : null;
  });
}

function cmsReadCache(pageKey) {
  try {
    const raw = sessionStorage.getItem(CMS_CACHE_KEY + ':' + pageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.at > CMS_CACHE_TTL) return null;
    return parsed.data;
  } catch (e) { return null; }
}

function cmsWriteCache(pageKey, data) {
  try {
    sessionStorage.setItem(CMS_CACHE_KEY + ':' + pageKey,
      JSON.stringify({ at: Date.now(), data: data }));
  } catch (e) { /* stockage indisponible : sans conséquence */ }
}

/* ------------------------------ Application ----------------------------- */
function cmsIsMobile() { return window.matchMedia('(max-width: 768px)').matches; }

function cmsFocal(media) {
  return cmsIsMobile()
    ? media.focal_x_mobile + '% ' + media.focal_y_mobile + '%'
    : media.focal_x_desktop + '% ' + media.focal_y_desktop + '%';
}

function cmsMediaUrl(media) {
  return (cmsIsMobile() && media.mobile_url) ? media.mobile_url : media.desktop_url;
}

function cmsSetText(root, selector, value) {
  if (value === null || value === undefined || value === '') return;
  const el = root.querySelector(selector);
  if (!el) return;
  /* Un titre qui contient une image (le logo du hero) ne doit jamais être
     remplacé par du texte : cela ferait disparaître le logo NOVRA. */
  if (el.querySelector('img, svg, video')) return;
  el.textContent = value;
}

/* Les boutons pilotés depuis l'admin sont ceux du bloc d'actions de la section,
   jamais les liens internes des cartes (collections, produits…). */
function cmsCtaLinks(root) {
  const zone = root.querySelector('.hero-actions, .campaign-body, .split-text') || root;
  return zone.querySelectorAll(':scope > .btn, :scope > a.btn, :scope > .link-underline, :scope > div > .btn');
}

function cmsSetCta(root, index, label, url, blank) {
  const el = cmsCtaLinks(root)[index];
  if (!el) return;
  if (label) el.textContent = label;
  if (url) el.setAttribute('href', url);
  if (blank) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
}

function cmsApplySection(section) {
  const root = document.querySelector('[data-home="' + section.section_key + '"]')
            || (section.section_key === 'hero' ? document.querySelector('.page-hero, .hero') : null)
            || document.querySelector('[data-cms="' + section.section_key + '"]');
  if (!root) return;

  /* Section désactivée dans l'admin : elle disparaît du site public */
  if (section.status !== 'published') { root.hidden = true; return; }
  root.hidden = false;

  cmsSetText(root, '.eyebrow', section.eyebrow);
  cmsSetText(root, 'h1, h2', section.title);
  cmsSetText(root, '.lead, .page-hero p, .campaign-body p', section.description);

  if (section.cta1_label || section.cta1_url) {
    cmsSetCta(root, 0, section.cta1_label, section.cta1_url, section.cta1_blank);
  }
  if (section.cta2_label || section.cta2_url) {
    cmsSetCta(root, 1, section.cta2_label, section.cta2_url, section.cta2_blank);
  }

  const media = (section.section_media || [])
    .filter(function (m) { return m.active; })
    .sort(function (a, b) { return a.sort_order - b.sort_order; });
  if (!media.length) return;

  /* Vidéo */
  const video = root.querySelector('video');
  if (video && media[0].media_type === 'video') {
    const source = video.querySelector('source');
    const url = cmsMediaUrl(media[0]);
    const poster = cmsIsMobile() && media[0].poster_mobile_url
      ? media[0].poster_mobile_url : media[0].poster_desktop_url;
    if (poster) video.setAttribute('poster', poster);

    if (source && url && source.getAttribute('src') !== url) {
      source.setAttribute('src', url);
      video.load();
      /* load() désarme la lecture automatique sur iOS : on relance
         explicitement dès que la nouvelle source est prête. */
      video.addEventListener('loadeddata', function again() {
        video.removeEventListener('loadeddata', again);
        if (typeof initHeroVideo === 'function') initHeroVideo();
        const p = video.play();
        if (p && p.catch) p.catch(function () {});
      });
    }
    return;
  }

  /* Diaporama */
  const slideshow = root.querySelector('.page-hero__slideshow');
  if (slideshow && media.length > 1) {
    slideshow.innerHTML = media.map(function (m, i) {
      return '<img class="page-hero__slide' + (i === 0 ? ' is-active' : '') +
             '" src="' + cmsMediaUrl(m) + '" alt="" style="object-position:' + cmsFocal(m) + '">';
    }).join('');
    if (media[0].duration_ms) window.SLIDE_DURATION_OVERRIDE = media[0].duration_ms;
    slideshow.style.setProperty('--slide-transition', (media[0].transition_ms || 1300) + 'ms');
    if (typeof resetHeroSlideshow === 'function') resetHeroSlideshow();
    else if (typeof initHeroSlideshow === 'function') { slideshow.removeAttribute('data-running'); initHeroSlideshow(); }
    return;
  }

  /* Image simple ou collection de visuels */
  const images = root.querySelectorAll('.page-hero__image, .split-media img, .collection-card img, .campaign-media img');
  media.forEach(function (m, i) {
    const img = images[i];
    if (!img) return;
    const url = cmsMediaUrl(m);
    if (url) img.setAttribute('src', url);
    if (m.alt_text !== null && m.alt_text !== undefined) img.setAttribute('alt', m.alt_text);
    img.style.objectPosition = cmsFocal(m);
  });
}

function cmsApply(page) {
  if (!page || !page.page_sections) return;
  page.page_sections
    .sort(function (a, b) { return a.sort_order - b.sort_order; })
    .forEach(cmsApplySection);
  document.dispatchEvent(new CustomEvent('cms:applied', { detail: page }));
}

/* --------------------------------- Init --------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  const pageKey = cmsPageKey();
  if (!pageKey || typeof novraRest !== 'function') return;

  /* Le cache évite un aller-retour réseau à chaque navigation interne */
  const cached = cmsReadCache(pageKey);
  if (cached) cmsApply(cached);

  cmsFetch(pageKey).then(function (page) {
    if (!page) return;
    cmsWriteCache(pageKey, page);
    cmsApply(page);
  }).catch(function () {
    /* Supabase injoignable : le contenu livré dans le HTML reste affiché. */
  });
});
