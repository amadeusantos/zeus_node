import { z } from 'zod';

export const AuthenticateSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export const TokenSchema = z.object({
    expires_in: z.int(),
    token_type: z.string(),
    access_token: z.string(),
});

