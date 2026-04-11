import {
    RegisterSchema, 
    LoginSchema, 
    TwoFactorCodeSchema, 
    Verify2FALoginSchema }  from    './auth.schema';
import { Router }           from    'express';
import { authMiddleware }   from    '../../middlewares/auth.middleware';
import { asyncCatcher }     from    '../../middlewares/async_catcher.middleware';
import { autoFormatter }    from    '../../middlewares/auto_formatter.middleware';
import { errorHandler }     from    '../../middlewares/error_handler.middleware';
import { validate }         from    '../../middlewares/validate.middleware';
import { authController }   from    './auth.controller';

export const authRouter = Router();

// (publique)
authRouter.post('/register', validate(RegisterSchema), asyncCatcher(authController.register));
authRouter.post('/login', validate(LoginSchema), asyncCatcher(authController.login));
authRouter.post('/verify-2fa-login', validate(Verify2FALoginSchema), asyncCatcher(authController.verify2FALogin));

authRouter.use(autoFormatter);
authRouter.use(errorHandler);

authRouter.get('/me', authMiddleware, asyncCatcher(authController.me));

// Configuration (protégée)
authRouter.get('/2fa/setup', authMiddleware, asyncCatcher(authController.setup2FA));
authRouter.post('/2fa/enable', authMiddleware, validate(TwoFactorCodeSchema), asyncCatcher(authController.enable2FA));
