/**
 * Number formatting utilities for consistent display across the app
 * All monetary values should be floored (no decimals) and formatted with commas
 */

/**
 * Format a number with no decimals and comma separators
 * @param num - The number to format
 * @returns Formatted string like "1,234,567"
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return Math.floor(num).toLocaleString('en-US');
};

/**
 * Format a number as currency with dollar sign, no decimals, comma separators
 * @param num - The number to format
 * @returns Formatted string like "$1,234,567"
 */
export const formatCurrency = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '$0';
  return `$${formatNumber(num)}`;
};

/**
 * Format a percentage with 2 decimal places
 * @param num - The number to format
 * @returns Formatted string like "12.34%"
 */
export const formatPercent = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0.00%';
  return `${num.toFixed(2)}%`;
};

/**
 * Format shares (whole numbers only, with commas)
 * @param num - The number of shares
 * @returns Formatted string like "1,234"
 */
export const formatShares = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return Math.floor(num).toLocaleString('en-US');
};
