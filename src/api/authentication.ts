import { FastifyRequest } from 'fastify';
import { ForbiddenException, NotAuthenticatedException, TokenInvalidException } from './exceptions.js';
import { RequestContext } from '@mikro-orm/core';
import { User } from '../infrastructure/mikro-orm/index.js';
import { UserPrincipal } from './schemas.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    userPrincipal: UserPrincipal;
  }
}

export async function authenticated(request: FastifyRequest) {
  try {
    await request.jwtVerify();
    const em = RequestContext.getEntityManager()!;
    const user = await em.findOne(User, { id: request.user.sub, active: true }, { populate: ['roles'] });
    if (!user) {
      throw new NotAuthenticatedException();
    }

    request.userPrincipal = UserPrincipal.parse({
      ...user,
      roles: user.roles.getItems().filter(role => role.active).map(role => ({ id: role.id, name: role.name })),
    });
  } catch (error: any) {
    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      throw new NotAuthenticatedException();
    }
    throw new TokenInvalidException();
  }
}

export function authorization(is_admin: boolean) {
  return async (request: FastifyRequest) => {
    await authenticated(request);
    if (is_admin && !request.userPrincipal.is_admin) {
      throw new ForbiddenException();
    }
  }
}