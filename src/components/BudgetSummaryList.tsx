import { View } from "react-native";
import type { CategoryBudgetSummary } from "../features/budgets/types";
import { EmptyState, GlassPressable, MoneyText, ProgressBar, SkeletonRows, Text, money, space } from "@/ui";

type Props = {
  summaries: CategoryBudgetSummary[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  loading?: boolean;
};

export function BudgetSummaryList({ summaries, selectedCategoryId, onSelectCategory, loading = false }: Props) {
  if (loading && summaries.length === 0) return <SkeletonRows count={4} />;
  if (summaries.length === 0) {
    return <EmptyState icon="pie-chart-outline" title="No expense categories yet" message="Add a category to start setting monthly budgets." />;
  }

  return (
    <View style={{ gap: space.md }}>
      {summaries.map((item) => {
        const pct = item.effectiveAllotted > 0 ? Math.min(1, item.actual / item.effectiveAllotted) : item.actual > 0 ? 1 : 0;
        const over = item.remaining < 0;
        const untouched = item.effectiveAllotted === 0 && item.actual === 0;

        return (
          <GlassPressable
            key={item.categoryId}
            selected={selectedCategoryId === item.categoryId}
            onPress={() => onSelectCategory(item.categoryId)}
            accessibilityLabel={
              untouched
                ? `${item.categoryName}, no budget set. Tap to set one.`
                : `${item.categoryName}, ${money(item.actual)} of ${money(item.effectiveAllotted)}, ${over ? "over by" : "left"} ${money(Math.abs(item.remaining))}. Tap to edit.`
            }
            style={{ padding: space.lg, gap: space.md }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.md }}>
              <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                {item.categoryName}
              </Text>
              {!untouched ? (
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                  <Text variant="caption" tone={over ? "negative" : "secondary"}>
                    {over ? "Over by" : "Left"}
                  </Text>
                  <MoneyText amount={Math.abs(item.remaining)} size="figureSm" tone={over ? "negative" : "primary"} decimals={0} style={{ maxWidth: 130 }} />
                </View>
              ) : null}
            </View>

            {!untouched ? <ProgressBar value={pct} tone={over ? "negative" : "accent"} label={`${item.categoryName} budget used`} /> : null}

            <Text variant="caption" tone="secondary">
              {untouched ? "No budget set. Tap to add one." : `${money(item.actual, 0)} of ${money(item.effectiveAllotted, 0)}`}
              {item.rolledOverIn > 0 ? `  ·  +${money(item.rolledOverIn, 0)} rolled over` : ""}
            </Text>
          </GlassPressable>
        );
      })}
    </View>
  );
}
