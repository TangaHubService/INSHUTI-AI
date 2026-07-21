export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Loose on purpose: digits, spaces, dashes and a leading + across 7-15 digits
// covers Rwandan and international numbers without rejecting real ones.
export function isValidPhone(value: string): boolean {
  return /^[+]?[\d\s-]{7,15}$/.test(value.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

export function isStrongPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}
