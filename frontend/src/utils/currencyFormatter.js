export const formatCurrency = (amount, currencyCode = 'PHP', symbol = '₱') => {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
