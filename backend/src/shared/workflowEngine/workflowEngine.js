const { REQUEST_STATUS } = require('../../constants/status');
const businessRulesEngine = require('../rulesEngine/businessRulesEngine');

class WorkflowEngine {
  constructor() {
    this.thresholds = [
      { min: 0, max: 10000, requiredRole: 'department', label: 'Department Review' },
      { min: 10000, max: 50000, requiredRole: 'executive', label: 'Manager Approval' },
      { min: 50000, max: 100000, requiredRole: 'executive', label: 'Executive Approval' },
      { min: 100000, max: Infinity, requiredRole: 'admin', label: 'President / CEO Approval' }
    ];
  }

  evaluateNextStep(currentStatus, userRole, action, documentData = {}) {
    if (action === 'REJECT') {
      return REQUEST_STATUS.REJECTED;
    }

    if (action === 'APPROVE') {
      const totalAmount = Number(documentData.total_amount || documentData.total_estimated_cost || 0);
      const breResult = businessRulesEngine.evaluateRules({
        total_amount: totalAmount,
        currency: 'PHP',
        priority: documentData.priority || 'Normal'
      }, 'BEFORE_APPROVAL');

      if (currentStatus === REQUEST_STATUS.SUBMITTED && (userRole === 'executive' || userRole === 'admin')) {
        return REQUEST_STATUS.APPROVED;
      }
      if (currentStatus === REQUEST_STATUS.APPROVED && userRole === 'admin') {
        return REQUEST_STATUS.COMPLETED;
      }
    }

    return currentStatus;
  }

  canUserApprove(userRole, currentStatus, totalAmount = 0) {
    if (userRole === 'admin') return true;
    if (userRole === 'executive' && (currentStatus === REQUEST_STATUS.SUBMITTED || currentStatus === REQUEST_STATUS.UNDER_REVIEW)) return true;
    return false;
  }
}

const workflowEngine = new WorkflowEngine();
module.exports = workflowEngine;
