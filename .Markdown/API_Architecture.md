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

Avant d'atteindre les routes, quatre middlewares sont appliqués dans l'ordre :

```ts
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
```

| Middleware       | Rôle                                          |
|------------------|-----------------------------------------------|
| `helmet()`       | Headers de sécurité (XSS, clickjacking, etc.) |
| `cors()`         | Autorise les requêtes cross-origin             |
| `rateLimit()`    | Limite à 100 requêtes / 15 min par IP          |
| `express.json()` | Parse le body JSON entrant (`req.body`)        |

---

## 🌐 Routes publiques

### Healthcheck

```ts
app.get('/api/health', ((req: Request, res: Response) =>{console.log("Called api/health"); res.json({ ok: true });}) as RequestHandler);

```

### Authentification

```ts
app.use('/api/auth', authRouter);
```

| Méthode | Route                  | Middleware(s)              | Description           |
|---------|------------------------|----------------------------|-----------------------|
| POST    | `/api/auth/register`   | validate(RegisterSchema)   | Création de compte    |
| POST    | `/api/auth/login`      | validate(LoginSchema)      | Connexion             |
| GET     | `/api/auth/me`         | authMiddleware             | Utilisateur courant   |

---

## 🔒 Routes protégées

```ts
app.use('/api', authMiddleware);  // garde global sur tout /api
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
```

Toutes les routes déclarées **après** `authMiddleware` nécessitent un JWT valide.

**`authMiddleware`** (src/middlewares/auth.middleware.ts) :
- Vérifie la présence du header `Authorization: Bearer <token>`
- Vérifie la validité du JWT avec `process.env.JWT_SECRET`
- Injecte le payload dans `req.user` via l'interface `AuthRequest`
- Renvoie `401` si absent ou invalide

**`AuthRequest`** — pattern d'extension locale de `Request` :
```ts
export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}
```
À importer dans chaque controller/middleware qui consomme `req.user`.

---

## 🏗️ Architecture d'un module

Chaque ressource suit la même structure :

```
modules/
└── [nom]/
    ├── [nom].schema.ts      → Validation Zod + types DTO
    ├── [nom].controller.ts  → Logique métier
    ├── [nom].routes.ts      → Définition des routes
    └── [nom].repository.ts  → Accès BDD Prisma (optionnel si simple)
```

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
  ├── throw new ApiError(msg, status)   ← si erreur métier
  ├── res.status(xxx)                   ← toujours ajouter status pour un code homogène  
  ├── res.locals.data = result          ← TOUJOURS ici, jamais res.json()
  └── next()                            ← passe au middleware suivant
         │
         ▼
autoFormatter (app.ts, avant errorHandler)
  └── res.format({ json, xml })         → envoie res.locals.data selon Accept header
         │
         ▼
errorHandler (app.ts, en dernier)
  └── err instanceof ApiError → res.status(err.status).json({ error: err.message })
      sinon                   → res.status(500).json({ error: 'Internal server error' })
```

---

## 📐 Contraintes architecturales

### schema.ts — Validation Zod
```ts
import { z } from 'zod';

export const XxxSchema = z.object({ ... });
export type XxxDto = z.infer<typeof XxxSchema>;
```

- Un schema par opération (Create, Update, etc.)
- Les types DTO sont **toujours** inférés via `z.infer`
- Jamais de types écrits à la main pour les données entrantes

---

### controller.ts — Logique métier
```ts
export const xxxController = {
    getAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const data = await xxxRepository.findAll();
        res.locals.data = data;   // 👍 toujours res.locals.data
        next();                   // 👍 toujours next()
    },

    create: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const existing = await xxxRepository.findByX(req.body.x);
        if (existing) return next(new ApiError('Already exists', 409));  // 👍 ApiError
        const item = await xxxRepository.create(req.body);
        res.status(201);          // 👍 201 explicite pour tout les code meme 200
        res.locals.data = item;
        next();
    },
};
```

**Règles strictes :**
- 👎 Jamais `res.json()` ou `res.send()` dans le controller
- 👎 Jamais `res.status(xxx).json(...)` direct
- 👍 Données dans `res.locals.data`
- 👍 Erreurs via `return next(new ApiError(message, status))`
- 👍 `res.status(xxx)` toujours ajouter status pour un code homogène  

---

### routes.ts — Définition des routes
```ts
import { Router } from 'express';
import { asyncCatcher } from '../../middlewares/async_catcher.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { xxxController } from './xxx.controller';
import { XxxCreateSchema, XxxUpdateSchema } from './xxx.schema';

export const xxxRouter = Router();

