export interface FacebookProfile {
    facebookId: string;
    email: string | null;
    name: string | null;
    picture: string | null;
}

export async function verifyFacebookAccessToken(accessToken: string): Promise<FacebookProfile> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error("Facebook app credentials not set");
    }

    const debugUrl =
        `https://graph.facebook.com/debug_token` +
        `input_token=${accessToken}&access_token=${appId}|${appSecret}`;

    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();

    if (!debugData || !debugData.data.is_valid) {
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
    const userData = await userRes.json();

    return {
        facebookId: userData.id,
        email: userData.email ?? null,
        name: userData.name ?? null,
        picture: userData.picture?.data?.url ?? null,
    }
}