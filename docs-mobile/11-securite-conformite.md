# 11 — Sécurité et conformité

## Règles non négociables ✅

1. Le navigateur/l'app ne reçoivent que la **clé publiable**. Jamais de `service_role`, `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `SUMUP_WEBHOOK_URL`, `NOVRA_SITE_URL`, `RESEND_API_KEY` dans le dépôt de l'app.
2. Le téléphone n'est jamais cru sur parole : prix, stock, remise, statut de paiement = serveur.
3. Preuve de paiement = `GET /v0.1/checkouts/{id}` de SumUp via `sumup-webhook`. Ne pas raccourcir.
4. « Payée » uniquement via `apply_payment_result()`.
5. Suivi : référence **et** e-mail, ou référence **et** jeton.
6. Montants en centimes entiers côté serveur ; pas de flottant dans un calcul métier.

## Stockage sur l'appareil

| Donnée | Où |
|---|---|
| Panier, favoris | AsyncStorage |
| Jetons de commande, e-mail du client | `expo-secure-store` |
| Session admin | `expo-secure-store` |
| Aucune donnée de carte | — (saisie sur SumUp) |

## Réseau et build

HTTPS uniquement ; pas d'exception ATS/cleartext. Épinglage de certificat non requis. Variables `EXPO_PUBLIC_*` visibles dans le binaire : n'y mettre que du public. Obfuscation Hermes par défaut ; pas de secrets "cachés".

## RGPD et boutiques d'applications

- Politique de confidentialité : lien du site. ⚠ Elle doit mentionner l'app, les notifications push et le sous-traitant Expo avant publication.
- Collecte minimale : e-mail, nom, adresse, téléphone **pour la commande**. Newsletter : consentement explicite, désinscription.
- **Notifications** : transactionnelles, demandées après l'achat. Marketing : opt-in séparé.
- Pas de pistage publicitaire ; si analyse, anonymisée. Renseigner correctement la « Confidentialité de l'app » (Apple) et la « Sécurité des données » (Google).
- Suppression/export des données : procédure par e-mail (aucun compte client en V1).
- Apple : fournir un moyen de suppression de compte **si** des comptes clients sont créés (non applicable en V1). Les achats de biens physiques n'utilisent pas l'achat intégré — conforme.
- Mentions légales : à compléter après Kbis (éditeur SASU NOVRA, siège 26 ter rue Jules Princet, 93600 Aulnay-sous-Bois) ⚠. Directeur de publication à confirmer (orthographe « Mahamé Traoré »).
- CGV : droit de rétractation 14 jours, rappel obligatoire avant paiement ; vérifier les textes avec un juriste ⚠ (je ne suis pas avocat).

## Points ouverts de sécurité Supabase

- Activer la protection contre les mots de passe compromis (Authentication → Policies) ⚠.
- Limiter le débit des fonctions publiques (`create-order`, `order-status`) pour éviter l'énumération de références.
- Compte de test / commande de test `NVR-260929-P703` à supprimer avant le lancement.
