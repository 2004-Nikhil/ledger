import { View, Text, FlatList, StyleSheet } from "react-native";
import type { Transaction } from "@/features/transactions/types";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  transactions: Transaction[];
  accountsById: Map<string, Account>;
  categoriesById: Map<string, Category>;
  isEditable: (transaction: Transaction) => boolean;
};

export function TransactionList({ transactions, accountsById, categoriesById, isEditable }: Props) {
  return (
    <FlatList
      data={transactions}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.empty}>No transactions yet — log your first one below.</Text>}
      renderItem={({ item }) => {
        const account = accountsById.get(item.accountId);
        const category = categoriesById.get(item.categoryId);
        const isIncome = item.type === "income";

        return (
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {category?.name ?? "Uncategorized"} · {account?.name ?? "Unknown account"} ·{" "}
                {formatDisplayDate(item.date)}
                {!isEditable(item) ? " · locked" : ""}
              </Text>
            </View>
            <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
              {isIncome ? "+" : "-"}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  left: { flex: 1, paddingRight: 12 },
  name: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700" },
  income: { color: "#16a34a" },
  expense: { color: "#dc2626" },
});
