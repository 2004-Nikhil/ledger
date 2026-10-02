/**
 * Display-only money formatting for the redesigned UI.
 *
 * `@/utils/currency` stays the single source of truth for WHICH currency the
 * app uses — the symbol is read from it. This module only decides how amounts
 * are laid out on screen: grouping, decimals, and the whole/fraction split that
 * lets hero values render with a quiet fractional part.
 */
import { formatCurrency } from "@/utils/currency";

export const CURRENCY_SYMBOL: string = formatCurrency(0).replace(/[\d.,\s-]/g, "") || "\u20B9";

const INDIAN_GROUPING = CURRENCY_SYMBOL === "\u20B9";

function group(integerDigits: string): string {
  if (integerDigits.length <= 3) return integerDigits;
  if (!INDIAN_GROUPING) return integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const tail = integerDigits.slice(-3);
  let head = integerDigits.slice(0, -3);
  const parts: string[] = [];
  while (head.length > 2) {
    parts.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head) parts.unshift(head);
  return `${parts.join(",")},${tail}`;
}

export interface MoneyParts {
  negative: boolean;
  symbol: string;
  whole: string;
  fraction: string; // includes the leading "." or "" when decimals === 0
}

export function moneyParts(amount: number, decimals = 2): MoneyParts {
  const safe = Number.isFinite(amount) ? amount : 0;
  const fixed = Math.abs(safe).toFixed(decimals);
  const [whole, frac] = fixed.split(".");
  const negative = safe < 0 && Number(fixed) !== 0;
  return { negative, symbol: CURRENCY_SYMBOL, whole: group(whole), fraction: frac ? `.${frac}` : "" };
}

/** "₹1,24,560.50" / "-₹320.00" */
export function money(amount: number, decimals = 2): string {
  const p = moneyParts(amount, decimals);
  return `${p.negative ? "-" : ""}${p.symbol}${p.whole}${p.fraction}`;
}

/** "+₹320.00" / "-₹320.00" — sign always shown. */
export function signedMoney(amount: number, decimals = 2): string {
  const p = moneyParts(amount, decimals);
  return `${p.negative ? "-" : "+"}${p.symbol}${p.whole}${p.fraction}`;
}

/** Short form for tight spaces (calendar cells, chart labels): ₹1.2L, ₹45K. */
export function compactMoney(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const trim = (n: number) => (n >= 100 ? n.toFixed(0) : n.toFixed(1)).replace(/\.0$/, "");
  if (INDIAN_GROUPING) {
    if (abs >= 1e7) return `${sign}${CURRENCY_SYMBOL}${trim(abs / 1e7)}Cr`;
    if (abs >= 1e5) return `${sign}${CURRENCY_SYMBOL}${trim(abs / 1e5)}L`;
  } else {
    if (abs >= 1e9) return `${sign}${CURRENCY_SYMBOL}${trim(abs / 1e9)}B`;
    if (abs >= 1e6) return `${sign}${CURRENCY_SYMBOL}${trim(abs / 1e6)}M`;
  }
  if (abs >= 1e3) return `${sign}${CURRENCY_SYMBOL}${trim(abs / 1e3)}K`;
  return `${sign}${CURRENCY_SYMBOL}${abs.toFixed(0)}`;
}

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** "Sep" from "2026-09" — used on chart axes. */
export function shortMonth(month: string): string {
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

/** "Sep 26" this year, "Sep 26, 2025" otherwise. Takes "YYYY-MM-DD". */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const sameYear = y === new Date().getFullYear();
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric", ...(sameYear ? null : { year: "numeric" }) });
}
