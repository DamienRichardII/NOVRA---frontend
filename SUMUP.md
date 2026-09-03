# NOVRA — Back-end de paiement SumUp

Tout le code est écrit, déployé et testé. Il ne manque que vos clés.

**Ce que je ne fais pas, volontairement** : je ne crée pas votre compte SumUp
et je ne manipule aucune de vos clés. Vous seul les voyez, vous seul les
déposez dans les secrets Supabase. C'est la seule façon de garantir qu'elles
ne traînent nulle part — ni dans le dépôt, ni dans les journaux, ni ici.

---

## Variables d'environnement à renseigner

Dans Supabase → **Edge Functions** → **Secrets** :

| Variable | Valeur | Où la trouver |
|---|---|---|
| `SUMUP_API_KEY` | `sup_sk_…` | SumUp → Développeurs → Clés API. **Secrète.** |
| `SUMUP_MERCHANT_CODE` | ex. `MH4H92C7` | SumUp → Profil → Identifiant de commerçant |
| `SUMUP_WEBHOOK_URL` | `https://luvydsusnupkxvjfxsug.supabase.co/functions/v1/sumup-webhook` | Fixe |
| `NOVRA_SITE_URL` | `https://novra-frontend.vercel.app` | Sans barre finale |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont
injectées automatiquement dans les fonctions : **ne les redéposez pas**.

**`SUMUP_PUBLIC_KEY` n'est pas utilisée.** Elle ne sert qu'aux intégrations
qui affichent le formulaire de carte dans votre propre page (SDK widget).
Nous utilisons le Hosted Checkout : le client est redirigé vers la page
sécurisée de SumUp, aucune donnée bancaire ne touche NOVRA. Gardez-la de côté
si vous changez un jour d'approche.

**Jamais dans le navigateur** : `SUMUP_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY`.
Le site public ne reçoit que la clé publiable Supabase, et la protection
repose sur les règles RLS.

---

## Ce qui a été construit

### Trois fonctions serveur

**`create-order`** — appelée quand le client valide son panier.

1. Valide l'entrée avec Zod : produits, variantes, quantités entre 1 et 20,
   e-mail, mode de réception, adresse.
2. **Ne fait jamais confiance au prix envoyé.** Le navigateur n'envoie que des
   références et des quantités ; les prix, stocks, remises et frais de port
   sont relus dans la base et recalculés.
3. Crée la commande en `pending`, ses lignes, et un paiement en `pending`.
4. Ouvre un checkout SumUp et renvoie l'adresse de la page de paiement.

**`sumup-webhook`** — appelée par SumUp.

SumUp **ne signe pas ses appels** : n'importe qui peut frapper cette adresse.
Le corps reçu n'est donc jamais une preuve. Il sert uniquement à apprendre
quel checkout a bougé. La fonction appelle ensuite
`GET /v0.1/checkouts/{id}` avec la clé secrète, et c'est **cette réponse
seule** qui décide du statut.

**`order-status`** — lecture d'une commande par le client, sans compte.

### Une transaction unique pour le paiement

`apply_payment_result()` fait tout dans une seule transaction Postgres :
verrou sur la commande, sortie de stock, fiche client, statut du paiement,
statut de la commande. Soit tout avance ensemble, soit rien ne bouge.

L'idempotence ne repose pas sur un identifiant d'événement mais sur l'état :
`inventory_processed_at` est posé à la première sortie de stock. Un webhook
rejoué dix fois ne décrémente qu'une fois.

### Une garde sur le statut « payée »

Un administrateur peut faire avancer une commande — préparation, expédition,
retrait — mais **ne peut pas la déclarer payée**. Ce statut n'est accessible
qu'à la fonction de vérification, via un marqueur de transaction qu'elle seule
sait poser et qui ne survit pas à la transaction. Testé dans les deux sens.

---

## Correspondance des statuts

| SumUp | Commande | Paiement |
|---|---|---|
| `PAID` | `paid` | `paid` |
| `FAILED` | `payment_failed` | `failed` |
| `PENDING` | inchangée | `pending` |
| `EXPIRED` | `payment_expired` | `expired` |

