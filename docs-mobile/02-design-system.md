# 02 — Design system

Source ✅ : variables en tête de `css/style.css`. **Règle de la marque : noir `#0a0a0a`, blanc, gris. Aucune couleur d'interface.** Les couleurs vives n'existent que dans les photos produits et les pastilles de couleur.

## Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `black` | `#0a0a0a` | Fond sombre, texte sur clair |
| `blackSoft` | `#121212` | Surfaces élevées en thème sombre |
| `white` | `#ffffff` | Fond clair, texte sur sombre |
| `grey50` → `grey700` | `#f6f6f6` `#eeeeee` `#e2e2e2` `#c9c9c9` `#9a9a9a` `#6f6f6f` `#4a4a4a` `#2c2c2c` | Fonds de section, séparateurs, textes secondaires |
| `line` | `#e2e2e2` | Séparateurs (clair) |
| `lineDark` | `rgba(255,255,255,.14)` | Séparateurs (sombre) |
| `white70 / white45 / white15 / white08` | blanc à 70/45/15/8 % | Textes et voiles sur fond sombre |
| `black90 / black70 / black40` | noir à 90/70/40 % | Voiles sur photos |

États (succès/erreur) : rester dans le gris/noir/blanc, signalés par icône et texte, pas par une couleur vive. Seule exception tolérée : un rouge d'erreur discret pour les messages de formulaire.

## Typographie

- **Titres** : *Barlow Condensed* 700, **MAJUSCULES**, interligne `.95`, interlettrage `-0.01em` ✅.
- **Texte** : *Inter* 400/500/600/700, 16 px, interligne 1,6 ✅.
- Polices à charger avec `expo-font` / `@expo-google-fonts/barlow-condensed` et `@expo-google-fonts/inter`.

Échelle proposée 🛠 (mobile) :

| Style | Taille / interligne | Police |
|---|---|---|
| display | 56 / 52 | Barlow Condensed 700 |
| h1 | 40 / 38 | Barlow Condensed 700 |
| h2 | 28 / 27 | Barlow Condensed 700 |
| h3 | 20 / 20 | Barlow Condensed 700 |
| body | 16 / 25 | Inter 400 |
| small | 13 / 19 | Inter 400 |
| eyebrow | 11 / 14, capitales, +0,12 em | Inter 600 |

## Espacements, formes, mouvement

- Grille d'espacement 4 px ; marge d'écran 20 px (le site utilise 40 px de gouttière sur desktop, réduite sur mobile).
- Angles quasi droits : badges 3 px ; boutons « pastille » ronds (999) uniquement pour l'ajout rapide ✅.
- Courbes ✅ : `ease = cubic-bezier(.22,.61,.36,1)` ; `easeOut = cubic-bezier(.16,1,.3,1)`. En Reanimated : `Easing.bezier(...)`.
- Durées : 200 ms micro-interactions, 350 ms apparitions de cartes (le site utilise .35 s), 600–800 ms transitions de page.
- Apparition au défilement : fondu + léger glissement ; titres en « masque » (révélation de gauche à droite) ✅ (`data-reveal="mask"`). ⚠ Sur le site, l'animation a dû recevoir un filet de sécurité (affichage forcé après 1,8 s). **Dans l'app, ne jamais conditionner la visibilité d'un texte à une animation** : l'état final est le rendu par défaut.

## Composants à créer

| Composant | Règles tirées du site |
|---|---|
| `ProductCard` | Image 3:4, nom, catégorie, prix `45,99 €`, pastilles de couleur. Badge « Nouveauté » **discret** : petite étiquette en coin haut-gauche, fond noir 78 %, 9 px capitales, rayon 3 px, jamais pleine largeur ✅. Ajout rapide : pastille ronde blanche en bas à droite, toujours visible sur mobile ✅ |
| `Button` | Variantes `solid` (noir), `outline`, `light` (sur fond sombre) ; capitales, interlettrage large ; pleine largeur dans les formulaires |
| `Chip` | Filtres taille/catégorie : actif = fond noir texte blanc |
| `ColorDot` | Pastille ronde selon `COLOR_SWATCHES` (voir 05) ; actif = anneau |
| `SizeGrid` | Grille 4 colonnes ; indisponible = barré + désactivé |
| `RadioCard` | Choix du mode de réception : titre, sous-titre, prix à droite ✅ |
| `Timeline` | Frise de commande verticale, étapes faites/active (voir 08) ✅ |
| `Marquee` | Bande défilante infinie des 8 mots-clés |
| `Skeleton` | Remplace les images pendant le chargement |
| `BottomSheet` | Filtres, guide des tailles, sélection de taille rapide |

## Photographie

- Images 3:4 portrait pour les cartes, plein écran pour hero et galerie.
- **Point focal** ✅ : chaque média a un point focal desktop et mobile (0–100 %). L'app utilise les champs `*_mobile` pour le cadrage (`contentPosition` d'`expo-image`). Repli : 50 / 50.
- Pièges de cadrage appris sur le site ⚠ : un cadre très large et peu haut appliqué à une photo portrait ne garde qu'une bande horizontale ; viser des cadres proches du ratio source.

## Thème React Native prêt à coller

```ts
export const colors = {
  black: '#0a0a0a', blackSoft: '#121212', white: '#ffffff',
  grey: { 50:'#f6f6f6',100:'#eeeeee',200:'#e2e2e2',300:'#c9c9c9',400:'#9a9a9a',500:'#6f6f6f',600:'#4a4a4a',700:'#2c2c2c' },
  line: '#e2e2e2', lineDark: 'rgba(255,255,255,0.14)',
  white70: 'rgba(255,255,255,0.7)', white45: 'rgba(255,255,255,0.45)', white15: 'rgba(255,255,255,0.15)',
  black70: 'rgba(10,10,10,0.7)', black40: 'rgba(10,10,10,0.4)',
};
export const fonts = { display: 'BarlowCondensed_700Bold', body: 'Inter_400Regular', bodyMedium: 'Inter_500Medium', bodySemi: 'Inter_600SemiBold' };
export const motion = { ease: [0.22, 0.61, 0.36, 1] as const, easeOut: [0.16, 1, 0.3, 1] as const, fast: 200, base: 350, slow: 700 };
export const formatPrice = (n: number) => n.toFixed(2).replace('.', ',') + ' €';   // identique au site
```

## Accessibilité

- Contraste AA minimum ; zones tactiles ≥ 44 px ; libellés d'accessibilité en français sur toutes les icônes (le site fournit déjà des `aria-label` : « Ouvrir le panier », « Rechercher un produit », « Suivre ma commande »).
- Respecter « réduire les animations » : désactiver parallaxe et défilement automatique.
