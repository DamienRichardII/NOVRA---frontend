/* =========================================================================
   NOVRA — Marketplace : filtres, tri, recherche
   ========================================================================= */

const state = {
  category: 'all',
  gender: 'all',
  sizes: [],
  colors: [],
  maxPrice: 130,
  inStock: false,
  onlyNew: false,
  query: '',
  sort: 'new'
};

const GENDERS = [
  { key: 'all', label: 'Tous' },
  { key: 'homme', label: 'Homme' },
  { key: 'femme', label: 'Femme' },
  { key: 'unisexe', label: 'Unisexe' }
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'TU'];

function allColors() {
  const set = [];
  products.forEach(function (p) {
    p.colors.forEach(function (c) { if (set.indexOf(c) === -1) set.push(c); });
  });
  return set;
}

/* ------------------------------ Filtrage --------------------------------- */
function matchesGender(p) {
  if (state.gender === 'all') return true;
  if (state.gender === 'unisexe') return p.gender === 'unisexe';
  return p.gender === state.gender || p.gender === 'unisexe';
}

function matchesQuery(p) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  return (p.name + ' ' + p.categoryLabel + ' ' + p.description + ' ' + p.colors.join(' ')).toLowerCase().indexOf(q) !== -1;
}

function filteredProducts() {
  const list = products.filter(function (p) {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (!matchesGender(p)) return false;
    if (state.sizes.length && !state.sizes.some(function (s) { return p.sizes.indexOf(s) !== -1; })) return false;
    if (state.colors.length && !state.colors.some(function (c) { return p.colors.indexOf(c) !== -1; })) return false;
    if (p.price > state.maxPrice) return false;
    if (state.inStock && !p.stock) return false;
    if (state.onlyNew && !p.newProduct) return false;
    if (!matchesQuery(p)) return false;
    return true;
  });

  return list.sort(function (a, b) {
    if (state.sort === 'price-asc') return a.price - b.price;
    if (state.sort === 'price-desc') return b.price - a.price;
    if (state.sort === 'name') return a.name.localeCompare(b.name, 'fr');
    return (b.newProduct ? 1 : 0) - (a.newProduct ? 1 : 0);
  });
}

/* -------------------------------- Rendu ---------------------------------- */
function renderGrid() {
  const grid = document.getElementById('shop-grid');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('result-count');
  const list = filteredProducts();

  grid.innerHTML = list.map(function (p, i) { return productCardMarkup(p, { index: i }); }).join('');
  empty.hidden = list.length > 0;
  count.textContent = list.length + (list.length > 1 ? ' produits' : ' produit');
  initReveal();
}

function renderFilters() {
  document.getElementById('filter-categories').innerHTML = CATEGORIES.map(function (c) {
    return '<button type="button" data-category="' + c.key + '"' +
      (state.category === c.key ? ' class="is-active"' : '') + '>' + c.label + '</button>';
  }).join('');

  document.getElementById('filter-genders').innerHTML = GENDERS.map(function (g) {
    return '<button type="button" data-gender="' + g.key + '"' +
      (state.gender === g.key ? ' class="is-active"' : '') + '>' + g.label + '</button>';
  }).join('');

  document.getElementById('filter-sizes').innerHTML = ALL_SIZES.map(function (s) {
    return '<button type="button" class="chip' + (state.sizes.indexOf(s) !== -1 ? ' is-active' : '') +
      '" data-size="' + s + '">' + s + '</button>';
  }).join('');

  document.getElementById('filter-colors').innerHTML = allColors().map(function (c) {
    return '<button type="button" class="color-dot' + (state.colors.indexOf(c) !== -1 ? ' is-active' : '') +
      '" data-color="' + c + '" style="background:' + colorSwatch(c) + '" aria-label="Couleur ' + c + '" title="' + c + '"></button>';
  }).join('');
}

function resetFilters() {
  state.category = 'all';
  state.gender = 'all';
  state.sizes = [];
  state.colors = [];
  state.maxPrice = 130;
  state.inStock = false;
  state.onlyNew = false;
  state.query = '';

  document.getElementById('filter-price').value = 130;
  document.getElementById('price-max-label').textContent = '130 €';
  document.getElementById('filter-stock').checked = false;
  document.getElementById('filter-new').checked = false;

  renderFilters();
  renderGrid();
}

/* ------------------------------- Init ------------------------------------ */
/* Un prix ou une photo corrigés dans l'admin se répercutent aussitôt. */
if (typeof onCatalogueUpdate === 'function') onCatalogueUpdate(function () {
  if (document.getElementById('shop-grid')) renderGrid();
});

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) state.category = params.get('category');
  if (params.get('gender')) state.gender = params.get('gender');
  if (params.get('q')) state.query = params.get('q');
  if (params.get('new')) state.onlyNew = true;

  renderFilters();

  if (state.onlyNew) document.getElementById('filter-new').checked = true;
  if (state.query) {
    const title = document.querySelector('.page-hero h1');
    if (title) title.textContent = 'Recherche : ' + state.query;
  }

  renderGrid();

  /* Filtres — délégation */
  const panel = document.getElementById('filters');
  panel.addEventListener('click', function (e) {
    const cat = e.target.closest('[data-category]');
    if (cat) { state.category = cat.dataset.category; renderFilters(); renderGrid(); return; }

    const gen = e.target.closest('[data-gender]');
    if (gen) { state.gender = gen.dataset.gender; renderFilters(); renderGrid(); return; }

    const size = e.target.closest('[data-size]');
    if (size) {
      const v = size.dataset.size;
      const i = state.sizes.indexOf(v);
      if (i === -1) state.sizes.push(v); else state.sizes.splice(i, 1);
      renderFilters(); renderGrid(); return;
    }

    const color = e.target.closest('[data-color]');
    if (color) {
      const v = color.dataset.color;
      const i = state.colors.indexOf(v);
      if (i === -1) state.colors.push(v); else state.colors.splice(i, 1);
      renderFilters(); renderGrid(); return;
    }
  });

  document.getElementById('filter-price').addEventListener('input', function (e) {
    state.maxPrice = parseInt(e.target.value, 10);
    document.getElementById('price-max-label').textContent = state.maxPrice + ' €';
    renderGrid();
  });

  document.getElementById('filter-stock').addEventListener('change', function (e) {
    state.inStock = e.target.checked; renderGrid();
  });

  document.getElementById('filter-new').addEventListener('change', function (e) {
    state.onlyNew = e.target.checked; renderGrid();
  });

  document.getElementById('sort-select').addEventListener('change', function (e) {
    state.sort = e.target.value; renderGrid();
  });

  document.getElementById('reset-filters').addEventListener('click', resetFilters);
  document.getElementById('reset-filters-empty').addEventListener('click', resetFilters);

  /* Panneau filtres mobile */
  const toggle = document.querySelector('[data-filters-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      const open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open) Overlay.lock(); else Overlay.unlock();
    });
  }
  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-filters-close]')) {
      panel.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      Overlay.unlock();
    }
  });

  /* Recherche instantanée depuis le panneau global */
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    if (state.query) searchInput.value = state.query;
    searchInput.addEventListener('input', function (e) {
      state.query = e.target.value.trim();
      renderGrid();
    });
    const form = searchInput.closest('form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); Overlay.closeAll(); });
  }
});
