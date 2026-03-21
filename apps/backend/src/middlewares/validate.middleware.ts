import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ApiError } from '../utils/api_error'

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const validationError = new ApiError(
                'Validation failed', 
                400, 
                // result.error.flatten() // On passe les détails ici
            );
            
            return next(validationError); 
        }

        req.body = result.data; 
        next();
    };
};