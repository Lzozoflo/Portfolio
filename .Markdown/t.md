# Contexte — Projet Portfolio (Production-Ready)

Tu es Lead Developer Fullstack et Expert DevOps.
Tu m'aides à construire un environnement de développement production-ready de A à Z.

---

## Stack technique

- **Langage** : TypeScript strict mode (front + back)
- **Backend** : Node.js + Express
- **Frontend** : React 19 + Vite 8 (plugin react-swc)
- **Style** : SCSS (sass installé, alias Vite configurés)
- **BDD** : PostgreSQL 17 via Prisma ORM 7 (configuré, migrations faites)
- **Infra** : Docker Compose + Nginx reverse proxy
- **Qualité** : ESLint 9 flat config, Prettier
- **Monorepo** : npm workspaces

---

## Structure du repo

```
Portfolio/
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   ├── tsconfig.json
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   │           ├── 20260320125511_start/
│   │           ├── 20260323082845_add_2fa/
│   │           └── 20260323084428_add_2fa_to_users/
│   │   └── src/
│   │       ├── app.ts
│   │       ├── lib/
│   │       │   └── prisma.ts
│   │       ├── middlewares/
│   │       │   ├── async_catcher.middleware.ts
│   │       │   ├── auth.middleware.ts
│   │       │   ├── auto_formatter.middleware.ts
│   │       │   ├── error_handler.middleware.ts
│   │       │   └── validate.middleware.ts
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   │   ├── auth.controller.ts
│   │       │   │   ├── auth.routes.ts
│   │       │   │   └── auth.schema.ts
│   │       │   ├── posts/
│   │       │   │   └── post.routes.ts     ← stub vide
│   │       │   └── users/
│   │       │       └── user.routes.ts     ← stub vide
│   │       └── utils/
│   │           └── api_error.ts
│   └── frontend/
│       ├── Dockerfile
│       ├── index.html
│       ├── main.tsx
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── App.tsx
│           ├── Component/
│           │   ├── Background/
│           │   │   ├── Background.tsx          ← animation matrix canvas
│           │   │   ├── BackgroundPortfolioInit.tsx  ← split bg static|matrix avec focus prop
│           │   │   └── BackgroundPortfolioInit.scss
│           │   └── Hr/
│           │       ├── Hr.tsx                  ← splitter resizable (row/column)
│           │       └── Hr.scss
│           ├── Route/
│           │   ├── Auth/
│           │   │   ├── Auth.tsx
│           │   │   ├── Auth.scss
│           │   │   └── Script/
│           │   │       ├── Login.tsx
│           │   │       ├── Register.tsx
│           │   │       ├── TwoFactorLogin.tsx
│           │   │       └── TwoFactorSetup.tsx
│           │   ├── ErrorRedir/
│           │   │   ├── ErrorRedir.tsx
│           │   │   └── ErrorRedir.scss
│           │   └── Portfolio/
│           │       ├── Portfolio.tsx
│           │       ├── Portfolio.scss
│           │       ├── Admin/
│           │       │   ├── Admin.tsx           ← stub (futur terminal)
│           │       │   └── Admin.scss
│           │       └── Inviter/
│           │           ├── Inviter.tsx
│           │           ├── Inviter.scss
│           │           ├── Nav/
│           │           │   ├── Nav.tsx
│           │           │   └── Nav.scss
│           │           └── Explorateur/
│           │               ├── Explorateur.tsx
│           │               ├── Explorateur.scss
│           │               └── ExplorateurItem/
│           │                   ├── ExplorateurItem.tsx
│           │                   └── ExplorateurItem.scss
│           ├── hooks/
│           │   ├── useClock.tsx
│           │   ├── useFetch.tsx
│           │   └── useIDB_tree.tsx             ← ✅ implémenté
│           ├── media/
│           │   └── bg.png
│           ├── style/
│           │   ├── index.scss
│           │   ├── _global.scss
│           │   ├── _mixin.scss
│           │   ├── _variable.scss
│           │   └── global/
│           │       └── _border.scss
│           └── types/
│               └── scss.d.ts
├── infra/
│   └── nginx/
│       ├── nginx.dev.conf
│       └── nginx.prod.conf
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts    ← ✅ FileNode + IDBNode définis
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── eslint.config.ts
├── Makefile
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── tsconfig.back.json
├── tsconfig.front.json
└── tsconfig.shared.json
```

