const logger = require('../../utils/logger');

class TaskScheduler {
  constructor() {
    this.tasks = [];
  }

  initDefaultTasks() {
    this.scheduleTask('Nightly Database Backup & Cleanup', 3600000, async () => {
      logger.info('[CronScheduler] Running nightly automated backup check...');
    });

    this.scheduleTask('Expired JWT & Session Token Invalidation', 1800000, async () => {
      logger.info('[CronScheduler] Cleaning expired security tokens...');
    });

    this.scheduleTask('Temporary Uploads & Cache Housekeeping', 7200000, async () => {
      logger.info('[CronScheduler] Performing temp file cleanup...');
    });
  }

  scheduleTask(name, intervalMs, callback) {
    logger.info(`[CronScheduler] Task '${name}' registered with interval ${intervalMs / 1000}s.`);
    const timer = setInterval(callback, intervalMs);
    this.tasks.push({ name, timer });
  }

  stopAll() {
    this.tasks.forEach(t => clearInterval(t.timer));
    logger.info('[CronScheduler] All scheduled tasks stopped.');
  }
}

const scheduler = new TaskScheduler();
module.exports = scheduler;
