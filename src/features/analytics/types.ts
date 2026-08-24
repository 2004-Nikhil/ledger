export interface CategoryBreakdownSlice {
  categoryId: string;
  categoryName: string;
  amount: number;
  percent: number;
}

export interface BalanceTrendPoint {
  month: string; // "YYYY-MM"
  totalBalance: number;
}

export interface MonthlyIncomeExpense {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryTrendPoint {
  month: string;
  amount: number;
}

/** One dated event affecting TOTAL balance across all accounts, used to reconstruct history. */
export interface BalanceDelta {
  date: string;
  amount: number;
}
