import initSqlJs, { Database as SqlDatabase } from 'sql.js';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './database.sqlite';
const dbPath = path.resolve(process.cwd(), DB_PATH);

let db: SqlDatabase;

// Simple synchronous-style wrapper over sql.js
export class DB {
  private static instance: DB;
  private sqlDb!: SqlDatabase;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  static async getInstance(): Promise<DB> {
    if (!DB.instance) {
      DB.instance = new DB();
      await DB.instance.initialize();
    }
    return DB.instance;
  }

  private async initialize(): Promise<void> {
    const SQL = await initSqlJs();

    if (await fs.pathExists(dbPath)) {
      const fileBuffer = await fs.readFile(dbPath);
      this.sqlDb = new SQL.Database(fileBuffer);
    } else {
      this.sqlDb = new SQL.Database();
    }

    // Save on exit
    process.on('exit', () => this.saveSync());
    process.on('SIGINT', () => { this.saveSync(); process.exit(0); });
    process.on('SIGTERM', () => { this.saveSync(); process.exit(0); });
  }

  private scheduleAutoSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveSync(), 2000);
  }

  private saveSync(): void {
    try {
      const data = this.sqlDb.export();
      fs.ensureDirSync(path.dirname(dbPath));
      fs.writeFileSync(dbPath, Buffer.from(data));
    } catch (e) {
      // ignore
    }
  }

  exec(sql: string): void {
    this.sqlDb.exec(sql);
    this.scheduleAutoSave();
  }

  run(sql: string, params: (string | number | null | boolean)[] = []): { changes: number; lastInsertRowid: number } {
    const stmt = this.sqlDb.prepare(sql);
    stmt.run(params);
    stmt.free();
    this.scheduleAutoSave();
    return { changes: this.sqlDb.getRowsModified(), lastInsertRowid: 0 };
  }

  get<T = Record<string, unknown>>(sql: string, params: (string | number | null | boolean)[] = []): T | undefined {
    const stmt = this.sqlDb.prepare(sql);
    stmt.bind(params);
    const result = stmt.step() ? (stmt.getAsObject() as T) : undefined;
    stmt.free();
    return result;
  }

  all<T = Record<string, unknown>>(sql: string, params: (string | number | null | boolean)[] = []): T[] {
    const stmt = this.sqlDb.prepare(sql);
    stmt.bind(params);
    const rows: T[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return rows;
  }

  pragma(sql: string): void {
    this.sqlDb.exec(`PRAGMA ${sql}`);
  }
}

// Singleton getter
let dbInstance: DB;

export async function getDb(): Promise<DB> {
  if (!dbInstance) {
    dbInstance = await DB.getInstance();
  }
  return dbInstance;
}

export default { getDb };
