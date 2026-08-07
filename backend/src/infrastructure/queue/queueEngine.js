const logger = require('../../utils/logger');

class JobQueueEngine {
  constructor() {
    this.jobs = [];
    this.isProcessing = false;
  }

  async addJob(name, data, handler) {
    const job = { id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name, data, handler, createdAt: new Date() };
    this.jobs.push(job);
    logger.info(`[QueueEngine] Job '${name}' (${job.id}) queued.`);
    this.processNext();
    return job.id;
  }

  async processNext() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;

    const job = this.jobs.shift();
    try {
      logger.info(`[QueueEngine] Executing async background job '${job.name}' (${job.id})...`);
      if (job.handler) {
        await job.handler(job.data);
      }
      logger.info(`[QueueEngine] Job '${job.name}' (${job.id}) completed successfully.`);
    } catch (err) {
      logger.error(`[QueueEngine] Job '${job.name}' (${job.id}) failed:`, err);
    } finally {
      this.isProcessing = false;
      if (this.jobs.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }
}

const queueEngine = new JobQueueEngine();
module.exports = queueEngine;
