import { View, Text, FlatList, StyleSheet } from "react-native";
import type { Account } from "@/features/accounts/types";
import { formatCurrency } from "@/utils/currency";

const TYPE_LABEL: Record<Account["type"], string> = {
  cash: "Cash",
  card: "Card",
  bank: "Bank",
};

type Props = {
  accounts: Account[];
  netWorth: number;
};

export function AccountList({ accounts, netWorth }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>Net worth</Text>
        <Text style={styles.netWorthValue}>{formatCurrency(netWorth)}</Text>
      </View>

      <FlatList
        data={accounts}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No accounts yet — add your first one below.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{TYPE_LABEL[item.type]}</Text>
            </View>
            <Text style={styles.balance}>{formatCurrency(item.currentBalance)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  netWorthCard: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 16, gap: 4 },
  netWorthLabel: { fontSize: 13, color: "#166534" },
  netWorthValue: { fontSize: 26, fontWeight: "700", color: "#166534" },
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  name: { fontSize: 15, fontWeight: "600" },
  type: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  balance: { fontSize: 15, fontWeight: "600" },
});
