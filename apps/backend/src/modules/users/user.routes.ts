import { Router } from 'express';

export const usersRouter = Router();

// TODO: brancher userController + validate
usersRouter.get('/', (_req, res) => res.json({ data: [] }));
