import { useState } from "react";
import { View } from "react-native";
import type { CreateTransferRequest } from "../features/transfers/types";
import type { Account } from "@/features/accounts/types";
import { Button, Chip, ChipRow, InlineError, Text, TextField, CURRENCY_SYMBOL, space } from "@/ui";
import { todayIso } from "@/utils/date";

type Props = {
  accounts: Account[];
  onSubmit: (request: CreateTransferRequest) => Promise<void>;
};

/** Rendered inside a Sheet titled "Transfer". */
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

  const renderPicker = (label: string, selected: string | null, onSelect: (id: string) => void, exclude: string | null) => (
    <View style={{ gap: 8 }}>
      <Text variant="captionStrong" tone="secondary">
        {label}
      </Text>
      <ChipRow bleed={space.xl}>
        {accounts
          .filter((a) => a.id !== exclude)
          .map((a) => (
            <Chip key={a.id} label={a.name} selected={selected === a.id} onPress={() => onSelect(a.id)} />
          ))}
      </ChipRow>
    </View>
  );

  return (
    <View style={{ gap: space.lg }}>
      {renderPicker("From", fromAccountId, setFromAccountId, toAccountId)}
      {renderPicker("To", toAccountId, setToAccountId, fromAccountId)}

      <TextField size="lg" label="Amount" prefix={CURRENCY_SYMBOL} placeholder="0" value={amount} onChangeText={setAmount} keyboardType="numeric" />

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Transferring…" : "Transfer"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
