import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/client";
import { runMigrations } from "@/db/migrationRunner";
import { migrations } from "@/db/migrations";
import type { ICategoryRepository } from "@/features/categories/repositories/ICategoryRepository";
import { SqliteCategoryRepository } from "@/features/categories/repositories/SqliteCategoryRepository";
import { CategoryService } from "@/features/categories/services/CategoryService";
import type { IAccountRepository } from "@/features/accounts/repositories/IAccountRepository";
import { SqliteAccountRepository } from "@/features/accounts/repositories/SqliteAccountRepository";
import { AccountService } from "@/features/accounts/services/AccountService";
/**
 * The single composition root of the app.
 *
 * Nothing outside this file should ever import a concrete repository
 * (e.g. a future `SqliteAccountRepository`) directly. Feature services
 * depend only on interfaces (e.g. `IAccountRepository`); this container
 * is the one place that decides which concrete class satisfies each
 * interface, and hands the finished object to the rest of the app.
 *
 * If SQLite is ever swapped for a remote API, this is the only file
 * that changes — every service and screen that consumed the interface
 * keeps working untouched.
 *
 * Later phases extend this shape, e.g.:
 *   accountRepository: IAccountRepository;
 *   accountService: AccountService;
 */
export interface AppContainer {
  db: SQLiteDatabase;
  accountRepository: IAccountRepository;
  accountService: AccountService;
  categoryRepository: ICategoryRepository;
  categoryService: CategoryService;
}

let containerInstance: AppContainer | null = null;

export async function buildContainer(): Promise<AppContainer> {
  const db = await getDatabase();
  await runMigrations(db, migrations);

  const accountRepository = new SqliteAccountRepository(db);
  const categoryRepository = new SqliteCategoryRepository(db);

  containerInstance = { 
    db,
    accountRepository,
    accountService: new AccountService(accountRepository),
    categoryRepository,
    categoryService: new CategoryService(categoryRepository),
   };
  return containerInstance;
}

/**
 * For code that runs after startup and can assume the container is
 * already built (buildContainer() has resolved). Throws otherwise —
 * that's a bug (something tried to use the container before AppProvider
 * finished initializing), not a case to silently work around.
 */
export function getContainer(): AppContainer {
  if (!containerInstance) {
    throw new Error("Container not initialized — buildContainer() must resolve first (see AppProvider).");
  }
  return containerInstance;
}
