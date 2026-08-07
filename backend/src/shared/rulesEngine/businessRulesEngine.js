const logger = require('../../utils/logger');

class BusinessRulesEngine {
  constructor() {
    this.rules = [
      {
        id: 'rule_high_val_executive',
        name: 'High Value Requisition Executive Approval Threshold',
        phase: 'BEFORE_APPROVAL',
        priority: 1,
        is_active: 1,
        conditions: [
          { variable: 'total_amount', operator: '>', target: 50000 },
          { variable: 'currency', operator: '==', target: 'PHP' }
        ],
        actions: [
          { type: 'REQUIRE_EXECUTIVE_APPROVAL', params: { role: 'executive' } }
        ]
      },
      {
        id: 'rule_urgent_priority_alert',
        name: 'Urgent Priority Immediate Manager Alert',
        phase: 'AFTER_SAVE',
        priority: 2,
        is_active: 1,
        conditions: [
          { variable: 'priority', operator: '==', target: 'Urgent' }
        ],
        actions: [
          { type: 'SEND_NOTIFICATION', params: { title: 'Urgent Requisition Filed', message: 'Immediate review required for urgent request.' } }
        ]
      }
    ];
  }

  evaluateCondition(variableValue, operator, targetValue) {
    switch (operator) {
      case '==': return String(variableValue) === String(targetValue);
      case '!=': return String(variableValue) !== String(targetValue);
      case '>': return Number(variableValue) > Number(targetValue);
      case '<': return Number(variableValue) < Number(targetValue);
      case '>=': return Number(variableValue) >= Number(targetValue);
      case '<=': return Number(variableValue) <= Number(targetValue);
      case 'CONTAINS': return String(variableValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'IN_LIST': return Array.isArray(targetValue) ? targetValue.includes(variableValue) : false;
      default: return false;
    }
  }

  evaluateRules(payload, phase = 'BEFORE_APPROVAL') {
    const startTime = Date.now();
    const matchedRules = [];
    const triggeredActions = [];

    const activeRules = this.rules
      .filter(r => r.is_active && r.phase === phase)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of activeRules) {
      const isMatch = rule.conditions.every(cond => {
        const val = payload[cond.variable];
        return this.evaluateCondition(val, cond.operator, cond.target);
      });

      if (isMatch) {
        matchedRules.push(rule.id);
        rule.actions.forEach(act => triggeredActions.push(act));
      }
    }

    const executionTimeMs = Date.now() - startTime;
    logger.info(`[BRE] Evaluated ${activeRules.length} rules for phase '${phase}' in ${executionTimeMs}ms. Matched: ${matchedRules.length}`);

    return {
      matchedRules,
      triggeredActions,
      executionTimeMs,
      requireExecutiveApproval: triggeredActions.some(a => a.type === 'REQUIRE_EXECUTIVE_APPROVAL')
    };
  }

  simulateRule(ruleConfig, samplePayload) {
    const isMatch = ruleConfig.conditions.every(cond => {
      const val = samplePayload[cond.variable];
      return this.evaluateCondition(val, cond.operator, cond.target);
    });

    return {
      ruleId: ruleConfig.id,
      matched: isMatch,
      triggeredActions: isMatch ? ruleConfig.actions : []
    };
  }
}

const businessRulesEngine = new BusinessRulesEngine();
module.exports = businessRulesEngine;