Une commande déjà payée ne redevient jamais un échec : l'ordre d'arrivée des
callbacks n'est pas garanti, et un client peut réessayer après un refus.

---

## Cas limites traités

| Situation | Comportement |
|---|---|
| Double clic sur « Payer » | Le navigateur envoie une clé stable ; la même commande est réutilisée et la même page de paiement rouverte. |
| Navigateur fermé après paiement | Le webhook fait le travail sans le client. La commande est payée, le stock sorti. |
| Retour sans nos paramètres | La référence et le jeton sont conservés en local ; la page les retrouve. |
| Callback en retard | Le statut vérifié auprès de SumUp fait foi, quel que soit l'ordre d'arrivée. |
| Callbacks multiples | Idempotents : une seule sortie de stock, un seul jeu de messages. |
| SumUp injoignable | Délai de 15 s puis erreur franche ; la commande est annulée et la clé libérée pour réessayer. |
| SumUp répond mal au webhook | Réponse 503 : SumUp réessaiera. |
| Rupture pendant le tunnel | Refusée avant tout débit, avec le stock restant annoncé. |
| Stock parti entre commande et paiement | Le paiement est encaissé, la commande signalée dans son historique. Personne n'invente du stock. |
| Livraison sans adresse | Refusée avant tout débit. |
| Panier vide | Bouton désactivé côté client, refus côté serveur. |
| Confirmation rechargée | Lecture seule : rien n'est créé ni modifié. |

---

## Consultation d'une commande sans compte

Deux chemins, tous deux sans mot de passe :

- **Retour de paiement** : `?ref=NVR-…&t=<jeton>`. Le jeton fait 48 caractères
  tirés de 24 octets aléatoires. Il n'ouvre que sa propre commande.
- **Page de suivi** : numéro **et** adresse e-mail. Les deux sont exigés — le
  numéro seul permettrait de lire la commande d'un autre en devinant une
  référence. Le message d'échec est identique dans tous les cas, pour ne pas
  révéler qu'une référence existe.

---

## Montants

En base et dans le code serveur : **centimes entiers**. Un entier ne dérive
jamais. La conversion en euros décimaux ne se fait qu'à la frontière avec
SumUp, qui attend des unités majeures (`64.90` et non `6490`). Aucun calcul
métier n'est fait en flottant.

---

## Diagnostic

Chaque appel de SumUp est enregistré dans `payment_events` **avant** d'être
interprété : corps brut, statut vérifié, commande rattachée, erreur
éventuelle. Pour comprendre un paiement qui a mal tourné :

```sql
select created_at, provider_event_type, provider_checkout_id,
       verified_status, error, payload
from payment_events
order by created_at desc limit 20;
```

Les erreurs renvoyées au navigateur sont volontairement génériques et portent
un code (`OUT_OF_STOCK`, `PROVIDER`, `VALIDATION`…). Le détail reste dans les
journaux serveur, jamais dans la réponse.

---

## Ce qui reste à faire

1. Créer le compte SumUp et l'activer (SIRET, IBAN, pièce d'identité).
2. Déposer les quatre variables ci-dessus dans les secrets Supabase.
3. Déclarer l'adresse du webhook dans SumUp si votre compte le demande —
   elle est déjà transmise comme `return_url` à chaque checkout.
4. Faire une commande de test, puis vérifier dans l'admin que la commande
   apparaît, que le client est créé et que le stock a baissé.

**Trois points bloquants indépendants de SumUp** subsistent : les prix sont
provisoires et vivent à deux endroits (`js/products.js` et la table
`products`, c'est la base qui facture) ; les stocks sont à zéro avec le suivi
éteint ; les mentions légales et les CGV sont incomplètes.

---

## Stripe

Les fonctions Stripe ont été retirées. **Les colonnes `stripe_*` de la table
`orders` sont conservées**, vides et inutilisées : aucune suppression
destructive n'a été faite. Si vous vouliez revenir en arrière, l'historique
serait intact.
