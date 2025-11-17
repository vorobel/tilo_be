import type {RequestHandler} from "express";
import {prisma} from "../../infra/database.js";

export const getMe: RequestHandler = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
        }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
}