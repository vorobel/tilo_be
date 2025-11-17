import type { Request, Response } from 'express';
import {AuthService} from "./auth.service.js";
import {RegistrationSchema, LoginSchema} from "./auth.types.js";
import { signAccessToken, signRefreshToken } from "./jwt.js";
import {cookieOption} from "../../config/cookies.js";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const data = RegistrationSchema.parse(req.body);

            const user = await AuthService.registerWithCredentials(
                data.email,
                data.name,
                data.password
            );

            const accessToken = signAccessToken(user.id);
            const refreshToken = signRefreshToken(user.id);

            res.cookie("refresh_token", refreshToken, cookieOption);

            res.json({
                user,
                accessToken,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(400).json({ error: 'Unknown error' });
            }
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const data = LoginSchema.parse(req.body);

            const user = await AuthService.loginWithCredentials(
                data.email,
                data.password
            );

            const accessToken = signAccessToken(user.id);
            const refreshToken = signRefreshToken(user.id);

            res.cookie("refresh_token", refreshToken, cookieOption);

            res.json({
                user,
                accessToken,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(400).json({ error: 'Unknown error' });
            }
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const token = req.cookies?.refresh_token;

            if (!token) {
                return res.status(401).json({ error: 'No refresh token provided' });
            }

            const payload = await import('./jwt.js')
                .then(m => m.verifyRefreshToken(token));

            const accessToken = signAccessToken(payload.userId);
            const newRefreshToken = signRefreshToken(payload.userId);

            res.cookie("refresh_token", newRefreshToken, cookieOption);

            return res.json({ accessToken });
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(400).json({ error: 'Unknown error' });
            }
        }
    }
}