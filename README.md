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
# Optionnel : pochettes et genres sur les fiches artistes via Spotify
NUXT_SPOTIFY_CLIENT_ID=
NUXT_SPOTIFY_CLIENT_SECRET=
NUXT_SPOTIFY_MARKET=FR
```

#### Spotify (pochettes et fiches artistes)

- Créez une application sur le [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) et renseignez son Client ID / Client Secret. Les pochettes, genres et crédits d'artistes utilisent le flux Client Credentials (aucune connexion utilisateur) et le serveur renouvelle lui-même ses access tokens.
- **Export de playlist** (bouton « Créer la playlist » sur la vue des titres) : ajoutez l'URL de redirection `http://127.0.0.1:3000/api/spotify/callback` dans les réglages de votre application Spotify (champ *Redirect URIs*) — Spotify exige `127.0.0.1` plutôt que `localhost` en HTTP, ou HTTPS. Si vous servez l'app autrement, ajustez `NUXT_SPOTIFY_REDIRECT_URI` en conséquence et déclarez exactement la même URL dans le dashboard. Au premier clic, Spotify vous demande l'autorisation (scope `playlist-modify-private` uniquement) ; les playlists créées sont privées. Le jeton utilisateur est conservé en mémoire côté serveur : un redémarrage du serveur demande une nouvelle connexion.
- Sans identifiants, l'application fonctionne normalement, sans pochettes ni genres Spotify sur les fiches artistes.
- En Development Mode, le propriétaire doit disposer de Spotify Premium, et Spotify applique des limites d'accès et de [quota](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
- `NUXT_SPOTIFY_MARKET` (par défaut `FR`) est un code pays ISO 3166-1 alpha-2 configurable.
- L'export d'historique de l'année reste la seule source des statistiques d'écoute. Hors import, Spotify n'est interrogé que lors de l'affichage du détail d'un titre, du slide « titre n°1 » et de la fiche d'un artiste, uniquement avec le nom du titre et de l'artiste (une seule recherche, avec le seul nom de l'artiste, pour une fiche artiste) : jamais d'historique, de dates ni de durées. À l'import, Spotify est aussi interrogé pour les genres des artistes (voir la section Genres) et pour les artistes crédités sur les titres tagués « feat./ft. » ou portant une mention entre parenthèses ou crochets (voir la section Featurings) ; seuls ces genres et ces crédits d'artistes sont stockés, dans l'historique archivé sur l'appareil. Les pochettes et les genres affichés sur les fiches ne sont pas stockés.
- Les pochettes affichées sont liées à l'album sur Spotify et accompagnées du logo Spotify, conformément aux [Design Guidelines](https://developer.spotify.com/documentation/design) et aux conditions d'utilisation ; voir aussi le [schéma OpenAPI](https://developer.spotify.com/reference/web-api/open-api-schema.yaml). Il n'y a aucune garantie de couverture complète.

#### Genres

Le champ `genres` de l'API Spotify est **déprécié** : Spotify peut cesser de le renvoyer à tout moment, sans préavis. De plus, la [politique Spotify](https://developer.spotify.com/policy) restreint l'utilisation des données de son API pour calculer des statistiques dérivées : cette fonctionnalité vise donc les projets personnels, à vos risques et périls.

Pour les nouveaux imports, les genres sont récupérés lors de l'import via la recherche d'artistes de l'API Spotify (correspondance exacte de nom uniquement), pour tous les artistes non couverts par le catalogue administrateur — seuls les noms d'artistes sont envoyés, jamais d'historique, de dates ni de durées. Les artistes sans correspondance exacte, ceux dont le champ `genres` est absent ou vide, ainsi que les imports sans identifiants Spotify configurés obtiennent des genres vides. Les genres des historiques déjà archivés sont conservés tels quels.

Le catalogue administrateur conserve la priorité sur Spotify, y compris pour les désactivations explicites :

```env
NUXT_HISTORY_GENRES='{"Artist":{"genres":["indie"],"tracks":{"Song":["dream pop"]}}}'
```

Les genres d'un titre (`tracks`) priment sur ceux de l'artiste (`genres`) ; un tableau vide désactive les genres sans repli sur Spotify. Pour les artistes et titres absents du catalogue, les genres Spotify de l'artiste sont utilisés en repli. Quand aucun genre n'est disponible, les pages de genres affichent un message d'absence d'information.

#### Featurings

L'export Spotify ne crédite que l'artiste principal dans `artistName` : les artistes invités n'apparaissent que dans le nom du titre, par exemple `All I Need (feat. Beth Hirsch)`. Pour les nouveaux imports, les titres dont le nom porte une mention « feat. »/« ft. » ou une parenthèse/un crochet — c'est sous cette forme que les collaborations multi-artistes non taguées apparaissent dans les exports, par exemple `Guns for Hire (from the series Arcane League of Legends)`, crédité Woodkid, Arcane et League of Legends — sont résolus une seule fois par couple artiste/titre lors de l'import, via la recherche de titres de l'API Spotify — seuls les noms du titre et de l'artiste sont envoyés, jamais d'historique, de dates ni de durées. La correspondance tolère les différences de ponctuation entre le titre de l'export et le titre canonique Spotify, ainsi que les mentions « (feat. …) » absentes du titre canonique. Les titres sans aucun indice de collaboration ne sont jamais résolus : c'est un compromis coût/quota (la recherche Spotify prend environ une seconde par requête), et les collaborations non taguées sans parenthèse (par exemple `Under Pressure`) restent créditées au seul artiste principal.

Chaque écoute compte alors intégralement pour tous les artistes crédités, sans répartition du temps d'écoute : l'artiste invité apparaît dans les classements d'artistes et sa fiche détaille les titres sur lesquels il est crédité. Les titres sans correspondance exacte conservent le crédit du seul artiste principal, tout comme les historiques déjà archivés : un nouvel import est nécessaire pour appliquer la résolution aux années déjà importées. Les genres ne sont pas récupérés pour les artistes invités, et sans identifiants Spotify configurés aucune résolution n'est tentée.

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
