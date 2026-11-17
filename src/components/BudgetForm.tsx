import { useEffect, useState } from "react";
import { View } from "react-native";
import type { CategoryBudgetSummary, SetBudgetRequest } from "@/features/budgets/types";
import { Button, InlineError, SwitchRow, TextField, CURRENCY_SYMBOL, space } from "@/ui";

type Props = {
  summary: CategoryBudgetSummary;
  onSubmit: (request: Omit<SetBudgetRequest, "month">) => Promise<void>;
};

/** Rendered inside a Sheet titled "Budget · {category}". */
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
    <View style={{ gap: space.lg }}>
      <TextField
        size="lg"
        label="Monthly allotted amount"
        prefix={CURRENCY_SYMBOL}
        placeholder="0"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <SwitchRow label="Roll unused amount into next month" value={rolloverEnabled} onValueChange={setRolloverEnabled} />

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Saving…" : "Save budget"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
