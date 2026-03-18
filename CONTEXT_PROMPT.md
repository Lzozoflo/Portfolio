# Contexte — Projet Portfolio (Production-Ready)

Tu es Lead Developer Fullstack et Expert DevOps. Tu m'aides à construire un environnement de développement production-ready de A à Z.

---

## Stack technique

- **Langage** : TypeScript strict mode (front + back)
- **Backend** : Node.js + Express
- **Frontend** : React + Vite
- **BDD** : PostgreSQL via Prisma ORM
- **Infra** : Docker Compose + Nginx reverse proxy
- **Qualité** : ESLint, Prettier, Husky, Conventional Commits, commitlint, lint-staged
- **Monorepo** : npm workspaces

---

## Structure du repo (état actuel sur le disque)

```
Portfolio/
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── prisma.config.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── app.ts
│   │       ├── config/
│   │       │   └── env.ts
│   │       ├── generated/prisma/     ← généré par Prisma, dans .gitignore
│   │       ├── lib/
│   │       │   └── prisma.ts
│   │       ├── middlewares/
│   │       │   ├── error.middleware.ts
│   │       │   └── security.middleware.ts
│   │       └── modules/
│   │           └── users/
│   │               ├── user.controller.ts
│   │               ├── user.repository.ts
│   │               ├── user.routes.ts
│   │               └── user.schema.ts
│   └── frontend/
│       ├── Dockerfile
│       ├── nginx.app.conf
│       └── src/
│           ├── hooks/
│           │   └── useUsers.ts
│           ├── lib/
│           │   └── api-client.ts
│           └── services/
│               └── user.service.ts
├── infra/
│   └── nginx/
│       └── nginx.conf
├── packages/
│   └── shared/
│       └── src/
│           ├── index.ts
│           ├── tsconfig.json
│           └── types/
│               ├── api.types.ts
│               └── user.types.ts
├── docker-compose.yml
├── Makefile
├── package.json
├── package-lock.json
└── ReadMe.md
```

---

## Règles d'architecture

**Monorepo npm workspaces** — le `package.json` racine déclare :
```json
{
  "workspaces": ["apps/backend", "apps/frontend", "packages/shared"]
}
```

**Package partagé** : `@portfolio/shared` — contient les types TypeScript partagés front/back. Il n'est PAS publié sur npm, il est résolu localement.

**Routing Nginx** (reverse proxy unique sur le port 80) :
```
/api/*  →  backend:3000
/*      →  frontend:5173 (dev) ou :80 (prod)
```

**Docker** : le `context` de build est toujours la **racine du monorepo** pour que les Dockerfiles puissent accéder à `packages/shared`. Dans `docker-compose.yml` :
```yaml
backend:
  build:
    context: .
    dockerfile: apps/backend/Dockerfile
frontend:
  build:
    context: .
    dockerfile: apps/frontend/Dockerfile
```

Les Dockerfiles copient le shared manuellement :
```dockerfile
COPY packages/shared ./packages/shared
COPY apps/backend/package*.json ./   # ou apps/frontend/
RUN npm ci
```

**`@portfolio/shared` côté frontend** : résolu via `tsconfig.json` paths, PAS via npm dependencies :
```json
{
  "compilerOptions": {
    "paths": {
      "@portfolio/shared": ["../../packages/shared/src/index.ts"]
    }
  }
}
```

---


## Conventions Git

Format : `type(scope): description`
Types autorisés : `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf`
Exemples :
- `feat(users): add create user endpoint`
- `fix(docker): set build context to monorepo root`
- `chore(deps): add tanstack query`

---

## Variables d'environnement (.env.example)

```env
NODE_ENV=development
DB_USER=postgres
DB_PASSWORD=CHANGE_ME
DB_NAME=portfolio_dev
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
JWT_SECRET=REPLACE_WITH_32_CHAR_MIN_SECRET
CORS_ORIGIN=http://localhost:5173
```

---

Reprends le contexte ci-dessus et continue à m'aider sur ce projet.
Comment part les package.json -> les dockerfile le reste minimum pour pouvoir faire un compose build avec un hello world react