import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AuthenticateSchema, TokenSchema } from './schemas.js';
import { RequestContext } from '@mikro-orm/core';
import { User } from '../../infrastructure/mikro-orm/entities/user.entity.js';
import argon2 from 'argon2';
import { InvalidCredentialsException } from './exceptions.js';
import { UserInactiveException } from '../exceptions.js';

import { authenticated } from '../authentication.js';
import { UserPrincipal } from '../schemas.js';


export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post('/authenticate', {
    schema: {
      tags: ['auth'],
      body: AuthenticateSchema,
      response: { 200: TokenSchema }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    const em = RequestContext.getEntityManager()!;
    const user = await em.findOne(User, { email });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (!user.active) {
      throw new UserInactiveException();
    }


    const token = await reply.jwtSign({
      sub: user.id,
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400,
    };
  });

  app.get('/authenticated', { schema: { tags: ['auth'], security: [{ bearerAuth: [] }], response: { 200: UserPrincipal } }, preHandler: [authenticated] }, async (request, reply) => {
    return request.userPrincipal;
  });

};
