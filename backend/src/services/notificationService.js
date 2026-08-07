const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async notify({ userId, departmentId, title, message, type = 'info' }) {
    return await notificationRepository.create({ user_id: userId, department_id: departmentId, title, message, type });
  }

  async getUserNotifications(user) {
    return await notificationRepository.findForUser(user.id, user.department_id);
  }

  async markAsRead(id) {
    await notificationRepository.markAsRead(id);
  }
}

module.exports = new NotificationService();
