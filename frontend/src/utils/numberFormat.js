/**
 * Safely parses any number or string (including those with commas like "20,000" or "1,500.50")
 * into a valid Javascript float.
 */
export function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a number into Philippine Peso currency format with commas.
 * e.g., 20000 -> "₱20,000.00"
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
