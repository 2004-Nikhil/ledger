import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from "react-native";
import type { CategoryBudgetSummary, SetBudgetRequest } from "@/features/budgets/types";

type Props = {
  summary: CategoryBudgetSummary;
  onSubmit: (request: Omit<SetBudgetRequest, "month">) => Promise<void>;
};

export function BudgetForm({ summary, onSubmit }: Props) {
  const [amount, setAmount] = useState(summary.allotted ? String(summary.allotted) : "");
  const [rolloverEnabled, setRolloverEnabled] = useState(summary.rolloverEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-sync whenever a different category (or a different month) is selected.
  useEffect(() => {
    setAmount(summary.allotted ? String(summary.allotted) : "");
    setRolloverEnabled(summary.rolloverEnabled);
    setError(null);
  }, [summary.categoryId, summary.month, summary.allotted, summary.rolloverEnabled]);

  const handleSubmit = async () => {
    setError(null);
    const parsed = amount.trim() === "" ? 0 : Number(amount);
    if (Number.isNaN(parsed) || parsed < 0) return setError("Enter an amount of 0 or more.");

    setIsSubmitting(true);
    try {
      await onSubmit({ categoryId: summary.categoryId, allottedAmount: parsed, rolloverEnabled });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget for {summary.categoryName}</Text>

      <TextInput
        style={styles.input}
        placeholder="Monthly allotted amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Roll unused amount into next month</Text>
        <Switch value={rolloverEnabled} onValueChange={setRolloverEnabled} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Saving…" : "Save budget"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb" },
  title: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchLabel: { fontSize: 13, color: "#374151", flex: 1, paddingRight: 12 },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
