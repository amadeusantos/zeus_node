import z from "zod"

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('production'),
    DB_NAME: z.string().nonempty(),
    DB_USER: z.string().nonempty(),
    DB_PASSWORD: z.string().nonempty(),
    DB_HOST: z.string().nonempty(),
    DB_PORT: z.coerce.number().default(5432),
    DB_POOL_SIZE: z.coerce.number().default(5),
    JWT_SECRET: z.string().nonempty(),
    ARGON2_SALT_LENGTH: z.coerce.number().int().positive().default(16),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    console.error('Invalid environment variables', _env.error.issues)

    throw new Error('Invalid environment variables')
}

export const env = _env.data;