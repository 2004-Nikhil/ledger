import { useState } from "react";
import { useInvestments } from "@/features/investments/hooks/useInvestments";
import { InvestmentList } from "@/components/InvestmentList";
import { InvestmentForm } from "@/components/InvestmentForm";
import { Button, ErrorNotice, Screen, Sheet } from "@/ui";

export default function InvestmentsScreen() {
  const { investments, portfolioSummary, addInvestment, updateCurrentValue, isLoading, error, refresh } = useInvestments();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <Screen title="Investments" onRefresh={refresh} right={<Button label="Add" icon="add" size="sm" variant="glass" onPress={() => setAdding(true)} accessibilityLabel="Add investment" />}>
        {error ? <ErrorNotice message={error} onRetry={refresh} /> : null}
        <InvestmentList
          investments={investments}
          summary={portfolioSummary}
          loading={isLoading}
          onAddInvestment={() => setAdding(true)}
          onUpdateValue={(investmentId, currentValue) => updateCurrentValue({ investmentId, currentValue })}
        />
      </Screen>

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add investment" subtitle="Stocks, funds, and SIPs count toward net worth">
        <InvestmentForm
          onSubmit={async (request) => {
            await addInvestment(request);
            setAdding(false);
          }}
        />
      </Sheet>
    </>
  );
}
