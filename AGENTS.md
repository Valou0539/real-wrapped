# Guide d'architecture - Nuxt Boilerplate

Ce document décrit l'architecture complète du projet Nuxt 4 Boilerplate. Il est destiné aux développeurs et aux assistants IA (agents) pour comprendre la structure et les patterns utilisés.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Patterns et conventions](#patterns-et-conventions)
- [Modules principaux](#modules-principaux)
- [Tests et assurance qualité](#-tests-et-assurance-qualité)
- [Guides de développement](#guides-de-développement)

---

## Vue d'ensemble

Ce boilerplate est un projet Nuxt 4 moderne qui intègre un système d'authentification complet, une gestion d'état avec Pinia, un système de thème clair/sombre, et du multilingue (i18n). Il utilise PrimeVue pour les composants UI et Tailwind CSS pour le styling.

### Objectifs du projet

- **Réutilisabilité** : Composants et composables génériques
- **Type-safety** : TypeScript partout avec typage strict
- **Maintenabilité** : Architecture modulaire et séparation des responsabilités
- **DX optimale** : Auto-imports, conventions Nuxt, et patterns clairs

---

## Stack technique

### Framework & Core

- **Nuxt 4** (^4.2.0) - Framework Vue.js avec SSR
- **Vue 3** (latest) - Framework JavaScript réactif
- **Vue Router** (latest) - Routage officiel Vue.js
- **TypeScript** - Typage statique avec @types/node (^24.9.1)

### UI & Styling

- **PrimeVue** (fork custom github:Valou0539/primevue#primevue-only) - Bibliothèque de composants UI
- **@primevue/forms** (^4.2.5) - Gestion des formulaires
- **@primevue/themes** (^4.2.5) - Système de thème
- **@primevue/nuxt-module** (^4.2.5) - Module Nuxt pour PrimeVue
- **Tailwind CSS** (^4.1.12) - Framework CSS utilitaire
- **@tailwindcss/vite** (^4.1.12) - Plugin Vite pour Tailwind
- **@nuxtjs/color-mode** (^3.5.2) - Gestion thème clair/sombre
- **@nuxtjs/google-fonts** (^3.2.0) - Intégration Google Fonts (Poppins)

### État & Data

- **Pinia** (^3.0.3) - Gestion d'état
- **@pinia/nuxt** (^0.11.2) - Module Nuxt pour Pinia
- **pinia-plugin-persistedstate** (^4.5.0) - Persistance d'état (sessionStorage/cookies)

### Validation & Formulaires

- **Zod** (^3.25.17) - Validation de schémas

### Internationalisation

- **@nuxtjs/i18n** (^10.0.6) - Support multilingue (FR/EN)

### Icônes

- **@heroicons/vue** (^2.2.0) - Icônes Heroicons
- **primeicons** (^7.0.0) - Icônes PrimeVue

### Images

- **@nuxt/image** (^1.9.0) - Optimisation d'images

### Testing (Dev)

- **@vitest/browser** (^3.1.4) - Tests browser avec Vitest

### Code Quality

- **Prettier** (^3.4.2) - Formatage de code
- **prettier-plugin-tailwindcss** (^0.6.11) - Tri des classes Tailwind

---

## Structure du projet

### Principe d'organisation par domaine

Le projet suit une **architecture Domain-Driven** où le code est organisé par **domaines fonctionnels** plutôt que par type de fichier. Chaque domaine (ex: authentification, profil utilisateur, paiement, etc.) regroupe sa logique, ses composants, et ses données dans des dossiers dédiés.

### Arborescence

```
boilerplate-nuxt/
├── app/                          # Dossier principal de l'application
│   │
│   ├── assets/
│   │   └── css/                  # Styles CSS globaux
│   │       └── main.css          # Variables CSS et thèmes
│   │
│   ├── components/               # Composants Vue organisés par domaine
│   │   ├── _layout/              # Composants globaux de layout (Topbar, Footer)
│   │   ├── _shared/              # Composants partagés entre domaines (Loader, ErrorMessage)
│   │   └── [domain]/             # Composants spécifiques à un domaine fonctionnel
│   │       └── *.vue             # Ex: LoginForm.vue, UserProfile.vue
│   │
│   ├── composables/              # Composables Vue organisés par domaine
│   │   ├── _layout/              # Composables pour le layout (responsive, scroll)
│   │   ├── _shared/              # Composables partagés (i18n, formatters)
│   │   └── [domain]/             # Composables d'un domaine fonctionnel
│   │       ├── forms/            # Formulaires du domaine (useLoginForm, useProfileForm)
│   │       ├── requests/         # Requêtes API du domaine (useLoginRequest, etc.)
│   │       └── use*.ts           # Composables orchestrateurs du domaine
│   │
│   ├── constants/                # Constantes organisées par domaine
│   │   └── [domain]/             # Constantes d'un domaine
│   │       ├── resolvers.ts      # Schémas de validation Zod
│   │       └── errorMappings.ts  # Mappings d'erreurs
│   │
│   ├── enums/                    # Énumérations TypeScript par domaine
│   │   └── *ErrorContext.ts      # Contextes d'erreur par domaine
│   │
│   ├── layouts/                  # Layouts Nuxt
│   │   └── default.vue           # Layout par défaut
│   │
│   ├── middleware/               # Middleware Nuxt (guards de routes)
│   │   ├── connected.ts          # Protection routes authentifiées
│   │   ├── disconnected.ts       # Redirection si connecté
│   │   └── [custom].ts           # Guards personnalisés
│   │
│   ├── pages/                    # Pages Nuxt (routage automatique)
│   │   ├── [domain]/             # Pages d'un domaine fonctionnel
│   │   │   └── *.vue             # Ex: login.vue, profile.vue
│   │   └── index.vue             # Page d'accueil
│   │
│   ├── plugins/                  # Plugins Vue/Nuxt
│   │
│   ├── stores/                   # Stores Pinia par domaine
│   │   └── [domain]Store.ts      # Ex: authStore.ts, cartStore.ts
│   │
│   ├── types/                    # Types TypeScript globaux (client)
│   │   ├── composables.ts        # Types pour composables (FormComposable, etc.)
│   │   └── errorHandler.ts       # Types pour gestion d'erreurs
│   │
│   ├── utils/                    # Fonctions utilitaires globales
│   │   └── handleError.ts        # Gestion générique des erreurs
│   │
│   ├── app.config.ts             # Configuration runtime de l'app
│   ├── app.vue                   # Composant racine
│   └── error.vue                 # Page d'erreur personnalisée
│
├── i18n/                         # Internationalisation
│   └── locales/
│       └── [lang]/               # Traductions par langue (en, fr, etc.)
│           ├── [domain].json     # Traductions par domaine
│           ├── layout.json       # Traductions globales
│           └── primevue.json     # Surcharge PrimeVue
│
├── public/                       # Fichiers statiques publics
│   ├── .well-known/              # Fichiers de vérification (Apple, Google, etc.)
│   ├── favicon.ico
│   └── robots.txt
│
├── server/                       # API côté serveur Nuxt
│   ├── api/
│   │   └── [domain]/             # Endpoints API par domaine
│   │       └── *.{get,post,patch,delete}.ts
│   └── tsconfig.json
│
├── shared/                       # Code partagé client/serveur
│   └── types/
│       └── [domain].ts           # Types par domaine (ILoginBody, IUser, etc.)
│
├── .env.example                  # Template des variables d'environnement
├── .gitignore
├── .prettierrc                   # Configuration Prettier
├── AGENTS.md                     # Documentation architecture (ce fichier)
├── README.md                     # Documentation utilisateur
├── nuxt.config.ts                # Configuration Nuxt
├── package.json                  # Dépendances npm
├── primevue-theme.ts             # Thème PrimeVue personnalisé
└── tsconfig.json                 # Configuration TypeScript
```

### Exemples de domaines implémentés

- **`auth/`** : Authentification (login, inscription, tokens, vérification email)
- **`account/`** : Gestion du compte utilisateur (profil, paramètres, suppression)
- **`_layout/`** : Éléments globaux de layout (navigation, footer, thème)
- **`_shared/`** : Composants et utilitaires réutilisables partout

### Principe clé

**Chaque domaine est autonome** : sa logique, ses composants, ses types, ses traductions et ses endpoints API sont regroupés. Cela facilite la maintenance, les tests et l'ajout de nouvelles fonctionnalités.

---

## 🏗️ Patterns et conventions

### 1. Architecture des composables

Le projet utilise une architecture en 3 couches pour les composables :

#### a) Composables de requêtes (`requests/`)

- **Responsabilité** : Communication avec l'API
- **Pattern** : Retourne un objet avec une fonction `execute()`
- **Type** : Implémente `ApiRequestComposable<TBody, TResponse>`
- **Exemple** : `useLoginRequest()`, `useUpdateNameRequest()`

```typescript
// Exemple structure
export const useLoginRequest = (): ApiRequestComposable<
  ILoginBody,
  ITokenResponse
> => {
  const config = useRuntimeConfig();
  const execute = (body: ILoginBody, fetchConfig?: any) => {
    return $fetch<ITokenResponse>(`${config.apiUrl}/auth/login`, {
      method: "POST",
      body,
      ...fetchConfig,
    });
  };
  return { execute };
};
```

#### b) Composables de formulaires (`forms/`)

- **Responsabilité** : Gestion des formulaires (état, validation, soumission)
- **Pattern** : Utilise PrimeVue Forms + Zod
- **Type** : Implémente `FormComposable<T>`
- **Exemple** : `useLoginForm()`, `useSignUpForm()`

```typescript
// Exemple structure
export const useLoginForm = (): FormComposable<ILoginBody> => {
  const initialValues = ref<ILoginBody>({
    /* ... */
  });
  const resolver = ref(loginResolver); // Zod schema
  const responseError = ref<string | undefined>();
  const loading = ref(false);

  const submit = (form: FormSubmitEvent<ILoginBody>) => {
    // Logique de soumission
  };

  return { initialValues, resolver, responseError, loading, submit };
};
```

#### c) Composables orchestrateurs

- **Responsabilité** : Orchestration de plusieurs requêtes ou workflows complexes
- **Exemple** : `useLoadProfile()`, `useForgotPasswordWorkflow()`, `useLogout()`

```typescript
// Exemple
export const useLoadProfile = () => {
  const loadProfile = () => {
    return useLoadProfileRequest()
      .execute()
      .then((profile) => {
        const profileStore = useProfileStore();
        profileStore.setProfile(profile);
      });
  };
  return { execute: loadProfile };
};
```

### 2. Gestion des erreurs

#### Pattern centralisé avec `handleError`

```typescript
// app/utils/handleError.ts
export const handleError = (
  error: FetchContext,
  mapping: ErrorMapping,
): string => {
  const statusCode = error.response?.status;
  if (!statusCode) return mapping.default;
  return mapping[statusCode] ?? mapping.default;
};
```

#### Utilisation avec contexte

```typescript
// Dans un composable
import { AuthErrorContext } from "~/enums/AuthErrorContext";

responseError.value = handleAuthError(error, AuthErrorContext.LOGIN);
```

### 3. Gestion d'état avec Pinia

#### authStore

- **Responsabilité** : Gestion des tokens d'authentification
- **Persistance** : sessionStorage + cookies (refresh token)
- **État** :
  - `token` : Access token
  - `sessionRefreshToken` : Refresh token en session
  - `refreshToken` : Refresh token persistant
  - `authenticated` : Computed boolean

#### profileStore

- **Responsabilité** : Données du profil utilisateur
- **Persistance** : sessionStorage

### 4. Authentification et sécurité

#### useAuthFetch

Composable qui crée un client `$fetch` avec :

- Injection automatique du token Bearer
- Gestion automatique du refresh token sur 401
- Retry automatique (1 fois)

```typescript
const authFetch = useAuthFetch();
authFetch.execute("/api/protected-endpoint", { method: "GET" });
```

#### Middleware

- **`connected.ts`** : Protège les routes nécessitant une authentification
- **`disconnected.ts`** : Redirige les utilisateurs connectés (ex: page login)
- **`verify-email-guard.ts`** : Vérifie que l'email en query param est valide

### 5. Validation avec Zod

Les schémas de validation sont centralisés dans `/constants/auth/resolvers` et `/constants/account/resolvers`.

```typescript
// Exemple resolver
import { z } from "zod";

export const loginResolver = z.object({
  identifier: z.string().email().or(z.string().min(3)),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});
```

### 6. Types TypeScript

#### Types partagés (`/shared/types`)

Types utilisables côté client ET serveur :

- `auth.ts` : Interfaces pour l'authentification (ILoginBody, ITokenResponse, etc.)
- `profile.ts` : Interfaces pour le profil utilisateur

#### Types client (`/app/types`)

Types spécifiques au client :

- `composables.ts` : Types génériques pour composables
- `errorHandler.ts` : Types pour gestion d'erreurs

### 7. Internationalisation (i18n)

#### Organisation

Les traductions sont organisées par domaine :

- `authentication.json` : Connexion, inscription, etc.
- `account.json` : Gestion du compte
- `layout.json` : Topbar, footer, navigation
- `home.json` : Page d'accueil
- `error.json` : Messages d'erreur
- `primevue.json` : Surcharge des traductions PrimeVue

#### Utilisation

```typescript
const errorMessage = $t("authentication.errors.invalidCredentials");
```

### 8. Thème et styling

#### Variables CSS personnalisées

Le fichier `/app/assets/css/main.css` définit des variables CSS pour :

- Couleurs (palette complète avec modes clair/sombre)
- Surfaces
- Contrastes
- Couleurs primaires dynamiques

#### PrimeVue Theme

Le fichier `/primevue-theme.ts` définit un preset personnalisé basé sur Aura qui :

- Utilise les variables CSS pour la cohérence
- Configure les border-radius
- Définit les couleurs pour les modes clair/sombre

#### Tailwind CSS

Configuration via `@tailwindcss/vite` dans `nuxt.config.ts`.

### 9. Conventions de nommage

#### Fichiers et dossiers

- **Composants** : PascalCase (`AccountSettings.vue`)
- **Composables** : camelCase avec prefix `use` (`useLoginForm.ts`)
- **Types/Interfaces** : PascalCase avec prefix `I` pour interfaces (`ILoginBody`)
- **Enums** : PascalCase (`AuthErrorContext`)
- **Constantes** : camelCase (`loginResolver`)

#### Structure des composables

```
feature/
├── forms/              # Composables de formulaires
│   └── useFeatureForm.ts
├── requests/           # Composables de requêtes API
│   └── useFeatureRequest.ts
└── useFeature.ts      # Composable orchestrateur
```

---

## Modules principaux

### Authentication Module

**Composables principaux** :

- `useAuthFetch()` : Client HTTP avec tokens
- `useAuthRedirect()` : Gestion des redirections post-login
- `useLogout()` : Déconnexion complète (local + API)
- `useResendVerificationEmail()` : Renvoi email de vérification

**Formulaires** :

- `useLoginForm()` : Connexion
- `useSignUpForm()` : Inscription
- `useVerifyEmailForm()` : Vérification email
- `useForgotPasswordEmailForm()` : Email pour reset mot de passe
- `useForgotPasswordPasswordForm()` : Nouveau mot de passe

**Workflow** :

1. Inscription → Email de vérification
2. Vérification email → Accès complet
3. Connexion → Tokens → Chargement profil
4. Refresh automatique du token sur expiration

### Account Module

**Composables** :

- `useLoadProfile()` : Charge le profil utilisateur
- `useUpdateNameForm()` : Modification du nom
- `useUpdateEmailForm()` : Demande de changement d'email
- `useCheckEmailForm()` : Confirmation changement email
- `useUpdatePasswordForm()` : Changement de mot de passe
- `useDeleteAccountForm()` : Suppression du compte

**Workflow changement email** :

1. Demande de changement → Email de confirmation
2. Confirmation via code → Email mis à jour

### Layout Module

**Composables** :

- `useResponsiveMenu()` : Gestion du menu responsive
- `useScrollBackground()` : Background dynamique au scroll
- `usePrimevueI18n()` : Synchronisation i18n pour PrimeVue

**Composants** :

- `Topbar.vue` : Barre de navigation principale
- `Footer.vue` : Pied de page
- `ThemeToggle.vue` : Switch thème clair/sombre
- `LocaleSelector.vue` : Sélecteur de langue

### Shared Module

**Composants réutilisables** :

- `Loader.vue` : Indicateur de chargement
- `ErrorMessage.vue` : Affichage d'erreurs
- `ConfirmDialog.vue` : Dialogue de confirmation
- Custom wrappers pour composants PrimeVue

---

## 🧪 Tests et assurance qualité

### Vue d'ensemble

Le projet dispose d'une suite complète de **tests unitaires** avec **100% de couverture** du code critique. Les tests sont organisés par domaine et suivent des patterns cohérents.

### Framework et outils

- **Vitest** (^3.1.4) - Framework de test moderne et rapide
- **@nuxt/test-utils** - Utilitaires pour tester les composables Nuxt
- **happy-dom** - Environnement DOM léger
- **@vitest/browser** - Tests browser interactifs

### Structure des tests

```
tests/
├── composables/
│   ├── _layout/              # Tests des composables de layout (2)
│   ├── account/
│   │   ├── forms/            # Tests des formulaires de compte (5)
│   │   └── requests/         # Tests des requêtes API account (6 composables)
│   └── auth/
│       ├── forms/            # Tests des formulaires d'auth (5)
│       └── requests/         # Tests des requêtes API auth (8 composables)
├── middleware/               # Tests des middlewares (3)
├── plugins/                  # Tests des plugins (1)
├── stores/                   # Tests des stores Pinia (2)
└── utils/                    # Tests des utilitaires (3)
```

### Couverture par catégorie

#### ✅ 100% de couverture

1. **Formulaires** - Tous les formulaires avec validation, soumission et gestion d'erreurs
2. **Stores** - authStore avec toutes ses actions et computed
3. **Middlewares** - Tous les guards de routes
4. **Utils** - Toutes les fonctions de gestion d'erreurs
5. **Enums** - AuthErrorContext et AccountErrorContext

### Pattern de test standard

Tous les tests suivent une structure cohérente en 4 parties :

#### 1. Configuration des mocks

```typescript
// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock des dépendances avec vi.hoisted() pour éviter les problèmes d'initialisation
const mockExecute = vi.hoisted(() => vi.fn());
const mockNavigateTo = vi.hoisted(() => vi.fn());

mockNuxtImport("useLoginRequest", () => ({
  execute: mockExecute,
}));
mockNuxtImport("navigateTo", () => mockNavigateTo);
```

#### 2. Tests de base (obligatoires)

```typescript
describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { initialValues, resolver, responseError, loading } = useLoginForm();

    expect(initialValues.value.identifier).toBe("");
    expect(initialValues.value.password).toBe("");
    expect(initialValues.value.remember).toBe(false);
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("should submit form successfully", async () => {
    mockExecute.mockResolvedValue({ token: "test-token" });
    const { submit } = useLoginForm();

    await submit({
      valid: true,
      values: { identifier: "test@test.com", password: "12345678" },
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  it("should handle form validation error", async () => {
    const { submit } = useLoginForm();

    await submit({ valid: false, values: {} });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockExecute.mockRejectedValue({
      response: { status: 401 },
    });
    const { submit, responseError } = useLoginForm();

    await submit({
      valid: true,
      values: { identifier: "test@test.com", password: "wrong" },
    });

    expect(responseError.value).toBeDefined();
  });
});
```

#### 3. Tests spécifiques au composable

Chaque composable peut avoir des tests supplémentaires selon sa logique :

- **Redirections** : Vérifier les navigations
- **Updates de stores** : Vérifier les actions sur les stores
- **Toast notifications** : Vérifier les appels à useToast
- **Fonction reset()** : Tester le reset des formulaires

#### 4. Tests d'intégration (orchestrateurs)

Les composables orchestrateurs testent l'intégration de plusieurs composables :

```typescript
describe("useAuthFetch", () => {
  it("should automatically refresh token on 401 and retry", async () => {
    const mockRefresh = vi.fn().mockResolvedValue({ token: "new-token" });
    mockNuxtImport("useRefreshRequest", () => ({ execute: mockRefresh }));

    const authFetch = useAuthFetch();

    // Premier appel échoue avec 401, second réussit
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ data: "success" });

    await authFetch.execute("/api/test", {});

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

### Tests des middlewares

Les middlewares sont testés avec des mocks de navigation et de stores :

```typescript
describe("connected middleware", () => {
  it("should allow access if authenticated", () => {
    mockAuthStore.authenticated = true;
    const result = connectedMiddleware();
    expect(result).toBeUndefined();
  });

  it("should redirect to login if not authenticated", () => {
    mockAuthStore.authenticated = false;
    connectedMiddleware();
    expect(mockNavigateTo).toHaveBeenCalledWith("/auth/login");
  });
});
```

### Tests des stores

Les stores Pinia sont testés avec `createPinia()` et `setActivePinia()` :

```typescript
import { setActivePinia, createPinia } from "pinia";

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should set token correctly", () => {
    const store = useAuthStore();
    store.setToken("test-token");
    expect(store.token).toBe("test-token");
    expect(store.authenticated).toBe(true);
  });

  it("should clear all tokens on logout", () => {
    const store = useAuthStore();
    store.setToken("test-token");
    store.clearToken();
    expect(store.token).toBeUndefined();
    expect(store.authenticated).toBe(false);
  });
});
```

### Tests des utilitaires

Les fonctions utilitaires sont testées avec des cas limites :

```typescript
describe("handleError", () => {
  it("should return mapped error for known status code", () => {
    const error = { response: { status: 404 } };
    const mapping = {
      404: "errors.notFound",
      500: "errors.server",
      default: "errors.unknown",
    };
    expect(handleError(error, mapping)).toBe("errors.notFound");
  });

  it("should return default error for unknown status", () => {
    const error = { response: { status: 999 } };
    const mapping = { default: "errors.unknown" };
    expect(handleError(error, mapping)).toBe("errors.unknown");
  });
});
```

### Commandes de test

```bash
# Lancer tous les tests
npm run test

