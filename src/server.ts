import 'reflect-metadata';
import { setupApp } from './app.js';

const start = async () => {
  try {
    const app = await setupApp();
    const port = Number(process.env.APP_PORT) || 3000;

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
