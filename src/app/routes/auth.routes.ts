import { Router } from "express";
import {
    register,
    login,
    googleAuth,
    facebookAuth,
    refresh,
    logout
} from "../../modules/auth/auth.controller.js";
import { getGoogleAuthUrl } from "../../modules/auth/google.client.js";
import { getGoogleProfile } from "../../modules/auth/google.auth.service.js";
import { getFacebookAuthUrl, exchangeFacebookCodeForToken, verifyFacebookAccessToken } from "../../modules/auth/facebook.js";
import { loginWithGoogle, loginWithFacebook } from "../../modules/auth/auth.service.js";
import { signAccessToken, signRefreshToken } from "../../modules/auth/jwt.js";
import { cookieOption } from "../../config/cookies.js";

export const authRouter: Router = Router();

/* --------------------------
 * Credentials Auth
 * -------------------------- */
authRouter.post("/register", register);
authRouter.post("/login", login);

/* --------------------------
 * Refresh & Logout
 * -------------------------- */
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

/* --------------------------
 * Google OAuth — URL
 * front: open returned url in new tab
 * -------------------------- */
authRouter.get("/google/url", (req, res) => {
    const url = getGoogleAuthUrl(res);
    res.json({ url });
});

/* --------------------------
 * Google OAuth — callback
 * -------------------------- */
authRouter.get("/google/callback", async (req, res) => {
    try {
        const { code, state } = req.query;

        const storedState = req.cookies.oauth_state;
        if (!state || state !== storedState) {
            return res.status(400).json({ error: "Invalid or missing state" });
        }

        res.clearCookie("oauth_state");

        const profile = await getGoogleProfile(code as string);
        const user = await loginWithGoogle(profile);

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        res.cookie("refresh_token", refreshToken, cookieOption);
        return res.json({ user, accessToken });
    } catch (err) {
        res.status(400).json({ error: "Google OAuth failed" });
    }
});


/* --------------------------
 * Facebook OAuth — URL
 * -------------------------- */
authRouter.get("/facebook/url", (req, res) => {
    const url = getFacebookAuthUrl(res);
    res.json({ url });
});

/* --------------------------
 * Facebook OAuth — callback
 * -------------------------- */
authRouter.get("/facebook/callback", async (req, res) => {
    try {
        const { code, state } = req.query;
        const storedState = req.cookies.oauth_state;

        if (!state || state !== storedState) {
            return res.status(400).json({ error: "Invalid or missing state" });
        }

        res.clearCookie("oauth_state");

        const tokenData = await exchangeFacebookCodeForToken(code as string);
        const fbProfile = await verifyFacebookAccessToken(tokenData.access_token);

        const user = await loginWithFacebook(fbProfile);

        const access = signAccessToken(user.id);
        const refresh = signRefreshToken(user.id);

        res.cookie("refresh_token", refresh, cookieOption);
        return res.json({ user, accessToken: access });
    } catch (err) {
        res.status(400).json({ error: "Facebook OAuth failed" });
    }
})
/* --------------------------
 * Facebook direct token auth (mobile apps)
 * -------------------------- */
authRouter.post("/facebook", facebookAuth);

/* --------------------------
 * Also allow old Google POST (mobile use case)
 * -------------------------- */
authRouter.post("/google", googleAuth);

