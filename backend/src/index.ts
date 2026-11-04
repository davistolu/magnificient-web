import { createApp } from './app.js';
import { config } from './config/index.js';
import { runMigrations } from './database/migrate.js';
import { seedDatabase } from './database/seed.js';

async function bootstrap() {
  const app = createApp();

  // Run database migrations and seed if in dev mode
  try {
    await runMigrations();
    await seedDatabase();
  } catch (err) {
    console.warn('[Bootstrap] Database init warning (falling back to memory datastore):', (err as Error).message);
  }

  const server = app.listen(config.port, () => {
    console.log(`
===========================================================
  MAGNIFISCENT LUXURY COMMERCE PLATFORM - API READY
===========================================================
  Listening on:   http://localhost:${config.port}
  Health Check:   http://localhost:${config.port}/health
  Environment:    ${config.env}
  Concierge Desk: ${config.store.supportEmail}
===========================================================
    `);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Gracefully shutting down Magnificent API...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
  process.exit(1);
});
