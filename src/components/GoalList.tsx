import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import type { Goal, GoalProgress } from "../features/goals/types";
import type { Account } from "@/features/accounts/types";
import { formatCurrency } from "@/utils/currency";
import { formatDisplayDate } from "@/utils/date";

type Props = {
  goals: Goal[];
  progressByGoalId: Map<string, GoalProgress>;
  accounts: Account[];
  onContribute: (goalId: string, accountId: string, amount: number) => Promise<void>;
};

function GoalRow({
  goal,
  progress,
  accounts,
  onContribute,
}: {
  goal: Goal;
  progress: GoalProgress | undefined;
  accounts: Account[];
  onContribute: Props["onContribute"];
}) {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percent = progress?.percentComplete ?? 0;
  const isComplete = percent >= 100;

  const handleContribute = async () => {
    setError(null);
    const parsed = Number(amount);
    if (!accountId) return setError("Pick an account.");
    if (Number.isNaN(parsed) || parsed <= 0) return setError("Enter an amount greater than 0.");

    setIsSubmitting(true);
    try {
      await onContribute(goal.id, accountId, parsed);
      setAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{goal.name}</Text>
        <Text style={styles.category}>{goal.category}</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(100, percent)}%` }, isComplete && styles.barComplete]} />
      </View>

      <Text style={styles.meta}>
        {formatCurrency(goal.accumulatedAmount)} of {formatCurrency(goal.requiredAmount)} ({percent.toFixed(0)}%)
        {goal.targetDate ? ` · target ${formatDisplayDate(goal.targetDate)}` : ""}
      </Text>

      {!isComplete && (
        <Text style={styles.projection}>
          {progress?.projectedCompletionDate
            ? `At this pace, done around ${formatDisplayDate(progress.projectedCompletionDate)}`
            : "Not enough contribution history yet to project a completion date"}
        </Text>
      )}

      {isComplete && <Text style={styles.completeLabel}>{"Goal reached \u{1F389}"}</Text>}

      {!isComplete && (
        <View style={styles.contributeRow}>
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
          <View style={styles.contributeInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Contribute amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Pressable style={styles.contributeButton} onPress={handleContribute} disabled={isSubmitting}>
              <Text style={styles.contributeButtonText}>{isSubmitting ? "…" : "Add"}</Text>
            </Pressable>
          </View>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function GoalList({ goals, progressByGoalId, accounts, onContribute }: Props) {
  return (
    <FlatList
      data={goals}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.empty}>No savings goals yet — add one below.</Text>}
      renderItem={({ item }) => (
        <GoalRow
          goal={item}
          progress={progressByGoalId.get(item.id)}
          accounts={accounts}
          onContribute={onContribute}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { color: "#6b7280", fontSize: 13, paddingVertical: 12 },
  row: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb", gap: 6 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "600" },
  category: { fontSize: 11, color: "#9333ea", fontWeight: "700", textTransform: "uppercase" },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: "#e5e7eb", overflow: "hidden" },
  barFill: { height: 8, backgroundColor: "#9333ea" },
  barComplete: { backgroundColor: "#16a34a" },
  meta: { fontSize: 12, color: "#6b7280" },
  projection: { fontSize: 12, color: "#7c3aed", fontStyle: "italic" },
  completeLabel: { fontSize: 13, color: "#16a34a", fontWeight: "700" },
  contributeRow: { gap: 6, marginTop: 4 },
  chipScroll: { flexGrow: 0 },
  chip: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipActive: { backgroundColor: "#9333ea", borderColor: "#9333ea" },
  chipText: { fontSize: 12, color: "#374151" },
  chipTextActive: { color: "#ffffff", fontWeight: "600" },
  contributeInputRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  contributeButton: { backgroundColor: "#9333ea", borderRadius: 8, paddingHorizontal: 16, justifyContent: "center" },
  contributeButtonText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
  error: { color: "#dc2626", fontSize: 12 },
});