xxxRouter.get('/',      asyncCatcher(xxxController.getAll));
xxxRouter.get('/:id',   asyncCatcher(xxxController.getById));
xxxRouter.post('/',     validate(XxxCreateSchema), asyncCatcher(xxxController.create));
xxxRouter.patch('/:id', validate(XxxUpdateSchema), asyncCatcher(xxxController.update));
xxxRouter.delete('/:id', asyncCatcher(xxxController.delete));
```

**Règles :**
- Chaque handler est enveloppé dans `asyncCatcher`
- `validate` est placé **avant** `asyncCatcher` sur les routes avec body

---

### asyncCatcher — Capture des erreurs async
```ts
// src/middlewares/async_catcher.middleware.ts
import { type Request, type Response, type NextFunction } from 'express';

export const asyncCatcher = (
    fn: (req: Request, res: Response, next: NextFunction) => void
) =>
    (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
```

- Évite les `try/catch` répétitifs dans chaque controller
- Toute exception non catchée remonte via `next(err)` vers `errorHandler`

---

### ApiError — Erreurs métier
```ts
// src/utils/api_error.ts
export class ApiError extends Error {
    constructor(public message: string, public status: number = 500) {
        super(message);
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
```

Usage :
```ts
return next(new ApiError('User not found', 404));
return next(new ApiError('Email already in use', 409));
return next(new ApiError('Forbidden', 403));
```

> **`Object.setPrototypeOf`** : nécessaire pour que `instanceof ApiError` fonctionne
> correctement après compilation TypeScript vers ES5/CommonJS.

---

### autoFormatter — Envoi de la réponse (content negotiation)
```ts
// src/middlewares/auto_formatter.middleware.ts
import * as js2xml from 'js2xmlparser';

export const autoFormatter = (req: Request, res: Response, next: NextFunction) => {
    const data = res.locals.data;
    if (!data) return next();   // rien à envoyer → passe au suivant

    res.format({
        'application/json': () => res.json(data),
        'application/xml':  () => res.type('xml').send(js2xml.parse('response', data)),
        'default':          () => res.status(406).send('Not Acceptable'),
    });
};
```

- Placé **avant** `errorHandler` dans `app.ts`
- Si `res.locals.data` est vide (route sans données à renvoyer), passe au suivant sans rien émettre
- Supporte JSON (par défaut) et XML via header `Accept: application/xml`

---

### errorHandler — Gestion globale des erreurs
```ts
// src/middlewares/error_handler.middleware.ts
export const errorHandler = (
    err: unknown, _req: Request, res: Response, _next: NextFunction
): void => {
    if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};
```

- **Toujours en dernier** dans `app.ts`
- Signature à 4 paramètres obligatoire pour qu'Express le reconnaisse comme error handler
- Distingue les erreurs métier (`ApiError`) des erreurs inattendues (500)

---

## 🧱 Ordre des middlewares dans `app.ts`

```ts
// ─── Sécurité globale ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(...));
app.use(rateLimit(...));
app.use(express.json());

// ─── Routes publiques ────────────────────────────────────────────────────────
app.get('/api/health', ...);
app.use('/api/auth', authRouter);

// ─── Routes protégées ────────────────────────────────────────────────────────
app.use('/api', authMiddleware);       // ← garde JWT global
// app.use('/api/users', usersRouter);
// app.use('/api/posts', postsRouter);

// ─── Middleware finaux (TOUJOURS EN DERNIER) ─────────────────────────────────
app.use(autoFormatter);   // ← envoie res.locals.data
app.use(errorHandler);    // ← gère les erreurs
```

---

## 🧠 Résumé du flux complet

```
Nginx → app.ts → middlewares globaux (helmet, cors, rateLimit, json)
                      │
                      ├── GET /api/health    → réponse directe {console.log("Called api/health"); res.json({ ok: true });}
                      │
                      ├── /api/auth          → authRouter (public)
                      │       ├── POST /register  → validate → asyncCatcher → controller
                      │       ├── POST /login     → validate → asyncCatcher → controller
                      │       └── GET  /me        → authMiddleware → asyncCatcher → controller
                      │
                      └── authMiddleware (vérifie JWT)
                              │
                              └── /api/xxx → xxxRouter
                                      │
                                 routes.ts
                                      │
                                 validate()      → next(ApiError 400) si invalide
                                 asyncCatcher()  → catch → next(err)
                                      │
                                 controller.ts
                                      ├── throw ApiError  → next(err)
                                      ├── res.locals.data = result
                                      └── next()
                                      │
                                 autoFormatter   → res.json(data) ou res.xml(data)
                                      │
                                 errorHandler    → res.json({ error }) si err instanceof ApiError
                                                → res.status(500) sinon
```