---

## Règles d'architecture

**Monorepo npm workspaces** — le `package.json` racine déclare :
```json
{
  "workspaces": ["apps/backend", "apps/frontend", "packages/shared"]
}
```

**Package partagé** : `@portfolio/shared` — types TypeScript partagés front/back.

**Routing Nginx** :
```
/api/*  →  backend:3000
/*      →  frontend:5173 (dev) ou frontend:80 (prod)
```

**Docker** : context de build = racine du monorepo. Multi-stage Dockerfiles :
```
base → development   (ts-node-dev, hot-reload via volumes)
base → builder       (tsc / vite build)
     → production    (image légère sans devDeps)
```

**Commandes** :
```bash
make dev          # docker compose avec docker-compose.dev.yml, port 8080
make prod         # docker compose avec docker-compose.prod.yml, port 8080
make re           # fclean + relance dev
make logs-backend # logs d'un service
make studio       # lance Prisma Studio sur http://localhost:5555
make modeldb      # crée une migration Prisma (depuis le container)
```

---

## Conventions code

- **Fichiers** : snake_case (`user_controller.ts`)
- **Variables/fonctions** : camelCase
- **Classes/interfaces/types** : PascalCase
- **Constantes** : UPPER_SNAKE_CASE
- **CSS classes** : `ComponentName-element` (PascalCase-kebab-case)

## Conventions Git
Format : `type(scope): description`
Types : `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf`

---

## Backend — Architecture

### Flux d'une requête
```
Request
  │
  ▼
routes.ts
  ├── validate(Schema)       → safeParse req.body → next(ApiError 400) si invalide
  └── asyncCatcher(handler)  → capture les erreurs async → next(err)
         │
         ▼
controller.ts
  ├── logique métier
  ├── throw new ApiError(msg, status)
  ├── res.status(xxx)
  ├── res.locals.data = result          ← TOUJOURS ici, jamais res.json()
  └── next()
         │
         ▼
autoFormatter   → res.json(data) ou res.xml(data)
         │
         ▼
errorHandler    → res.json({ error }) si err instanceof ApiError
                → res.status(500) sinon
```

### Règles strictes controller
- 👎 Jamais `res.json()` ou `res.send()` dans le controller
- 👍 Données dans `res.locals.data`, puis `next()`
- 👍 Erreurs via `return next(new ApiError(message, status))`
- 👍 `res.status(xxx)` toujours explicite (même 200)

### Structure d'un module backend
```
modules/
└── xxx/
    ├── xxx.routes.ts      → URLs + middlewares
    ├── xxx.schema.ts      → validation Zod (types inférés via z.infer)
    ├── xxx.controller.ts  → logique métier, res.locals.data, next()
    └── xxx.repository.ts  → accès BDD Prisma (si logique complexe)
```

### Middlewares
| Middleware | Rôle |
|---|---|
| `helmet()` | Headers sécurité |
| `cors()` | Cross-origin |
| `rateLimit()` | 100 req/15min/IP |
| `express.json()` | Parse body |
| `authMiddleware` | Vérifie JWT, injecte `req.user` |
| `validate(Schema)` | Zod safeParse → ApiError 400 |
| `asyncCatcher(fn)` | Wrap async → next(err) |
| `autoFormatter` | Envoie res.locals.data en JSON ou XML |
| `errorHandler` | ApiError → status+json / sinon 500 |

### Ordre middlewares dans app.ts
```ts
app.use(helmet()); app.use(cors()); app.use(rateLimit()); app.use(express.json());
app.get('/api/health', ...);
app.use('/api/auth', authRouter);
app.use('/api', authMiddleware);  // garde JWT global
// app.use('/api/users', usersRouter);
// app.use('/api/posts', postsRouter);
app.use(autoFormatter);  // TOUJOURS avant errorHandler
app.use(errorHandler);   // TOUJOURS en dernier
```

---

## Backend — Fichiers clés (état actuel)

### `apps/backend/prisma/schema.prisma`
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" }

