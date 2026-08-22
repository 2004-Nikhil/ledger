import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { CreateGoalRequest } from "@/features/goals/types";

type Props = {
  onSubmit: (request: CreateGoalRequest) => Promise<void>;
};

export function GoalForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [requiredAmount, setRequiredAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsed = Number(requiredAmount);
    if (!name.trim()) return setError("Name is required.");
    if (!category.trim()) return setError("Category is required.");
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");

    setIsSubmitting(true);
    try {
      await onSubmit({ name, category, requiredAmount: parsed, targetDate: targetDate.trim() || undefined });
      setName("");
      setCategory("");
      setRequiredAmount("");
      setTargetDate("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add savings goal</Text>

      <TextInput style={styles.input} placeholder="Goal name (e.g. Emergency Fund)" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Category (e.g. Safety Net)" value={category} onChangeText={setCategory} />
      <TextInput
        style={styles.input}
        placeholder="Required amount"
        value={requiredAmount}
        onChangeText={setRequiredAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Target date YYYY-MM-DD (optional)"
        value={targetDate}
        onChangeText={setTargetDate}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Adding…" : "Add goal"}</Text>
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
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#9333ea", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
