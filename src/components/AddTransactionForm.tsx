import { useMemo, useState } from "react";
import { View } from "react-native";
import type { CreateTransactionRequest, TransactionType } from "@/features/transactions/types";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { Button, Chip, ChipRow, InlineError, Segmented, Text, TextField, CURRENCY_SYMBOL, space } from "@/ui";
import { todayIso } from "@/utils/date";

type Props = {
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  onSubmit: (request: CreateTransactionRequest) => Promise<void>;
};

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

/** Rendered inside a Sheet (which supplies the title and page padding). */
export function AddTransactionForm({ accounts, incomeCategories, expenseCategories, onSubmit }: Props) {
  const [type, setType] = useState<TransactionType>("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(
    () => (type === "income" ? incomeCategories : expenseCategories),
    [type, incomeCategories, expenseCategories]
  );

  const handleSubmit = async () => {
    setError(null);

    const parsedAmount = Number(amount);
    if (!name.trim()) return setError("Name is required.");
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return setError("Enter an amount greater than 0.");
    if (!categoryId) return setError("Pick a category.");
    if (!accountId) return setError("Pick an account.");

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        amount: parsedAmount,
        date: todayIso(),
        categoryId,
        accountId,
        type,
        notes: notes.trim() || undefined,
      });
      setName("");
      setAmount("");
      setNotes("");
      setCategoryId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ gap: space.lg }}>
      <Segmented
        options={TYPE_OPTIONS}
        value={type}
        onChange={(t) => {
          setType(t);
          setCategoryId(null);
        }}
      />

      <TextField
        size="lg"
        label="Amount"
        prefix={CURRENCY_SYMBOL}
        placeholder="0"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TextField label="Name" placeholder="e.g. Groceries" value={name} onChangeText={setName} returnKeyType="next" />

      <View style={{ gap: 8 }}>
        <Text variant="captionStrong" tone="secondary">
          Category
        </Text>
        {categories.length === 0 ? (
          <Text variant="caption" tone="muted">
            No {type} categories yet. Add one from Budgets.
          </Text>
        ) : (
          <ChipRow bleed={space.xl}>
            {categories.map((c) => (
              <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
            ))}
          </ChipRow>
        )}
      </View>

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

      <TextField label="Notes" placeholder="Optional" value={notes} onChangeText={setNotes} />

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Saving…" : "Save transaction"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
