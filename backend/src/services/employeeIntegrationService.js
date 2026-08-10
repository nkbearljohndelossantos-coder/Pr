const https = require('https');
const http = require('http');

const DEFAULT_FALLBACK_EMPLOYEES = [
  { id: 16, employee_id: 'NKB052026-0005', name: 'Atayde, Marvin G.', department: 'Security', status: 'active' },
  { id: 1, employee_id: 'NKB012026-0001', name: 'Bella, Katherine A.', department: 'CEO', status: 'active' },
  { id: 2, employee_id: 'NKB012026-0002', name: 'Bella, Norvin L.', department: 'COO', status: 'active' },
  { id: 14, employee_id: 'NKB052026-0003', name: 'Alonzo, Merry Jean I.', department: 'Production', status: 'active' },
  { id: 15, employee_id: 'NKB052026-0004', name: 'Atayde, Emmie M.', department: 'Production', status: 'active' },
  { id: 52, employee_id: 'PRJ2026-0001', name: 'Amolo, Wenjielyn', department: 'Production', status: 'active' },
  { id: 17, employee_id: 'NKB052026-0006', name: 'Bautista, Allen L.', department: 'Production', status: 'active' },
  { id: 18, employee_id: 'NKB052026-0007', name: 'Bertudazo, Charlotte R.', department: 'Maintenance', status: 'active' },
  { id: 19, employee_id: 'NKB052026-0008', name: 'Caballes, Jayson', department: 'Accounting', status: 'active' },
  { id: 20, employee_id: 'NKB052026-0009', name: 'Delos Santos, Earl John', department: 'IT', status: 'active' }
];

let cachedEmployees = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

class EmployeeIntegrationService {
  async getEmployees() {
    const now = Date.now();
    if (cachedEmployees && (now - lastCacheTime < CACHE_TTL_MS)) {
      return cachedEmployees;
    }

    try {
      const url = 'https://canteen.nkbmanufacturing.com/api/integration/employees?api_key=NkbCanteenIntegrationSecretApiKey2026';
      const data = await new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { timeout: 10000, headers: { 'User-Agent': 'NKB-ERP/1.0' } }, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(body));
              } catch (err) {
                reject(new Error('Invalid JSON response from Canteen Employee API'));
              }
            } else {
              reject(new Error(`Canteen API returned status code ${res.statusCode}`));
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Canteen Employee API request timed out'));
        });
      });

      if (Array.isArray(data) && data.length > 0) {
        cachedEmployees = data;
        lastCacheTime = now;
        return cachedEmployees;
      } else {
        throw new Error('API output empty or invalid');
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch live Canteen Employee API, using fallback list:', err.message);
      if (cachedEmployees && cachedEmployees.length > 0) return cachedEmployees;
      return DEFAULT_FALLBACK_EMPLOYEES;
    }
  }
}

module.exports = new EmployeeIntegrationService();
