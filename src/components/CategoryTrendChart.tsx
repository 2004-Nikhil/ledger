import { useEffect } from "react";
import { View } from "react-native";
import type { Category } from "@/features/categories/types";
import type { CategoryTrendPoint } from "../features/analytics/types";
import { Chip, ChipRow, LineTrend, Text, money, shortMonth, space } from "@/ui";

type Props = {
  expenseCategories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  trend: CategoryTrendPoint[];
  /** Parent card's horizontal padding, so the chips scroll edge to edge. */
  bleed?: number;
};

export function CategoryTrendChart({ expenseCategories, selectedCategoryId, onSelectCategory, trend, bleed = space.lg }: Props) {
  // Default to the first category once the list loads, without
  // clobbering a selection the person already made.
  useEffect(() => {
    if (!selectedCategoryId && expenseCategories.length > 0) {
      onSelectCategory(expenseCategories[0].id);
    }
  }, [expenseCategories, selectedCategoryId, onSelectCategory]);

  if (expenseCategories.length === 0) {
    return (
      <Text variant="caption" tone="secondary">
        No expense categories yet.
      </Text>
    );
  }

  return (
    <View style={{ gap: space.lg }}>
      <ChipRow bleed={bleed}>
        {expenseCategories.map((c) => (
          <Chip key={c.id} label={c.name} selected={selectedCategoryId === c.id} onPress={() => onSelectCategory(c.id)} />
        ))}
      </ChipRow>

      {trend.length > 0 ? (
        <LineTrend
          data={trend.map((p) => ({ label: shortMonth(p.month), value: p.amount }))}
          height={168}
          fromZero
          tone="violet"
          formatValue={(v) => money(v, 0)}
        />
      ) : (
        <Text variant="caption" tone="secondary">
          Pick a category to see how your spending has moved.
        </Text>
      )}
    </View>
  );
}
