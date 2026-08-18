import type { Budget, CategoryBudgetSummary } from "@/features/budgets/types";
import type { Transaction } from "@/features/transactions/types";
import type { Category } from "@/features/categories/types";
import { shiftMonth, monthOf } from "./date";

function key(categoryId: string, month: string): string {
  return `${categoryId}:${month}`;
}

/**
 * Computes one summary row per expense category for `month`, including
 * rollover from the previous month.
 *
 * Rollover is defined recursively rather than stored as a running
 * total: effectiveAllotted(M) = allotted(M) + rolledIn(M), where
 * rolledIn(M) is max(0, effectiveAllotted(M-1) - actual(M-1)) — but
 * only if the M-1 budget had rollover enabled. Recomputing this on
 * every read (instead of mutating a stored balance every month) means
 * there's never a "did the rollover job run" bug — the numbers are
 * always derivable from the raw budgets + transactions.
 */
export function computeBudgetSummaries(
  budgets: Budget[],
  transactions: Transaction[],
  expenseCategories: Category[],
  month: string
): CategoryBudgetSummary[] {
  const budgetsByKey = new Map<string, Budget>();
  for (const budget of budgets) {
    budgetsByKey.set(key(budget.categoryId, budget.month), budget);
  }

  const actualByKey = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    const k = key(transaction.categoryId, monthOf(transaction.date));
    actualByKey.set(k, (actualByKey.get(k) ?? 0) + transaction.amount);
  }

  const effectiveMemo = new Map<string, number>();

  function effectiveAllottedFor(categoryId: string, targetMonth: string): number {
    const k = key(categoryId, targetMonth);
    const cached = effectiveMemo.get(k);
    if (cached !== undefined) return cached;

    const allotted = budgetsByKey.get(k)?.allottedAmount ?? 0;

    const prevMonth = shiftMonth(targetMonth, -1);
    const prevBudget = budgetsByKey.get(key(categoryId, prevMonth));

    let rolledIn = 0;
    if (prevBudget?.rolloverEnabled) {
      const prevEffective = effectiveAllottedFor(categoryId, prevMonth);
      const prevActual = actualByKey.get(key(categoryId, prevMonth)) ?? 0;
      rolledIn = Math.max(0, prevEffective - prevActual);
    }

    const total = allotted + rolledIn;
    effectiveMemo.set(k, total);
    return total;
  }

  return expenseCategories.map((category): CategoryBudgetSummary => {
    const budget = budgetsByKey.get(key(category.id, month)) ?? null;
    const allotted = budget?.allottedAmount ?? 0;
    const effectiveAllotted = effectiveAllottedFor(category.id, month);
    const actual = actualByKey.get(key(category.id, month)) ?? 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      month,
      allotted,
      rolledOverIn: effectiveAllotted - allotted,
      effectiveAllotted,
      actual,
      remaining: effectiveAllotted - actual,
      rolloverEnabled: budget?.rolloverEnabled ?? false,
      budgetId: budget?.id ?? null,
    };
  });
}
