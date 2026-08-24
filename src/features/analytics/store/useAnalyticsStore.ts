import { create } from "zustand";
import type { AnalyticsService } from "../services/AnalyticsService";
import type { BalanceTrendPoint, MonthlyIncomeExpense, CategoryBreakdownSlice, CategoryTrendPoint } from "../types";

interface AnalyticsState {
  balanceTrend: BalanceTrendPoint[];
  incomeExpenseTrend: MonthlyIncomeExpense[];
  categoryBreakdown: CategoryBreakdownSlice[];
  categoryTrend: CategoryTrendPoint[];
  isLoading: boolean;
  error: string | null;
  loadOverview: (service: AnalyticsService, month: string, monthsBack: number) => Promise<void>;
  loadCategoryTrend: (service: AnalyticsService, categoryId: string, monthsBack: number) => Promise<void>;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  balanceTrend: [],
  incomeExpenseTrend: [],
  categoryBreakdown: [],
  categoryTrend: [],
  isLoading: false,
  error: null,

  loadOverview: async (service, month, monthsBack) => {
    set({ isLoading: true, error: null });
    try {
      const [balanceTrend, incomeExpenseTrend, categoryBreakdown] = await Promise.all([
        service.getBalanceTrend(monthsBack),
        service.getIncomeExpenseTrend(monthsBack),
        service.getCategoryBreakdown(month),
      ]);
      set({ balanceTrend, incomeExpenseTrend, categoryBreakdown, isLoading: false });
    } catch (error) {
      set({ error: toMessage(error), isLoading: false });
    }
  },

  loadCategoryTrend: async (service, categoryId, monthsBack) => {
    try {
      const categoryTrend = await service.getCategoryTrend(categoryId, monthsBack);
      set({ categoryTrend });
    } catch (error) {
      set({ error: toMessage(error) });
    }
  },
}));
