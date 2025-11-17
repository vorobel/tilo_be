import { prisma } from '../../infra/database.js';
import { hash, verify } from '@node-rs/argon2';
import type {GoogleProfile} from "./google.js";
import {AuthProviderType} from '@prisma/client';
import type {FacebookProfile} from "./facebook.js";

export async function registerWithCredentials(email: string, name: string, password: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { providers: true },
    });

    if (existingUser) {
        const alreadyHasCreds = existingUser.providers.some(
            (p) => p.provider === 'CREDENTIALS'
        );

        if (alreadyHasCreds) {
            throw new Error('User with this email already exists.');
        }

        const passwordHash = await hash(password);

        await prisma.authProvider.create({
            data: {
                provider: 'CREDENTIALS',
                passwordHash,
                userId: existingUser.id,
            },
        });

        return existingUser;
    }

    const passwordHash = await hash(password);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            providers: {
                create: {
                    provider: 'CREDENTIALS',
                    passwordHash,
                },
            },
        },
        include: {
            providers: true,
        },
    });

    return user;
}

export async function loginWithCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { providers: true },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const provider = user.providers.find(
        (p) => p.provider === 'CREDENTIALS'
    );

    if (!provider || !provider.passwordHash) {
        throw new Error(
            'This account does not have a password. Try sign in with Google or Facebook.'
        );
    }

    const isValid = await verify(provider.passwordHash, password);

    if (!isValid) {
        throw new Error('Invalid email or password');
    }

    return user;
}

export async function loginWithGoogle(profile: GoogleProfile) {
    const { googleId, email, name, picture } = profile;

    const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { providers: true },
    });

    if (existingUser) {
        const hasGoogle = existingUser.providers.some(
            (p) =>
                p.provider === AuthProviderType.GOOGLE &&
                p.providerUserId === googleId,
        );

        if (!hasGoogle) {
            await prisma.authProvider.create({
                data: {
                    provider: AuthProviderType.GOOGLE,
                    providerUserId: googleId,
                    userId: existingUser.id,
                }
            })
        }

        const user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                name: existingUser.name || name,
                avatarUrl: existingUser.avatarUrl || picture,
            },
            include: { providers: true },
        });

        return user;
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            avatarUrl: picture,
            providers: {
                create: {
                    provider: AuthProviderType.GOOGLE,
                    providerUserId: googleId,
                }
            }
        },
        include: { providers: true },
    });

    return user;
}

export async function loginWithFacebook(profile: FacebookProfile) {
    const { facebookId, email, name, picture } = profile;

    const normalizedEmail = email ?? `fb_${facebookId}@facebook.local`;

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { providers: true }
    });

    if (existingUser) {
        const hasFacebook = existingUser.providers.some(
            (p) =>
                p.provider === AuthProviderType.FACEBOOK &&
                p.providerUserId === facebookId,

        );

        if (!hasFacebook) {
            await prisma.authProvider.create({
                data: {
                    provider: AuthProviderType.FACEBOOK,
                    providerUserId: facebookId,
                    userId: existingUser.id,
                }
            })
        }

        const user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                name: existingUser.name || name || '',
                avatarUrl: existingUser.avatarUrl
                    ? existingUser.avatarUrl
                    : picture
                        ? picture
                        : null,
            },
            include: { providers: true },
        });

        return user;
    }

    const user = await prisma.user.create({
        data: {
            email: normalizedEmail,
            name: name || '',
            avatarUrl: picture,
            providers: {
                create: {
                    provider: AuthProviderType.FACEBOOK,
                    providerUserId: facebookId,
                }
            }
        },
        include: { providers: true },
    });

    return user;
}

