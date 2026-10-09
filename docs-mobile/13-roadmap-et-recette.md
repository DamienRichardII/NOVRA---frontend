# 13 — Roadmap et recette

## Jalons proposés 🛠

| Jalon | Contenu | Critère de sortie |
|---|---|---|
| **J0 — Socle** | Projet Expo, thème, polices, navigation, config, client Supabase, catalogue + repli | Boutique navigable hors ligne avec le catalogue embarqué |
| **J1 — Vitrine** | Accueil CMS, boutique + filtres, fiche produit, recherche, favoris, pages Mission/légales | Parité visuelle avec le site mobile |
| **J2 — Achat** | Panier, checkout 4 étapes, `create-order`, SumUp, retour (B1), écran commande | Paiement de bout en bout en environnement de test SumUp |
| **J3 — Après-vente** | Suivi, onglet Commandes, push (B2/B3), reçu PDF | Notification reçue à chaque changement de statut |
| **J4 — Admin** | Connexion, dashboard, commandes, stocks, produits (prix) | Un manager traite une commande de A à Z depuis le téléphone |
| **J5 — Stores** | Accessibilité, perf, Sentry, fiches, TestFlight / test interne Play | Passage de la revue |

## Définition de terminé (pour chaque écran)

- Aucune erreur console / aucun avertissement React.
- Rendu correct de 320 à 430 pt de large, tablette tolérée ; pas de débordement horizontal.
- Panier persistant après redémarrage de l'app.
- Tous les boutons visibles ont un comportement réel.
- États vide / chargement / erreur / hors ligne gérés.
- Textes en français depuis `i18n/fr.ts`.

## Recette — scénarios obligatoires

| # | Scénario | Attendu |
|---|---|---|
| R1 | Catalogue chargé, réseau coupé | Catalogue de repli + bandeau, achat désactivé |
| R2 | Ajout panier sans taille | Bloqué, message clair |
| R3 | Livraison standard à 79,99 € / 80,00 € | 4,90 € puis offerte |
| R4 | Code promo valide / invalide | Remise appliquée / ignoré sans bloquer |
| R5 | Relais | Libellés « point relais » et complément masqué |
| R6 | Retrait | Option absente si boutique non configurée ; présente sinon, adresse masquée du formulaire |
| R7 | Paiement réussi | Retour dans l'app, panier vidé, statut payé confirmé par `order-status` |
| R8 | Paiement abandonné | Panier intact ; reprise avec la même clé |
| R9 | Double tap sur « Valider » | Une seule commande |
| R10 | Rupture de stock (produit suivi) | Message du serveur, ligne signalée |
| R11 | Suivi avec mauvais e-mail | Erreur 404 lisible ; référence seule refusée |
| R12 | Changement de statut dans l'admin | Frise mise à jour + push + e-mail |
| R13 | Admin `support` | Écrans limités, aucune écriture possible (RLS) |
| R14 | Tentative de forcer « payée » | Refusée (trigger) |
| R15 | Stock modifié depuis l'app admin | Mouvement dans `stock_movements`, visible sur l'admin web |
| R16 | Changement d'URL Supabase en config | L'app fonctionne sans autre modification |
| R17 | Lecteur d'écran, texte agrandi | Parcours achat utilisable |

## Tests automatisés

Unitaires : formatage des prix, fusion du panier, résolution d'URL média, calcul d'estimation. Composants : `SizeGrid`, `ProductCard`, `Timeline`. Parcours Maestro : R2, R7 (mode test), R11.
