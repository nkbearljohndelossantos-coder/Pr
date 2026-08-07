const http = require('http');
const assert = require('assert');

const post = (path, body, token) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const get = (path, token) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.end();
  });
};

async function runTests() {
  console.log('--- Starting Enterprise ERP Architecture Integration Tests (/api/v1/) ---');

  // Test 1: Health Check
  const health = await get('/health');
  assert.strictEqual(health.status, 200, 'Health check failed');
  console.log('✓ Health Check Passed (v1.0.0)');

  // Test 2: Account Login
  const loginRes = await post('/api/v1/auth/login', { username: 'admin', password: 'admin123' });
  assert.strictEqual(loginRes.status, 200, 'Admin login failed');
  assert.ok(loginRes.body.data.accessToken, 'Token missing');
  const token = loginRes.body.data.accessToken;
  console.log('✓ Enterprise Account JWT Login Passed');

  // Test 3: List Departments
  const deptsRes = await get('/api/v1/departments', token);
  assert.strictEqual(deptsRes.status, 200, 'List departments failed');
  assert.ok(deptsRes.body.data.length > 0, 'No departments found');
  console.log('✓ List Departments Passed');

  // Test 4: Create Requisition Document
  const reqRes = await post('/api/v1/requests', {
    department_id: 1,
    prepared_by: 'Test Staff',
    position: 'Lead Engineer',
    required_date: '2026-09-01',
    purpose: 'Procurement of Server Racks',
    business_justification: 'Data center upgrade requirement',
    priority: 'Urgent',
    items: JSON.stringify([
      { item_description: 'Dell PowerEdge R750', quantity: 2, unit: 'PCS', estimated_cost: 3500 },
      { item_description: 'Cat6 Shielded Patch Cable 5m', quantity: 10, unit: 'PCS', estimated_cost: 15 }
    ])
  }, token);
  assert.strictEqual(reqRes.status, 201, 'Create requisition failed');
  assert.ok(reqRes.body.data.request_number.startsWith('REQ-IT-'), 'Invalid request number format');
  console.log(`✓ Create Document Passed (${reqRes.body.data.request_number})`);

  console.log('--- All Enterprise Integration Tests Passed Successfully! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
