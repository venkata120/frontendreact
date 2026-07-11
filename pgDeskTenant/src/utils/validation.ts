export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const NAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z\s]+$/;
export const AADHAAR_REGEX = /^\d{12}$/;

export function sanitizeMobile(text: string): string {
  let digits = text.replace(/\D/g, '').slice(0, 10);
  if (digits && !/^[6-9]/.test(digits)) {
    digits = digits.slice(1);
  }
  return digits;
}

export function sanitizeName(text: string): string {
  return text.replace(/[^A-Za-z\s]/g, '');
}

export function sanitizeAadhaar(text: string): string {
  return text.replace(/\D/g, '').slice(0, 12);
}
