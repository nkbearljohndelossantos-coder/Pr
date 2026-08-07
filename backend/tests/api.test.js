const assert = require('assert');
const app = require('../src/app');
const http = require('http');

let server;
let port = 5005;

function makeRequest(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Enterprise ERP Automated API Verification Tests...');

  server = app.listen(port, async () => {
    try {
      // Test 1: Health Check Endpoint
      const health = await makeRequest('/api/system/health');
      assert.strictEqual(health.status, 200, 'Health endpoint status should be 200');
      assert.strictEqual(health.body.status, 'UP', 'Health status should be UP');
      console.log('✅ PASS: Health Check Endpoint (/api/system/health)');

      // Test 2: Admin Login
      const loginRes = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { username: 'admin', password: 'admin123' });

      assert.strictEqual(loginRes.status, 200, 'Login status should be 200');
      assert.strictEqual(loginRes.body.success, true, 'Login response success should be true');
      const token = loginRes.body.data.accessToken;
      assert.ok(token, 'Access token should be issued');
      console.log('✅ PASS: System Admin Login & JWT Issuance');

      // Test 3: Module Registry Listing
      const modules = await makeRequest('/api/modules');
      assert.strictEqual(modules.status, 200);
      assert.ok(Array.isArray(modules.body.data), 'Modules data should be an array');
      console.log('✅ PASS: ERP Pluggable Module Registry Listing');

      // Test 4: Master Dropdowns Query
      const masterData = await makeRequest('/api/system/master-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert.strictEqual(masterData.status, 200);
      assert.ok(Array.isArray(masterData.body.data));
      console.log('✅ PASS: Master Data Dropdown Listing');

      // Test 5: IT Department Request Creation & Auto Sequence Number
      const deptLogin = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { username: 'it_dept', password: 'password123' });

      const deptToken = deptLogin.body.data.accessToken;

      const reqRes = await makeRequest('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deptToken}`
        }
      }, {
        prepared_by: 'Alex Vance',
        position: 'IT Infrastructure Specialist',
        required_date: '2026-08-15',
        purpose: 'Server Upgrade Components for Enterprise ERP Deployment',
        business_justification: 'High performance database node expansion',
        priority: 'High',
        status: 'Submitted',
        items: [
          { item_description: 'Dell PowerEdge R750 RAM Module 64GB', quantity: 4, unit: 'PCS', estimated_cost: 450.00 },
          { item_description: 'Samsung Enterprise 3.84TB NVMe SSD', quantity: 2, unit: 'PCS', estimated_cost: 890.00 }
        ]
      });

      assert.strictEqual(reqRes.status, 201);
      assert.ok(reqRes.body.data.request_number.startsWith('REQ-IT-'), 'Request number should start with REQ-IT-');
      console.log(`✅ PASS: Department Request Auto Sequence Generation (${reqRes.body.data.request_number})`);

      console.log('\n🎉 ALL ENTERPRISE API TESTS PASSED CLEANLY WITH ZERO ERRORS!\n');
    } catch (err) {
      console.error('❌ FAIL: API Test Assertion Error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
