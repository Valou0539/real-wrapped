# Tests

Ce dossier contient tous les tests du projet - **150 tests au total** ! ✅

## Structure

```
tests/
├── composables/
│   ├── _layout/            # Tests des composables de layout (2 fichiers)
│   ├── account/
│   │   ├── forms/          # Tests des formulaires de compte (5 fichiers)
│   │   ├── requests/       # Tests des requêtes API account (1 fichier - 6 composables)
│   │   └── useLoadProfile.test.ts
│   └── auth/
│       ├── forms/          # Tests des formulaires d'auth (5 fichiers)
│       ├── requests/       # Tests des requêtes API auth (1 fichier - 8 composables)
│       ├── useAuthFetch.test.ts
│       ├── useAuthRedirect.test.ts
│       ├── useForgotPasswordWorkflow.test.ts
│       ├── useLogout.test.ts
│       └── useResendVerificationEmail.test.ts
├── middleware/             # Tests des middlewares (3 fichiers)
├── plugins/                # Tests des plugins (1 fichier)
├── stores/                 # Tests des stores Pinia (1 fichier)
├── utils/                  # Tests des utilitaires (3 fichiers)
└── README.md
```

## Couverture des tests

### ✅ 100% de couverture

- **Formulaires** (10 composables) - 100%
- **Stores** (authStore) - 100%
- **Middlewares** (connected, disconnected, verify-email-guard) - 100%
- **Utils** (handleError, handleAuthError, handleAccountError) - 100%
- **Enums** (AuthErrorContext, AccountErrorContext) - 100%

### ✅ Composables testés

#### Formulaires (10)

1. `useLoginForm` - Formulaire de connexion
2. `useSignUpForm` - Formulaire d'inscription
3. `useVerifyEmailForm` - Formulaire de vérification d'email
4. `useForgotPasswordEmailForm` - Formulaire de demande de réinitialisation
5. `useForgotPasswordPasswordForm` - Formulaire de réinitialisation
6. `useUpdateNameForm` - Formulaire de mise à jour du nom
7. `useUpdateEmailForm` - Formulaire de demande de changement d'email
8. `useUpdatePasswordForm` - Formulaire de mise à jour du mot de passe
9. `useCheckEmailForm` - Formulaire de confirmation du changement d'email
10. `useDeleteAccountForm` - Formulaire de suppression de compte

#### Requêtes API (14)

**Auth (8)** 11. `useLoginRequest` - Requête de connexion 12. `useRegisterRequest` - Requête d'inscription 13. `useVerifyEmailRequest` - Requête de vérification d'email 14. `useForgotPasswordRequest` - Requête de mot de passe oublié 15. `useCreateNewPasswordRequest` - Requête de nouveau mot de passe 16. `useRefreshRequest` - Requête de refresh token 17. `useLogoutRequest` - Requête de déconnexion 18. `useResendVerificationEmailRequest` - Requête de renvoi d'email

**Account (6)** 19. `useLoadProfileRequest` - Requête de chargement du profil 20. `useUpdateNameRequest` - Requête de mise à jour du nom 21. `useRequestEmailChangeRequest` - Requête de changement d'email 22. `useConfirmEmailChangeRequest` - Requête de confirmation d'email 23. `useUpdatePasswordRequest` - Requête de mise à jour du mot de passe 24. `useDeleteAccountRequest` - Requête de suppression de compte

#### Orchestrateurs (7)

25. `useLoadProfile` - Chargement du profil utilisateur
26. `useLogout` - Déconnexion (remote et local)
27. `useAuthFetch` - Fetch avec authentification et refresh automatique
28. `useAuthRedirect` - Redirection après authentification
29. `useForgotPasswordWorkflow` - Workflow de réinitialisation de mot de passe
30. `useResendVerificationEmail` - Renvoi d'email de vérification
31. `useResponsiveMenu` - Menu responsive
32. `useScrollBackground` - Background au scroll

## Commandes

### Lancer tous les tests

```bash
npm run test
```

### Lancer les tests en mode UI

```bash
npm run test:ui
```

### Lancer un fichier de test spécifique

```bash
npm run test -- tests/composables/auth/forms/useLoginForm.test.ts
```

## Approche de test

Tous les tests suivent la même structure :

1. **Mocks des dépendances** : Les composables de requêtes API, stores Pinia, et utilitaires (toast, i18n, navigation) sont mockés avec `mockNuxtImport` de `@nuxt/test-utils/runtime`.

2. **Tests de base** :
   - Initialisation avec valeurs par défaut
   - Soumission réussie du formulaire
   - Gestion des erreurs
   - Validation (ne pas soumettre si invalide)

3. **Tests spécifiques** selon le composable :
   - Redirections
   - Mises à jour du store
   - Notifications toast
   - Fonction `reset()` si disponible

## Environnement de test

- **Framework** : Vitest
- **Environnement** : Nuxt (via `@nuxt/test-utils`)
- **DOM** : happy-dom
- **Couverture** : v8

## Statistiques

- **📊 Nombre total de tests** : 162
- **📁 Fichiers de test** : 28
- **✅ Taux de réussite** : 100%
- **🎯 Couverture du code critique** : 100% (formulaires, stores, middlewares, utils)
- **🔌 Composables de requêtes** : 14 testés (auth + account)

## Ce qui n'est PAS testé (volontairement)

- **Pages Vue** (`.vue` dans `/pages`) - Composants Vue nécessitant des tests E2E
- **Layouts** - Composants de présentation pure
- **Types TypeScript** - Pas de logique à tester
- **Composables \_shared** - `usePrimevueI18n` (i18n PrimeVue, pas de logique métier)

## Notes techniques

- Les tests utilisent `// @vitest-environment nuxt` pour l'auto-import des composables
- Les mocks sont définis avec `vi.hoisted()` pour éviter les problèmes d'initialisation
- Chaque test réinitialise les mocks avec `beforeEach(() => vi.clearAllMocks())`
- Les erreurs TypeScript dans l'IDE sont normales (auto-imports Nuxt)
- Les tests s'exécutent dans l'environnement Nuxt avec happy-dom
