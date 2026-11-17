import { View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import { Dock, Drawer, EmptyState, ScreenBackground, Sheet, ShellProvider, SkeletonRows, useShell } from "@/ui";

/**
 * Information architecture
 *  · Dock (4 + quick add): Home, Activity, Accounts, Budgets — the things you open daily.
 *  · Drawer: everything else (Analytics, Goals, Investments, Lending, Backup) plus a full map.
 * The drawer-only routes stay registered here (href: null) so they're still real tab
 * screens with preserved state; they just don't get a dock slot.
 */
export default function TabsLayout() {
  return (
    <ShellProvider>
      <View style={{ flex: 1 }}>
        <ScreenBackground />
        <Tabs
          tabBar={(props) => <Dock {...props} />}
          screenOptions={{ headerShown: false, animation: "fade", sceneStyle: { backgroundColor: "transparent" } }}
        >
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          <Tabs.Screen name="transactions" options={{ title: "Activity" }} />
          <Tabs.Screen name="accounts" options={{ title: "Accounts" }} />
          <Tabs.Screen name="budgets" options={{ title: "Budgets" }} />

          <Tabs.Screen name="analytics" options={{ title: "Analytics", href: null }} />
          <Tabs.Screen name="goals" options={{ title: "Goals", href: null }} />
          <Tabs.Screen name="investments" options={{ title: "Investments", href: null }} />
          <Tabs.Screen name="lending" options={{ title: "Lend and borrow", href: null }} />
          <Tabs.Screen name="data" options={{ title: "Backup and restore", href: null }} />
        </Tabs>
        <ShellOverlays />
      </View>
    </ShellProvider>
  );
}

function ShellOverlays() {
  const { drawerOpen, closeDrawer } = useShell();
  return (
    <>
      <Drawer visible={drawerOpen} onClose={closeDrawer} />
      <QuickAddSheet />
    </>
  );
}

/** The one-tap way to log a transaction, from anywhere. */
function QuickAddSheet() {
  const { quickAddOpen, closeQuickAdd } = useShell();
  const router = useRouter();
  const { accounts, isLoading } = useAccounts();
  const { addTransaction } = useTransactions();
  const { incomeCategories, expenseCategories } = useCategories();

  return (
    <Sheet visible={quickAddOpen} onClose={closeQuickAdd} title="Log transaction" subtitle="Saved with today's date">
      {accounts.length === 0 ? (
        isLoading ? (
          <SkeletonRows count={3} />
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="Add an account first"
            message="Every transaction needs an account to come from."
            actionLabel="Go to Accounts"
            onAction={() => {
              closeQuickAdd();
              router.navigate("/accounts" as never);
            }}
          />
        )
      ) : (
        <AddTransactionForm
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          onSubmit={async (request) => {
            await addTransaction(request);
            closeQuickAdd();
          }}
        />
      )}
    </Sheet>
  );
}
