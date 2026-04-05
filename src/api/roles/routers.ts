import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { RoleCreateSchema, RoleQuerySchema, RoleSchema, RoleUpdateSchema } from './schemas.js';
import { createPaginationSchema } from '../schemas.js';
import { pagination } from '../database.js';
import { IRole, Role } from '../../infrastructure/mikro-orm/entities/role.entity.js';
import { FilterQuery, RequestContext } from '@mikro-orm/core';
import { validateName } from './validations.js';
import { RoleNotFoundException } from './exceptions.js';
import z from 'zod';
import { authorization } from '../authentication.js';

export const roleRoutes: FastifyPluginAsyncZod = async (app) => {
  async function get_role_by_id(id: string) {
    const role = await RequestContext.getEntityManager()!.findOne(Role, { id });

    if (!role) {
      throw new RoleNotFoundException();
    }

    return role;
  }

  app.get('', { schema: { tags: ['roles'], querystring: RoleQuerySchema, security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 200: createPaginationSchema(RoleSchema) } } }, async (request, reply) => {
    const { page, size, ording, name, active } = request.query;

    const filters: FilterQuery<IRole> = {};

    if (name) {
      filters.name = name;
    }

    if (active !== undefined) {
      filters.active = active;
    }

    return pagination(Role, page, size, ording, filters);
  });

  app.post('', { schema: { tags: ['roles'], body: RoleCreateSchema, security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 201: RoleSchema } } }, async (request, reply) => {
    const { name, description, active } = request.body;

    await validateName(name);

    const em = RequestContext.getEntityManager()!;
    const role = em.create(Role, {
      name,
      description,
      active,
    });

    em.persist(role);
    await em.flush();

    return reply.status(201).send(role);
  });

  app.get('/:id', { schema: { tags: ['roles'], params: z.object({ id: z.uuid() }), security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 200: RoleSchema } } }, async (request, reply) => {
    const { id } = request.params;
    return await get_role_by_id(id);
  });

  app.patch('/:id', { schema: { tags: ['roles'], params: z.object({ id: z.uuid() }), body: RoleUpdateSchema, security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 200: RoleSchema } } }, async (request, reply) => {
    const { id } = request.params;
    const role = await get_role_by_id(id);
    const { name, ...updates } = request.body;

    if (name && name !== role.name) {
      await validateName(name);
      role.name = name;
    }

    Object.assign(role, updates);

    await RequestContext.getEntityManager()!.flush();

    return role;
  });

  app.delete('/:id', { schema: { tags: ['roles'], params: z.object({ id: z.uuid() }), security: [{ bearerAuth: [] }], preHandler: [authorization(true)], response: { 204: z.undefined() } } }, async (request, reply) => {
    const { id } = request.params;
    const role = await get_role_by_id(id);

    RequestContext.getEntityManager()!.remove(role);
    await RequestContext.getEntityManager()!.flush();

    return reply.status(204).send();
  });
};
