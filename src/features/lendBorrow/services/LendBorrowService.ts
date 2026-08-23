import type { SQLiteDatabase } from "expo-sqlite";
import type { ILendBorrowRepository } from "../repositories/ILendBorrowRepository";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { LendBorrow, CreateLendBorrowRequest, RecordRepaymentRequest } from "../types";
import { generateId } from "@/utils/id";

export class LendBorrowService {
  constructor(
    private db: SQLiteDatabase,
    private lendBorrowRepository: ILendBorrowRepository,
    private accountRepository: IAccountRepository
  ) {}

  async create(request: CreateLendBorrowRequest): Promise<LendBorrow> {
    if (!request.person.trim()) {
      throw new Error("Person is required.");
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new Error("Selected account no longer exists.");
    }

    const row = {
      id: generateId("lb"),
      person: request.person.trim(),
      amount: request.amount,
      date: request.date,
      direction: request.direction,
      accountId: request.accountId,
      dueDate: request.dueDate ?? null,
      notes: request.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    // Lending cash out reduces what you can spend right now, the same
    // way an expense would; borrowing does the opposite. Getting repaid
    // reverses this — see recordRepayment below.
    const delta = request.direction === "lent" ? -request.amount : request.amount;

    let created: LendBorrow | undefined;
    await this.db.withTransactionAsync(async () => {
      created = await this.lendBorrowRepository.create(row);
      await this.accountRepository.adjustBalance(request.accountId, delta);
    });
    if (!created) {
      throw new Error("Entry failed to save.");
    }
    return created;
  }

  async recordRepayment(request: RecordRepaymentRequest): Promise<LendBorrow> {
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error("Repayment amount must be greater than zero.");
    }

    const entry = await this.lendBorrowRepository.findById(request.lendBorrowId);
    if (!entry) {
      throw new Error("Entry no longer exists.");
    }

    const remaining = entry.amount - entry.paidAmount;
    if (request.amount > remaining) {
      throw new Error(`That's more than what's left to repay (${remaining.toFixed(2)}).`);
    }

    const newPaidAmount = entry.paidAmount + request.amount;
    const status = newPaidAmount >= entry.amount ? "paid" : "partial";

    // Reverses the original direction: money coming back on something
    // you lent increases your balance; paying back something you
    // borrowed decreases it.
    const delta = entry.direction === "lent" ? request.amount : -request.amount;

    const repaymentRow = {
      id: generateId("lbr"),
      lendBorrowId: entry.id,
      amount: request.amount,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    await this.db.withTransactionAsync(async () => {
      await this.lendBorrowRepository.updateRepayment(entry.id, newPaidAmount, status);
      // This dated record is what lets Analytics reconstruct historical
      // balances — updateRepayment alone only tracks current totals.
      await this.lendBorrowRepository.createRepaymentRecord(repaymentRow);
      await this.accountRepository.adjustBalance(entry.accountId, delta);
    });

    return { ...entry, paidAmount: newPaidAmount, status };
  }

  async listAll(): Promise<LendBorrow[]> {
    return this.lendBorrowRepository.findAll();
  }
}