# Mode UI interactif
npm run test:ui

# Lancer un fichier spécifique
npm run test -- tests/composables/auth/forms/useLoginForm.test.ts

# Lancer les tests d'un domaine
npm run test -- tests/composables/auth/

# Lancer avec verbosité
npm run test -- --reporter=verbose
```

### Bonnes pratiques pour les tests

#### ✅ À faire

1. **Toujours utiliser `vi.hoisted()`** pour les mocks afin d'éviter les problèmes d'initialisation
2. **Nettoyer les mocks** avec `beforeEach(() => vi.clearAllMocks())`
3. **Tester tous les cas** : succès, échec, validation, cas limites
4. **Utiliser `@vitest-environment nuxt`** en commentaire en haut du fichier
5. **Tester les side effects** : stores, navigation, toasts
6. **Nommer clairement** : describe/it avec descriptions en anglais
7. **Isoler les tests** : Chaque test doit être indépendant

#### ❌ À éviter

1. **Ne pas oublier** de mocker les dépendances (ça fait planter les tests)
2. **Ne pas tester** les composants Vue (préférer les tests E2E)
3. **Ne pas tester** les types TypeScript (pas de logique)
4. **Ne pas partager** d'état entre les tests
5. **Ne pas faire** de tests trop longs ou complexes

### Ajouter un nouveau test

Pour ajouter un test pour un nouveau composable :

1. **Créer le fichier** dans `tests/composables/[domain]/[nom].test.ts`
2. **Ajouter l'environnement** : `// @vitest-environment nuxt`
3. **Mocker les dépendances** avec `vi.hoisted()` et `mockNuxtImport()`
4. **Suivre le pattern** : initialisation, succès, validation, erreur
5. **Tester les side effects** : stores, navigation, toasts
6. **Lancer le test** : `npm run test -- [chemin-du-fichier]`

