import { useEffect } from "react";
import { View, Text, Pressable, ScrollView, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { Category } from "@/features/categories/types";
import type { CategoryTrendPoint } from "../features/analytics/types";
import { chartTheme } from "../features/analytics/chartTheme";
import { formatMonthLabel } from "@/utils/date";

type Props = {
  expenseCategories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  trend: CategoryTrendPoint[];
};

const CHART_WIDTH = Dimensions.get("window").width - 64;

export function CategoryTrendChart({ expenseCategories, selectedCategoryId, onSelectCategory, trend }: Props) {
  // Default to the first category once the list loads, without
  // clobbering a selection the person already made.
  useEffect(() => {
    if (!selectedCategoryId && expenseCategories.length > 0) {
      onSelectCategory(expenseCategories[0].id);
    }
  }, [expenseCategories, selectedCategoryId, onSelectCategory]);

  if (expenseCategories.length === 0) {
    return <Text style={styles.empty}>No expense categories yet.</Text>;
  }

  const data = {
    labels: trend.map((p) => formatMonthLabel(p.month).split(" ")[0].slice(0, 3)),
    datasets: [{ data: trend.length > 0 ? trend.map((p) => p.amount) : [0] }],
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {expenseCategories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onSelectCategory(c.id)}
            style={[styles.chip, selectedCategoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {trend.length > 0 && (
        <LineChart
          data={data}
          width={CHART_WIDTH}
          height={160}
          chartConfig={chartTheme}
          withInnerLines={false}
          withOuterLines={false}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  chipScroll: { flexGrow: 0, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
});
