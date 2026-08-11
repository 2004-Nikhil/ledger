import type { SQLiteDatabase } from "expo-sqlite";
import type { IAccountRepository, CreateAccountRow } from "./IAccountRepository";
import type { Account } from "../types";

interface AccountRow {
  id: string;
  name: string;
  type: Account["type"];
  opening_balance: number;
  current_balance: number;
  created_at: string;
}

function mapRow(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    openingBalance: row.opening_balance,
    currentBalance: row.current_balance,
    createdAt: row.created_at,
  };
}

export class SqliteAccountRepository implements IAccountRepository {
  constructor(private db: SQLiteDatabase) {}

  async create(input: CreateAccountRow): Promise<Account> {
    await this.db.runAsync(
      `INSERT INTO accounts (id, name, type, opening_balance, current_balance, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [input.id, input.name, input.type, input.openingBalance, input.openingBalance, input.createdAt]
    );

    return {
      id: input.id,
      name: input.name,
      type: input.type,
      openingBalance: input.openingBalance,
      currentBalance: input.openingBalance,
      createdAt: input.createdAt,
    };
  }

  async findAll(): Promise<Account[]> {
    const rows = await this.db.getAllAsync<AccountRow>(
      "SELECT * FROM accounts ORDER BY created_at ASC;"
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Account | null> {
    const row = await this.db.getFirstAsync<AccountRow>(
      "SELECT * FROM accounts WHERE id = ?;",
      [id]
    );
    return row ? mapRow(row) : null;
  }

  async adjustBalance(accountId: string, delta: number): Promise<void> {
    await this.db.runAsync(
      "UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?;",
      [delta, accountId]
    );
  }
}
