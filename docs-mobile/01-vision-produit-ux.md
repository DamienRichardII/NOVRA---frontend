# 01 — Vision produit et expérience

## Positionnement

NOVRA vend des équipements sportifs techniques (« Run must go on », « Conçu pour la performance »). L'app doit donner la même impression que l'app Nike : **le produit et la photo d'abord**, peu de texte, gestes rapides, aucune couleur d'interface — les couleurs vives viennent uniquement des photos produits ✅ (règle de direction artistique du site).

Promesses de marque déjà affichées sur le site, à reprendre telles quelles dans l'app :
- 100 % matières techniques · Livraison 24-48 h · Retours gratuits 30 jours · « Vision : vous dépasser ».
- Mots-clés de la bande défilante : Respirant, Ultra léger, Séchage rapide, Résistant, Exigence, Innovation, Authenticité, Communauté.

## Principes d'expérience (patterns « Nike »)

1. **Plein écran immersif** : l'accueil s'ouvre sur le film de marque en boucle (muet, `playsinline`), sans bouton superposé ✅ (le site a retiré les CTA du hero à la demande du chef de projet).
2. **Barre d'onglets en bas** : Accueil · Shop · Favoris · Panier · Compte/Commandes.
3. **Fiche produit en galerie swipe** avec barre « Ajouter au panier » collée en bas 🛠.
4. **Sélecteur de taille en grille** : tailles indisponibles barrées, pas cachées 🛠.
5. **Retour haptique** sur ajout au panier, changement de taille, validation 🛠.
6. **Squelettes de chargement** (jamais d'écran blanc) et **tirer pour rafraîchir** 🛠.
7. **Favoris** (liste d'envies locale, sans compte) 🛠.
8. **Notifications push** sur chaque étape de commande 🛠 (voir 08).
9. **Mode sombre natif** : la marque est noir/blanc ; thème sombre par défaut, clair disponible.

## Navigation

```
Onglets
├─ Accueil          (contenus pilotés par le CMS — fichier 09)
├─ Shop             (liste + recherche + filtres en panneau du bas)
│   └─ Fiche produit
├─ Favoris          (local)
├─ Panier           (panneau plein écran) → Tunnel → Paiement (navigateur intégré) → Confirmation
└─ Commandes        (suivi par numéro + e-mail, ou historique local des commandes passées)
    └─ Détail commande (frise d'avancement)

Écrans secondaires : À propos/Mission, Contact + FAQ, Newsletter, Mentions légales, CGV, Confidentialité
Mode gestionnaire (connexion e-mail + mot de passe) : voir 10-admin-mobile.md
```

## Inventaire des écrans : page du site → écran de l'app

| Page du site ✅ | Écran de l'app 🛠 | Notes |
|---|---|---|
| `index.html` | Accueil | Sections pilotées par la base (09). Grille « Nos essentiels » (6 catégories) incluse |
| `marketplace.html` | Shop | Filtres : catégorie, genre, taille, couleur, prix max, en stock, nouveautés. Tri : nouveautés, prix ↑/↓, nom A-Z |
| `product.html?id=<slug>` | Fiche produit | Galerie, couleur, taille, quantité, guide des tailles, détails techniques, composition, entretien, livraison/retours, « Vous aimerez aussi » |
| `cart.html` + tiroir panier | Panier | Quantité 1–20, suppression, code promo, seuil livraison offerte |
| `checkout.html` | Tunnel de commande | Coordonnées → mode de réception → adresse → paiement |
| `confirmation.html` | Confirmation | Frise, articles, totaux, bouton « Suivre » |
| `suivi.html` | Suivre ma commande | Numéro **et** e-mail exigés |
| `about.html` | À propos | Mission, ADN (Performance / Discipline / Style), Engagement |
| `contact.html` | Contact + FAQ | Ancres : livraison, tailles, faq |
| `newsletter.html` | Newsletter | ⚠ aucune adresse n'est enregistrée aujourd'hui (voir 12) |
| `cgv.html`, `mentions-legales.html`, `politique-confidentialite.html` | Écrans légaux | Contenu récupéré depuis le site ou embarqué |
| `admin/` | Mode gestionnaire | Fichier 10 |

## Ce qu'on ne porte volontairement pas

- **Les avis et notes affichés sur le site** (« 4.9 — 61 avis ») : ce sont des valeurs écrites en dur dans `js/products.js`, sans aucun avis réel. Les afficher serait une pratique commerciale trompeuse. ⚠ L'app n'affiche aucune note tant qu'un vrai système d'avis n'existe pas (voir 12).
- **Le compte client avec mot de passe** : le site fonctionne volontairement en invité (choix documenté dans `AUDIT-PARCOURS-CLIENT.md`). L'app suit la même règle au lancement.
