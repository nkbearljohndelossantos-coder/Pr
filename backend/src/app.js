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
app.use(compression({
  filter: (req, res) => {
    if (req.path && req.path.includes('employees')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiter for API Endpoints
app.use('/api', globalRateLimiter);

// Serve File Uploads Static Folder across all candidate locations
const uploadCandidateDirs = [
  env.UPLOAD_DIR,
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../../uploads'),
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'public/uploads'),
  path.join(process.cwd(), 'backend/uploads'),
  path.join(process.cwd(), 'backend/public/uploads'),
  path.join(process.cwd(), 'backend/src/uploads'),
  path.join(process.cwd(), 'dist/uploads')
];

uploadCandidateDirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    app.use('/uploads', express.static(dir));
  } catch (e) {}
});

// Auto-sync existing uploaded files across all candidate upload directories on startup
try {
  uploadCandidateDirs.forEach(srcDir => {
    if (fs.existsSync(srcDir)) {
      const files = fs.readdirSync(srcDir);
      files.forEach(file => {
        const srcPath = path.join(srcDir, file);
        if (fs.statSync(srcPath).isFile()) {
          uploadCandidateDirs.forEach(destDir => {
            const destPath = path.join(destDir, file);
            if (!fs.existsSync(destPath)) {
              try { fs.copyFileSync(srcPath, destPath); } catch (e) {}
            }
          });
        }
      });
    }
  });
} catch (e) {}

// Universal Fail-Safe Route for Upload Files (eliminates 404 on any upload file)
app.get('/uploads/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const possiblePaths = [
    path.join(env.UPLOAD_DIR, safeFilename),
    path.join(__dirname, '../uploads', safeFilename),
    path.join(__dirname, '../../uploads', safeFilename),
    path.join(process.cwd(), 'uploads', safeFilename),
    path.join(process.cwd(), 'public', 'uploads', safeFilename),
    path.join(process.cwd(), 'backend', 'uploads', safeFilename),
    path.join(process.cwd(), 'backend', 'public', 'uploads', safeFilename),
    path.join(process.cwd(), 'backend', 'src', 'uploads', safeFilename),
    path.join(process.cwd(), 'dist', 'uploads', safeFilename)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }

  return res.status(404).json({ success: false, message: `Upload file '${safeFilename}' not found on server.` });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/system', systemRoutes);

// Canteen & Employees Integration Direct Route Aliases
app.get(['/api/canteen/employees', '/api/employees'], (req, res, next) => {
  const { employeeController } = require('./controllers/systemControllers');
  employeeController.list(req, res, next);
});

// Module Registry Route
app.get('/api/modules', (req, res) => {
  return res.json({ success: true, data: MODULE_REGISTRY });
});

// Explicit Favicon Handler
app.get(['/favicon.ico', '/favicon.svg'], (req, res) => {
  const possibleFavicons = [
    path.resolve(__dirname, '../public', req.path.replace('/', '')),
    path.resolve(__dirname, '..', req.path.replace('/', '')),
    path.resolve(__dirname, '../../frontend/dist', req.path.replace('/', '')),
    path.resolve(process.cwd(), req.path.replace('/', ''))
  ];

  for (const favPath of possibleFavicons) {
    if (fs.existsSync(favPath)) {
      return res.sendFile(favPath);
    }
  }
  return res.status(204).end();
});

// Explicit /assets Static Handler with Strict JS/CSS MIME Types
const possibleAssetDirs = [
  path.resolve(__dirname, '../public/assets'),
  path.resolve(__dirname, '../assets'),
  path.resolve(__dirname, '../../frontend/dist/assets'),
  path.resolve(process.cwd(), 'public/assets'),
  path.resolve(process.cwd(), 'assets'),
  path.resolve(process.cwd(), 'frontend/dist/assets')
];

for (const assetDir of possibleAssetDirs) {
  if (fs.existsSync(assetDir)) {
    app.use('/assets', express.static(assetDir, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        }
      }
    }));
  }
}

// Serve Static Root Assets
const possibleStaticDirs = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd())
];

for (const dir of possibleStaticDirs) {
  if (fs.existsSync(dir)) {
    app.use(express.static(dir));
  }
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

// Robust SPA Client Route Fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/api-docs')) {
    return next();
  }

  // Block serving HTML index.html for missing assets or static files
  if (req.path.startsWith('/assets') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json)$/i)) {
    return res.status(404).type('text/plain').send('Static asset not found');
  }

  const possibleIndexPaths = [
    path.resolve(__dirname, '../public/index.html'),
    path.resolve(__dirname, '../index.html'),
    path.resolve(__dirname, '../../frontend/dist/index.html'),
    path.resolve(process.cwd(), 'index.html')
  ];

  for (const indexPath of possibleIndexPaths) {
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(indexPath);
    }
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
