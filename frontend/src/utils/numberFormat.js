/**
 * Safely parses any number or string in any international or local typing format:
 * - "20,113,12" (user mistyped comma instead of dot for cents) -> 20113.12
 * - "20,113.12" (standard US/PH comma for thousands, dot for decimal) -> 20113.12
 * - "20.113,12" (European dot for thousands, comma for decimal) -> 20113.12
 * - "20113,12" or "20113.12" -> 20113.12
 * - "20,000" or "20,000.00" -> 20000
 * - "₱20,113.12" -> 20113.12
 */
export function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim().replace(/[₱$€\s]/g, '');
  if (!str) return 0;

  const lastCommaIndex = str.lastIndexOf(',');
  const lastDotIndex = str.lastIndexOf('.');
  const dotCount = (str.match(/\./g) || []).length;

  // Case 1: Both comma and dot present
  if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
    if (lastCommaIndex > lastDotIndex) {
      // European format e.g. "20.113,12" or "1.234.567,89"
      str = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // US/PH format e.g. "20,113.12" or "1,234,567.89"
      str = str.replace(/,/g, '');
    }
  } 
  // Case 2: Only comma(s) present (no dots)
  else if (lastCommaIndex !== -1) {
    const afterLastComma = str.substring(lastCommaIndex + 1);
    // If the part after the last comma is 1 or 2 digits (e.g. "20,113,12" or "20113,12" or "500,5")
    if (afterLastComma.length === 2 || afterLastComma.length === 1) {
      const beforeLastComma = str.substring(0, lastCommaIndex).replace(/,/g, '');
      str = beforeLastComma + '.' + afterLastComma;
    } else {
      // Thousands separators e.g. "20,000" or "1,000,000"
      str = str.replace(/,/g, '');
    }
  }
  // Case 3: Only dot(s) present (no commas)
  else if (lastDotIndex !== -1) {
    if (dotCount > 1) {
      const afterLastDot = str.substring(lastDotIndex + 1);
      if (afterLastDot.length === 2 || afterLastDot.length === 1) {
        const beforeLastDot = str.substring(0, lastDotIndex).replace(/\./g, '');
        str = beforeLastDot + '.' + afterLastDot;
      } else {
        str = str.replace(/\./g, '');
      }
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a number into Philippine Peso currency format with commas.
 * e.g., 20113.12 -> "₱20,113.12"
 */
export function formatCurrency(val) {
  const num = parseNum(val);
  return '₱' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formats a quantity number with commas.
 * e.g., 20000 -> "20,000.00" or "20,000"
 */
export function formatQuantity(val, decimals = 2) {
  const num = parseNum(val);
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
