import { useState } from "react";
import { View } from "react-native";
import type { CreateGoalRequest } from "@/features/goals/types";
import { Button, InlineError, TextField, CURRENCY_SYMBOL, space } from "@/ui";

type Props = {
  onSubmit: (request: CreateGoalRequest) => Promise<void>;
};

/** Rendered inside a Sheet titled "New savings goal". */
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
    <View style={{ gap: space.lg }}>
      <TextField label="Goal name" placeholder="e.g. Emergency Fund" value={name} onChangeText={setName} />
      <TextField label="Category" placeholder="e.g. Safety Net" value={category} onChangeText={setCategory} />
      <TextField size="lg" label="Required amount" prefix={CURRENCY_SYMBOL} placeholder="0" value={requiredAmount} onChangeText={setRequiredAmount} keyboardType="numeric" />
      <TextField
        label="Target date"
        placeholder="YYYY-MM-DD (optional)"
        helper="Use the format 2027-03-31."
        value={targetDate}
        onChangeText={setTargetDate}
        keyboardType="numbers-and-punctuation"
        autoCorrect={false}
      />

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Adding…" : "Add goal"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
