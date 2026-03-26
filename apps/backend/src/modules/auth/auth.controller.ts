import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../../lib/prisma';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api_error';
import { type RegisterDto, type LoginDto, type TwoFactorCodeDto, TwoFactorCodeSchema } from './auth.schema';

const SALT_ROUNDS = 12;
const JWT_EXPIRES = '7d';

const signToken = (payload: { sub: string; email: string; role: string }) =>
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRES });

export const authController = {
    register: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { email, username, password } = req.body as RegisterDto;

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existing) {
            return next(new ApiError('Email or username already in use', 409));
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: { email, username, password: hashed/*, TwoFactorEnable: true*/ },
            select: { id: true, email: true, username: true, role: true }
        });
        const token = signToken({ sub: user.id, email: user.email, role: user.role });

        res.status(201);
        res.locals.data = { user, token };
        next();
    },


    login: async (req: AuthRequest, res: Response, next: NextFunction) => {

        const { email, password } = req.body as LoginDto;
        console.log("login:", email);
        const user = await prisma.user.findUnique({ where: { email } });
        console.log("user:", user)

        if (!user ||!(await bcrypt.compare(password, user.password))) {
            console.log("error ?")
            return next(new ApiError('Invalid credentials', 401));
        }

        console.log("before user")
        // si 2FA est activée on ne donne pas le token JWT tout de suite
        if (user.twoFactorEnabled) {
            res.status(200);
            res.locals.data = {
                requires2FA: true,
                userId: user.id,
                message: 'Veuillez entrer votre code 2FA'
            };
            return next();
        }

        // Si pas de 2FA login normal
        const token = signToken({ sub: user.id, email: user.email, role: user.role });
        res.status(200);
        res.locals.data = {
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
            token
        };
        next();
    },

    // Vérification du code TOTP
    verify2FALogin: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { userId, code } = req.body as { userId: string; code: string };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user ||!user.twoFactorSecret) {
            return next(new ApiError('User or 2FA secret not found', 404));
        }

        // Vérification avec otplib v13
        const result = await verify({ token: code, secret: user.twoFactorSecret });
        if (!result.valid) {
            return next(new ApiError('Code 2FA invalide', 401));
        }

        const token = signToken({ sub: user.id, email: user.email, role: user.role });
        res.status(200);
        res.locals.data = {
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
            token
        };
        next();
    },

    setup2FA: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const payload = req.user as jwt.JwtPayload;
        const user = await prisma.user.findUnique({ where: { id: payload.sub! } });

        if (!user) return next(new ApiError('User not found', 404));

        const secret = generateSecret();
        const uri = generateURI({ secret, label: user.email, issuer: 'PortfolioApp' });
        const qrCodeDataUrl = await QRCode.toDataURL(uri);

        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret }
        });

        res.status(200);
        res.locals.data = { qrCode: qrCodeDataUrl, secret };
        next();
    },

    enable2FA: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const payload = req.user as jwt.JwtPayload;
        const { code } = req.body as TwoFactorCodeDto;

        const user = await prisma.user.findUnique({ where: { id: payload.sub! } });
        if (!user ||!user.twoFactorSecret) return next(new ApiError('Setup not started', 400));

        const result = await verify({ token: code, secret: user.twoFactorSecret });
        if (!result.valid) return next(new ApiError('Code invalide', 401));

        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: true }
        });

        res.status(200);
        res.locals.data = { message: '2FA activée avec succès' };
        next();
    },

    me: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const payload = req.user as jwt.JwtPayload;
        const user = await prisma.user.findUnique({
            where: { id: payload.sub! },
            select: { id: true, email: true, username: true, role: true, createdAt: true }
        });

        if (!user) return next(new ApiError('User not found', 404));

        res.status(200);
        res.locals.data = user;
        next();
    }

};