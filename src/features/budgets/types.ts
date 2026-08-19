export interface Budget {
  id: string;
  categoryId: string;
  /** "YYYY-MM" */
  month: string;
  allottedAmount: number;
  rolloverEnabled: boolean;
  createdAt: string;
}

export interface SetBudgetRequest {
  categoryId: string;
  month: string;
  allottedAmount: number;
  rolloverEnabled: boolean;
}

/**
 * What a screen actually needs to render one category's row for one
 * month — the output of the budget-vs-actual + rollover calculation.
 * `effectiveAllotted` already includes anything rolled in from a prior
 * month; `allotted` is just what was set for this month specifically.
 */
export interface CategoryBudgetSummary {
  categoryId: string;
  categoryName: string;
  month: string;
  allotted: number;
  rolledOverIn: number;
  effectiveAllotted: number;
  actual: number;
  remaining: number;
  rolloverEnabled: boolean;
  /** Null if no budget row exists yet for this category + month. */
  budgetId: string | null;
}
