import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CreateAdjustmentRequest, Transaction } from "@/features/transactions/types";
import { Button, GlassCard, InlineError, Text, TextField, CURRENCY_SYMBOL, colors, money, space } from "@/ui";

type Props = {
  original: Transaction;
  onSubmit: (request: CreateAdjustmentRequest) => Promise<void>;
  onCancel: () => void;
};

/** Rendered inside a Sheet titled "Adjust entry". */
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
    <View style={{ gap: space.lg }}>
      <GlassCard quiet padding={space.lg} style={{ flexDirection: "row", gap: 12 }}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.accentText} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {original.name}
          </Text>
          <Text variant="caption" tone="secondary">
            This {original.type} of {money(original.amount)} is locked and can't be edited. An adjustment adds a new entry that
            corrects the balance and keeps the original visible, for the audit trail.
          </Text>
        </View>
      </GlassCard>

      <TextField
        size="lg"
        label="Corrected amount"
        prefix={CURRENCY_SYMBOL}
        value={correctedAmount}
        onChangeText={setCorrectedAmount}
        keyboardType="numeric"
      />

      <TextField label="Reason" placeholder="e.g. Typed the wrong amount" value={reason} onChangeText={setReason} />

      {error ? <InlineError message={error} /> : null}

      <View style={{ flexDirection: "row", gap: space.md }}>
        <Button label="Cancel" variant="glass" size="lg" onPress={onCancel} disabled={isSubmitting} style={{ flex: 1 }} />
        <Button label={isSubmitting ? "Saving…" : "Save adjustment"} loading={isSubmitting} onPress={handleSubmit} size="lg" style={{ flex: 2 }} />
      </View>
    </View>
  );
}
