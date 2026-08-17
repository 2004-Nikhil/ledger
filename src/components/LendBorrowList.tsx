import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from "react-native";
import type { LendBorrow } from "@/features/lendBorrow/types";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  entries: LendBorrow[];
  onRepay: (lendBorrowId: string, amount: number) => Promise<void>;
};

const STATUS_LABEL: Record<LendBorrow["status"], string> = {
  unpaid: "Unpaid",
  partial: "Partially paid",
  paid: "Paid",
};

function isOverdue(entry: LendBorrow): boolean {
  if (!entry.dueDate || entry.status === "paid") return false;
  return new Date(entry.dueDate) < new Date(new Date().toDateString());
}

function EntryRow({ entry, onRepay }: { entry: LendBorrow; onRepay: Props["onRepay"] }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remaining = entry.amount - entry.paidAmount;

  const handleRepay = async () => {
    setError(null);
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");
    setIsSubmitting(true);
    try {
      await onRepay(entry.id, parsed);
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.person}>{entry.person}</Text>
        <Text style={[styles.direction, entry.direction === "lent" ? styles.lent : styles.borrowed]}>
          {entry.direction === "lent" ? "You lent" : "You borrowed"}
        </Text>
      </View>

      <Text style={styles.meta}>
        {formatCurrency(entry.amount)} · {formatDisplayDate(entry.date)}
        {entry.dueDate ? ` · due ${formatDisplayDate(entry.dueDate)}` : ""}
        {isOverdue(entry) ? " · overdue" : ""}
      </Text>
      <Text style={styles.status}>
        {STATUS_LABEL[entry.status]}
        {entry.status !== "unpaid" ? ` (${formatCurrency(entry.paidAmount)} of ${formatCurrency(entry.amount)})` : ""}
      </Text>

      {entry.status !== "paid" && (
        <View style={styles.repayRow}>
          <TextInput
            style={styles.repayInput}
            placeholder={`Repay (up to ${formatCurrency(remaining)})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Pressable style={styles.repayButton} onPress={handleRepay} disabled={isSubmitting}>
            <Text style={styles.repayButtonText}>{isSubmitting ? "…" : "Record"}</Text>
          </Pressable>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function LendBorrowList({ entries, onRepay }: Props) {
  return (
    <FlatList
      data={entries}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.empty}>Nothing lent or borrowed yet.</Text>}
      renderItem={({ item }) => <EntryRow entry={item} onRepay={onRepay} />}
    />
  );
}

const styles = StyleSheet.create({
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    gap: 4,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  person: { fontSize: 15, fontWeight: "600" },
  direction: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  lent: { color: "#dc2626" },
  borrowed: { color: "#16a34a" },
  meta: { fontSize: 12, color: "#6b7280" },
  status: { fontSize: 12, color: "#374151", fontWeight: "500" },
  repayRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  repayInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  repayButton: { backgroundColor: "#0891b2", borderRadius: 8, paddingHorizontal: 14, justifyContent: "center" },
  repayButtonText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
  error: { color: "#dc2626", fontSize: 12 },
});
