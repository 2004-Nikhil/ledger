import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import type { CreateLendBorrowRequest, LendBorrowDirection } from "../features/lendBorrow/types";
import type { Account } from "@/features/accounts/types";
import { todayIso } from "@/utils/date";

type Props = {
  accounts: Account[];
  onSubmit: (request: CreateLendBorrowRequest) => Promise<void>;
};

export function LendBorrowForm({ accounts, onSubmit }: Props) {
  const [direction, setDirection] = useState<LendBorrowDirection>("lent");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsed = Number(amount);
    if (!person.trim()) return setError("Person is required.");
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");
    if (!accountId) return setError("Pick an account.");

    setIsSubmitting(true);
    try {
      await onSubmit({
        person,
        amount: parsed,
        date: todayIso(),
        direction,
        accountId,
        dueDate: dueDate.trim() || undefined,
      });
      setPerson("");
      setAmount("");
      setDueDate("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lend / Borrow</Text>

      <View style={styles.typeRow}>
        {(["lent", "borrowed"] as LendBorrowDirection[]).map((d) => (
          <Pressable
            key={d}
            onPress={() => setDirection(d)}
            style={[styles.typeChip, direction === d && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, direction === d && styles.typeChipTextActive]}>
              {d === "lent" ? "I lent" : "I borrowed"}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Person" value={person} onChangeText={setPerson} />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Account</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {accounts.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setAccountId(a.id)}
            style={[styles.chip, accountId === a.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, accountId === a.id && styles.chipTextActive]}>{a.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        placeholder="Due date YYYY-MM-DD (optional)"
        value={dueDate}
        onChangeText={setDueDate}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Saving…" : "Save"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 12 },
  title: { fontSize: 15, fontWeight: "600" },
  label: { fontSize: 12, color: "#6b7280" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  typeChipActive: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  typeChipText: { fontSize: 13, color: "#374151" },
  typeChipTextActive: { color: "#ffffff", fontWeight: "600" },
  chipScroll: { flexGrow: 0 },
  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#0891b2", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
