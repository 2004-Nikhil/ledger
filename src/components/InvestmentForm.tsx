import { useState } from "react";
import { View } from "react-native";
import type { CreateInvestmentRequest, InvestmentType, SipFrequency } from "@/features/investments/types";
import { Button, InlineError, Segmented, Text, TextField, CURRENCY_SYMBOL, space } from "@/ui";

const TYPES: { value: InvestmentType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "mutual_fund", label: "Mutual fund" },
  { value: "sip", label: "SIP" },
];

const FREQUENCIES: { value: SipFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

type Props = {
  onSubmit: (request: CreateInvestmentRequest) => Promise<void>;
};

/** Rendered inside a Sheet titled "Add investment". */
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
    <View style={{ gap: space.lg }}>
      <Segmented options={TYPES} value={type} onChange={setType} />

      <TextField label="Name or ticker" placeholder="e.g. NIFTY 50 Index Fund" value={name} onChangeText={setName} autoCapitalize="words" />

      <TextField size="lg" label="Current total value" prefix={CURRENCY_SYMBOL} placeholder="0" value={currentValue} onChangeText={setCurrentValue} keyboardType="numeric" />

      <View style={{ flexDirection: "row", gap: space.md }}>
        <View style={{ flex: 1 }}>
          <TextField label="Units" placeholder="Optional" value={units} onChangeText={setUnits} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Buy price / unit" placeholder="Optional" value={buyPrice} onChangeText={setBuyPrice} keyboardType="numeric" />
        </View>
      </View>

      {type === "sip" ? (
        <>
          <TextField label="SIP amount per installment" prefix={CURRENCY_SYMBOL} placeholder="0" value={sipAmount} onChangeText={setSipAmount} keyboardType="numeric" />
          <View style={{ gap: 8 }}>
            <Text variant="captionStrong" tone="secondary">
              Frequency
            </Text>
            <Segmented options={FREQUENCIES} value={sipFrequency} onChange={setSipFrequency} />
          </View>
        </>
      ) : null}

      {error ? <InlineError message={error} /> : null}

      <Button label={isSubmitting ? "Adding…" : "Add investment"} loading={isSubmitting} onPress={handleSubmit} fullWidth size="lg" />
    </View>
  );
}
