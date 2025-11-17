import type { RequestHandler } from 'express';
import {RegistrationSchema, LoginSchema, GoogleAuthSchema, FacebookAuthSchema} from './auth.types.js';
import {registerWithCredentials, loginWithCredentials, loginWithGoogle, loginWithFacebook} from './auth.service.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js';
import { cookieOption } from '../../config/cookies.js';
import {verifyGoogleToken} from "./google.js";
import {verifyFacebookAccessToken} from "./facebook.js";

export const register: RequestHandler = async (req, res) => {
    try {
        const data = RegistrationSchema.parse(req.body);

        const user = await registerWithCredentials(
            data.email,
            data.name,
            data.password,
        );

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        res.cookie('refresh_token', refreshToken, cookieOption);

        return res.json({
            user,
            accessToken,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: 'Unknown error' });
    }
};

export const login: RequestHandler = async (req, res) => {
    try {
        const data = LoginSchema.parse(req.body);

        const user = await loginWithCredentials(
            data.email,
            data.password,
        );

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        res.cookie('refresh_token', refreshToken, cookieOption);

        return res.json({
            user,
            accessToken,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: 'Unknown error' });
    }
};

export const googleAuth: RequestHandler = async (req, res) => {
    try {
        const { idToken } = GoogleAuthSchema.parse(req.body);
        const googleProfile = await verifyGoogleToken(idToken);

        if (!googleProfile.emailVerified) {
            return res.status(400).json({ error: 'Google email is not verified' });
        }

        const user = await loginWithGoogle(googleProfile);

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        res.cookie('refresh_token', refreshToken, cookieOption);

        return res.json({
            user,
            accessToken,
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: 'Unknown error' });
    }
}

export const facebookAuth: RequestHandler = async (req, res) => {
    try {
        const { accessToken } = FacebookAuthSchema.parse(req.body);

        const fbProfile = await verifyFacebookAccessToken(accessToken);
        const user = await loginWithFacebook(fbProfile);

        const access = signAccessToken(user.id);
        const refresh = signRefreshToken(user.id);

        res.cookie('refresh_token', refresh, cookieOption);

        return res.json({
            user,
            accessToken: access,
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: "Unknown error" });
    }
}

export const refresh: RequestHandler = async (req, res) => {
    try {
        const token = req.cookies?.refresh_token;

        if (!token) {
            return res.status(401).json({ error: 'No refresh token provided' });
        }

        const payload = verifyRefreshToken(token);

        const accessToken = signAccessToken(payload.userId);
        const newRefreshToken = signRefreshToken(payload.userId);

        res.cookie('refresh_token', newRefreshToken, cookieOption);

        return res.json({ accessToken });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(401).json({ error: err.message });
        }
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
};

export const logout: RequestHandler = async (req, res) => {
    res.clearCookie('refresh_token', {
        ...cookieOption,
        maxAge: 0
    });

    return res.json({ success: true });
}