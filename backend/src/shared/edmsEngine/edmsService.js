const crypto = require('crypto');
const logger = require('../../utils/logger');
const { StorageFactory } = require('../../infrastructure/storage/storageProvider');

class EnterpriseDocumentManagementService {
  constructor() {
    this.storage = StorageFactory.getProvider('local');
  }

  calculateSha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async processUpload(file, entityType, entityId, accountUuid) {
    const fileHash = this.calculateSha256(file.buffer || Buffer.from(file.filename));
    const storageResult = await this.storage.uploadFile(file);

    const mediaRecord = {
      id: crypto.randomUUID(),
      original_filename: file.originalname || file.filename,
      stored_filename: storageResult.filename,
      file_path: storageResult.url,
      mime_type: file.mimetype || 'application/octet-stream',
      file_size: file.size || 0,
      sha256_hash: fileHash,
      uploaded_by: accountUuid,
      uploaded_at: new Date().toISOString(),
      version_number: 1,
      is_deleted: 0
    };

    const linkRecord = {
      id: crypto.randomUUID(),
      media_id: mediaRecord.id,
      entity_type: entityType,
      entity_id: entityId,
      created_at: new Date().toISOString()
    };

    logger.info(`[EDMS] Processed file '${mediaRecord.original_filename}' (${mediaRecord.id}) for ${entityType}:${entityId}`);
    return { mediaRecord, linkRecord };
  }

  generateQrVerificationUrl(documentNumber) {
    return `https://erp.company.com/verify/doc/${documentNumber}`;
  }
}

const edmsService = new EnterpriseDocumentManagementService();
module.exports = edmsService;
