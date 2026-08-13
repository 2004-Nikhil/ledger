import { ScrollView, StyleSheet } from "react-native";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { AccountList } from "@/components/AccountList";
import { AddAccountForm } from "@/components/AddAccountForm";

export default function AccountsScreen() {
  const { accounts, netWorth, addAccount } = useAccounts();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AccountList accounts={accounts} netWorth={netWorth} />
      <AddAccountForm onSubmit={addAccount} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
