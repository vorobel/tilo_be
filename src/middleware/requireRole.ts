import type {RequestHandler} from "express";
import type {UserRole} from '@prisma/client';
import {prisma} from "../infra/database.js";

export function requireRole(requiredRole: UserRole): RequestHandler {
    return async (req, res, next) => {
        if(!req.userId) {
            return res.status(401).send('Unauthorized');
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, role: true }
        })

        if (!user) {
            return res.status(401).send('User not found');
        }

        if (user.role !== requiredRole) {
            return res.status(403).send('Forbidden');
        }

        return next();
    }
}