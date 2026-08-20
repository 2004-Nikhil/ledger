import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import type { CategoryBudgetSummary } from "../features/budgets/types";
import { formatCurrency } from "@/utils/currency";

type Props = {
  summaries: CategoryBudgetSummary[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
};

export function BudgetSummaryList({ summaries, selectedCategoryId, onSelectCategory }: Props) {
  return (
    <FlatList
      data={summaries}
      scrollEnabled={false}
      keyExtractor={(item) => item.categoryId}
      ListEmptyComponent={<Text style={styles.empty}>No expense categories yet.</Text>}
      renderItem={({ item }) => {
        const pct =
          item.effectiveAllotted > 0
            ? Math.min(1, item.actual / item.effectiveAllotted)
            : item.actual > 0
              ? 1
              : 0;
        const over = item.remaining < 0;
        const untouched = item.effectiveAllotted === 0 && item.actual === 0;

        return (
          <Pressable
            style={[styles.row, selectedCategoryId === item.categoryId && styles.rowSelected]}
            onPress={() => onSelectCategory(item.categoryId)}
          >
            <View style={styles.headerRow}>
              <Text style={styles.name}>{item.categoryName}</Text>
              {!untouched && (
                <Text style={[styles.remaining, over ? styles.over : styles.under]}>
                  {over ? "Over by " : "Left "}
                  {formatCurrency(Math.abs(item.remaining))}
                </Text>
              )}
            </View>

            {!untouched && (
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct * 100}%` }, over && styles.barOver]} />
              </View>
            )}

            <Text style={styles.meta}>
              {untouched
                ? "No budget set — tap to add one"
                : `${formatCurrency(item.actual)} of ${formatCurrency(item.effectiveAllotted)}`}
              {item.rolledOverIn > 0 ? ` (+${formatCurrency(item.rolledOverIn)} rolled over)` : ""}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    gap: 6,
    borderRadius: 8,
  },
  rowSelected: { backgroundColor: "#eff6ff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "600" },
  remaining: { fontSize: 13, fontWeight: "700" },
  over: { color: "#dc2626" },
  under: { color: "#16a34a" },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: "#e5e7eb", overflow: "hidden" },
  barFill: { height: 6, backgroundColor: "#2563eb" },
  barOver: { backgroundColor: "#dc2626" },
  meta: { fontSize: 12, color: "#6b7280" },
});
