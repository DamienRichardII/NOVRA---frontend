# NOVRA — Basculer le site sur le nouveau projet Supabase

Nouveau projet : `https://toaejbfhagtvowgpfbrd.supabase.co`
Clé publiable : `sb_publishable_hItnOh_AXBOBKvkR7i8zXQ_-rWTPh7G` (publique, faite pour être dans le site)

## À savoir avant de commencer

- Les données importées viennent de la **sauvegarde du 24/09/2026**. Tout ce qui a été fait après (stocks saisis, coloris ajoutés, nouvelles photos, commandes, compteur de visiteurs) n'y est pas. L'ancien projet est gelé : on ne peut pas en extraire plus.
- Les **photos téléversées depuis l'admin** sont dans le stockage de l'ancien projet. Elles ne reviennent pas toutes seules : il faut les téléverser à nouveau (étape 5).
- Pendant la bascule, **ne prenez pas de commandes sur les deux projets en même temps** : elles seraient réparties entre deux bases.
- Quand l'ancien projet sera réactivé, il sera plus simple d'y revenir (remettre l'ancienne URL/clé dans `js/supabase-config.js`) que de tout rapatrier.

## 1. Importer la base (schéma, règles de sécurité, données)

Fichier : `novra_migration_public_schema.sql` (fourni dans la conversation).
Il contient des blocs `COPY ... FROM stdin`, que **l'éditeur SQL du tableau de bord ne sait pas exécuter**. Il faut `psql` :

1. Dans Supabase (nouveau projet) : Project Settings > Database > Connection string > « URI » (mode Session). Remplacez `[YOUR-PASSWORD]` par le mot de passe de la base.
2. Installez PostgreSQL (psql) sur Windows si besoin, puis dans un terminal :
```cmd
psql "postgresql://postgres:[MOT_DE_PASSE]@db.toaejbfhagtvowgpfbrd.supabase.co:5432/postgres" -f novra_migration_public_schema.sql
```
3. Une erreur sur la table `admin_profiles` est **normale** (elle référence des comptes qui n'existent pas encore dans le nouveau projet). Elle sera recréée à l'étape 3.

## 2. Compléter la base

Dans l'éditeur SQL du nouveau projet, exécutez `supabase/migrations/20261113_nouveau_projet_apres_import.sql` **bloc par bloc**, de 1 à 4 (le bloc 5 vient après les photos). Il crée : extensions, création automatique des profils admin, bucket `novra-media` et ses règles, envoi des e-mails de commande et sa relance toutes les 5 minutes.

Puis exécutez `supabase/migrations/20261102_site_visits.sql` (compteur de visiteurs de l'écran Analytics).

## 3. Comptes administrateurs

Authentication > Users > Add user, pour **chaque** personne listée dans la table `admin_invitations` (cochez « Auto Confirm User »). Le rôle (super_admin, manager…) est attribué automatiquement d'après l'invitation. Choisissez un mot de passe solide et transmettez-le en privé.

Authentication > URL Configuration : Site URL = `https://novra.paris`.
Authentication > Policies : activez la protection contre les mots de passe compromis.

## 4. Fonctions Edge (les 4 à déployer)

| Fonction | Rôle | Option de déploiement |
|---|---|---|
| `create-order` | crée la commande et la session de paiement SumUp | `--no-verify-jwt` |
| `sumup-webhook` | confirme le paiement en rappelant SumUp | `--no-verify-jwt` |
| `order-status` | suivi de commande côté client | `--no-verify-jwt` |
| `send-order-email` | envoi des e-mails via Resend | `--no-verify-jwt` |

Le dossier `_shared/` (fichier `sumup.ts`) est inclus automatiquement. Depuis le dossier du site :
```cmd
npx supabase login
npx supabase link --project-ref toaejbfhagtvowgpfbrd
npx supabase functions deploy create-order --no-verify-jwt
npx supabase functions deploy sumup-webhook --no-verify-jwt
npx supabase functions deploy order-status --no-verify-jwt
npx supabase functions deploy send-order-email --no-verify-jwt
```

**Secrets** (Edge Functions > Secrets, ou `npx supabase secrets set NOM=valeur`). Ne les mettez jamais dans un fichier du dépôt :

| Secret | Valeur |
|---|---|
| `SUMUP_API_KEY` | votre clé API SumUp |
| `SUMUP_MERCHANT_CODE` | votre code marchand SumUp |
| `NOVRA_SITE_URL` | `https://novra.paris` |
| `RESEND_API_KEY` | votre clé Resend |
| `RESEND_FROM` (facultatif) | `NOVRA <commandes@novra.paris>` |

N'ajoutez **pas** `SUMUP_WEBHOOK_URL` : sans lui, la fonction utilise automatiquement l'adresse du nouveau projet. `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis par Supabase.

## 5. Photos

1. Storage > `novra-media` : téléversez les fichiers de votre archive `luvydsusnupkxvjfxsug.storage.zip` en **gardant les mêmes dossiers et noms**.
2. Exécutez le bloc 5 du fichier SQL (remplacement des anciennes adresses de photos par les nouvelles).
3. Les photos ajoutées après septembre devront être remises depuis l'admin (Produits, Médias & Contenus).

## 6. Brancher le site

Dans `js/supabase-config.js`, remplacer les deux lignes :
```js
const NOVRA_SUPABASE_URL = 'https://toaejbfhagtvowgpfbrd.supabase.co';
const NOVRA_SUPABASE_ANON_KEY = 'sb_publishable_hItnOh_AXBOBKvkR7i8zXQ_-rWTPh7G';
```
Puis augmenter le numéro `?v=` de `supabase-config.js` dans les pages HTML et dans `admin/index.html`, pousser, et faire Ctrl+F5.

Je peux faire cette modification dès que l'étape 1 est faite et que vous me le dites.

## 7. Vérifications

- Le site affiche les produits et photos (page d'accueil, boutique, une fiche produit).
- Connexion à l'admin avec un des comptes créés.
- Stocks : les 88 variantes sont revenues, à vérifier (valeurs du 24/09, à ressaisir si besoin).
- Une commande de test jusqu'à la page SumUp (sans saisir de carte), puis vérification en base et dans « Edge Functions > Logs ».
- E-mail de commande reçu (table `email_outbox`).

## 8. Retour vers l'ancien projet

Quand il est réactivé : remettre dans `js/supabase-config.js` l'ancienne URL (`https://luvydsusnupkxvjfxsug.supabase.co`) et sa clé publiable d'origine, pousser. Les commandes éventuellement prises dans le nouveau projet devront être reportées à la main.
