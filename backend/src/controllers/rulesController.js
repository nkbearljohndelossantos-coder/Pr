const businessRulesEngine = require('../shared/rulesEngine/businessRulesEngine');
const { successResponse, errorResponse } = require('../utils/response');

class RulesController {
  getRules(req, res) {
    return successResponse(res, 'Configurable Business Rules List.', businessRulesEngine.rules);
  }

  testRule(req, res) {
    const { ruleConfig, samplePayload } = req.body;
    if (!ruleConfig || !samplePayload) {
      return errorResponse(res, 'ruleConfig and samplePayload are required for simulation testing.', 400);
    }
    const result = businessRulesEngine.simulateRule(ruleConfig, samplePayload);
    return successResponse(res, 'Rule simulation executed successfully.', result);
  }

  executeRules(req, res) {
    const { payload, phase } = req.body;
    const result = businessRulesEngine.evaluateRules(payload || {}, phase || 'BEFORE_APPROVAL');
    return successResponse(res, 'Business rules evaluated.', result);
  }
}

module.exports = new RulesController();
