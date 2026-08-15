import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { AdjustmentForm } from "@/components/AdjustmentForm";
import type { Transaction } from "@/features/transactions/types";

export default function TransactionsScreen() {
  const { transactions, addTransaction, addAdjustmentEntry, isEditable } = useTransactions();
  const { accounts } = useAccounts();
  const { categories, incomeCategories, expenseCategories } = useCategories();

  const [adjusting, setAdjusting] = useState<Transaction | null>(null);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TransactionList
        transactions={transactions}
        accountsById={accountsById}
        categoriesById={categoriesById}
        isEditable={isEditable}
        onAdjust={setAdjusting}
      />

      {adjusting && (
        <AdjustmentForm
          original={adjusting}
          onCancel={() => setAdjusting(null)}
          onSubmit={async (request) => {
            await addAdjustmentEntry(request);
            setAdjusting(null);
          }}
        />
      )}

      <AddTransactionForm
        accounts={accounts}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onSubmit={addTransaction}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
