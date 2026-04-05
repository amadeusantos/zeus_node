import { defineConfig } from '@mikro-orm/postgresql';
import { User, Role } from './entities/index.js';
import { env } from '../../config/index.js';

export default defineConfig({
  entities: [User, Role],
  dbName: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  debug: env.NODE_ENV === 'dev',
});
