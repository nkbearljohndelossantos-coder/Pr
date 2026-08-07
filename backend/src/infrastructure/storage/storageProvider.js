const fs = require('fs');
const path = require('path');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class StorageProviderInterface {
  async uploadFile(file) { throw new Error('Not implemented'); }
  async getFilePath(filename) { throw new Error('Not implemented'); }
  async deleteFile(filename) { throw new Error('Not implemented'); }
}

class LocalStorageProvider extends StorageProviderInterface {
  constructor() {
    super();
    this.uploadDir = env.UPLOAD_DIR;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file) {
    logger.info(`[LocalStorage] File stored locally: ${file.filename}`);
    return {
      filename: file.filename,
      path: file.path,
      url: `/uploads/${file.filename}`,
      provider: 'local'
    };
  }

  async getFilePath(filename) {
    return path.join(this.uploadDir, filename);
  }

  async deleteFile(filename) {
    const fullPath = path.join(this.uploadDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info(`[LocalStorage] Deleted file: ${filename}`);
    }
  }
}

class S3StorageProvider extends StorageProviderInterface {
  async uploadFile(file) {
    logger.info(`[S3Storage] Simulated S3 upload for file: ${file.originalname}`);
    return { filename: file.filename, url: `https://s3.amazonaws.com/erp-bucket/${file.filename}`, provider: 's3' };
  }
}

class R2StorageProvider extends StorageProviderInterface {
  async uploadFile(file) {
    logger.info(`[R2Storage] Simulated Cloudflare R2 upload for file: ${file.originalname}`);
    return { filename: file.filename, url: `https://r2.cloudflare.com/erp-bucket/${file.filename}`, provider: 'r2' };
  }
}

class AzureBlobStorageProvider extends StorageProviderInterface {
  async uploadFile(file) {
    logger.info(`[AzureStorage] Simulated Azure Blob upload for file: ${file.originalname}`);
    return { filename: file.filename, url: `https://azureblob.core.windows.net/erp-container/${file.filename}`, provider: 'azure' };
  }
}

class StorageFactory {
  static getProvider(type = 'local') {
    switch (type.toLowerCase()) {
      case 's3': return new S3StorageProvider();
      case 'r2': return new R2StorageProvider();
      case 'azure': return new AzureBlobStorageProvider();
      case 'local':
      default:
        return new LocalStorageProvider();
    }
  }
}

module.exports = { StorageFactory, LocalStorageProvider };
