import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import type { CreateTransferRequest } from "../features/transfers/types";
import type { Account } from "@/features/accounts/types";
import { todayIso } from "@/utils/date";

type Props = {
  accounts: Account[];
  onSubmit: (request: CreateTransferRequest) => Promise<void>;
};

export function TransferForm({ accounts, onSubmit }: Props) {
  const [fromAccountId, setFromAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsed = Number(amount);
    if (!fromAccountId) return setError("Pick a source account.");
    if (!toAccountId) return setError("Pick a destination account.");
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");

    setIsSubmitting(true);
    try {
      await onSubmit({ fromAccountId, toAccountId, amount: parsed, date: todayIso() });
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPicker = (
    label: string,
    selected: string | null,
    onSelect: (id: string) => void,
    exclude: string | null
  ) => (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {accounts
          .filter((a) => a.id !== exclude)
          .map((a) => (
            <Pressable
              key={a.id}
              onPress={() => onSelect(a.id)}
              style={[styles.chip, selected === a.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected === a.id && styles.chipTextActive]}>{a.name}</Text>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer between accounts</Text>

      {renderPicker("From", fromAccountId, setFromAccountId, toAccountId)}
      {renderPicker("To", toAccountId, setToAccountId, fromAccountId)}

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Transferring…" : "Transfer"}</Text>
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
  chipScroll: { flexGrow: 0 },
  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#7c3aed", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
