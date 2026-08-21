export type InvestmentType = "stock" | "mutual_fund" | "sip";
export type SipFrequency = "weekly" | "monthly" | "quarterly";

export interface Investment {
  id: string;
  type: InvestmentType;
  name: string;
  units: number;
  /** Average cost per unit. */
  buyPrice: number;
  /** TOTAL current value of the holding (not per-unit) — this is what feeds net worth. */
  currentValue: number;
  sipAmount: number | null;
  sipFrequency: SipFrequency | null;
  createdAt: string;
}

export interface CreateInvestmentRequest {
  type: InvestmentType;
  name: string;
  units: number;
  buyPrice: number;
  currentValue: number;
  sipAmount?: number;
  sipFrequency?: SipFrequency;
}

export interface UpdateCurrentValueRequest {
  investmentId: string;
  currentValue: number;
}

/** Derived, not stored — see utils/investmentMath.ts. */
export interface PortfolioSummary {
  totalCurrentValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
}
