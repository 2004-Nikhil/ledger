import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { CreateInvestmentRequest, InvestmentType, SipFrequency } from "@/features/investments/types";

const TYPES: { value: InvestmentType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "sip", label: "SIP" },
];

const FREQUENCIES: SipFrequency[] = ["weekly", "monthly", "quarterly"];

type Props = {
  onSubmit: (request: CreateInvestmentRequest) => Promise<void>;
};

export function InvestmentForm({ onSubmit }: Props) {
  const [type, setType] = useState<InvestmentType>("stock");
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [sipAmount, setSipAmount] = useState("");
  const [sipFrequency, setSipFrequency] = useState<SipFrequency>("monthly");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsedUnits = units.trim() === "" ? 0 : Number(units);
    const parsedBuyPrice = buyPrice.trim() === "" ? 0 : Number(buyPrice);
    const parsedCurrentValue = Number(currentValue);

    if (!name.trim()) return setError("Name is required.");
    if (Number.isNaN(parsedCurrentValue) || parsedCurrentValue < 0) {
      return setError("Enter the current value (0 or more).");
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        name,
        units: parsedUnits,
        buyPrice: parsedBuyPrice,
        currentValue: parsedCurrentValue,
        sipAmount: type === "sip" ? Number(sipAmount) : undefined,
        sipFrequency: type === "sip" ? sipFrequency : undefined,
      });
      setName("");
      setUnits("");
      setBuyPrice("");
      setCurrentValue("");
      setSipAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add investment</Text>

      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setType(t.value)}
            style={[styles.typeChip, type === t.value && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Name / ticker" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Units (optional)" value={units} onChangeText={setUnits} keyboardType="numeric" />
      <TextInput
        style={styles.input}
        placeholder="Buy price per unit (optional)"
        value={buyPrice}
        onChangeText={setBuyPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Current total value"
        value={currentValue}
        onChangeText={setCurrentValue}
        keyboardType="numeric"
      />

      {type === "sip" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="SIP amount per installment"
            value={sipAmount}
            onChangeText={setSipAmount}
            keyboardType="numeric"
          />
          <View style={styles.typeRow}>
            {FREQUENCIES.map((f) => (
              <Pressable
                key={f}
                onPress={() => setSipFrequency(f)}
                style={[styles.typeChip, sipFrequency === f && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, sipFrequency === f && styles.typeChipTextActive]}>{f}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.submitText}>{isSubmitting ? "Adding…" : "Add investment"}</Text>
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
  typeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  typeChip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  typeChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  typeChipText: { fontSize: 13, color: "#374151" },
  typeChipTextActive: { color: "#ffffff", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 13 },
  submit: { backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
