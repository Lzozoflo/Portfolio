import { Router } from 'express';

export const postsRouter = Router();

// TODO: implémenter le module posts
postsRouter.get('/', (_req, res) => res.json({ data: [] }));
