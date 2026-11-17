import { useState } from "react";
import { View } from "react-native";
import type { AccountType, CreateAccountRequest } from "@/features/accounts/types";
import { Button, InlineError, Segmented, Text, TextField, CURRENCY_SYMBOL, space } from "@/ui";

const TYPES: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank" },
];

type Props = {
  onSubmit: (request: CreateAccountRequest) => Promise<void>;
};

/** Rendered inside a Sheet titled "Add account". */
export function AddAccountForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsedBalance = openingBalance.trim() === "" ? 0 : Number(openingBalance);
    if (Number.isNaN(parsedBalance)) {
      setError("Opening balance must be a number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, type, openingBalance: parsedBalance });
      setName("");
      setOpeningBalance("");
      setType("cash");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ gap: space.lg }}>
      <TextField label="Account name" placeholder="e.g. HDFC Savings" value={name} onChangeText={setName} />

      <View style={{ gap: 8 }}>
        <Text variant="captionStrong" tone="secondary">
          Type
        </Text>
        <Segmented options={TYPES} value={type} onChange={setType} />
      </View>

      <TextField
        label="Opening balance"
        prefix={CURRENCY_SYMBOL}
        placeholder="0 (optional)"
        value={openingBalance}
        onChangeText={setOpeningBalance}
        keyboardType="numeric"
      />

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Adding…" : "Add account"} loading={isSubmitting} disabled={!name.trim()} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
