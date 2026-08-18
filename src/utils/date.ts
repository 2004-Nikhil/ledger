export function todayIso(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Extracts "YYYY-MM" from any ISO date/datetime string. */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function currentMonth(): string {
  return monthOf(new Date().toISOString());
}

/** Adds `delta` months to a "YYYY-MM" string, wrapping years correctly. */
export function shiftMonth(month: string, delta: number): string {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1; // 0-based
  const shifted = new Date(Date.UTC(year, monthIndex + delta, 1));
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function formatMonthLabel(month: string): string {
  const [yearStr, monthStr] = month.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
