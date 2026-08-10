const https = require('https');
const http = require('http');

let cachedEmployees = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

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
        const req = client.get(url, { timeout: 10000 }, (res) => {
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

      if (Array.isArray(data)) {
        cachedEmployees = data;
        lastCacheTime = now;
        return cachedEmployees;
      } else {
        throw new Error('API output format unexpected');
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch live Canteen Employee API, fallback:', err.message);
      if (cachedEmployees) return cachedEmployees;
      return [];
    }
  }
}

module.exports = new EmployeeIntegrationService();
