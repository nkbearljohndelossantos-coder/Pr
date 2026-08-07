/**
 * Format: REQ-{DEPT_CODE}-{YYYYMMDD}-{SEQ:05d}
 * Example: REQ-IT-20260806-00001
 */
const generateRequestNumber = (deptCode, seqNumber, date = new Date()) => {
  const code = (deptCode || 'GEN').toUpperCase().trim();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const seqStr = String(seqNumber).padStart(5, '0');

  return `REQ-${code}-${dateStr}-${seqStr}`;
};

module.exports = { generateRequestNumber };
