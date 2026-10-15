import { IUser, User } from '../../infrastructure/mikro-orm/entities/user.entity.js';
import { pagination } from '../database.js';
import { FilterQuery, RequestContext } from '@mikro-orm/core';
import { UserNotFoundException } from './exceptions.js';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UserCreateSchema, UserQuerySchema, UserSchema, UserUpdateSchema } from './schemas.js';
import { validateEmail } from './validations.js';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import z from 'zod';
import { createPaginationSchema, UserMinimalSchema } from '../schemas.js';
import { authorization } from '../authentication.js';
import { syncRoles } from './actions.js';
import { env } from '../../config/index.js';

export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  async function getUserById(id: string) {
    const user = await RequestContext.getEntityManager()!.findOne(User, { id }, { populate: ['roles'] });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  app.get('', { schema: { tags: ['users'], querystring: UserQuerySchema, security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 200: createPaginationSchema(UserMinimalSchema) } } }, async (request, reply) => {
    const { page,
      size,
      ording,
      email,
      active,
      full_name_contains } = request.query

    const filters: FilterQuery<IUser> = {};
    if (email) {
      filters.email = email;
    }

    if (active !== undefined) {
      filters.active = active;
    }

    if (full_name_contains) {
      filters.full_name = { $ilike: `%${full_name_contains}%` };
    }

    return pagination(User, page, size, ording, filters);
  });

  app.post('', { schema: { tags: ['users'], body: UserCreateSchema, security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 201: UserSchema } } }, async (request, reply) => {
    const { email, full_name, password, active, is_admin, role_ids } = request.body;

    await validateEmail(email);

    const hashedPassword = await argon2.hash(password, { salt: randomBytes(env.ARGON2_SALT_LENGTH) });

    const em = RequestContext.getEntityManager()!;
    const user = em.create(User, {
      email,
      full_name,
      active,
      is_admin,
      password: hashedPassword,
    });

    if (role_ids) {
      await syncRoles(user, role_ids);
    }

    em.persist(user);
    await em.flush();

    return reply.status(201).send(user);
  });

  app.get('/:id', { schema: { tags: ['users'], params: z.object({ id: z.uuid() }), security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 200: UserSchema } } }, async (request, reply) => {
    const { id } = request.params;
    return await getUserById(id)
  });

  app.patch('/:id', { schema: { tags: ['users'], params: z.object({ id: z.uuid() }), body: UserUpdateSchema, security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 200: UserSchema } } }, async (request, reply) => {
    const { id } = request.params;
    const user = await getUserById(id);
    const { email, role_ids, ...updates } = request.body;

    if (email && email !== user.email) {
      await validateEmail(email);
      user.email = email;
    }

    if (role_ids) {
      await syncRoles(user, role_ids);
    }

    Object.assign(user, updates);
    await RequestContext.getEntityManager()!.flush();

    return user;
  });

  app.delete('/:id', { schema: { tags: ['users'], params: z.object({ id: z.uuid() }), security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 204: z.undefined() } } }, async (request, reply) => {
    const { id } = request.params;
    const user = await getUserById(id);

    RequestContext.getEntityManager()!.remove(user);
    await RequestContext.getEntityManager()!.flush();
    return reply.status(204).send();
  });
};