#### Exemple complet

```typescript
// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mocks
const mockExecute = vi.hoisted(() => vi.fn());
const mockNavigateTo = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({ add: vi.fn() }));

mockNuxtImport("useFeatureRequest", () => ({
  execute: mockExecute,
}));
mockNuxtImport("navigateTo", () => mockNavigateTo);
mockNuxtImport("useToast", () => () => mockToast);

describe("useFeatureForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { initialValues, resolver, loading } = useFeatureForm();
    expect(initialValues.value).toEqual({ field1: "", field2: 0 });
    expect(resolver.value).toBeDefined();
    expect(loading.value).toBe(false);
  });

  it("should submit form successfully", async () => {
    mockExecute.mockResolvedValue({ id: "1", data: "success" });
    const { submit } = useFeatureForm();

    await submit({ valid: true, values: { field1: "test", field2: 10 } });

    expect(mockExecute).toHaveBeenCalledWith(
      { field1: "test", field2: 10 },
      expect.any(Object),
    );
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: "success",
      summary: expect.any(String),
    });
  });

  it("should not submit if validation fails", async () => {
    const { submit } = useFeatureForm();
    await submit({ valid: false, values: {} });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("should handle API error", async () => {
    mockExecute.mockRejectedValue({ response: { status: 400 } });
    const { submit, responseError } = useFeatureForm();

    await submit({ valid: true, values: { field1: "test", field2: 10 } });

    expect(responseError.value).toBeDefined();
    expect(loading.value).toBe(false);
  });
});
```

