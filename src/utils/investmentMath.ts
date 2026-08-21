import type { Investment, PortfolioSummary } from "@/features/investments/types";

export function computePortfolioSummary(investments: Investment[]): PortfolioSummary {
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalCost = investments.reduce((sum, inv) => sum + inv.units * inv.buyPrice, 0);
  const totalGain = totalCurrentValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return { totalCurrentValue, totalCost, totalGain, totalGainPercent };
}
