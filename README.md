# 🚀 Nuxt Boilerplate

Un boilerplate moderne et production-ready pour **Nuxt 4** avec authentification complète, gestion d'état, système de thème et multilingue. Conçu pour démarrer rapidement vos projets avec les meilleures pratiques.

## ✨ Fonctionnalités principales

- 🔐 **Authentification complète** : Login, inscription, vérification email, mot de passe oublié
- 🎨 **Thème clair/sombre** : Switch automatique avec persistance
- 🌍 **Multilingue (i18n)** : Français et Anglais prêts à l'emploi
- 📱 **Responsive** : Layout adaptatif mobile-first
- 🎯 **Type-safe** : TypeScript partout avec auto-complétion
- 🔄 **Gestion d'état** : Pinia avec persistance (sessionStorage/cookies)
- ✅ **Validation** : Formulaires avec Zod et gestion d'erreurs
- 🎭 **Architecture modulaire** : Organisation par domaines fonctionnels

## 🛠️ Stack technique

| Catégorie        | Technologies                        |
| ---------------- | ----------------------------------- |
| **Framework**    | Nuxt 4 • Vue 3 • TypeScript         |
| **UI**           | PrimeVue • Tailwind CSS • Heroicons |
| **État**         | Pinia • pinia-plugin-persistedstate |
| **Validation**   | Zod                                 |
| **i18n**         | @nuxtjs/i18n                        |
| **Images**       | @nuxt/image                         |
| **Code Quality** | Prettier • TypeScript strict        |

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ ou Bun
- npm, pnpm, yarn ou bun

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/boilerplate-nuxt.git
cd boilerplate-nuxt

# Installer les dépendances
npm install
# ou
pnpm install
```

### Configuration

1. Copier le fichier d'environnement :

```bash
cp .env.example .env
```

2. Configurer les variables d'environnement dans `.env` :

```env
# URL de l'application
APP_URL=http://localhost:3000

# URL de l'API backend
API_URL=https://your-api-url.com
```

### Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📂 Architecture du projet

Le projet suit une **architecture Domain-Driven** où chaque fonctionnalité (domaine) regroupe :

- Ses composants Vue
- Ses composables (logique métier)
- Ses types TypeScript
- Ses traductions i18n
- Ses endpoints API

```
app/
├── components/[domain]/    # Composants par domaine
├── composables/[domain]/   # Logique métier par domaine
│   ├── forms/             # Gestion des formulaires
│   ├── requests/          # Requêtes API
│   └── use*.ts            # Composables orchestrateurs
├── constants/             # Constantes globales
├── enums/                 # Enumerations globales
├── layouts/               # Layouts globaux
├── middleware/            # Middleware globaux
├── pages/[domain]/        # Pages par domaine
├── plugins/               # Plugins globaux
├── stores/                # Stores Pinia
├── types/                 # Types TypeScript
└── utils/                 # Utils globaux
i18n/[lang]
├── [domain].json          # Traductions par domaine
server/api/[domain]/       # Endpoints API par domaine
shared/types               # Types partagés
```

**Domaines implémentés** :

- `auth/` : Authentification et autorisation
- `account/` : Gestion du compte utilisateur
- `_layout/` : Composants globaux (Topbar, Footer)
- `_shared/` : Composants réutilisables

> 📖 Pour une documentation détaillée de l'architecture, consultez [AGENTS.md](./AGENTS.md)

## 🧪 Tests

Le projet inclut des **tests unitaires** avec **100% de couverture** des fichiers TypeScript :

### Framework de test

- **Vitest** - Framework de test rapide et moderne
- **@nuxt/test-utils** - Support des composables et auto-imports Nuxt
- **happy-dom** - Environnement DOM léger

### Commandes

```bash
npm run test              # Lance tous les tests
npm run test:ui           # Interface UI interactive
```

> 📖 Voir [tests/README.md](./tests/README.md) pour la documentation complète des tests

## 🎯 Fonctionnalités détaillées

### Authentification

- ✅ Inscription avec validation email
- ✅ Connexion (email/username)
- ✅ Mot de passe oublié
- ✅ Refresh token automatique
- ✅ Guards de routes (middleware)
- ✅ Déconnexion avec cleanup

### Gestion du compte

- ✅ Modification du nom
- ✅ Changement d'email (avec vérification)
- ✅ Changement de mot de passe
- ✅ Suppression du compte

### UI/UX

- ✅ Thème clair/sombre avec switch
- ✅ Variables CSS personnalisables
- ✅ Layout responsive
- ✅ Composants PrimeVue stylés
- ✅ Messages d'erreur contextuels

## 📦 Commandes disponibles

```bash
# Développement
npm run dev              # Lance le serveur de développement

# Production
npm run build            # Compile pour la production
npm run preview          # Preview de la version production

# Tests
npm run test             # Lance tous les tests
npm run test:ui          # Lance les tests en mode UI

# Code Quality
npx prettier --write .   # Formate le code
npx nuxi typecheck       # Vérification TypeScript
```

## 🔧 Configuration

### Variables d'environnement

Les variables sont définies dans `.env` et accessibles via `useRuntimeConfig()` :

```typescript
const config = useRuntimeConfig();

// Public (client + serveur)
console.log(config.public.appUrl);

// Privé (serveur uniquement)
console.log(config.apiUrl);
```

### Ajouter une nouvelle langue

1. Créer un dossier dans `i18n/locales/[code-langue]/`
2. Ajouter les fichiers de traduction (JSON)
3. Configurer dans `nuxt.config.ts` :

```typescript
i18n: {
  locales: [
    // ... autres langues
    {
      code: "de",
      files: ["de/authentication.json", "de/layout.json"],
      name: "Deutsch",
    },
  ],
}
```

### Personnaliser le thème

Modifier les variables CSS dans `app/assets/css/main.css` :

```css
:root {
  --color-primary-500: #10b981; /* Votre couleur primaire */
  /* ... autres variables */
}
```

## 🏗️ Ajouter une nouvelle fonctionnalité

1. **Créer les types** dans `shared/types/[feature].ts`
2. **Créer l'endpoint API** dans `server/api/[feature]/`
3. **Créer les composables** dans `app/composables/[feature]/`
4. **Créer les composants** dans `app/components/[feature]/`
5. **Créer les pages** dans `app/pages/[feature]/`
6. **Ajouter les traductions** dans `i18n/locales/[lang]/[feature].json`

> 📖 Guide complet dans [AGENTS.md - Guides de développement](./AGENTS.md#guides-de-développement)

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)** - Documentation technique complète (architecture, patterns, conventions)
- **[Nuxt Documentation](https://nuxt.com/)** - Framework Nuxt
- **[PrimeVue Documentation](https://primevue.org/)** - Composants UI
- **[Pinia Documentation](https://pinia.vuejs.org/)** - Gestion d'état