---

## Guides de développement

### Ajouter une nouvelle fonctionnalité

#### 1. Définir les types

```typescript
// shared/types/feature.ts
export interface IFeatureBody {
  field1: string;
  field2: number;
}

export interface IFeatureResponse {
  id: string;
  data: any;
}
```

#### 2. Créer le endpoint serveur

```typescript
// server/api/feature/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody<IFeatureBody>(event);
  const config = useRuntimeConfig();

  return $fetch<IFeatureResponse>(`${config.apiUrl}/feature`, {
    method: "POST",
    body,
  });
});
```

#### 3. Créer le composable de requête

```typescript
// app/composables/feature/requests/useFeatureRequest.ts
export const useFeatureRequest = (): ApiRequestComposable<
  IFeatureBody,
  IFeatureResponse
> => {
  const authFetch = useAuthFetch(); // Si authentification requise

  const execute = (body: IFeatureBody, config?: any) => {
    return authFetch.execute<IFeatureResponse>("/api/feature", {
      method: "POST",
      body,
      ...config,
    });
  };

  return { execute };
};
```

#### 4. Créer le resolver Zod

```typescript
// app/constants/feature/resolvers.ts
import { z } from "zod";

export const featureResolver = z.object({
  field1: z.string().min(3),
  field2: z.number().positive(),
});
```

