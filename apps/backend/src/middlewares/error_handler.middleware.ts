import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api_error';

export const errorHandler = ( err: unknown, req: Request,res: Response, next: NextFunction ): void => {
    
    // console.error("errorHandler: ",err);
    if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
        return;
    }
    console.error("not ApiError");
    res.status(500).json({ error: 'Internal server error' });
};