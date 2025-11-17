import { z } from 'zod';

export const RegistrationSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const GoogleAuthSchema = z.object({
    idToken: z.string().min(1),
})

export const FacebookAuthSchema = z.object({
    accessToken: z.string().min(1),
})