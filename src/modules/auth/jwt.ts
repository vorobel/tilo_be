import jwt from 'jsonwebtoken';
import type { JwtPayload } from "./jwt.types.js";

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';

export function signAccessToken(userId: number) {
    return jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: ACCESS_TOKEN_TTL }
    )
}

export function signRefreshToken(userId: number) {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: REFRESH_TOKEN_TTL }
    )
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN!) as JwtPayload;
}