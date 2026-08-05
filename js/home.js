/* =========================================================================
   NOVRA — Page d'accueil : produits mis en avant
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const featured = getFeaturedProducts(8);
  grid.innerHTML = featured.map(function (p, i) {
    return productCardMarkup(p, { index: i });
  }).join('');

  initReveal();
});
