# 14 — Prompts pour Claude Code

Mode d'emploi : placer ce dossier dans le dépôt de l'app (`docs/`), créer un `CLAUDE.md` à la racine qui renvoie vers `docs/00-INDEX.md`, puis exécuter les prompts **dans l'ordre**, un par session, en validant chaque jalon (voir 13).

## CLAUDE.md à créer à la racine de l'app

```
# NOVRA — Application mobile
React Native + Expo (TypeScript strict, expo-router). Lire docs/00-INDEX.md avant toute intervention.
Règles : français partout dans l'UI ; noir/blanc/gris uniquement ; Barlow Condensed (titres, majuscules) + Inter ;
jamais de prix, stock ou statut de paiement décidé par le client ; aucune clé secrète ; aucune donnée inventée
(états vides explicites) ; URL/clé Supabase uniquement via variables EXPO_PUBLIC_* ; ne jamais porter les faux avis.
Après chaque intervention : pas d'erreur console, pas de débordement 320–430 pt, panier persistant, boutons fonctionnels.
```

## Prompt 0 — Socle (J0)

> Lis `docs/00-INDEX.md`, `02-design-system.md` et `03-architecture-technique.md`. Initialise un projet Expo TypeScript avec expo-router, charge Barlow Condensed et Inter, crée `src/theme`, le client Supabase configurable par variables d'environnement, `lib/money.ts`, `lib/media.ts` (résolution des chemins relatifs contre `EXPO_PUBLIC_MEDIA_BASE`) et la navigation par onglets (Accueil, Boutique, Favoris, Panier, Commandes). Ajoute ESLint/Prettier et un test pour `formatPrice`. Ne code aucun écran métier.

## Prompt 1 — Catalogue et vitrine (J1)

> Lis `05-catalogue-produits.md`, `09-cms-contenus-accueil.md` et `01-vision-produit-ux.md`. Implémente la lecture du catalogue (Supabase + repli JSON embarqué), `ProductCard`, l'écran Boutique avec filtres en BottomSheet, la fiche produit (galerie, pastilles, SizeGrid, guide des tailles, accordéons, produits liés) et l'accueil piloté par le CMS avec garde-fous (focal mobile, repli à 50 %). Ne reprends pas les avis. Ajoute les états vide/chargement/erreur/hors ligne.

## Prompt 2 — Panier et paiement (J2)

> Lis `06-panier-checkout-paiement.md`, `07-livraison-retrait-transporteurs.md` et `04-backend-supabase-api.md`. Implémente le panier persistant, le checkout en 4 étapes (relais et retrait inclus), l'appel à `create-order` avec clé d'idempotence, l'ouverture de `checkout_url` via expo-web-browser, puis la lecture de `order-status` pour confirmer. Ne vide le panier qu'une fois `paid` confirmé par le serveur. Écris les tests de fusion de panier et d'estimation de livraison.

## Prompt 3 — Backend (B1–B3, B6)

> Dans le dépôt du site (`Novra - site`), en respectant `CLAUDE.md` et `Damcompany-code-guardrails.md` : ajoute le champ facultatif `client: 'app'` à `create-order` (redirection via une page `app-retour.html` vers `novra://commande/…`), crée `register-push` et la table `push_tokens` avec RLS, étends l'envoi pour pousser via l'API Expo à chaque `order_events`, et expose en lecture publique restreinte les infos de la boutique de retrait. Ne modifie pas le chemin de preuve de paiement. Présente les migrations avant de les appliquer.

## Prompt 4 — Après-vente (J3)

> Lis `08-commandes-suivi-notifications.md`. Implémente l'écran Commande avec Timeline selon `fulfilment`, le suivi référence + e-mail, l'onglet Commandes alimenté par le stockage sécurisé de l'appareil, l'enregistrement du token push après le premier achat, les liens profonds et le reçu PDF (expo-print).

## Prompt 5 — Admin mobile (J4)

> Lis `10-admin-mobile.md`. Implémente la connexion admin (Supabase Auth, SecureStore, verrouillage), le garde par rôle, le dashboard avec états vides, les commandes (filtres statut + mode, étape suivante avec saisie transporteur/numéro/lien), les stocks (recherche, filtres, saisie rapide) et la modification de prix avec confirmation au-delà du double. Ne crée aucun bouton « Marquer payée ». Vérifie que le rôle `support` ne peut rien écrire.

## Prompt 6 — Finitions et stores (J5)

> Lis `11-securite-conformite.md` et `13-roadmap-et-recette.md`. Passe l'accessibilité, ajoute Sentry, configure EAS (profils dev/preview/production), l'icône, le splash, les permissions minimales, les liens universels, puis exécute la recette R1–R17 et rends un rapport écart par écart.

## Prompt de vérification transversale

> Relis tout le code de l'app contre `00-INDEX.md` (règle d'or : le téléphone n'est jamais cru sur parole). Cherche : prix ou montants écrits en dur, secrets, URL Supabase en dur, textes non français, couleurs hors charte, avis fictifs, boutons sans action. Liste chaque écart avec fichier et ligne, puis corrige.
