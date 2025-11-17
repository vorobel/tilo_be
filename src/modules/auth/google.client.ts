import {OAuth2Client} from "google-auth-library";
import {generateState} from "./oauth.state.js";
import {oauthStateCookie} from "../../config/cookies.js";

export const google = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

export function getGoogleAuthUrl(res: any) {
    const state = generateState();

    res.cookie("oauth_state", state, oauthStateCookie);

    const scopes = [
        'openid',
        'profile',
        'email',
    ];

    return google.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state
    })
}