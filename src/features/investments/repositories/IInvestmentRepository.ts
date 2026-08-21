import type { Investment } from "../types";

export interface CreateInvestmentRow {
  id: string;
  type: Investment["type"];
  name: string;
  units: number;
  buyPrice: number;
  currentValue: number;
  sipAmount: number | null;
  sipFrequency: Investment["sipFrequency"];
  createdAt: string;
}

export interface IInvestmentRepository {
  create(input: CreateInvestmentRow): Promise<Investment>;
  findAll(): Promise<Investment[]>;
  updateCurrentValue(id: string, currentValue: number): Promise<void>;
}
