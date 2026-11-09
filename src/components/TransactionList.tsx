import { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Transaction } from "@/features/transactions/types";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";
import { Button, Divider, EmptyState, MoneyText, Text, colors, money, shortDate, space } from "@/ui";

type RowProps = {
  transaction: Transaction;
  accountsById: Map<string, Account>;
  categoriesById: Map<string, Category>;
  locked: boolean;
  onAdjust?: (transaction: Transaction) => void;
};

/**
 * One transaction. Income is the only thing that earns emerald; expenses stay
 * white with a minus, so colour still means something when you scan a long list.
 * Locked entries show a small lock beside the date; tap one to reveal "Adjust".
 */
export const TransactionRow = memo(function TransactionRow({ transaction, accountsById, categoriesById, locked, onAdjust }: RowProps) {
  const [open, setOpen] = useState(false);
  const account = accountsById.get(transaction.accountId);
  const category = categoryById(categoriesById, transaction.categoryId);
  const isIncome = transaction.type === "income";
  const isAdjustment = transaction.adjustsTransactionId !== null;
  const expandable = locked && !!onAdjust;

  return (
    <View>
      <Pressable
        disabled={!expandable}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole={expandable ? "button" : undefined}
        accessibilityHint={expandable ? "Shows the adjust option for this locked entry" : undefined}
        accessibilityState={expandable ? { expanded: open } : undefined}
        accessibilityLabel={`${transaction.name}, ${isIncome ? "income" : "expense"} ${money(transaction.amount)}, ${category}, ${shortDate(transaction.date)}${locked ? ", locked" : ""}`}
        style={({ pressed }) => [styles.row, pressed && expandable && { opacity: 0.7 }]}
      >
        <View style={[styles.icon, isIncome && styles.iconIncome]}>
          <Ionicons
            name={isAdjustment ? "return-down-forward-outline" : isIncome ? "arrow-down-outline" : "arrow-up-outline"}
            size={18}
            color={isIncome ? colors.positive : colors.textSecondary}
          />
        </View>

        <View style={styles.body}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {transaction.name}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {category} · {account?.name ?? "Unknown account"}
          </Text>
          {transaction.notes && isAdjustment ? (
            <Text variant="caption" tone="muted" numberOfLines={2} style={{ fontStyle: "italic" }}>
              {transaction.notes}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          <MoneyText amount={transaction.amount} size="amount" tone={isIncome ? "positive" : "primary"} sign={isIncome ? "+" : "\u2212"} align="right" />
          <View style={styles.dateRow}>
            {locked ? <Ionicons name="lock-closed-outline" size={11} color={colors.textMuted} /> : null}
            <Text variant="caption" tone="secondary">
              {shortDate(transaction.date)}
            </Text>
          </View>
        </View>
      </Pressable>

      {open && expandable ? (
        <View style={styles.reveal}>
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            Locked. Adjusting adds a correcting entry and keeps this one visible.
          </Text>
          <Button label="Adjust" size="sm" variant="glass" icon="create-outline" onPress={() => onAdjust?.(transaction)} accessibilityLabel={`Adjust ${transaction.name}`} />
        </View>
      ) : null}
    </View>
  );
});

function categoryById(map: Map<string, Category>, id: string): string {
  return map.get(id)?.name ?? "Uncategorized";
}

type Props = {
  transactions: Transaction[];
  accountsById: Map<string, Account>;
  categoriesById: Map<string, Category>;
  isEditable: (transaction: Transaction) => boolean;
  onAdjust?: (transaction: Transaction) => void;
  emptyTitle?: string;
  emptyMessage?: string;
};

/** Non-virtualised list, for short sets (a single calendar day). The main list uses FlatList + TransactionRow. */
export function TransactionList({
  transactions,
  accountsById,
  categoriesById,
  isEditable,
  onAdjust,
  emptyTitle = "No transactions yet",
  emptyMessage = "Tap + to log your first one.",
}: Props) {
  if (transactions.length === 0) {
    return <EmptyState icon="receipt-outline" title={emptyTitle} message={emptyMessage} />;
  }
  return (
    <View>
      {transactions.map((t, i) => (
        <View key={t.id}>
          {i > 0 && <Divider inset={56} />}
          <TransactionRow transaction={t} accountsById={accountsById} categoriesById={categoriesById} locked={!isEditable(t)} onAdjust={onAdjust} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 14, minHeight: 64 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.border,
  },
  iconIncome: { backgroundColor: colors.positiveSoft, borderColor: colors.positiveBorder },
  body: { flex: 1, gap: 2 },
  right: { alignItems: "flex-end", gap: 2, maxWidth: "42%" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  reveal: { flexDirection: "row", alignItems: "center", gap: space.md, paddingBottom: 14, paddingLeft: 56 },
});
