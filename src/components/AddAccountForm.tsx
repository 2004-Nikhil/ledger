import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { AccountType, CreateAccountRequest } from "@/features/accounts/types";

const TYPES: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank" },
];

type Props = {
  onSubmit: (request: CreateAccountRequest) => Promise<void>;
};

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
    <View style={styles.container}>
      <Text style={styles.title}>Add account</Text>

      <TextInput
        style={styles.input}
        placeholder="Account name (e.g. HDFC Savings)"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setType(t.value)}
            style={[styles.typeChip, type === t.value && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Opening balance (optional)"
        value={openingBalance}
        onChangeText={setOpeningBalance}
        keyboardType="numeric"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.submit, isSubmitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || !name.trim()}
      >
        <Text style={styles.submitText}>{isSubmitting ? "Adding…" : "Add account"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 12 },
  title: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  typeChipText: { fontSize: 13, color: "#374151" },
  typeChipTextActive: { color: "#ffffff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#16a34a", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
