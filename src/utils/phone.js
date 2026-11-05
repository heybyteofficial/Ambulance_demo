const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

function getNationalDigits(value) {
  let digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length === 14 && digits.startsWith('0091')) {
    digits = digits.slice(4);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits;
}

export function sanitizeIndianMobileInput(value) {
  return getNationalDigits(value).slice(0, 10);
}

export function normalizeIndianMobile(value) {
  const digits = getNationalDigits(value);
  if (!INDIAN_MOBILE_PATTERN.test(digits) || /^(\d)\1{9}$/.test(digits)) {
    return '';
  }
  return digits;
}

export function isValidIndianMobile(value) {
  return Boolean(normalizeIndianMobile(value));
}
