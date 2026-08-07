const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

// Catch uncaught exceptions to prevent silent process crashes
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

if (!app.get('server_started')) {
  app.set('server_started', true);
  
  if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    app.listen('passenger');
  } else {
    const server = app.listen(PORT, HOST, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Enterprise ERP Backend Core Server Running on http://${HOST}:${PORT}`);
      logger.info(`📖 OpenAPI / Swagger Docs: http://${HOST}:${PORT}/api-docs`);
      logger.info(`🏥 Health Check Endpoint: http://${HOST}:${PORT}/api/system/health`);
      logger.info(`=======================================================`);
    });

    const handleShutdown = (signal) => {
      logger.info(`${signal} signal received. Closing Enterprise ERP Server gracefully...`);
      if (server && server.close) {
        server.close(() => {
          logger.info('HTTP server closed cleanly. Exiting process.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  }
}

module.exports = app;
