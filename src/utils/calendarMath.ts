import type { Transaction } from "@/features/transactions/types";
import { monthOf } from "@/utils/date";

/** date ("YYYY-MM-DD") -> that day's transactions, restricted to the given month. */
export function groupTransactionsByDay(transactions: Transaction[], month: string): Map<string, Transaction[]> {
  const byDay = new Map<string, Transaction[]>();
  for (const t of transactions) {
    if (monthOf(t.date) !== month) continue;
    const existing = byDay.get(t.date);
    if (existing) existing.push(t);
    else byDay.set(t.date, [t]);
  }
  return byDay;
}

/** date -> signed net amount that day (income positive, expense negative) — drives the day-cell indicator. */
export function dailyNetByDate(transactionsByDay: Map<string, Transaction[]>): Map<string, number> {
  const netByDate = new Map<string, number>();
  for (const [date, dayTransactions] of transactionsByDay) {
    const net = dayTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
    netByDate.set(date, net);
  }
  return netByDate;
}
