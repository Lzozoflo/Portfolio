import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

import type { Response , NextFunction } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api_error'; 


import type { RegisterDto, LoginDto } from './auth.schema';

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
            data: { email, username, password: hashed },
            select: { id: true, email: true, username: true, role: true }
        });

        const token = signToken({ sub: user.id, email: user.email, role: user.role });

        // On stocke et on passe au formateur
        res.status(201);
        res.locals.data = { user, token };
        next();
    },

    login: async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { email, password } = req.body as LoginDto;
        
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return next(new ApiError('Invalid Email', 401));
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return next(new ApiError('Invalid password', 401));
        }

        const token = signToken({ sub: user.id, email: user.email, role: user.role });
        
        res.locals.data = {
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
            token
        };
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

