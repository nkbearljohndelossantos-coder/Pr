const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const runAutoMigration = require('./scripts/migrate');

// Run automated Hostinger MySQL table provisioning on boot
runAutoMigration();

const server = app.listen(env.PORT, () => {
  logger.info(`Enterprise ERP API Server running on port ${env.PORT} in [${env.NODE_ENV}] mode.`);
  logger.info(`OpenAPI Swagger documentation available at http://localhost:${env.PORT}/api-docs`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down gracefully...', err);
  server.close(() => process.exit(1));
});
