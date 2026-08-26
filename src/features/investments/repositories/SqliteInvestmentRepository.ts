import type { SQLiteDatabase } from "expo-sqlite";
import type { IInvestmentRepository, CreateInvestmentRow } from "./IInvestmentRepository";
import type { Investment } from "../types";

interface InvestmentRow {
  id: string;
  type: Investment["type"];
  name: string;
  units: number;
  buy_price: number;
  current_value: number;
  sip_amount: number | null;
  sip_frequency: Investment["sipFrequency"];
  created_at: string;
}

function mapRow(row: InvestmentRow): Investment {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    units: row.units,
    buyPrice: row.buy_price,
    currentValue: row.current_value,
    sipAmount: row.sip_amount,
    sipFrequency: row.sip_frequency,
    createdAt: row.created_at,
  };
}

export class SqliteInvestmentRepository implements IInvestmentRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(input: CreateInvestmentRow): Promise<Investment> {
    await this.db.runAsync(
      `INSERT INTO investments (id, type, name, units, buy_price, current_value, sip_amount, sip_frequency, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.type,
        input.name,
        input.units,
        input.buyPrice,
        input.currentValue,
        input.sipAmount,
        input.sipFrequency,
        input.createdAt,
      ]
    );
    return { ...input };
  }

  async findAll(): Promise<Investment[]> {
    const rows = await this.db.getAllAsync<InvestmentRow>(
      "SELECT * FROM investments ORDER BY created_at ASC;"
    );
    return rows.map(mapRow);
  }

  async updateCurrentValue(id: string, currentValue: number): Promise<void> {
    await this.db.runAsync("UPDATE investments SET current_value = ? WHERE id = ?;", [currentValue, id]);
  }

  async findById(id: string): Promise<Investment | null> {
    const row = await this.db.getFirstAsync<InvestmentRow>("SELECT * FROM investments WHERE id = ?;", [id]);
    return row ? mapRow(row) : null;
  }
}
