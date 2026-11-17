import { useMemo, useState } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransfers } from "@/features/transfers/hooks/useTransfers";
import { AccountList } from "@/components/AccountList";
import { AddAccountForm } from "@/components/AddAccountForm";
import { TransferForm } from "@/components/TransferForm";
import { TransferList } from "@/components/TransferList";
import { Button, ErrorNotice, Screen, Section, Sheet } from "@/ui";

export default function AccountsScreen() {
  const { accounts, totalBalance, addAccount, isLoading, error, refresh } = useAccounts();
  const { transfers, addTransfer, error: transferError, refresh: refreshTransfers } = useTransfers();
  const [sheet, setSheet] = useState<"transfer" | "account" | null>(null);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const canTransfer = accounts.length >= 2;
  const failure = error ?? transferError;

  return (
    <>
      <Screen
        title="Accounts"
        onRefresh={() => Promise.all([refresh(), refreshTransfers()])}
        right={
          <>
            {canTransfer ? <Button label="Transfer" icon="swap-horizontal-outline" size="sm" variant="glass" onPress={() => setSheet("transfer")} /> : null}
            <Button label="Add" icon="add" size="sm" variant="glass" onPress={() => setSheet("account")} accessibilityLabel="Add account" />
          </>
        }
      >
        {failure ? <ErrorNotice message={failure} onRetry={() => Promise.all([refresh(), refreshTransfers()])} /> : null}

        <AccountList accounts={accounts} netWorth={totalBalance} loading={isLoading} onAddAccount={() => setSheet("account")} />

        {transfers.length > 0 ? (
          <Section title="Recent transfers">
            <TransferList transfers={transfers} accountsById={accountsById} />
          </Section>
        ) : null}
      </Screen>

      <Sheet visible={sheet === "transfer"} onClose={() => setSheet(null)} title="Transfer" subtitle="Move money between your accounts">
        {canTransfer ? (
          <TransferForm
            accounts={accounts}
            onSubmit={async (request) => {
              await addTransfer(request);
              setSheet(null);
            }}
          />
        ) : null}
      </Sheet>

      <Sheet visible={sheet === "account"} onClose={() => setSheet(null)} title="Add account" subtitle="Cash, card, or bank">
        <AddAccountForm
          onSubmit={async (request) => {
            await addAccount(request);
            setSheet(null);
          }}
        />
      </Sheet>
    </>
  );
}
