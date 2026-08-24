import { useEffect, useCallback } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { currentMonth } from "@/utils/date";

const DEFAULT_MONTHS_BACK = 5; // current month + 5 prior = 6 points on the trend charts

export function useAnalytics() {
  const { analyticsService } = useAppContainer();

  const balanceTrend = useAnalyticsStore((s) => s.balanceTrend);
  const incomeExpenseTrend = useAnalyticsStore((s) => s.incomeExpenseTrend);
  const categoryBreakdown = useAnalyticsStore((s) => s.categoryBreakdown);
  const categoryTrend = useAnalyticsStore((s) => s.categoryTrend);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const error = useAnalyticsStore((s) => s.error);
  const loadOverview = useAnalyticsStore((s) => s.loadOverview);
  const loadCategoryTrend = useAnalyticsStore((s) => s.loadCategoryTrend);

  useEffect(() => {
    loadOverview(analyticsService, currentMonth(), DEFAULT_MONTHS_BACK);
  }, [analyticsService, loadOverview]);

  const viewCategoryTrend = useCallback(
    (categoryId: string) => loadCategoryTrend(analyticsService, categoryId, DEFAULT_MONTHS_BACK),
    [analyticsService, loadCategoryTrend]
  );

  const refresh = useCallback(
    () => loadOverview(analyticsService, currentMonth(), DEFAULT_MONTHS_BACK),
    [analyticsService, loadOverview]
  );

  return {
    balanceTrend,
    incomeExpenseTrend,
    categoryBreakdown,
    categoryTrend,
    isLoading,
    error,
    viewCategoryTrend,
    refresh,
  };
}
