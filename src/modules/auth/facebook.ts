import {oauthStateCookie} from "../../config/cookies.js";
import {generateState} from "./oauth.state.js";

export interface FacebookProfile {
    facebookId: string;
    email: string | null;
    name: string | null;
    picture: string | null;
}

export function getFacebookAuthUrl(res: any) {
    const state = generateState();
    res.cookie("oauth_state", state, oauthStateCookie);

    const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
        response_type: 'code',
        scope: 'email,public_profile',
        state
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeFacebookCodeForToken(code: string) {
    const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');

    url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!);
    url.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!);
    url.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!);
    url.searchParams.set('code', code);

    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error('Invalid Facebook OAuth code');
    }
    return res.json();
}

export async function verifyFacebookAccessToken(accessToken: string): Promise<FacebookProfile> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error("Facebook app credentials not set");
    }

    const debugUrl =
        `https://graph.facebook.com/debug_token?` +
        `input_token=${accessToken}&access_token=${appId}|${appSecret}`;

    const debugRes = await fetch(debugUrl);
    if (!debugRes.ok) {
        const errText = await debugRes.text();
        throw new Error(`Facebook debug_token failed: ${errText}`);
    }

    const debugData = await debugRes.json();

    if (!debugData?.data?.is_valid) {
        throw new Error("Invalid Facebook Token");
    }

    const userId = debugData.data.user_id;
    if (!userId) {
        throw new Error("Invalid Facebook User ID");
    }

    const userUrl =
        `https://graph.facebook.com/${userId}` +
        `?fields=id,name,email,picture.type(large)` +
        `&access_token=${accessToken}`;

    const userRes = await fetch(userUrl);
    if (!userRes.ok) {
        const errText = await userRes.text();
        throw new Error(`Failed to fetch Facebook user profile: ${errText}`);
    }

    const userData = await userRes.json();

    return {
        facebookId: userData.id,
        email: userData.email ?? null,
        name: userData.name ?? null,
        picture: userData.picture?.data?.url ?? null,
    };
}