# NOVRA Mobile — Dossier de spécifications

Ce dossier transforme tout ce qui a été construit sur le site NOVRA (novra.paris) en cahier des charges pour une **application mobile moderne, dans l'esprit de l'app Nike** : immersive, sombre/sobre, visuels plein écran, navigation par onglets, achat en quelques gestes.

**Public visé : un agent de développement IA (Claude Code).** Les fichiers sont écrits pour être donnés tels quels, dans l'ordre. Choix validés avec le propriétaire du projet :

| Décision | Valeur |
|---|---|
| Stack | React Native + Expo (TypeScript) |
| Périmètre au lancement | Boutique client **+ espace admin mobile** (commandes, stocks, produits) |
| Backend | Supabase existant, réutilisé tel quel (aucune réécriture) |
| Paiement | SumUp Hosted Checkout (carte, Apple Pay, Google Pay) |

## Légende utilisée partout

- ✅ **Existe sur le site** — comportement à reproduire à l'identique (source citée).
- 🛠 **À construire pour l'app** — n'existe pas encore, spécifié ici.
- ⚠ **Point ouvert / piège connu** — à lire avant de coder.

## Ordre de lecture

| # | Fichier | Contenu |
|---|---|---|
| 01 | `01-vision-produit-ux.md` | Positionnement, navigation, inventaire des écrans, patterns « Nike » |
| 02 | `02-design-system.md` | Couleurs, typographies, composants, mouvement, thème React Native prêt à coller |
| 03 | `03-architecture-technique.md` | Stack, structure du dépôt, état, cache, variables d'environnement |
| 04 | `04-backend-supabase-api.md` | Tables, règles d'accès (RLS), requêtes, contrats des fonctions serveur |
| 05 | `05-catalogue-produits.md` | Modèle produit, filtres, fiche produit, disponibilité, couleurs |
| 06 | `06-panier-checkout-paiement.md` | Panier, codes promo, tunnel, paiement SumUp dans l'app |
| 07 | `07-livraison-retrait-transporteurs.md` | Livraison, point relais, retrait boutique, transporteurs |
| 08 | `08-commandes-suivi-notifications.md` | Cycle de vie des commandes, suivi, e-mails, notifications push |
| 09 | `09-cms-contenus-accueil.md` | Accueil piloté depuis l'admin (sections, médias, points focaux) |
| 10 | `10-admin-mobile.md` | Espace gestionnaire : commandes, stocks, produits, rôles |
| 11 | `11-securite-conformite.md` | Sécurité, RGPD, mentions légales, règles App Store / Play Store |
| 12 | `12-etat-actuel-points-ouverts.md` | Ce qui est fait, ce qui bloque, dette connue du site |
| 13 | `13-roadmap-et-recette.md` | Jalons, critères d'acceptation, plan de test |
| 14 | `14-prompts-claude-code.md` | Fichier `CLAUDE.md` du futur dépôt + prompts de construction dans l'ordre |

## Sources de vérité (dépôt du site)

Le site est en HTML/CSS/JS pur, sans framework. Les fichiers à consulter si un détail manque :

- Catalogue et structure : `js/products.js`, `js/catalogue.js`
- Panier : `js/cart.js` — Tunnel : `js/checkout.js`, `checkout.html`
- Commande/suivi : `js/order-view.js`, `supabase/functions/*`
- Contenus pilotés : `js/cms.js` — Admin : `admin/admin.js`, `admin/admin-pages.js`
- Design : `css/style.css` (variables en tête de fichier)
- Règles projet : `CLAUDE.md`, `SUMUP.md`, `AUDIT-PARCOURS-CLIENT.md`

## Règle d'or

> **Le téléphone n'est jamais cru sur parole.** Prix, stocks, remises, frais de port et statut « payée » sont décidés côté serveur. L'app n'envoie que des références et des quantités, exactement comme le site.
