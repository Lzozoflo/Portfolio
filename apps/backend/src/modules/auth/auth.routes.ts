import { Router } from 'express';

import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

import { authController } from './auth.controller';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { errorHandler } from '../../middlewares/error_handler.middleware';

export const authRouter = Router();
authRouter.post('/register', validate(RegisterSchema), errorHandler(authController.register));
authRouter.post('/login', validate(LoginSchema), errorHandler(authController.login));
authRouter.get('/me', authMiddleware, errorHandler(authController.me));
