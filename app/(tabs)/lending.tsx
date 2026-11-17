import { useState } from "react";
import { useRouter } from "expo-router";
import { useLendBorrow } from "@/features/lendBorrow/hooks/useLendBorrow";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { LendBorrowList } from "@/components/LendBorrowList";
import { LendBorrowForm } from "@/components/LendBorrowForm";
import { Button, EmptyState, ErrorNotice, Screen, Sheet } from "@/ui";

export default function LendingScreen() {
  const router = useRouter();
  const { entries, addEntry, recordRepayment, isLoading, error, refresh } = useLendBorrow();
  const { accounts } = useAccounts();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <Screen title="Lend and borrow" onRefresh={refresh} right={<Button label="New entry" icon="add" size="sm" variant="glass" onPress={() => setAdding(true)} />}>
        {error ? <ErrorNotice message={error} onRetry={refresh} /> : null}
        <LendBorrowList
          entries={entries}
          loading={isLoading}
          onAddEntry={() => setAdding(true)}
          onRepay={(lendBorrowId, amount) => recordRepayment({ lendBorrowId, amount })}
        />
      </Screen>

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Lend or borrow" subtitle="Recorded against one of your accounts">
        {accounts.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="Add an account first"
            message="Lending and borrowing move money in or out of an account."
            actionLabel="Go to Accounts"
            onAction={() => {
              setAdding(false);
              router.navigate("/accounts" as never);
            }}
          />
        ) : (
          <LendBorrowForm
            accounts={accounts}
            onSubmit={async (request) => {
              await addEntry(request);
              setAdding(false);
            }}
          />
        )}
      </Sheet>
    </>
  );
}
