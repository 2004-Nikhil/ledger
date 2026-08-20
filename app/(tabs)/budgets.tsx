import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { MonthNavigator } from "@/components/MonthNavigator";
import { BudgetSummaryList } from "@/components/BudgetSummaryList";
import { BudgetForm } from "@/components/BudgetForm";
import { CategoryForm } from "@/components/CategoryForm";

export default function BudgetsScreen() {
  const { month, summaries, setBudget, goToPreviousMonth, goToNextMonth } = useBudgets();
  const { addCategory } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Default to the first category once summaries load, without
  // clobbering a selection the person already made.
  useEffect(() => {
    if (!selectedCategoryId && summaries.length > 0) {
      setSelectedCategoryId(summaries[0].categoryId);
    }
  }, [summaries, selectedCategoryId]);

  const selectedSummary = useMemo(
    () => summaries.find((s) => s.categoryId === selectedCategoryId) ?? null,
    [summaries, selectedCategoryId]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MonthNavigator month={month} onPrevious={goToPreviousMonth} onNext={goToNextMonth} />

      <BudgetSummaryList
        summaries={summaries}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {selectedSummary && <BudgetForm summary={selectedSummary} onSubmit={setBudget} />}

      <CategoryForm onSubmit={addCategory} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