#### 5. Créer le composable de formulaire

```typescript
// app/composables/feature/forms/useFeatureForm.ts
export const useFeatureForm = (): FormComposable<IFeatureBody> => {
  const initialValues = ref<IFeatureBody>({
    field1: "",
    field2: 0,
  });

  const resolver = ref(featureResolver);
  const responseError = ref<string | undefined>();
  const loading = ref(false);

  const submit = (form: FormSubmitEvent<IFeatureBody>) => {
    responseError.value = undefined;
    if (form.valid) {
      loading.value = true;
      useFeatureRequest()
        .execute(form.values, {
          onResponse: () => {
            loading.value = false;
          },
          onResponseError: (error) => {
            responseError.value = handleError(error, {
              400: "feature.errors.badRequest",
              500: "feature.errors.serverError",
              default: "feature.errors.unknown",
            });
          },
        })
        .then((response) => {
          // Logique après succès
        });
    }
  };

  return { initialValues, resolver, responseError, loading, submit };
};
```

#### 6. Créer la page/composant Vue

```vue
<!-- app/pages/feature.vue -->
<template>
  <Form
    v-slot="$form"
    :initialValues="initialValues"
    :resolver="resolver"
    @submit="submit($event)"
  >
    <!-- Champs du formulaire -->
    <SharedFormLabelWithError
      :label="$t('feature.fields.field1')"
      :error="$form.field1.error?.message"
    >
      <InputText fluid name="field1" />
    </SharedFormLabelWithError>

    <Button type="submit" :loading="loading" :label="$t('feature.submit')" />

    <Message v-if="responseError" severity="error" :message="responseError" />
  </Form>
</template>

<script setup lang="ts">
useSeoMeta({
  title: $t("feature.seo.title"),
  description: $t("feature.seo.description"),
});
definePageMeta({
  middleware: "disconnected",
});

const { initialValues, resolver, responseError, loading, submit } =
  useFeatureForm();
</script>
```

