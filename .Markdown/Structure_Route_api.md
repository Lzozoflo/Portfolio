# Structure de l’API – Backend

## 🚪 Point d’entrée : `/api`

Les requêtes vers `/api` sont d’abord gérées par **Nginx** avec la configuration suivante :

```nginx
location /api/ { 
  proxy_pass http://backend:3000; 
}
```

* `backend` correspond au **service Docker** dans le réseau Docker
* Le trafic est redirigé vers le port **3000**
* Les requêtes arrivent ensuite dans : `apps/backend/app.ts`

---

## 🔐 Sécurité globale (middlewares)

Avant d’atteindre les routes, plusieurs middlewares sont appliqués :

```ts
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
```

### Détail des middlewares

* **helmet()** : ajoute des headers de sécurité (XSS, clickjacking, etc.)
* **cors()** : autorise les requêtes cross-origin
* **rateLimit()** : limite à 100 requêtes / 15 minutes par IP
* **express.json()** : parse le JSON entrant (`req.body`)

---

## 🌐 Routes publiques

### Healthcheck

```ts
app.get('/api/health', ((_req, res) =>
  res.json({ ok: true })));
```

* Endpoint : `/api/health`
* Permet de vérifier que le service fonctionne

---

### Authentification

```ts
app.use('/api/auth', authRouter);
```

Contient généralement :

* `POST /register` → création de compte
* `POST /login` → connexion
* `GET /me` → récupérer l’utilisateur courant

---

## 🔒 Routes protégées

```ts
app.use('/api', authMiddleware);
```

* Toutes les routes définies après passent par ce middleware

### authMiddleware

* Vérifie la présence d’un token JWT
* Vérifie sa validité
* Refuse l’accès si invalide

---

## 📁 Organisation des modules

Dossier : `/backend/src/modules/`

```
routes.ts
schema.ts
controller.ts
repository.ts
```

### Détail

* **routes.ts** → définit les URLs + middlewares
* **schema.ts** → validation des données (Zod)
* **controller.ts** → logique métier, gestion req/res
* **repository.ts** → accès base de données (Prisma)

---

## 🧠 Résumé

1. Nginx redirige `/api` vers le backend
2. Middlewares globaux sécurisent l’app
3. Routes publiques (`/health`, `/auth`)
4. Auth obligatoire pour les routes suivantes...
