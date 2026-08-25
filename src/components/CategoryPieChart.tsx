import { View, Text, Dimensions, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import type { CategoryBreakdownSlice } from "../features/analytics/types";
import { paletteColor } from "../features/analytics/chartTheme";
import { formatCurrency } from "@/utils/currency";

type Props = {
  slices: CategoryBreakdownSlice[];
};

const CHART_WIDTH = Dimensions.get("window").width - 64;

export function CategoryPieChart({ slices }: Props) {
  if (slices.length === 0) {
    return <Text style={styles.empty}>No expenses this month yet.</Text>;
  }

  const data = slices.map((slice, index) => ({
    name: slice.categoryName,
    amount: slice.amount,
    color: paletteColor(index),
    legendFontColor: "#374151",
    legendFontSize: 12,
  }));

  return (
    <View>
      <PieChart
        data={data}
        width={CHART_WIDTH}
        height={180}
        chartConfig={{ color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})` }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="8"
        hasLegend={false}
      />
      <View style={styles.legend}>
        {slices.map((slice, index) => (
          <View key={slice.categoryId} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: paletteColor(index) }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {slice.categoryName}
            </Text>
            <Text style={styles.legendValue}>
              {formatCurrency(slice.amount)} ({slice.percent.toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  legend: { marginTop: 8, gap: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 12, color: "#374151" },
  legendValue: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
});
