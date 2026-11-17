import { useState } from "react";
import { View } from "react-native";
import type { CreateLendBorrowRequest, LendBorrowDirection } from "../features/lendBorrow/types";
import type { Account } from "@/features/accounts/types";
import { Button, Chip, ChipRow, InlineError, Segmented, Text, TextField, CURRENCY_SYMBOL, space } from "@/ui";
import { todayIso } from "@/utils/date";

type Props = {
  accounts: Account[];
  onSubmit: (request: CreateLendBorrowRequest) => Promise<void>;
};

const DIRECTIONS: { value: LendBorrowDirection; label: string }[] = [
  { value: "lent", label: "I lent" },
  { value: "borrowed", label: "I borrowed" },
];

/** Rendered inside a Sheet titled "Lend or borrow". */
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
    <View style={{ gap: space.lg }}>
      <Segmented options={DIRECTIONS} value={direction} onChange={setDirection} />

      <TextField size="lg" label="Amount" prefix={CURRENCY_SYMBOL} placeholder="0" value={amount} onChangeText={setAmount} keyboardType="numeric" />

      <TextField label="Person" placeholder="Who is it with?" value={person} onChangeText={setPerson} autoCapitalize="words" />

      <View style={{ gap: 8 }}>
        <Text variant="captionStrong" tone="secondary">
          Account
        </Text>
        <ChipRow bleed={space.xl}>
          {accounts.map((a) => (
            <Chip key={a.id} label={a.name} selected={accountId === a.id} onPress={() => setAccountId(a.id)} />
          ))}
        </ChipRow>
      </View>

      <TextField
        label="Due date"
        placeholder="YYYY-MM-DD (optional)"
        helper="Use the format 2026-12-31."
        value={dueDate}
        onChangeText={setDueDate}
        keyboardType="numbers-and-punctuation"
        autoCorrect={false}
      />

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Saving…" : "Save"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
