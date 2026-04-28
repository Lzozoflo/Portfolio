import { prisma } from '../../lib/prisma';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ApiError } from '../../utils/api_error';
import type { AddPosPlaneteDto } from './spacyGameTool.schema';


export const spacyGameToolController = {
    check: async (req: AuthRequest, res: Response, next: NextFunction) => {

        const { galaxie, system, planete } = req.body as AddPosPlaneteDto;
        console.log(galaxie, system, planete);
        // const existing = await prisma.user.findFirst({
        //     where: { OR: [{ email }, { username }] }
        // });

        // if (existing) {
        //     return next(new ApiError('Email or username already in use', 409));
        // }

        res.status(201).json({ success: true, message: 'woupi'});;
    },



};