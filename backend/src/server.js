const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 Enterprise ERP Backend Core Server Running on Port ${PORT}`);
  logger.info(`📖 OpenAPI / Swagger Docs: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check Endpoint: http://localhost:${PORT}/api/system/health`);
  logger.info(`=======================================================`);
});

// Graceful Shutdown Handlers
const handleShutdown = (signal) => {
  logger.info(`${signal} signal received. Closing Enterprise ERP Server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = server;
