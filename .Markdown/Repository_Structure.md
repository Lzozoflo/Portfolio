# Repository Structure

## Structure de route /backend/src/modules/
```
    routes.ts     → "quelles URLs existent ?"
    schema.ts     → "quelles données j'accepte ?"
    controller.ts → "que faire avec la requête ?"
    repository.ts → "comment accéder aux données ?"
```
routes.ts — point d'entrée du module, définit les URLs et branche les middlewares
schema.ts — décrit et valide la forme des données (Zod)
controller.ts — reçoit req/res, orchestre, renvoie la réponse
repository.ts — parle à la BDD via Prisma (les requêtes SQL en gros)