import {OAuth2Client} from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleProfile {
    googleId: string;
    email: string;
    name: string;
    picture: string | null;
    emailVerified: boolean;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not set');
    }

    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
        throw new Error('Invalid Google token payload');
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? '',
        picture: payload.picture ?? null,
        emailVerified: payload.email_verified ?? false
    }
}