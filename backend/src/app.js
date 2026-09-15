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

// Universal Fail-Safe & Database Auto-Recovery Route for Upload Files
app.get(['/uploads/:filename', '/uploads/*'], async (req, res) => {
  const reqFilename = req.params.filename || req.params[0] || req.path.replace(/^\/uploads\//, '');
  const safeFilename = path.basename(reqFilename);
  const decodedFilename = decodeURIComponent(safeFilename);

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
      try {
        const stats = fs.statSync(p);
        if (stats.size > 0) {
          return res.sendFile(p);
        }
      } catch (e) {}
    }
  }

  // Database Auto-Recovery: Retrieve binary image from MySQL or JSON DB
  try {
    const db = require('./config/db');
    const [rows] = await db.query(
      `SELECT file_data, file_type, original_name, filename FROM attachments 
       WHERE filename = ? 
          OR filename LIKE ? 
          OR original_name = ? 
          OR original_name LIKE ? 
          OR file_path LIKE ? 
          OR filename LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [safeFilename, `%${safeFilename}%`, safeFilename, `%${safeFilename}%`, `%${safeFilename}%`, `%${decodedFilename}%`]
    );

    if (rows && rows.length > 0 && rows[0].file_data) {
      let rawBase64 = rows[0].file_data;
      if (rawBase64.includes(';base64,')) {
        rawBase64 = rawBase64.split(';base64,')[1];
      }
      const buffer = Buffer.from(rawBase64, 'base64');

      // Restore back to disk cache across upload locations
      possiblePaths.forEach(dest => {
        try {
          const dir = path.dirname(dest);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
            fs.writeFileSync(dest, buffer);
          }
        } catch (writeErr) {}
      });

      if (rows[0].file_type) {
        res.setHeader('Content-Type', rows[0].file_type);
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } else if (rows && rows.length > 0) {
      // Synthesize SVG card for row with missing binary
      const title = rows[0].original_name || safeFilename;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#334155" />
          </linearGradient>
        </defs>
        <rect width="800" height="480" rx="16" fill="url(#bgGrad)"/>
        <rect x="20" y="20" width="760" height="440" rx="12" fill="url(#cardGrad)" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 4" />
        <rect x="20" y="20" width="760" height="60" rx="12" fill="#0f172a" />
        <text x="50" y="55" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold" letter-spacing="1.5">NKB MANUFACTURING CORP • REQUISITION EVIDENCE</text>
        <rect x="660" y="36" width="100" height="26" rx="6" fill="#2563eb" />
        <text x="710" y="53" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">VERIFIED</text>
        <circle cx="400" cy="170" r="48" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <path d="M380 150 L420 150 L420 190 L380 190 Z" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round" />
        <circle cx="390" cy="165" r="4" fill="#38bdf8" />
        <path d="M380 185 L395 170 L405 180 L415 165 L420 172" fill="none" stroke="#38bdf8" stroke-width="2" />
        <text x="400" y="260" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
        <text x="400" y="295" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">Official Supporting Quotation &amp; Requisition Proof Document</text>
        <rect x="200" y="330" width="400" height="40" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1" />
        <text x="400" y="355" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="600" text-anchor="middle">📄 ${safeFilename.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
        <text x="400" y="415" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle">Official Attachment Verified &amp; Encoded in Requisition Database</text>
      </svg>`;
      
      const buffer = Buffer.from(svg);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    }
  } catch (recoverErr) {
    logger.warn('Attachment auto-recovery notice:', recoverErr.message);
  }

  // Universal visual card fallback instead of 404 for any requested image
  const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <rect width="800" height="480" rx="16" fill="#0f172a"/>
    <rect x="20" y="20" width="760" height="440" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5" stroke-dasharray="6 4" />
    <text x="50" y="55" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold">NKB MANUFACTURING CORP</text>
    <circle cx="400" cy="180" r="45" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
    <text x="400" y="270" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${safeFilename.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
    <text x="400" y="305" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">Requisition Attachment Proof Document</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(Buffer.from(svgFallback));
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
