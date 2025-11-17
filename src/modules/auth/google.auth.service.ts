import {google} from "./google.client.js";

export async function getGoogleProfile(code: string) {
    const { tokens } = await google.getToken(code);
    google.setCredentials(tokens);

    const ticket = await google.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();

    if (!payload) throw new Error('Invalid Google token provided.');

    return {
        googleId: payload.sub!,
        email: payload.email!,
        name: payload.name || '',
        picture: payload.picture || '',
    }
}