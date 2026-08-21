import type { IInvestmentRepository } from "../repositories/IInvestmentRepository";
import type { Investment, CreateInvestmentRequest, UpdateCurrentValueRequest } from "../types";
import { generateId } from "@/utils/id";

export class InvestmentService {
  // No IAccountRepository dependency here, unlike Transactions/Transfers/
  // Goals — creating an investment doesn't debit an account in this
  // phase. It's a tracked asset for net worth, not yet wired into the
  // cash-flow side (that would mean deciding which account "paid" for
  // it, which the feature plan didn't specify). Documented in the README.
  constructor(private repository: IInvestmentRepository) {}

  async createInvestment(request: CreateInvestmentRequest): Promise<Investment> {
    if (!request.name.trim()) {
      throw new Error("Name is required.");
    }
    if (!Number.isFinite(request.units) || request.units < 0) {
      throw new Error("Units must be zero or greater.");
    }
    if (!Number.isFinite(request.buyPrice) || request.buyPrice < 0) {
      throw new Error("Buy price must be zero or greater.");
    }
    if (!Number.isFinite(request.currentValue) || request.currentValue < 0) {
      throw new Error("Current value must be zero or greater.");
    }
    if (request.type === "sip" && (!request.sipAmount || request.sipAmount <= 0)) {
      throw new Error("SIPs need an amount greater than zero.");
    }

    return this.repository.create({
      id: generateId("inv"),
      type: request.type,
      name: request.name.trim(),
      units: request.units,
      buyPrice: request.buyPrice,
      currentValue: request.currentValue,
      sipAmount: request.type === "sip" ? (request.sipAmount ?? null) : null,
      sipFrequency: request.type === "sip" ? (request.sipFrequency ?? null) : null,
      createdAt: new Date().toISOString(),
    });
  }

  /** The manual "update current value" entry point the feature plan calls out as a fallback for live pricing. */
  async updateCurrentValue(request: UpdateCurrentValueRequest): Promise<void> {
    if (!Number.isFinite(request.currentValue) || request.currentValue < 0) {
      throw new Error("Current value must be zero or greater.");
    }
    await this.repository.updateCurrentValue(request.investmentId, request.currentValue);
  }

  async listInvestments(): Promise<Investment[]> {
    return this.repository.findAll();
  }
}
