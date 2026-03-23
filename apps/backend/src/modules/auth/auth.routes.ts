import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

import { authController } from './auth.controller';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { asyncCatcher } from '../../middlewares/async_catcher.middleware';

export const authRouter = Router();
authRouter.post('/register', validate(RegisterSchema), asyncCatcher(authController.register));
authRouter.post('/login', validate(LoginSchema), asyncCatcher(authController.login));
authRouter.get('/me', authMiddleware, asyncCatcher(authController.me));
