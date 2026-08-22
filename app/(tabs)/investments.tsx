import { ScrollView, StyleSheet } from "react-native";
import { useInvestments } from "@/features/investments/hooks/useInvestments";
import { InvestmentList } from "@/components/InvestmentList";
import { InvestmentForm } from "@/components/InvestmentForm";

export default function InvestmentsScreen() {
  const { investments, portfolioSummary, addInvestment, updateCurrentValue } = useInvestments();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InvestmentList
        investments={investments}
        summary={portfolioSummary}
        onUpdateValue={(investmentId, currentValue) => updateCurrentValue({ investmentId, currentValue })}
      />
      <InvestmentForm onSubmit={addInvestment} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
});
