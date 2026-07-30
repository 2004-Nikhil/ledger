import type { SQLiteDatabase } from "expo-sqlite";
export interface Migration {
    id: number;
    name: string;
    up: (db: SQLiteDatabase)=> Promise<void>;//Runs once, the first time this migration is seen on a device. 
}