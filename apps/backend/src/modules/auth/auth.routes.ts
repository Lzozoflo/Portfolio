import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

import { authController } from './auth.controller';
import { RegisterSchema, LoginSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', validate(RegisterSchema), authController.register);
authRouter.post('/login', validate(LoginSchema), authController.login);
authRouter.get('/me', authMiddleware, authController.me);
