# 03 — Architecture technique

## Stack recommandée 🛠

| Besoin | Choix |
|---|---|
| Framework | Expo (SDK courant) + React Native, **TypeScript strict** |
| Navigation | `expo-router` (onglets + piles), liens profonds natifs |
| Données serveur | `@tanstack/react-query` (cache, relance, hors-ligne partiel) |
| État local | `zustand` + persistance (panier, favoris, historique de commandes) |
| Supabase | `@supabase/supabase-js` ; session admin dans `expo-secure-store` |
| Images / vidéo | `expo-image` (cache disque, point focal), `expo-video` |
| Animation | `react-native-reanimated`, `react-native-gesture-handler` |
| Paiement | `expo-web-browser` (navigateur intégré SumUp) + `expo-linking` (retour) |
| Notifications | `expo-notifications` (push Expo) |
| Retour tactile | `expo-haptics` |
| Formulaires | `react-hook-form` + `zod` (les mêmes règles que `create-order`) |
| Build / publication | EAS Build, EAS Submit, EAS Update (correctifs sans passer par les stores) |
| Qualité | ESLint, Prettier, Jest + React Native Testing Library, Maestro (tests de parcours) |

## Structure du dépôt

```
novra-mobile/
├─ app/                      # routes expo-router
│  ├─ (tabs)/ index, shop, favoris, panier, commandes
│  ├─ produit/[slug].tsx
│  ├─ checkout/ index, retour
│  ├─ commande/[reference].tsx
│  ├─ pages/ a-propos, contact, newsletter, legal/[doc]
│  └─ admin/ (garde d'accès)  ← voir 10
├─ src/
│  ├─ api/        supabase.ts, catalogue.ts, cms.ts, orders.ts, functions.ts
│  ├─ stores/     cart.ts, favorites.ts, orders.ts
│  ├─ components/ ProductCard, SizeGrid, Timeline, …
│  ├─ theme/      colors.ts, fonts.ts, motion.ts
│  ├─ lib/        money.ts, media.ts (résolution des URLs), shipping.ts
│  └─ i18n/       fr.ts
├─ assets/        police, icône, splash
└─ app.config.ts
```

## Variables d'environnement

```
EXPO_PUBLIC_SUPABASE_URL=https://luvydsusnupkxvjfxsug.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<clé publiable sb_publishable_…>
EXPO_PUBLIC_MEDIA_BASE=https://novra.paris/        # pour les chemins relatifs
EXPO_PUBLIC_SITE_URL=https://novra.paris
```

- ⚠ **URL et clé doivent rester configurables** : une migration vers un autre projet Supabase (deuxième compte) est prévue (voir 12). Aucune URL ou clé ne doit être écrite en dur ailleurs que dans la configuration.
- La clé publiable est faite pour être embarquée ; la protection repose sur les règles RLS ✅. **Ne jamais** mettre `service_role`, `SUMUP_API_KEY` ou `RESEND_API_KEY` dans l'app.

## Règles de calcul

- **Montants** : centimes entiers côté serveur ✅. Côté app, l'affichage convertit `numeric` (euros) reçu de l'API ; ne jamais cumuler de flottants pour une décision métier — l'app **affiche**, le serveur **décide**.
- Les calculs du panier de l'app (sous-total, seuil de livraison offerte, remise) sont des estimations d'affichage, recalculées par `create-order` au paiement ✅ (même principe que `js/cart.js`).

## Cache et hors-ligne

| Donnée | Stratégie |
|---|---|
| Catalogue | `staleTime` 60 s (comme `CATALOGUE_TTL`), repli sur le dernier catalogue en cache si le réseau tombe |
| Contenus CMS | `staleTime` 60 s (comme `CMS_CACHE_TTL`), repli sur un accueil embarqué minimal |
| Panier / favoris | Persistés, valables hors ligne |
| Commande | Jamais mise en cache comme source de vérité : toujours relue via `order-status` |

Si Supabase est injoignable, le site garde son catalogue de secours (`js/products.js`). **Pour l'app : embarquer un instantané du catalogue** à chaque build pour afficher quelque chose, avec bandeau « Mode hors ligne », achat désactivé.

## Gestion d'erreurs

Afficher les messages d'erreur renvoyés par les fonctions (déjà rédigés en français, voir 04) ; ne jamais montrer de détail technique. Journaliser côté app (Sentry recommandé) sans données personnelles.

## Observabilité 🛠

Sentry (erreurs), événements d'analyse anonymes : vue produit, ajout panier, début checkout, paiement réussi/échoué. Pas de suivi publicitaire au lancement (voir 11).
