const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const { globalRateLimiter } = require('./middlewares/rateLimiter');
const globalErrorHandler = require('./middlewares/errorHandler');
const { loadModules, getModules } = require('./core/modules/moduleLoader');
const scheduler = require('./infrastructure/scheduler/scheduler');
const { successResponse } = require('./utils/response');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const systemRoutes = require('./routes/systemRoutes');
const rulesRoutes = require('./routes/rulesRoutes');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(env.UPLOAD_DIR));
app.use('/api', globalRateLimiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Version 1 Endpoint Prefix (/api/v1/)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/rules', rulesRoutes);

// Backwards compatibility mounts for /api/
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/system', systemRoutes);

app.get('/api/v1/modules', (req, res) => {
  return successResponse(res, 'ERP Pluggable Modules List.', getModules());
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', version: 'v1.0.0', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// Load modules & initialize cron scheduler
loadModules(app);
scheduler.initDefaultTasks();

app.use(globalErrorHandler);

module.exports = app;