#### 7. Ajouter les traductions

```json
// i18n/locales/fr/feature.json
{
  "feature": {
    "seo": {
      "title": "Nouvelle fonctionnalité",
      "description": "Nouvelle fonctionnalité"
    },
    "title": "Nouvelle fonctionnalité",
    "fields": {
      "field1": "Champ 1",
      "field2": "Champ 2"
    },
    "errors": {
      "badRequest": "Requête invalide",
      "serverError": "Erreur serveur",
      "unknown": "Une erreur est survenue"
    }
  }
}
```

#### 8. Créer les tests pour les fichiers typescript

```typescript
// tests/composables/feature/forms/useFeatureForm.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Mock du composable de requête
const mockFeatureRequest = vi.fn();
mockNuxtImport("useFeatureRequest", () => {
  return () => ({
    execute: mockFeatureRequest,
  });
});

// Mock du gestionnaire d'erreur
mockNuxtImport("handleFeatureError", () => {
  return (error: any, context: any) => {
    return `Error: ${error.response.status}`;
  };
});

describe("useFeatureForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit initialiser avec les bonnes valeurs par défaut", () => {
    const { initialValues, resolver, responseError, loading } =
      useFeatureForm();

    expect(initialValues.value).toEqual({
      field1: "",
      field2: 0,
    });
    expect(resolver.value).toBeDefined();
    expect(responseError.value).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  ...
});
```

### Ajouter un middleware

```typescript
// app/middleware/custom.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Votre logique de guard
  if (condition) {
    return navigateTo("/redirect");
  }
});
```

Utilisation dans une page :

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ["custom"],
});
</script>
```

### Ajouter un store Pinia

```typescript
// app/stores/featureStore.ts
export const useFeatureStore = defineStore(
  "feature",
  () => {
    const data = ref<IFeatureData | undefined>(undefined);

    const setData = (newData: IFeatureData) => {
      data.value = newData;
    };

    const clearData = () => {
      data.value = undefined;
    };

    return {
      data,
      setData,
      clearData,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.sessionStorage(),
      pick: ["data"],
    },
  },
);
```

### Variables d'environnement

Accès dans le code (si défini dans `nuxt.config.ts`) :

```typescript
const config = useRuntimeConfig();
console.log(config.public.appUrl); // Accessible client + serveur
console.log(config.apiUrl); // Accessible serveur uniquement
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production locale
npm run preview

# Formatage du code
npx prettier --write .

# Type checking
npx nuxi typecheck
```
