# Structure de l'API – Backend

## 🚪 Point d'entrée : `/api`

Les requêtes vers `/api` sont d'abord gérées par **Nginx** :

```nginx
location /api/ {
  proxy_pass http://backend:3000;
}
```

- `backend` correspond au **service Docker** dans le réseau interne
- Le trafic est redirigé vers le port **3000**
- Les requêtes arrivent ensuite dans `apps/backend/src/app.ts`

---

## 🔐 Sécurité globale

Avant d'atteindre les routes, plusieurs middlewares sont appliqués dans l'ordre :

```ts
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
```

| Middleware       | Rôle                                              |
|------------------|---------------------------------------------------|
| `helmet()`       | Headers de sécurité (XSS, clickjacking, etc.)     |
| `cors()`         | Autorise les requêtes cross-origin                |
| `rateLimit()`    | Limite à 100 requêtes / 15 min par IP             |
| `express.json()` | Parse le body JSON entrant (`req.body`)           |

---

## 🌐 Routes publiques

### Healthcheck

```ts
app.get('/api/health', (_req, res) => res.json({ ok: true }));
```

### Authentification

```ts
app.use('/api/auth', authRouter);
```

| Méthode | Route              | Description               |
|---------|--------------------|---------------------------|
| POST    | `/api/auth/register` | Création de compte      |
| POST    | `/api/auth/login`    | Connexion               |
| GET     | `/api/auth/me`       | Utilisateur courant     |

---

## 🔒 Routes protégées

```ts
app.use('/api', authMiddleware);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
```

Toutes les routes déclarées **après** `authMiddleware` nécessitent un JWT valide.

**`authMiddleware`** :
- Vérifie la présence du header `Authorization: Bearer <token>`
- Vérifie la validité du JWT
- Injecte le payload dans `req.user` via `AuthRequest`
- Renvoie `401` si absent ou invalide

---

## 🏗️ Architecture d'un module

Chaque ressource suit la même structure :

```
modules/
└── [nom]/
    ├── [nom].schema.ts      → Validation Zod + types DTO
    ├── [nom].controller.ts  → Logique métier
    └── [nom].routes.ts      → Définition des routes
```

### Flux d'une requête
```
Request
  │
  ▼
routes.ts
  ├── validate(Schema)      → vérifie req.body via Zod → 400 si invalide
  ├── asyncCatcher(fn)      → capture les erreurs async → next(err)
  │
  ▼
controller.ts
  ├── logique métier
  ├── appelle repository
  ├── stocke dans res.locals.data    ← jamais res.json() ici
  ├── throw new ApiError(msg, status) si erreur métier
  └── appelle next()
  │
  ▼
autoFormatter (app.ts)            → envoie res.locals.data en JSON
```

---

## 📐 Contraintes architecturales

### schema.ts — Validation Zod
```ts
import { z } from 'zod';

export const XxxSchema = z.object({ ... });
export type XxxDto = z.infer<typeof XxxSchema>;
```

- Un schema par opération (Create, Update...)
- Les types DTO sont **toujours** inférés via `z.infer`
- Jamais de types écrits à la main pour les entrées

---

### controller.ts — Logique métier
```ts
export const xxxController = {
    getAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const data = await xxxTable.findAll();
        res.locals.data = data;        // 👍 toujours res.locals.data
        next();                        // 👍 toujours next()
    },

    create: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const existing = await xxxTable.findByX(req.body.x);
        if (existing) throw new ApiError('Already exists', 409);   // 👍 ApiError
        const item = await xxxTable.create(req.body);
        res.status(201);               // 👍 201 explicite pour les créations
        res.locals.data = item;
        next();
    },
};
```

**Règles strictes :**
- 👎 Jamais `res.json()` ou `res.send()` dans le controller
- 👎 Jamais `res.status(xxx).json(...)` manuel
- 👍 Données dans `res.locals.data`
- 👍 Erreurs via `throw new ApiError(message, status)`
- 👍 `res.status(201)` explicite pour les créations uniquement

---

### routes.ts — Définition des routes
```ts
import { asyncCatcher } from '../../lib/async_catcher';
import { validate } from '../../middlewares/validate.middleware';

export const xxxRouter = Router();

xxxRouter.get('/',    asyncCatcher(xxxController.getAll));
xxxRouter.get('/:id', asyncCatcher(xxxController.getById));
xxxRouter.post('/',   validate(XxxSchema), asyncCatcher(xxxController.create));
xxxRouter.patch('/:id', validate(XxxSchema), asyncCatcher(xxxController.update));
xxxRouter.delete('/:id', asyncCatcher(xxxController.delete));
```

**Règles :**
- Chaque handler est enveloppé par `asyncCatcher`
- `validate` est placé **avant** `asyncCatcher` sur les routes avec body

---

### asyncCatcher — Capture des erreurs async
```ts
// src/lib/async_catcher.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncCatcher = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
    (req, res, next) =>
        fn(req, res, next).catch(next);
```

- Évite les `try/catch` répétitifs dans chaque controller
- Toute erreur non gérée est transmise à `next(err)` → error handler global

---

### ApiError — Erreurs métier
```ts
// src/lib/api_error.ts
export class ApiError extends Error {
    constructor(
        public message: string,
        public status: number = 500
    ) {
        super(message);
        this.name = 'ApiError';
    }
}
```

Usage :
```ts
throw new ApiError('User not found', 404);
throw new ApiError('Email already in use', 409);
throw new ApiError('Forbidden', 403);
```

---

### autoFormatter — Envoi de la réponse
```ts
// src/middlewares/auto_formatter.middleware.ts
import type { Request, Response, NextFunction } from 'express';

export const autoFormatter = (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ data: res.locals.data ?? null });
};
```

Placé **en dernier** dans `app.ts`, après toutes les routes :
```ts
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use(autoFormatter);              // ← toujours en dernier
app.use(errorHandler);               // ← error handler après
```

---

### errorHandler — Gestion globale des erreurs
```ts
// src/middlewares/error_handler.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../lib/api_error';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};
```

---

## 🧠 Résumé du flux complet

```
Nginx → app.ts → middlewares globaux
                      │
                      ├── /api/health  → réponse directe
                      ├── /api/auth    → authRouter (public)
                      │
                      └── authMiddleware (JWT requis)
                              │
                              ├── /api/users → usersRouter
                              └── /api/posts → postsRouter
                                      │
                              routes.ts
                                      │
                              validate() → asyncCatcher()
                                      │
                              controller.ts
                              res.locals.data = ...
                              next()
                                      │
                              autoFormatter → res.json({ data })
                                      │
                              errorHandler  → res.json({ error })
```
