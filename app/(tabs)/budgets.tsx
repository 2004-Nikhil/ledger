import { useMemo, useState } from "react";
import { View } from "react-native";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { MonthNavigator } from "@/components/MonthNavigator";
import { BudgetSummaryList } from "@/components/BudgetSummaryList";
import { BudgetForm } from "@/components/BudgetForm";
import { CategoryForm } from "@/components/CategoryForm";
import { Button, ErrorNotice, GlassCard, MoneyText, ProgressBar, Screen, Section, Sheet, Text, money, space, useLatest } from "@/ui";

export default function BudgetsScreen() {
  const { month, summaries, setBudget, goToPreviousMonth, goToNextMonth, isLoading, error } = useBudgets();
  const { addCategory } = useCategories();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const editing = useMemo(() => summaries.find((s) => s.categoryId === editingCategoryId) ?? null, [summaries, editingCategoryId]);
  const editingShown = useLatest(editing);

  // Month-at-a-glance, derived from the same summaries the list uses.
  // Compare like with like: only categories that HAVE a budget count against it.
  const spent = summaries.reduce((sum, s) => sum + s.actual, 0);
  const budgetedRows = summaries.filter((s) => s.effectiveAllotted > 0);
  const budgeted = budgetedRows.reduce((sum, s) => sum + s.effectiveAllotted, 0);
  const spentInBudgets = budgetedRows.reduce((sum, s) => sum + s.actual, 0);
  const unbudgeted = spent - spentInBudgets;
  const remaining = budgeted - spentInBudgets;
  const overall = budgeted > 0 ? spentInBudgets / budgeted : 0;

  return (
    <>
      <Screen title="Budgets" right={<Button label="Category" icon="add" size="sm" variant="glass" onPress={() => setAddingCategory(true)} accessibilityLabel="Add custom category" />}>
        {error ? <ErrorNotice message={error} /> : null}
        <MonthNavigator month={month} onPrevious={goToPreviousMonth} onNext={goToNextMonth} />

        <GlassCard variant="solid" glow="violet" glowCorner="tr" padding={space.xl} style={{ gap: space.md }}>
          <Text variant="caption" tone="secondary">
            Spent this month
          </Text>
          <MoneyText amount={spent} size="hero" animate decimals={0} />
          {budgeted > 0 ? (
            <View style={{ gap: space.sm }}>
              <ProgressBar value={overall} tone={remaining < 0 ? "negative" : "accent"} label="Overall budget used" />
              <Text variant="caption" tone={remaining < 0 ? "negative" : "secondary"}>
                {remaining < 0 ? `${money(Math.abs(remaining), 0)} over` : `${money(remaining, 0)} left`} of {money(budgeted, 0)} budgeted
              </Text>
              {unbudgeted > 0 ? (
                <Text variant="caption" tone="secondary">
                  {money(unbudgeted, 0)} spent in categories without a budget
                </Text>
              ) : null}
            </View>
          ) : (
            <Text variant="caption" tone="secondary">
              Set a budget on any category below to track it here.
            </Text>
          )}
        </GlassCard>

        <Section title="By category">
          <BudgetSummaryList summaries={summaries} selectedCategoryId={editingCategoryId} onSelectCategory={setEditingCategoryId} loading={isLoading} />
        </Section>
      </Screen>

      <Sheet
        visible={editing !== null}
        onClose={() => setEditingCategoryId(null)}
        title={editingShown ? `Budget for ${editingShown.categoryName}` : "Budget"}
        subtitle="Applies to the month you're viewing"
      >
        {editingShown ? (
          <BudgetForm
            summary={editingShown}
            onSubmit={async (request) => {
              await setBudget(request);
              setEditingCategoryId(null);
            }}
          />
        ) : null}
      </Sheet>

      <Sheet visible={addingCategory} onClose={() => setAddingCategory(false)} title="New category" subtitle="Custom expense or income category">
        <CategoryForm
          onSubmit={async (request) => {
            await addCategory(request);
            setAddingCategory(false);
          }}
        />
      </Sheet>
    </>
  );
}
