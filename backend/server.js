// Hostinger Phusion Passenger / Node.js Production Entry Point
const app = require('./src/app');
const env = require('./src/config/env');

const PORT = process.env.PORT || env.PORT || 5000;

if (!app.get('server_started')) {
  app.set('server_started', true);

  if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    app.listen('passenger');
  } else {
    app.listen(PORT, () => {
      console.log(`🚀 Enterprise ERP Server listening on port ${PORT}`);
    });
  }
}

module.exports = app;
