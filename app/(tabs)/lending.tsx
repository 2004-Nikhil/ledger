import { ScrollView, StyleSheet } from "react-native";
import { useLendBorrow } from "@/features/lendBorrow/hooks/useLendBorrow";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { LendBorrowList } from "@/components/LendBorrowList";
import { LendBorrowForm } from "@/components/LendBorrowForm";

export default function LendingScreen() {
  const { entries, addEntry, recordRepayment } = useLendBorrow();
  const { accounts } = useAccounts();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LendBorrowList
        entries={entries}
        onRepay={(lendBorrowId, amount) => recordRepayment({ lendBorrowId, amount })}
      />
      <LendBorrowForm accounts={accounts} onSubmit={addEntry} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
