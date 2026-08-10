import { useEffect, useCallback, useMemo } from "react";
import { useAppContainer } from "@/composition/AppProvider";
import { useCategoryStore } from "../store/useCategoryStore";
import type { CategoryType } from "../types";

export function useCategories() {
  const { categoryService } = useAppContainer();
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const error = useCategoryStore((s) => s.error);
  const load = useCategoryStore((s) => s.load);

  useEffect(() => {
    load(categoryService);
  }, [categoryService, load]);

  const byType = useCallback(
    (type: CategoryType) => categories.filter((c) => c.type === type),
    [categories]
  );

  const incomeCategories = useMemo(() => byType("income"), [byType]);
  const expenseCategories = useMemo(() => byType("expense"), [byType]);

  return { categories, incomeCategories, expenseCategories, isLoading, error };
}
