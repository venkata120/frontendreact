export const regex = {
  alphabetsOnly: /^[A-Za-z\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  mobile: /^\d{10}$/,
  aadhaar: /^\d{12}$/,
  digitsOnly: /^\d+$/,
  positiveInteger: /^[1-9]\d*$/,
};

export const messages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, length: number) => `${field} must be at least ${length} characters`,
  exactLength: (field: string, length: number) => `${field} must be exactly ${length} digits`,
  alphabetsOnly: (field: string) => `${field} should contain only alphabets and spaces`,
  validEmail: (field: string = 'Email') => `Enter a valid ${field.toLowerCase()}`,
  validMobile: (field: string = 'Mobile Number') => `${field} must be exactly 10 digits`,
  validAadhaar: () => 'Aadhaar Number must be exactly 12 digits',
  validNumber: (field: string) => `${field} must be a valid number`,
  passwordMatch: () => 'Passwords do not match',
};

export const normalizeMobile = (mobile: string): string => {
  const digits = mobile.replace(/\D/g, '');
  if (mobile.trim().startsWith('+')) return mobile.trim();
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

export const getApiErrorMessage = (err: any, fallback = 'Something went wrong'): string => {
  const message = err?.response?.data?.message || err?.message || fallback;
  const fieldErrors = err?.response?.data?.errors;

  if (typeof message !== 'string') return fallback;

  // Map backend "Invalid input: expected string, received undefined" to a friendly message
  if (message.includes('Invalid input: expected string, received undefined')) {
    return 'Please fill in all required fields';
  }

  // Include per-field validation errors when available
  if (fieldErrors && typeof fieldErrors === 'object') {
    const details = Object.values(fieldErrors).filter(Boolean).join('\n');
    if (details) {
      return `${message}\n${details}`;
    }
  }

  return message;
};
