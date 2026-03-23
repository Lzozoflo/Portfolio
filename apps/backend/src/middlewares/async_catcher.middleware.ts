import { type Request, type Response, type NextFunction } from 'express';

export const asyncCatcher = (fn: (req: Request, res: Response, next: NextFunction) => void ) => 
    (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

// /**
//  * @openapi
//  * /users/{id}:
//  * get:
//  * description: Récupère un utilisateur par son ID
//  * parameters:
//  * - name: id
//  * in: path
//  * required: true
//  * schema:
//  * type: integer
//  */