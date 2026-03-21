import cors from 'cors';
import express from 'express';
import type { Request, Response, RequestHandler, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { authMiddleware } from './middlewares/auth.middleware';
import { autoFormatter } from './middlewares/auto_formatter.middleware';
import { errorHandler } from './middlewares/error_handler.middleware';

import { authRouter } from './modules/auth/auth.routes';
import { postsRouter } from './modules/posts/post.routes';
import { usersRouter } from './modules/users/user.routes';
import { ApiError } from './utils/api_error';

const app = express();
const PORT = 3000;

// ─── Sécurité globale ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());

// ─── Routes publiques ────────────────────────────────────────────────────────
app.get('/api/health', ((req: Request, res: Response) =>{
    res.json({ ok: true }); console.log("Called api/health")}) as RequestHandler);

app.use('/api/auth', authRouter);

// ─── Routes protégées ────────────────────────────────────────────────────────
app.use('/api', authMiddleware);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// ─── Middleware final ────────────────────────────────────────────────────────

app.use(autoFormatter);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));