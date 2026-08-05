# NOVRA — Site officiel

Site statique HTML5 / CSS3 / JavaScript vanilla. Aucun framework, aucun build, aucun CMS.
Lire aussi `Damcompany-code-guardrails.md` avant toute intervention.

## Structure

```
index.html  marketplace.html  product.html  cart.html  checkout.html
about.html  contact.html  mentions-legales.html  politique-confidentialite.html  cgv.html
css/   style.css (design system) · responsive.css · animations.css
js/    products.js (catalogue) · main.js (noyau) · cart.js · marketplace.js · product.js · checkout.js · contact.js · home.js
assets/       médias originaux fournis par le client — NE PAS modifier, renommer ou supprimer
assets/web/   versions optimisées pour le web (générées) — utilisées par le site
```

## Règles projet

- **Catalogue** : toute donnée produit (nom, prix, images, couleurs, tailles, textes) vit dans `js/products.js`. Ne jamais écrire un prix ou un nom de produit en dur dans un HTML.
- **Header et footer** : générés par `renderHeader()` / `renderFooter()` dans `js/main.js`. Une seule source, ne pas dupliquer dans les pages.
- **Cartes produits** : `productCardMarkup()` dans `js/main.js`. Utilisée par l'accueil, la marketplace, la fiche produit et le panier.
- **Panier** : objet `Cart` dans `js/cart.js`, persistance `localStorage` (clé `novra_cart_v1`).
- **Paiement** : simulation front-end. Point d'intégration unique = `processPayment()` dans `js/checkout.js`.
- **Direction artistique** : noir `#0a0a0a`, blanc, gris. Aucune couleur d'interface. Les couleurs vives ne viennent que des photos produits.
- **Typographie** : Barlow Condensed (titres, majuscules) + Inter (textes).

## Assets

- Les originaux (~2,3 Go) restent intacts dans `assets/`.
- `assets/web/` contient les dérivés utilisés en production : photos 1400 px qualité 80, vidéo hero MP4 H.264 720p + poster, logos et favicon.
- Pour régénérer une image : redimensionner à 1400 px max, `-auto-orient`, qualité 80, JPEG progressif.

## Points à compléter avant mise en ligne

- Prix réels (actuellement provisoires, 25 à 130 €) — `js/products.js`.
- Mentions légales : éditeur, RCS, TVA, hébergeur, directeur de publication.
- Domaine réel dans les balises `canonical` et Open Graph (actuellement `https://www.novra.fr/`).
- Branchement d'une solution de paiement et d'un backend pour les formulaires contact / newsletter.

## Vérifications attendues après chaque intervention

- Aucune erreur console.
- Pas de débordement horizontal à 320, 375, 768, 1024 et 1440 px.
- Panier persistant après rechargement.
- Tous les liens et boutons visibles ont un comportement réel.
