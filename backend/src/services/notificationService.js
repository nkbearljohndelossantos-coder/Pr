const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async getNotificationsForUser(user) {
    const deptId = user.role === 'department' ? user.department_id : null;
    return await notificationRepository.findForUser(user.id, deptId);
  }

  async markAsRead(id) {
    await notificationRepository.markAsRead(id);
  }
}

module.exports = new NotificationService();
