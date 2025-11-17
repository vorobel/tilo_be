import { prisma } from '../../infra/database.js';
import { hash, verify } from '@node-rs/argon2';

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
