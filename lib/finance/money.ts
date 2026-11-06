/** All money in integer minor units (cents). Never use IEEE floats for balances. */

const AMOUNT_RE = /^[-+]?\$?\d+(?:\.\d{1,2})?$/;

export function parseMoneyToMinor(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!AMOUNT_RE.test(cleaned)) return null;
  const negative = cleaned.startsWith("-");
  const normalized = cleaned.replace(/^[+-]?\$?/, "");
  const [whole, frac = ""] = normalized.split(".");
  if (frac.length > 2) return null;
  const minor =
    Number.parseInt(whole, 10) * 100 +
    Number.parseInt((frac + "00").slice(0, 2), 10);
  if (!Number.isFinite(minor)) return null;
  return negative ? -minor : minor;
}

export function addMinor(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new TypeError("minor units must be integers");
  }
  return a + b;
}

export function sumMinor(values: readonly number[]): number {
  return values.reduce((acc, v) => addMinor(acc, v), 0);
}

export function formatMoney(minor: number, currency = "USD", locale = "en-US"): string {
  if (!Number.isInteger(minor)) {
    throw new TypeError("minor units must be integers");
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(minor / 100);
}

export function percentOf(part: number, whole: number): number {
  if (!Number.isInteger(part) || !Number.isInteger(whole)) {
    throw new TypeError("minor units must be integers");
  }
  if (whole === 0) return 0;
  return Math.round((part * 100) / whole);
}
