// Hostinger Phusion Passenger / OpenLiteSpeed Production Entry Point
const app = require('./src/app');
const env = require('./src/config/env');

const PORT = process.env.PORT || env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

if (!app.get('server_started')) {
  app.set('server_started', true);

  if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    app.listen('passenger');
  } else {
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Enterprise ERP Server listening on http://${HOST}:${PORT}`);
    });
  }
}

module.exports = app;
