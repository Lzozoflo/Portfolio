import bcrypt from 'bcrypt';
import { type Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../../lib/prisma';
import type { AuthRequest } from '../../middlewares/auth.middleware';

import type { RegisterDto, LoginDto } from './auth.schema';

const SALT_ROUNDS = 12;
const JWT_EXPIRES = '7d';

const signToken = (payload: { sub: string; email: string; role: string }) =>
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRES });

export const authController = {
    register: async (req: AuthRequest, res: Response) => {
        const { email, username, password } = req.body as RegisterDto;

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existing) {
            res.status(409).json({ error: 'Email or username already in use' });
            return;
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: { email, username, password: hashed },
            select: { id: true, email: true, username: true, role: true }
        });

        const token = signToken({ sub: user.id, email: user.email, role: user.role });
        res.status(201).json({ data: { user, token } });
    },

    login: async (req: AuthRequest, res: Response) => {
        const { email, password } = req.body as LoginDto;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = signToken({ sub: user.id, email: user.email, role: user.role });
        res.json({
            data: {
                user: { id: user.id, email: user.email, username: user.username, role: user.role },
                token
            }
        });
    },

    me: async (req: AuthRequest, res: Response) => {
        const payload = req.user as jwt.JwtPayload;
        const user = await prisma.user.findUnique({
            where: { id: payload.sub! },
            select: { id: true, email: true, username: true, role: true, createdAt: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ data: user });
    }
};
