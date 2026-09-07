/* =========================================================================
   NOVRA — Pont catalogue

   Les prix et les photos affichés doivent être exactement ceux qui sont
   facturés. Ils vivent donc en base, et c'est elle qui fait foi.
   `js/products.js` reste le filet de secours : structure du catalogue,
   couleurs, tailles, textes, et valeurs de repli si le réseau tombe.

   Deux temps, pour ne jamais faire clignoter un prix :
     1. au chargement, le cache de session est appliqué immédiatement,
        avant tout rendu — invisible pour le visiteur ;
     2. en arrière-plan, la base est relue ; si un prix a changé, les pages
        concernées se redessinent.

   Si Supabase est injoignable, rien ne se passe : le site garde ses prix
   de repli et reste utilisable. Le paiement, lui, recalcule toujours
   depuis la base : un prix périmé à l'écran ne peut pas être encaissé.
   ========================================================================= */

const CATALOGUE_CACHE_KEY = 'novra_catalogue_v1';
const CATALOGUE_TTL = 60 * 1000;   // 60 s, comme le pont CMS

/* Chaque page enregistre ici de quoi se redessiner. */
const catalogueRenderers = [];

function onCatalogueUpdate(fn) {
  if (typeof fn === 'function') catalogueRenderers.push(fn);
}

function catalogueReadCache() {
  try {
    const raw = sessionStorage.getItem(CATALOGUE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.at > CATALOGUE_TTL) return { data: parsed.data, stale: true };
    return { data: parsed.data, stale: false };
  } catch (e) { return null; }
}

function catalogueWriteCache(rows) {
  try {
    sessionStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify({ at: Date.now(), data: rows }));
  } catch (e) { /* stockage indisponible */ }
}

/* Construit un produit entièrement à partir d'une ligne de la base, pour un
   slug qui n'existe pas dans js/products.js : c'est le cas d'un produit créé
   depuis l'admin, jamais ajouté au fichier statique. La forme de l'objet
   reproduit exactement celle utilisée dans js/products.js, pour que les
   mêmes fonctions (cartes produit, fiche produit, panier) le lisent sans
   distinction. */
function catalogueBuildProduct(row) {
  const cat = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).find(function (c) { return c.key === row.category; });
  const details = row.details || {};
  return {
    id: row.slug,
    name: row.name,
    slug: row.slug,
    category: row.category,
    categoryLabel: cat ? cat.label : row.category,
    gender: row.gender || 'unisexe',
    price: Number(row.price) || 0,
    description: row.description || '',
    images: row.images.slice(),
    colors: row.colors.slice(),
    sizes: row.sizes.slice(),
    featured: !!row.featured,
    newProduct: true,
    stock: true,
    rating: 0,
    reviews: 0,
    technicalDetails: Array.isArray(details.technicalDetails) ? details.technicalDetails : [],
    composition: details.composition || '',
    care: details.care || '',
    available: row.status === 'active'
  };
}

/* Applique les valeurs de la base sur le catalogue en mémoire.
   Renvoie true si quelque chose a réellement changé à l'écran. */
function catalogueApply(rows) {
  if (!Array.isArray(rows) || typeof products === 'undefined') return false;
  let changed = false;

  rows.forEach(function (row) {
    const p = products.find(function (x) { return x.id === row.slug; });

    if (!p) {
      /* Un brouillon, ou une fiche sans photo/couleur/taille encore
         complète, ne doit jamais apparaître publiquement : on attend
         qu'elle soit prête plutôt que d'afficher une carte cassée. */
      if (row.status !== 'active') return;
      if (!Array.isArray(row.images) || !row.images.length) return;
      if (!Array.isArray(row.colors) || !row.colors.length) return;
      if (!Array.isArray(row.sizes) || !row.sizes.length) return;
      products.push(catalogueBuildProduct(row));
      changed = true;
      return;
    }

    const price = Number(row.price);
    if (Number.isFinite(price) && price > 0 && p.price !== price) {
      p.price = price;
      changed = true;
    }

    if (Array.isArray(row.images) && row.images.length) {
      if (p.images.length !== row.images.length ||
          p.images.some(function (src, i) { return src !== row.images[i]; })) {
        p.images = row.images.slice();
        changed = true;
      }
    }

    /* Un produit retiré de la vente disparaît du site sans redéploiement. */
    const sold = row.status === 'active';
    if (p.available !== sold) { p.available = sold; changed = true; }
  });

  /* Les produits absents de la base ne sont pas supprimés : mieux vaut
     afficher un article de trop qu'une boutique vide sur une erreur. */
  return changed;
}

function catalogueRefresh() {
  return novraRest('products?select=slug,name,category,gender,price,images,colors,sizes,details,featured,status&order=sort_order')
    .then(function (rows) {
      catalogueWriteCache(rows);
      if (catalogueApply(rows)) {
        catalogueRenderers.forEach(function (fn) {
          try { fn(); } catch (e) { /* un rendu raté ne casse pas les autres */ }
        });
        document.dispatchEvent(new CustomEvent('catalogue:updated'));
      }
      return rows;
    })
    .catch(function () { return null; });
}

/* Le cache est appliqué tout de suite, avant que les pages ne dessinent :
   sur toute visite après la première, le bon prix est affiché d'emblée. */
(function () {
  const cached = catalogueReadCache();
  if (cached) catalogueApply(cached.data);
})();

document.addEventListener('DOMContentLoaded', function () {
  const cached = catalogueReadCache();
  /* Rien en cache, ou cache périmé : on relit la base sans bloquer l'affichage. */
  if (!cached || cached.stale) catalogueRefresh();
});
