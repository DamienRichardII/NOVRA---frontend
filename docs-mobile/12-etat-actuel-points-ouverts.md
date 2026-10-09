# 12 — État actuel et points ouverts

Photographie au 9 octobre 2026. Site en ligne sur `https://novra.paris`, admin sur `https://novra.paris/admin/`.

## Ce qui fonctionne ✅

- Catalogue : 11 produits, 88 SKU ; prix/photos/statut lus en base, repli hors ligne.
- Paiement SumUp Hosted Checkout testé jusqu'à la page de paiement ; webhook vérifié côté serveur.
- Cycle de commande complet, frise de suivi, suivi sans compte (référence + e-mail).
- E-mails transactionnels Resend de bout en bout (domaine `novra.paris` vérifié).
- Reçu imprimable / PDF navigateur après achat.
- Admin : commandes, produits (prix, photos), stocks (écran refondu), promotions, CMS, rôles.
- Couleurs Bleu roi et Vert clair disponibles.

## Bloquants ou risques avant communication ⚠

| # | Sujet | Impact sur l'app |
|---|---|---|
| 1 | **Clés SumUp** à déposer dans les secrets Supabase (voir `SUMUP.md`) tant que non faites | Aucun paiement n'aboutit ; écrans Commandes/CRM/Analytics vides |
| 2 | **Stocks réels** : 88 variantes à 0 ; 9 produits sur 11 en `track_inventory=false` | Activer le suivi sans saisie bloquerait la vente |
| 3 | **Prix** provisoires (35–120 €) | À corriger depuis l'admin ; `products.js` à resynchroniser |
| 4 | **Mentions légales** : capital, SIRET/RCS/TVA (Kbis en cours) ; directeur de publication à confirmer | Bloque la publication sur les stores |
| 5 | **Faux avis** codés en dur | Ne pas les porter dans l'app |
| 6 | **Canonical / Open Graph** pointent encore vers `novra-frontend.vercel.app` | À corriger pour le partage et les liens universels |
| 7 | **Formulaires contact et newsletter** : rien n'est enregistré | Fonctions Edge à créer avant de les exposer |
| 8 | **Retrait en boutique** masqué tant que adresse+ville ne sont pas saisies | Renseigner Paramètres |
| 9 | **Point relais** : saisie libre, pas de sélecteur ; aucun transporteur branché | Expédition manuelle |
| 10 | **Pas de facture PDF** | Reçu imprimable uniquement |
| 11 | **Protection mots de passe compromis** non activée | Auth admin |
| 12 | **Commande de test** `NVR-260929-P703` en base | À supprimer |
| 13 | **Migration Supabase** vers un 2ᵉ compte envisagée (tâche en attente) | URL/clé configurables ; refaire le déploiement des fonctions Edge, secrets, `pg_net`/`pg_cron`, tâche `flush-email-outbox` et domaine de redirection |
| 14 | Le **filtre par mode de réception** n'existe pas dans l'admin Commandes | Prévu côté app admin |

## Éléments à préparer pour les stores 🛠

Compte Apple Developer et Google Play, identifiants d'app (`paris.novra.app` proposé), icône 1024 px, captures d'écran, textes de fiche, politique de confidentialité à jour, adresse d'assistance (`Novraurban@gmail.com` actuellement).

## Décisions à prendre par le client

1. Activer ou non le suivi des stocks (et quand les stocks réels seront saisis).
2. Intégrer ou non un sélecteur de point relais (Mondial Relay / Boxtal) et une API transporteur.
3. Comptes clients (historique, favoris synchronisés) en V2 ?
4. Notifications marketing : oui/non, avec quel consentement.
5. Pays desservis et tarifs hors France.
