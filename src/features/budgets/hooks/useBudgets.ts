import { useEffect, useState, useCallback } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useBudgetStore } from "../store/useBudgetStore";
import type { SetBudgetRequest } from "../types";
import { currentMonth, shiftMonth } from "@/utils/date";

export function useBudgets() {
  const { budgetService } = useAppContainer();
  const [month, setMonth] = useState(currentMonth());

  const summaries = useBudgetStore((s) => s.summaries);
  const isLoading = useBudgetStore((s) => s.isLoading);
  const error = useBudgetStore((s) => s.error);
  const load = useBudgetStore((s) => s.load);
  const setBudgetAction = useBudgetStore((s) => s.setBudget);

  useEffect(() => {
    load(budgetService, month);
  }, [budgetService, month, load]);

  const setBudget = useCallback(
    (request: Omit<SetBudgetRequest, "month">) => setBudgetAction(budgetService, { ...request, month }),
    [budgetService, month, setBudgetAction]
  );

  const goToPreviousMonth = useCallback(() => setMonth((m) => shiftMonth(m, -1)), []);
  const goToNextMonth = useCallback(() => setMonth((m) => shiftMonth(m, 1)), []);

  return { month, summaries, isLoading, error, setBudget, goToPreviousMonth, goToNextMonth };
}
