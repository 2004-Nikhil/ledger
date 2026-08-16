import type { SQLiteDatabase } from "expo-sqlite";
import type { ITransferRepository } from "../repositories/ITransferRepository";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import type { Transfer, CreateTransferRequest } from "../types";
import { generateId } from "@/utils/id";

export class TransferService {
  constructor(
    private db: SQLiteDatabase,
    private transferRepository: ITransferRepository,
    private accountRepository: IAccountRepository
  ) {}

  async createTransfer(request: CreateTransferRequest): Promise<Transfer> {
    if (request.fromAccountId === request.toAccountId) {
      throw new Error("Pick two different accounts to transfer between.");
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const [fromAccount, toAccount] = await Promise.all([
      this.accountRepository.findById(request.fromAccountId),
      this.accountRepository.findById(request.toAccountId),
    ]);
    if (!fromAccount) throw new Error("Source account no longer exists.");
    if (!toAccount) throw new Error("Destination account no longer exists.");

    const row = {
      id: generateId("xfr"),
      fromAccountId: request.fromAccountId,
      toAccountId: request.toAccountId,
      amount: request.amount,
      date: request.date,
      notes: request.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    let created: Transfer | undefined;

    // A transfer is never income or expense — it's two balance moves and
    // one record, all three succeeding together or not at all.
    await this.db.withTransactionAsync(async () => {
      created = await this.transferRepository.create(row);
      await this.accountRepository.adjustBalance(request.fromAccountId, -request.amount);
      await this.accountRepository.adjustBalance(request.toAccountId, request.amount);
    });

    if (!created) {
      throw new Error("Transfer failed to save.");
    }
    return created;
  }

  async listTransfers(): Promise<Transfer[]> {
    return this.transferRepository.findAll();
  }
}
