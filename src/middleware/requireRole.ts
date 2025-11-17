import type {RequestHandler} from "express";
import type {UserRole} from '@prisma/client';
import {prisma} from "../infra/database.js";

async function getUserRole(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true}
    });

    return user?.role ?? null;
}

export function requireAnyRole(allowedRoles: UserRole[]): RequestHandler {
    return async (req, res, next) => {
        if(!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const role = await getUserRole(req.userId);

        if (!role) {
            return res.status(401).json({ error: "User not found" });
        }

        if(!allowedRoles.includes(role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return next();
    }
}

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