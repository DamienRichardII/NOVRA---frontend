# 05 — Catalogue et fiches produit

## Sources de vérité ✅

1. **Base Supabase** (via `js/catalogue.js` sur le web) : **prix, photos, statut**. C'est ce qui est facturé.
2. **`js/products.js`** : structure (couleurs, tailles, textes, matières, guide de coupe) et **repli hors ligne**.

Règles : ne jamais écrire un prix ou un nom en dur dans l'app ; la fusion se fait par `slug`. Pour l'app, **exporter `products.js` en JSON embarqué** (`src/data/catalogue-fallback.json`) à chaque build.

## Modèle côté app

```ts
type Variant = { id: string; color: string; size: string; stock: number };
type Product = {
  id: string; slug: string; name: string; category: string;
  price: number;                 // euros, affichage
  status: 'active' | 'draft' | 'archived';
  images: string[];              // chemins ou URLs ; la 1ʳᵉ = vignette partout
  trackInventory: boolean;
  variants: Variant[];
  colors: string[]; sizes: string[];
  isNew?: boolean;
};
```

## Images ⚠

Les chemins peuvent être **relatifs** (`assets/web/...`) : les résoudre contre `EXPO_PUBLIC_MEDIA_BASE` (`https://novra.paris/`). Les URLs Supabase Storage restent absolues. Un helper `mediaUrl(path)` unique. Les photos sont en 1400 px max, JPEG qualité 80 : demander des vignettes via `expo-image` (`recyclingKey`, `placeholder` blurhash 🛠).

## Couleurs et tailles

Pastilles (`COLOR_SWATCHES` de `js/products.js` ✅) — extrait : `Bleu roi #1e4fc2`, `Vert clair #8fd694` (ajoutés récemment). Reprendre le tableau complet du fichier source et le tenir synchronisé avec `PRODUCT_COLOR_HEX` de l'admin.

Tailles reconnues : `XS S M L XL XXL 3XL 4XL 5XL` ✅ (liste de l'admin). Ordre d'affichage = cet ordre, jamais alphabétique.

## Disponibilité

| Cas | Affichage |
|---|---|
| `track_inventory = false` | Toujours vendable (la boutique vend sans compter) — **9 produits sur 11 sont dans ce cas aujourd'hui** ⚠ |
| `track_inventory = true` et `stock > 0` | Vendable ; « Plus que N » si N ≤ 3 🛠 |
| `track_inventory = true` et `stock = 0` | Taille barrée, non sélectionnable ; « Me prévenir » 🛠 (hors lancement) |

L'app **n'écrit jamais** les stocks : ils sont décrémentés par `apply_payment_result()` uniquement à la confirmation du paiement, avec une ligne `stock_movements` ✅.

## Écran Boutique (marketplace)

Reprendre `js/marketplace.js` ✅ : grille 2 colonnes, filtres (catégorie, couleur, taille, prix), tri (nouveautés, prix croissant/décroissant), compteur de résultats, état vide explicite. Filtres dans une `BottomSheet`. Persistance du filtre dans l'URL de la route (`?cat=`).

## Fiche produit

Reprendre `js/product.js` ✅ :

- Galerie plein écran à balayage + indicateurs ; pincer pour zoomer.
- Titre, prix, pastilles de couleur (la couleur choisie change la galerie si des photos y sont associées).
- `SizeGrid` + lien **Guide des tailles** (BottomSheet avec le tableau de `products.js`).
- CTA collant en bas : « Ajouter au panier » (désactivé tant que la taille n'est pas choisie ; message « Choisissez une taille »).
- Accordéons : Description, Matière & entretien, Livraison & retours.
- Carrousel « Vous aimerez aussi » : même logique que le web (même catégorie d'abord, puis complément) — `relatedProducts()` ✅.
- Partage natif (`Share.share`) avec lien `https://novra.paris/product.html?slug=…`.

## Avis ⚠

Les notes affichées sur le site sont **codées en dur et fictives** (point ouvert). **Ne pas les porter dans l'app.** Afficher des avis uniquement quand la table/écran Avis de l'admin contiendra de vrais avis modérés.

## Favoris 🛠

Local (zustand persisté) ; icône cœur sur carte et fiche ; onglet Favoris. Pas de compte client au lancement (voir 01).

## Recherche

Champ de recherche plein écran, filtrage local sur nom/catégorie (11 produits), historique récent. Reprendre le libellé d'accessibilité « Rechercher un produit ».
