import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/jwt.js';

export const authGuard: RequestHandler = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: 'No token' });
    }

    const token = header.replace('Bearer ', '');

    try {
        const payload = verifyAccessToken(token);
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};