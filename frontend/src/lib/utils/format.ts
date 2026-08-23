/**
 * AirFareX — Shared Formatting Utilities
 * Standardized INR currency, percentage, number and date formatters.
 */

export function formatINR(amount: number, options?: { showZeroDecimal?: boolean }): string {
  if (isNaN(amount)) return '₹0'
  const isFractional = options?.showZeroDecimal || (amount % 1 !== 0)
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: isFractional ? 2 : 0,
    minimumFractionDigits: isFractional ? 2 : 0,
  }).format(amount)

  // Replace default spacing if any
  return formatted.replace(/\s+/g, '')
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  if (isNaN(value)) return '0.0%'
  const formatted = Math.abs(value).toFixed(1) + '%'
  if (!includeSign) return formatted
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return `0.0%`
}

export function formatNumber(value: number): string {
  if (isNaN(value)) return '0'
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatIndex(value: number): string {
  if (isNaN(value)) return '100.00'
  return value.toFixed(2)
}
