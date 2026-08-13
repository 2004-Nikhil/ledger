import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import type { CreateTransactionRequest, TransactionType } from "@/features/transactions/types";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { todayIso } from "@/utils/date";

type Props = {
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  onSubmit: (request: CreateTransactionRequest) => Promise<void>;
};

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
    <View style={styles.container}>
      <Text style={styles.title}>Log transaction</Text>

      <View style={styles.typeRow}>
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setType(t);
              setCategoryId(null);
            }}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
              {t === "expense" ? "Expense" : "Income"}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Name (e.g. Groceries)" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategoryId(c.id)}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Account</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {accounts.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setAccountId(a.id)}
            style={[styles.chip, accountId === a.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, accountId === a.id && styles.chipTextActive]}>{a.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.submit, isSubmitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>{isSubmitting ? "Saving…" : "Save transaction"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 12 },
  title: { fontSize: 15, fontWeight: "600" },
  label: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  typeChipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  typeChipText: { fontSize: 13, color: "#374151" },
  typeChipTextActive: { color: "#ffffff", fontWeight: "600" },
  chipScroll: { flexGrow: 0 },
  chip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
