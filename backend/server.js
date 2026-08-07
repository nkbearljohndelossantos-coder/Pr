// Hostinger Phusion Passenger / OpenLiteSpeed Entry Point
const app = require('./src/app');
require('./src/server');

module.exports = app;
