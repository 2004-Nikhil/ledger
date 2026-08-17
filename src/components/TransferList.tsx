import { View, Text, FlatList, StyleSheet } from "react-native";
import type { Transfer } from "@/features/transfers/types";
import type { Account } from "@/features/accounts/types";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  transfers: Transfer[];
  accountsById: Map<string, Account>;
};

export function TransferList({ transfers, accountsById }: Props) {
  if (transfers.length === 0) return null;

  return (
    <View>
      <Text style={styles.title}>Recent transfers</Text>
      <FlatList
        data={transfers}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.route}>
              {accountsById.get(item.fromAccountId)?.name ?? "Unknown"} {"\u2192"}{" "}
              {accountsById.get(item.toAccountId)?.name ?? "Unknown"}
            </Text>
            <Text style={styles.meta}>{formatDisplayDate(item.date)}</Text>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginTop: 12, marginBottom: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  route: { fontSize: 13, fontWeight: "500", flex: 1 },
  meta: { fontSize: 12, color: "#9ca3af", marginHorizontal: 8 },
  amount: { fontSize: 13, fontWeight: "700", color: "#7c3aed" },
});
