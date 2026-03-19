import cors from 'cors';
import express from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { authMiddleware } from './middlewares/auth.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { postsRouter } from './modules/posts/post.routes';
import { usersRouter } from './modules/users/user.routes';

const app = express();
const PORT = 3000;

// ─── Sécurité globale ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());

// ─── Routes publiques ────────────────────────────────────────────────────────
app.get('/api/health', ((_req: Request, res: Response) =>
    res.json({ ok: true })) as RequestHandler);

app.use('/api/auth', authRouter);

// ─── Routes protégées ────────────────────────────────────────────────────────
app.use('/api', authMiddleware);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
