import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransfers } from "@/features/transfers/hooks/useTransfers";
import { AccountList } from "@/components/AccountList";
import { AddAccountForm } from "@/components/AddAccountForm";
import { TransferForm } from "@/components/TransferForm";
import { TransferList } from "@/components/TransferList";

export default function AccountsScreen() {
  const { accounts, totalBalance, addAccount } = useAccounts();
  const { transfers, addTransfer } = useTransfers();

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AccountList accounts={accounts} netWorth={totalBalance} />

      {accounts.length >= 2 && <TransferForm accounts={accounts} onSubmit={addTransfer} />}
      <TransferList transfers={transfers} accountsById={accountsById} />

      <AddAccountForm onSubmit={addAccount} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
