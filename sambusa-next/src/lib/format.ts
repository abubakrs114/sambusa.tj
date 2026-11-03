const numberFormatter = new Intl.NumberFormat("ru-RU");

/** 1250 -> "1 250 TJS" */
export function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} TJS`;
}

/** pluralize(3, ["товар", "товара", "товаров"]) -> "товара" */
export function pluralize(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}
