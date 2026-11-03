export const PHONE_DIGITS = 9;

/**
 * Приводит ввод/вставку к 9 цифрам национальной части номера (без +992 и
 * без ведущего 0).
 */
export function normalizePhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("992") && digits.length > PHONE_DIGITS) {
    digits = digits.slice(3);
  }
  if (digits.startsWith("0") && digits.length > PHONE_DIGITS) {
    digits = digits.slice(1);
  }
  return digits.slice(0, PHONE_DIGITS);
}

/** "987441234" -> "98 744 12 34" */
export function formatPhoneDigits(digits: string): string {
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ];
  return parts.filter(Boolean).join(" ");
}

export function isValidPhone(digits: string): boolean {
  return digits.length === PHONE_DIGITS;
}
