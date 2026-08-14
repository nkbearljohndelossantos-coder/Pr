const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const primaryUploadDir = env.UPLOAD_DIR;

// List of all candidate public and static upload directories on Hostinger & local environments
const allUploadDirs = [
  primaryUploadDir,
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../../uploads'),
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'public/uploads'),
  path.join(process.cwd(), 'backend/uploads'),
  path.join(process.cwd(), 'backend/public/uploads'),
  path.join(process.cwd(), 'dist/uploads')
];

allUploadDirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, primaryUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = (file.originalname || 'file').replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

// Fail-safe uploader with 50MB file size limit to prevent file rejection or drops
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Helper middleware to mirror newly uploaded files across all candidate upload folders (prevents 404 on Hostinger static web servers)
const mirrorUploadedFiles = (req, res, next) => {
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      if (file && file.path && fs.existsSync(file.path)) {
        allUploadDirs.forEach(targetDir => {
          try {
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            const destPath = path.join(targetDir, file.filename);
            if (file.path !== destPath && !fs.existsSync(destPath)) {
              fs.copyFileSync(file.path, destPath);
            }
          } catch (e) {}
        });
      }
    });
  }
  next();
};

module.exports = {
  upload,
  mirrorUploadedFiles,
  allUploadDirs
};