enum Role { USER ADMIN }

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  twoFactorSecret      String?
  twoFactorEnabled     Boolean  @default(false)
  twoFactorBackupCodes String[] @default([])

  @@map("users")
}
```

### `apps/backend/src/modules/auth/auth.routes.ts`
> ⚠️ **BUG CONNU** : `autoFormatter` et `errorHandler` sont déclarés dans `authRouter`
> au lieu d'être uniquement dans `app.ts`. Cela duplique le pipeline.
> À corriger : supprimer ces deux `use()` du router. Les routes `/me`, `2fa/setup`,
> `2fa/enable` déclarées APRÈS ces middlewares ne reçoivent donc pas la réponse
> via `autoFormatter` de `app.ts` mais via celui du router — comportement identique
> en pratique mais architecturalement incorrect.

```ts
// Publiques
authRouter.post('/register', validate(RegisterSchema), asyncCatcher(authController.register));
authRouter.post('/login',    validate(LoginSchema),    asyncCatcher(authController.login));
authRouter.post('/verify-2fa-login', validate(Verify2FALoginSchema), asyncCatcher(authController.verify2FALogin));

// ⚠️ BUG : ces deux lignes ne devraient pas être dans le router
authRouter.use(autoFormatter);
authRouter.use(errorHandler);

