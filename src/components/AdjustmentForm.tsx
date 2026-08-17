import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { CreateAdjustmentRequest, Transaction } from "@/features/transactions/types";
import { formatCurrency } from "@/utils/currency";

type Props = {
  original: Transaction;
  onSubmit: (request: CreateAdjustmentRequest) => Promise<void>;
  onCancel: () => void;
};

export function AdjustmentForm({ original, onSubmit, onCancel }: Props) {
  const [correctedAmount, setCorrectedAmount] = useState(String(original.amount));
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsed = Number(correctedAmount);
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");
    if (!reason.trim()) return setError("A short reason is required — this becomes the audit note.");

    setIsSubmitting(true);
    try {
      await onSubmit({ originalTransactionId: original.id, correctedAmount: parsed, reason });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adjust "{original.name}"</Text>
      <Text style={styles.hint}>
        This is locked ({formatCurrency(original.amount)}, {original.type}) and can't be edited
        directly. Adding an adjustment creates a new entry that corrects the balance and keeps
        the original visible, for the audit trail.
      </Text>

      <Text style={styles.label}>Corrected amount</Text>
      <TextInput
        style={styles.input}
        value={correctedAmount}
        onChangeText={setCorrectedAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Reason</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Typed the wrong amount"
        value={reason}
        onChangeText={setReason}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.actions}>
        <Pressable style={styles.cancel} onPress={onCancel} disabled={isSubmitting}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitText}>{isSubmitting ? "Saving…" : "Save adjustment"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 12, backgroundColor: "#fffbeb", borderRadius: 10, marginVertical: 8 },
  title: { fontSize: 14, fontWeight: "600" },
  hint: { fontSize: 12, color: "#92400e", lineHeight: 16 },
  label: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
  error: { color: "#dc2626", fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  cancel: { flex: 1, alignItems: "center", paddingVertical: 10 },
  cancelText: { color: "#6b7280", fontSize: 13 },
  submit: { flex: 2, backgroundColor: "#b45309", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
});
