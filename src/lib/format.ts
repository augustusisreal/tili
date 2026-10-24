/** Suomenkielinen muotoilu — ei kirjanpidon logiikkaa. */

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("fi-FI", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function parseEuroInput(raw: string): number {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)} %`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Y-tunnus: 1234567-8 */
export function normalizeYTunnus(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return raw.trim();
  return `${digits.slice(0, 7)}-${digits.slice(7)}`;
}

export function isValidYTunnus(raw: string): boolean {
  const m = normalizeYTunnus(raw).match(/^(\d{7})-(\d)$/);
  if (!m) return false;
  const n = m[1];
  const check = Number(m[2]);
  const weights = [7, 9, 10, 5, 8, 4, 2];
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(n[i]) * weights[i];
  const rem = sum % 11;
  if (rem === 0) return check === 0;
  if (rem === 1) return false;
  return check === 11 - rem;
}
