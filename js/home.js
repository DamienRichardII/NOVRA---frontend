/* =========================================================================
   NOVRA — Page d'accueil : produits mis en avant
   ========================================================================= */

function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  grid.innerHTML = getFeaturedProducts(8).map(function (p, i) {
    return productCardMarkup(p, { index: i });
  }).join('');
}

/* Un prix corrigé dans l'admin se répercute sans recharger la page. */
if (typeof onCatalogueUpdate === 'function') onCatalogueUpdate(renderFeatured);

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  renderFeatured();

  initReveal();
});
