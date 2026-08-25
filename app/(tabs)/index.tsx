import { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useInvestments } from "@/features/investments/hooks/useInvestments";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { summarizeCurrentMonth } from "@/utils/monthlySummary";
import { formatCurrency } from "@/utils/currency";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { IncomeExpenseBarChart } from "@/components/IncomeExpenseBarChart";
import { CategoryTrendChart } from "@/components/CategoryTrendChart";

export default function DashboardScreen() {
  const { totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const { portfolioSummary } = useInvestments();
  const { expenseCategories } = useCategories();
  const { balanceTrend, incomeExpenseTrend, categoryBreakdown, categoryTrend, viewCategoryTrend } = useAnalytics();
  const [trendCategoryId, setTrendCategoryId] = useState<string | null>(null);

  const summary = useMemo(() => summarizeCurrentMonth(transactions), [transactions]);
  const surplus = summary.income - summary.expense;

  // True net worth = spendable cash/bank/card balances + investment value.
  // Deliberately NOT netting out goal contributions or lend/borrow here —
  // those already reduced/increased the relevant account balance when
  // they happened, so totalBalance already reflects them correctly.
  const netWorth = totalBalance + portfolioSummary.totalCurrentValue;

  const handleSelectTrendCategory = (categoryId: string) => {
    setTrendCategoryId(categoryId);
    viewCategoryTrend(categoryId);
  };

  return (
    <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Net worth</Text>
        <Text style={styles.cardValue}>{formatCurrency(netWorth)}</Text>
        <Text style={styles.breakdown}>
          {formatCurrency(totalBalance)} spendable + {formatCurrency(portfolioSummary.totalCurrentValue)} invested
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>Income (this month)</Text>
          <Text style={[styles.cardValueSmall, styles.income]}>{formatCurrency(summary.income)}</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.cardLabel}>Expense (this month)</Text>
          <Text style={[styles.cardValueSmall, styles.expense]}>{formatCurrency(summary.expense)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{surplus >= 0 ? "Surplus" : "Deficit"} (this month)</Text>
        <Text style={[styles.cardValueSmall, surplus >= 0 ? styles.income : styles.expense]}>
          {formatCurrency(surplus)}
        </Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Expense breakdown (this month)</Text>
        <CategoryPieChart slices={categoryBreakdown} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Balance trend</Text>
        <BalanceTrendChart points={balanceTrend} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Income vs expense</Text>
        <IncomeExpenseBarChart points={incomeExpenseTrend} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Category trend</Text>
        <CategoryTrendChart
          expenseCategories={expenseCategories}
          selectedCategoryId={trendCategoryId}
          onSelectCategory={handleSelectTrendCategory}
          trend={categoryTrend}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: { flex: 1 },
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  card: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16, gap: 4 },
  cardLabel: { fontSize: 12, color: "#6b7280" },
  cardValue: { fontSize: 26, fontWeight: "700" },
  cardValueSmall: { fontSize: 18, fontWeight: "700" },
  breakdown: { fontSize: 12, color: "#9ca3af" },
  income: { color: "#16a34a" },
  expense: { color: "#dc2626" },
  chartCard: { backgroundColor: "#ffffff", borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: "#f3f4f6" },
  chartTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
});
