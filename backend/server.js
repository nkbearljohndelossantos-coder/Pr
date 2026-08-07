// Hostinger Phusion Passenger / Node.js Production Entry Point
const app = require('./src/app');
const env = require('./src/config/env');

const PORT = process.env.PORT || env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Enterprise ERP Server listening on port ${PORT}`);
  });
}

module.exports = app;
