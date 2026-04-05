import { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastify from 'fastify';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from './infrastructure/mikro-orm/mikro-orm.config.js';
import { userRoutes } from './api/users/routers.js';
import { roleRoutes } from './api/roles/routers.js';
import { authRoutes } from './api/auth/routers.js';
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { CoreException } from './api/exceptions.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import { env } from './config/index.js';

const app = fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
}).withTypeProvider<ZodTypeProvider>();

export const setupApp = async () => {
  const orm = await MikroORM.init(config);

  // Expose ORM globally if needed
  app.decorate('orm', orm);

  // JWT configuration
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '1d',
      algorithm: 'HS512',
    },
  });

  // Request-scoped context for MikroORM
  app.addHook('onRequest', (request, reply, done) => {
    RequestContext.create(orm.em, done);
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  if (env.NODE_ENV === 'dev') {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'Zeus Authority',
          description: 'Gerenciamento de usuários e permissões',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      transform: jsonSchemaTransform,
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
    });
  }

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  app.setErrorHandler((error, _, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(422).send({
        details: {
          type: error.name,
          message: error.message,
          issues: error.validation,
        },
      });
    }

    if (error instanceof CoreException) {
      return reply.status(error.statusCode).send({ message: error.message })
    }

    console.error(error);

    return reply.status(500).send({ message: 'Internal server error.' })
  });

  // User routes
  await app.register(userRoutes, { prefix: '/users', });

  // Role routes
  await app.register(roleRoutes, { prefix: '/roles' });

  // Auth routes
  await app.register(authRoutes, { prefix: '/auth', });

  return app;
};
