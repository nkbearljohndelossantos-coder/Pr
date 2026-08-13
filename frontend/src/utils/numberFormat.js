/**
 * Safely parses any number or string in any international format:
 * - "20.133,12" (European / Latin format dot for thousands, comma for decimal) -> 20133.12
 * - "20,133.12" (US / PH format comma for thousands, dot for decimal) -> 20133.12
 * - "20,000" or "20.000" -> 20000
 * - "20.13" -> 20.13
 */
export function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim().replace(/[₱$€\s]/g, '');
  if (!str) return 0;

  const lastCommaIndex = str.lastIndexOf(',');
  const lastDotIndex = str.lastIndexOf('.');

  // Case 1: Both comma and dot present
  if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
    if (lastCommaIndex > lastDotIndex) {
      // European format e.g. "20.133,12" -> replace dots with empty, comma with dot
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // US/PH format e.g. "20,133.12" -> replace commas with empty
      str = str.replace(/,/g, '');
    }
  } 
  // Case 2: Only comma present
  else if (lastCommaIndex !== -1) {
    const partsAfterComma = str.substring(lastCommaIndex + 1);
    if (partsAfterComma.length === 2 && !str.includes('.')) {
      // e.g. "20133,12" -> decimal comma
      str = str.replace(',', '.');
    } else {
      // e.g. "20,000" or "20,133" -> thousands comma
      str = str.replace(/,/g, '');
    }
  }
  // Case 3: Only dot(s) present
  else if (lastDotIndex !== -1) {
    const parts = str.split('.');
    if (parts.length > 2) {
      // Multiple dots e.g. "20.133.12" -> replace all dots except last with empty
      const decimalPart = parts.pop();
      str = parts.join('') + '.' + decimalPart;
    } else if (parts.length === 2) {
      const integerPart = parts[0];
      const fractionPart = parts[1];
      // If integerPart is 1-3 digits and fractionPart is exactly 3 digits e.g. "20.133" (intended as 20,133)
      if (integerPart.length >= 1 && integerPart.length <= 3 && fractionPart.length === 3) {
        str = integerPart + fractionPart;
      }
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a number into Philippine Peso currency format with commas.
 * e.g., 20133.12 -> "₱20,133.12"
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
