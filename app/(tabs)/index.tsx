import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { summarizeCurrentMonth } from "@//utils/monthlySummary";
import { formatCurrency } from "@/utils/currency";

export default function DashboardScreen() {
  const { netWorth } = useAccounts();
  const { transactions } = useTransactions();

  const summary = useMemo(() => summarizeCurrentMonth(transactions), [transactions]);
  const surplus = summary.income - summary.expense;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Net worth</Text>
        <Text style={styles.cardValue}>{formatCurrency(netWorth)}</Text>
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

      <Text style={styles.hint}>
        Charts, calendar view, and category breakdowns arrive in the Analytics phase.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  card: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16, gap: 4 },
  cardLabel: { fontSize: 12, color: "#6b7280" },
  cardValue: { fontSize: 26, fontWeight: "700" },
  cardValueSmall: { fontSize: 18, fontWeight: "700" },
  income: { color: "#16a34a" },
  expense: { color: "#dc2626" },
  hint: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
});
