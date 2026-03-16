import { format, formatDistance, formatRelative } from 'date-fns';

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date, formatStr = 'PPP') {
  return format(new Date(date), formatStr);
}

export function formatRelativeDate(date) {
  return formatRelative(new Date(date), new Date());
}

export function formatTimeDistance(date) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function frequencyToSeconds(frequency) {
  const frequencies = {
    daily: 86400,
    weekly: 604800,
    biweekly: 1209600,
    monthly: 2592000,
  };
  return frequencies[frequency] || 604800;
}

export function secondsToFrequency(seconds) {
  const frequencies = {
    86400: 'daily',
    604800: 'weekly',
    1209600: 'biweekly',
    2592000: 'monthly',
  };
  return frequencies[seconds] || 'weekly';
}

export function calculateTotalContribution(amount, rounds) {
  return amount * rounds;
}

export function calculateSecurityDeposit(amount) {
  return amount * 2;
}

export function formatPercentage(value) {
  return `${(value * 100).toFixed(0)}%`;
}

export function normalizeFlowTimestamp(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

export function flowTimestampToDate(value) {
  const normalized = normalizeFlowTimestamp(value);

  if (normalized === null) {
    return null;
  }

  return new Date(normalized * 1000);
}

export function formatFlowTimestamp(value, formatStr = 'PPP p') {
  const date = flowTimestampToDate(value);
  return date ? format(date, formatStr) : 'Pending';
}

export function isFlowTimestampDue(value) {
  const normalized = normalizeFlowTimestamp(value);

  if (normalized === null) {
    return false;
  }

  return Date.now() >= normalized * 1000;
}
