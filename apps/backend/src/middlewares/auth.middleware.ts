import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET!);
        
        // req.user = jwt.verify(token, process.env.JWT_SECRET!, {
        //     algorithms: ['HS256']
        // });
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
