import type { Request, Response, NextFunction } from "express";
import {verifyAccessToken} from "../modules/auth/jwt.js";

export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            error: 'No token'
        });
    }

    const token = header.replace('Bearer ', '');

    try {
        const payload = verifyAccessToken(token);

        req.userId = payload.userId;

        next();
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'Unknown error' });
        }
    }
}