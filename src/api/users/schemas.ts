import { Collection } from '@mikro-orm/core';
import { z } from 'zod';
import { IRole } from '../../infrastructure/mikro-orm/index.js';

export const UserQuerySchema = z.object({
    page: z.coerce.number().optional().default(1),
    size: z.coerce.number().optional().default(10),
    ording: z.string().optional(),
    email: z.email().optional(),
    active: z.coerce.boolean().optional(),
    full_name_contains: z.string().optional(),
});

export const UserCreateSchema = z.object({
    full_name: z.string().min(2).max(256),
    email: z.email().max(256),
    password: z.string()
        .min(8)
        .regex(/[A-Z]/, { message: "missing uppercase letter" })
        .regex(/[a-z]/, { message: "missing lowercase letter" })
        .regex(/[0-9]/, { message: "missing digit" })
        .regex(/[^A-Za-z0-9]/, { message: "missing special character" }),
    active: z.boolean().optional().default(true),
    is_admin: z.boolean().optional().default(false),
    role_ids: z.array(z.uuid()).optional(),
});

export const UserUpdateSchema = z.object({
    full_name: z.string().min(2).max(256).optional(),
    email: z.email().max(256).optional(),
    active: z.boolean().optional(),
    is_admin: z.boolean().optional(),
    role_ids: z.array(z.uuid()).optional(),
});

export const UserSchema = z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string(),
    active: z.boolean(),
    is_admin: z.boolean(),
    roles: z.transform((input: Collection<IRole>) => input.getItems().map((role) => ({
        id: role.id,
        name: role.name,
    }))),
});
