// Hostinger Node.js Application Root Entry Point Fallback
const app = require('./backend/src/app');
const env = require('./backend/src/config/env');

const PORT = process.env.PORT || env.PORT || 5000;

if (!app.get('server_started')) {
  app.set('server_started', true);

  if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    app.listen('passenger');
  } else {
    app.listen(PORT, () => {
      console.log(`🚀 Enterprise ERP Root Server listening on port ${PORT}`);
    });
  }
}

module.exports = app;
