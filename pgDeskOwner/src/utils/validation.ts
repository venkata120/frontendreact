export const regex = {
  alphabetsOnly: /^(?=.*[A-Za-z])[A-Za-z\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  mobile: /^[6-9]\d{9}$/,
  aadhaar: /^\d{12}$/,
  digitsOnly: /^\d+$/,
  positiveInteger: /^[1-9]\d*$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
};

export const messages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, length: number) => `${field} must be at least ${length} characters`,
  exactLength: (field: string, length: number) => `${field} must be exactly ${length} digits`,
  alphabetsOnly: (field: string) => `${field} should contain only alphabets and spaces`,
  validEmail: (field: string = 'Email') => `Enter a valid ${field.toLowerCase()}`,
  validMobile: (field: string = 'Mobile Number') => `${field} must be a valid 10-digit number starting with 6-9`,
  validAadhaar: () => 'Aadhaar Number must be exactly 12 digits',
  validNumber: (field: string) => `${field} must be a valid number`,
  passwordMatch: () => 'Passwords do not match',
  strongPassword: () =>
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
};

export const normalizeMobile = (mobile: string): string => {
  const digits = mobile.replace(/\D/g, '');
  // Keep the last 10 digits so the stored value matches the 10-digit login
  // format expected by the OTP endpoint.
  if (digits.length > 10) return digits.slice(-10);
  return digits;
};

export const sanitizeMobile = (text: string): string => {
  let digits = text.replace(/\D/g, '').slice(0, 10);
  if (digits && !/^[6-9]/.test(digits)) {
    digits = digits.slice(1);
  }
  return digits;
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
