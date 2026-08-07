const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const env = require('./config/env');
const logger = require('./utils/logger');
const globalErrorHandler = require('./middlewares/errorHandler');
const { globalRateLimiter } = require('./middlewares/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const systemRoutes = require('./routes/systemRoutes');
const { MODULE_REGISTRY } = require('./modules/moduleRegistry');

const app = express();

// Security & Optimization Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiter for API Endpoints
app.use('/api', globalRateLimiter);

// Serve File Uploads Static Folder
app.use('/uploads', express.static(env.UPLOAD_DIR));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/system', systemRoutes);

// Module Registry Route
app.get('/api/modules', (req, res) => {
  return res.json({ success: true, data: MODULE_REGISTRY });
});

// Explicit Favicon Handler to prevent 404 / 503 errors
app.get(['/favicon.ico', '/favicon.svg'], (req, res) => {
  const distFavicon = path.join(__dirname, '../../frontend/dist', req.path);
  const publicFavicon = path.join(__dirname, '../../frontend/public', req.path);
  if (fs.existsSync(distFavicon)) {
    return res.sendFile(distFavicon);
  } else if (fs.existsSync(publicFavicon)) {
    return res.sendFile(publicFavicon);
  }
  return res.status(204).end();
});

// Frontend SPA Distribution Static File Serving
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// System Status API Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: env.COMPANY_NAME,
    message: 'Enterprise ERP Platform API Gateway is Active.',
    docs: '/api-docs'
  });
});

// Fallback Route Handler: Serve SPA index.html for Frontend Routes or System Gateway Info
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/api-docs')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({
    status: 'ONLINE',
    system: env.COMPANY_NAME,
    message: 'Enterprise ERP Platform API Gateway is Active.',
    docs: '/api-docs'
  });
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