// Protégées
authRouter.get('/me',        authMiddleware, asyncCatcher(authController.me));
authRouter.get('/2fa/setup', authMiddleware, asyncCatcher(authController.setup2FA));
authRouter.post('/2fa/enable', authMiddleware, validate(TwoFactorCodeSchema), asyncCatcher(authController.enable2FA));
```

### Auth controller — endpoints implémentés
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | non | Inscription → retourne `{ user, token }` |
| POST | `/api/auth/login` | non | Login → `{ user, token }` ou `{ requires2FA, userId }` |
| POST | `/api/auth/verify-2fa-login` | non | Vérifie TOTP login → `{ user, token }` |
| GET | `/api/auth/me` | JWT | Utilisateur courant |
| GET | `/api/auth/2fa/setup` | JWT | Génère secret + QR code |
| POST | `/api/auth/2fa/enable` | JWT | Active 2FA après vérification code |

---

## Frontend — Architecture

### Alias Vite (`vite.config.ts`)
```ts
'FRONT': './src'
'COMP':  './src/Component'
'HOOKS': './src/hooks'
'STYLE': './src/style'
'MEDIA': './src/media'
```

> ⚠️ `MEDIA` est défini dans `vite.config.ts` mais **absent** des `paths` dans
> `tsconfig.json` — pas de typecheck sur les imports `MEDIA/*`.

### Alias TypeScript (`tsconfig.json` paths)
```json
"COMP/*":  ["./src/Component/*"],
"STYLE/*": ["./src/style/*"],
"FRONT/*": ["./src/*"],
"HOOKS/*": ["./src/hooks/*"],
"TOOL/*":  ["./src/tool/*"],
"@portfolio/shared": ["../../packages/shared/src/index.ts"]
```

### Routing React Router v7
```
/       → Portfolio
/auth   → Auth
/*      → ErrorRedir
```

### Hook useFetch
```ts
const repjson = await useFetch({
    url: '/api/auth/login',
    type_request: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }
});
```
Retourne `null` si erreur réseau. Retourne le JSON parsé sinon (même si status >= 400).

### Auth — Pattern enum de pages
```tsx
export enum authStep { CONNECTED, PAGE_LOGIN, PAGE_REGISTER, PAGE_2FA_LOGIN, PAGE_2FA_SETUP }
export interface AuthChildrenProps { setPage: (step: authStep) => void; }
```

### Composant Hr (splitter resizable)
```tsx
<Hr mode="row" min1={100} min2={100} initial={200} thickness={4}>
    <PannelGauche />
    <PannelDroit />
</Hr>
```
Accepte exactement 2 enfants, gère le drag avec ResizeObserver.

### BackgroundPortfolioInit
```tsx
<BackgroundPortfolioInit focus="both" />  // 50/50 static|matrix
<BackgroundPortfolioInit focus="left" />  // 100% static (mode Inviter)
<BackgroundPortfolioInit focus="right" /> // 100% matrix (mode Admin)
```

---

## Frontend — Mode Portfolio

### Trois modes utilisateur
```ts
type UserMode = 'init' | 'inviter' | 'admin';
```
- **`init`** : écran d'accueil, choix du mode (2 boutons)
- **`inviter`** : mode graphique — `Hr` avec `Explorateur` à gauche + zone display à droite
- **`admin`** : mode terminal (stub `<h1>Hello World</h1>`, à construire)

### Focus background selon le mode
```ts
if (mode === 'inviter') return 'left';   // 100% bg static
if (mode === 'admin')   return 'right';  // 100% matrix
return 'both';                           // 50/50 (init)
```

---

## Système de fichiers — Architecture IDB (implémenté)

### Types partagés — `packages/shared/src/index.ts`

```ts
// Vue mémoire — consommé par les composants graphiques (Explorateur)
export type FileNode = {
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
};

// Stockage plat IDB — une entrée par nœud
export type IDBNode = {
    path: string;        // clé primaire  ex: "/Portfolio/user/ReadMe.md"
    name: string;        // nom seul      ex: "ReadMe.md"
    type: 'file' | 'folder';
    data?: string;       // contenu texte (fichiers seulement)
    parentPath: string;  // ex: "/Portfolio/user/"  → index IDB by_parent
    createdAt: number;
    updatedAt: number;
};
```

### Hook `useIDB_tree` — `apps/frontend/src/hooks/useIDB_tree.tsx`

**Base IDB** :
- Nom : `IDB_tree` / Version : `1`
- ObjectStore : `tree` (keyPath: `"path"`)
- Index : `by_parent` sur `parentPath`

**Seed au premier chargement** :
- Si IDB vide → fetch GitHub API :
  `GET https://api.github.com/repos/Lzozoflo/Portfolio/git/trees/site_file?recursive=1`
- Filtre les entrées dont `item.path` commence par `'Portfolio/'`
- Convertit chaque blob en texte via `atob()` (base64 decode)
- Construit les `IDBNode` : `path = '/' + item.path + (dossier ? '/' : '')`
- `parentPath` = chemin parent calculé à partir du path
- Les nœuds racines de l'arbre graphique ont `parentPath === '/Portfolio/'`

**buildTree** : reconstruit `FileNode[]` depuis tous les `IDBNode[]`
- Nœuds dont `parentPath === '/Portfolio/'` → racines (premier niveau affiché)
- Connexion parent→enfant via `map.get(n.parentPath)?.children?.push(...)`

**API exposée** :
```ts
const {
    tree,          // FileNode[] — arbre reconstruit pour l'Explorateur
    loading,       // boolean
    error,         // string | null

    ls,            // (folderPath: string) → Promise<IDBNode[]>
    cat,           // (filePath: string)   → Promise<IDBNode | undefined>
    mkdir,         // (parentPath, name)   → Promise<void>
    touch,         // (parentPath, name)   → Promise<void>
    write,         // (filePath, data)     → Promise<void>
    rm,            // (path)               → Promise<void>  (récursif)
    resetDatabase, // ()                   → void  (supprime IDB + reload)
} = useIDB_tree();
```

**Flux Portfolio → Inviter** :
```ts
// Portfolio.tsx
const { tree, loading, error, ...crud } = useIDB_tree();

function hasUser(tree: FileNode[]): FileNode | undefined {
    return tree?.find(node => node.name === 'user/' && node.type === 'folder');
}

// Passe à Inviter :
<Inviter fileSystem={hasUser(tree)} crud={crud} />
```

### Schéma de chemins (convention)
```
/Portfolio/                        ← racine GitHub (invisible dans l'UI)
/Portfolio/user/                   ← dossier affiché comme racine dans l'Explorateur
/Portfolio/user/ReadMe.md          ← fichier
/Portfolio/user/Experience pro/    ← dossier
```
L'Explorateur est monté avec `pwd="/Portfolio/user/"`.

---

## Frontend — Composant Inviter (état actuel)

### Structure
```
Inviter
└── Hr (initial=335, min2=230)
    ├── [gauche] div.Explorateur-root
    │       ├── <Explorateur dir={fileSystem} pwd="/Portfolio/user/" displayOnScreen={...} />
    │       ├── fallback si fileSystem undefined
    │       └── <button> reset IDB
    └── [droite] div.display
            ├── div.nav-bar (40px, vide)
            └── div.display-file
                    └── <h1>Hi im Florent Cretin</h1>  ← placeholder
```

### Composant Explorateur
```tsx
<Explorateur
    dir={fileSystem}       // FileNode (le dossier user/)
    pwd="/Portfolio/user/"      // chemin courant (pour construire les clés)
    displayOnScreen={fn}   // callback quand un fichier est cliqué
/>
```
Gère `openFolders: { [key: string]: boolean }` pour le toggle des dossiers.

### Composant ExplorateurItem
Récursif. Props :
```ts
{ openFolders, toggle, node, pwd, depth, displayOnScreen }
```
> ⚠️ **BUG** : importe `FileNode` depuis `"FRONT/Route/Portfolio/Portfolio"` au lieu de
> `'@portfolio/shared'`. À corriger.

---

## Variables d'environnement (`.env`)
```env
NODE_ENV=development
DB_USER=postgres
DB_PASSWORD=CHANGE_ME_IN_PROD
DB_NAME=portfolio_dev
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
DATABASE_URL_STUDIO=postgresql://postgres:postgres@localhost:5432/portfolio_dev
JWT_SECRET=REPLACE_WITH_STRONG_SECRET_MIN_32_CHARS
CORS_ORIGIN=http://localhost:8080
```

---

## État actuel

### ✅ Fait
- Monorepo npm workspaces fonctionnel
- Docker multi-stage (dev + prod) opérationnel
- `make dev` / `make prod` fonctionnels sur port 8080
- ESLint 9 + Prettier configurés
- Prisma 7 configuré avec adapter-pg
- Migrations : table `users` + champs 2FA
- Auth complète (register ✅, login ✅, me ✅)
- 2FA TOTP complet (setup ✅, enable ✅, verify-login ✅)
- Middlewares : auth, validate, asyncCatcher, autoFormatter (JSON+XML), errorHandler
- SCSS configuré (sass, alias Vite + tsconfig paths)
- Prisma Studio via `make studio`
- Frontend routing React Router v7 (`/`, `/auth`, `/*`)
- Pages : Portfolio, Auth (Login + Register + TwoFactorLogin + TwoFactorSetup), ErrorRedir
- Composants : `Background` (matrix canvas), `BackgroundPortfolioInit` (split bg), `Hr` (splitter)
- Hooks : `useFetch`, `useClock`
- Portfolio : 3 modes (init, inviter, admin) + focus background selon mode
- Mode Inviter : `Explorateur` + `ExplorateurItem` (arbre avec toggle)
- `useIDB_tree` ✅ — hook complet (openDatabase, seed GitHub, buildTree, ls/cat/mkdir/touch/write/rm/resetDatabase)
- `packages/shared/src/index.ts` ✅ — `FileNode` + `IDBNode` définis et exportés
- Seed depuis GitHub API (`Lzozoflo/Portfolio`, branche `site_file`, dossier `Portfolio/`)

### ⚠️ Bugs connus
- `autoFormatter` et `errorHandler` dupliqués dans `authRouter` (à supprimer du router)
- `Background.tsx` : canvas non clippé au panneau matrix (overflow déborde sur tout le viewport)
- Alias `MEDIA` absent du `paths` de `tsconfig.json` (présent seulement dans `vite.config.ts`)

### 🔜 À faire (priorité)
1. **Mode Inviter — affichage de fichier** : au clic sur un fichier dans l'Explorateur,
   appeler `cat(pwd)` et afficher le contenu dans `div.display-file` (remplacer le `<h1>` placeholder)
2. **Mode Inviter — nav-bar** : implémenter les onglets (`Nav.tsx`) pour naviguer entre
   les fichiers ouverts (style éditeur de code)
3. **Mode Admin (terminal)** : parser de commandes bash-like dans `Admin.tsx` (`ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `mv`, `echo`, `clear`, `pwd`, `help`) en consommant directement `useIDB_tree` (les fonctions `ls`, `cat`, etc.)
4. **Fix bug authRouter** : supprimer `autoFormatter` et `errorHandler` du router auth
5. **Fix bug ExplorateurItem** : corriger l'import `FileNode` → `@portfolio/shared`
6. **Fix alias MEDIA** : ajouter `"MEDIA/*": ["./src/media/*"]` dans `tsconfig.json paths`
7. **Contenu portfolio** : peupler les fichiers du filesystem GitHub (`Portfolio/user/`) avec le vrai contenu CV/portfolio (texte, markdown)
8. Tests unitaires / intégration
9. Backup codes 2FA (prévu, non implémenté)

### ✋ Volontairement ignoré
- Husky + Commitlint + lint-staged (plus tard)
- `buildTree` : les nœuds racines sont détectés via `parentPath === '/Portfolio/'` — si la structure GitHub change, adapter ce critère