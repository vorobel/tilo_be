import {OAuth2Client} from "google-auth-library";
import {config} from "../../config/env.js";

export const google = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

export function getGoogleAuthUrl() {
    const scopes = [
        'openid',
        'profile',
        'email',
    ];

    return google.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    })
}