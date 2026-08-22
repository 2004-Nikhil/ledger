import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from "react-native";
import type { Investment, PortfolioSummary } from "@/features/investments/types";
import { formatCurrency } from "@/utils/currency";

type Props = {
  investments: Investment[];
  summary: PortfolioSummary;
  onUpdateValue: (investmentId: string, currentValue: number) => Promise<void>;
};

const TYPE_LABEL: Record<Investment["type"], string> = {
  stock: "Stock",
  mutual_fund: "Mutual Fund",
  sip: "SIP",
};

function InvestmentRow({
  investment,
  onUpdateValue,
}: {
  investment: Investment;
  onUpdateValue: Props["onUpdateValue"];
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(investment.currentValue));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cost = investment.units * investment.buyPrice;
  const gain = investment.currentValue - cost;
  const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

  const handleSave = async () => {
    setError(null);
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return setError("Enter a value of 0 or more.");
    setIsSubmitting(true);
    try {
      await onUpdateValue(investment.id, parsed);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.name}>{investment.name}</Text>
          <Text style={styles.type}>
            {TYPE_LABEL[investment.type]}
            {investment.units > 0 ? ` · ${investment.units} units @ ${formatCurrency(investment.buyPrice)}` : ""}
            {investment.type === "sip" && investment.sipAmount
              ? ` · ${formatCurrency(investment.sipAmount)}/${investment.sipFrequency}`
              : ""}
          </Text>
        </View>
        <View style={styles.valueBlock}>
          <Text style={styles.value}>{formatCurrency(investment.currentValue)}</Text>
          {cost > 0 && (
            <Text style={[styles.gain, gain >= 0 ? styles.up : styles.down]}>
              {gain >= 0 ? "+" : ""}
              {formatCurrency(gain)} ({gainPercent.toFixed(1)}%)
            </Text>
          )}
        </View>
      </View>

      {!editing ? (
        <Pressable onPress={() => setEditing(true)} hitSlop={6}>
          <Text style={styles.updateLink}>Update current value</Text>
        </Pressable>
      ) : (
        <View style={styles.editRow}>
          <TextInput style={styles.input} value={value} onChangeText={setValue} keyboardType="numeric" />
          <Pressable style={styles.saveButton} onPress={handleSave} disabled={isSubmitting}>
            <Text style={styles.saveButtonText}>{isSubmitting ? "…" : "Save"}</Text>
          </Pressable>
          <Pressable onPress={() => setEditing(false)} hitSlop={6}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </Pressable>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function InvestmentList({ investments, summary, onUpdateValue }: Props) {
  return (
    <View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Portfolio value</Text>
        <Text style={styles.summaryValue}>{formatCurrency(summary.totalCurrentValue)}</Text>
        {summary.totalCost > 0 && (
          <Text style={[styles.summaryGain, summary.totalGain >= 0 ? styles.up : styles.down]}>
            {summary.totalGain >= 0 ? "+" : ""}
            {formatCurrency(summary.totalGain)} ({summary.totalGainPercent.toFixed(1)}%)
          </Text>
        )}
      </View>

      <FlatList
        data={investments}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No investments tracked yet — add one below.</Text>}
        renderItem={({ item }) => <InvestmentRow investment={item} onUpdateValue={onUpdateValue} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: "#eff6ff", borderRadius: 12, padding: 16, gap: 4, marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: "#1e40af" },
  summaryValue: { fontSize: 26, fontWeight: "700", color: "#1e40af" },
  summaryGain: { fontSize: 13, fontWeight: "600" },
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb", gap: 6 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontSize: 15, fontWeight: "600" },
  type: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  valueBlock: { alignItems: "flex-end" },
  value: { fontSize: 15, fontWeight: "700" },
  gain: { fontSize: 12, fontWeight: "600" },
  up: { color: "#16a34a" },
  down: { color: "#dc2626" },
  updateLink: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  saveButton: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 14, justifyContent: "center", paddingVertical: 8 },
  saveButtonText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
  cancelLink: { fontSize: 12, color: "#6b7280" },
  error: { color: "#dc2626", fontSize: 12 },
});
