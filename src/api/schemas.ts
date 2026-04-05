import { z } from 'zod';

export const createPaginationSchema = <T extends z.ZodType>(resultSchema: T) =>
    z.object({
        page: z.number(),
        size: z.number(),
        total_items: z.number(),
        total_pages: z.number(),
        result: z.array(resultSchema),
    });

export const UserMinimalSchema = z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string(),
    active: z.boolean(),
    is_admin: z.boolean(),
});
export const RoleMinimalSchema = z.object({
    id: z.string(),
    name: z.string(),
});


export const UserPrincipal = z.object({
    id: z.string(),
    full_name: z.string(),
    email: z.string(),
    is_admin: z.boolean(),
    roles: z.array(RoleMinimalSchema),
});

export type UserPrincipal = z.infer<typeof UserPrincipal>;