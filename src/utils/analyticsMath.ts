import type { Transaction } from "@/features/transactions/types";
import type { Category } from "@/features/categories/types";
import type { LendBorrow, LendBorrowRepaymentRecord } from "@/features/lendBorrow/types";
import type { GoalContribution } from "@/features/goals/types";
import type {
  CategoryBreakdownSlice,
  BalanceTrendPoint,
  MonthlyIncomeExpense,
  CategoryTrendPoint,
  BalanceDelta,
} from "@/features/analytics/types";
import { monthOf, shiftMonth } from "./date";

/**
 * Converts every balance-affecting domain event into a single signed
 * "effect on TOTAL balance across all accounts" delta, dated. Transfers
 * are deliberately excluded — a transfer moves money between two of the
 * user's own accounts, so it never changes the total, by construction.
 * Skipping them isn't an approximation, it's exact.
 */
export function buildBalanceDeltas(
  transactions: Transaction[],
  lendBorrows: LendBorrow[],
  lendBorrowRepayments: LendBorrowRepaymentRecord[],
  goalContributions: GoalContribution[]
): BalanceDelta[] {
  const deltas: BalanceDelta[] = [];

  for (const t of transactions) {
    deltas.push({ date: t.date, amount: t.type === "income" ? t.amount : -t.amount });
  }

  const lendBorrowById = new Map(lendBorrows.map((lb) => [lb.id, lb]));

  for (const lb of lendBorrows) {
    // Lending cash out reduces total balance; borrowing increases it.
    deltas.push({ date: lb.date, amount: lb.direction === "lent" ? -lb.amount : lb.amount });
  }

  for (const repayment of lendBorrowRepayments) {
    const parent = lendBorrowById.get(repayment.lendBorrowId);
    if (!parent) continue; // orphaned record shouldn't happen, but don't crash the chart if it does
    // Reverses the parent's effect: getting repaid on something lent
    // increases total balance; paying back a borrow decreases it.
    deltas.push({ date: repayment.date, amount: parent.direction === "lent" ? repayment.amount : -repayment.amount });
  }

  for (const contribution of goalContributions) {
    // Money leaves spendable balance into the goal's earmarked bucket.
    deltas.push({ date: contribution.date, amount: -contribution.amount });
  }

  return deltas;
}

/**
 * Reconstructs total balance at the end of each of the last `monthsBack`
 * months (plus the current month), anchored at the known-correct
 * current total and working backward by reversing dated deltas. For
 * any past month M, "reverse everything that happened after M ended."
 */
export function computeBalanceTrend(
  currentTotalBalance: number,
  deltas: BalanceDelta[],
  monthsBack: number,
  referenceDate: Date = new Date()
): BalanceTrendPoint[] {
  const currentMonth = monthOf(referenceDate.toISOString());
  const points: BalanceTrendPoint[] = [];

  for (let i = monthsBack; i >= 0; i--) {
    const month = shiftMonth(currentMonth, -i);
    const monthEndExclusive = shiftMonth(month, 1); // first day of the NEXT month
    const reversedSinceThen = deltas
      .filter((d) => d.date >= monthEndExclusive)
      .reduce((sum, d) => sum + d.amount, 0);
    points.push({ month, totalBalance: currentTotalBalance - reversedSinceThen });
  }

  return points;
}

function buildMonthRange(monthsBack: number, referenceDate: Date): string[] {
  const currentMonth = monthOf(referenceDate.toISOString());
  const months: string[] = [];
  for (let i = monthsBack; i >= 0; i--) {
    months.push(shiftMonth(currentMonth, -i));
  }
  return months;
}

export function computeIncomeExpenseTrend(
  transactions: Transaction[],
  monthsBack: number,
  referenceDate: Date = new Date()
): MonthlyIncomeExpense[] {
  const months = buildMonthRange(monthsBack, referenceDate);
  const byMonth = new Map<string, { income: number; expense: number }>(
    months.map((m) => [m, { income: 0, expense: 0 }])
  );

  for (const t of transactions) {
    const bucket = byMonth.get(monthOf(t.date));
    if (!bucket) continue; // outside the requested window
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expense += t.amount;
  }

  return months.map((month) => ({ month, ...byMonth.get(month)! }));
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  month: string
): CategoryBreakdownSlice[] {
  const amountByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || monthOf(t.date) !== month) continue;
    amountByCategory.set(t.categoryId, (amountByCategory.get(t.categoryId) ?? 0) + t.amount);
  }

  const total = Array.from(amountByCategory.values()).reduce((sum, v) => sum + v, 0);
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return Array.from(amountByCategory.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryName: nameById.get(categoryId) ?? "Unknown",
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function computeCategoryTrend(
  transactions: Transaction[],
  categoryId: string,
  monthsBack: number,
  referenceDate: Date = new Date()
): CategoryTrendPoint[] {
  const months = buildMonthRange(monthsBack, referenceDate);
  const byMonth = new Map<string, number>(months.map((m) => [m, 0]));

  for (const t of transactions) {
    if (t.type !== "expense" || t.categoryId !== categoryId) continue;
    const month = monthOf(t.date);
    if (byMonth.has(month)) {
      byMonth.set(month, byMonth.get(month)! + t.amount);
    }
  }

  return months.map((month) => ({ month, amount: byMonth.get(month) ?? 0 }));
}
