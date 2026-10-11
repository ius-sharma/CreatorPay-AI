import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

interface Statement { get(...args: unknown[]): any; run(...args: unknown[]): unknown }
interface Database { exec(sql: string): void; prepare(sql: string): Statement }
const shared = globalThis as typeof globalThis & { __creatorpayDB?: Database };
export function database(): Database {
  if (shared.__creatorpayDB) return shared.__creatorpayDB;
  const file = resolve(process.env.CREATORPAY_DB_PATH || '.data/creatorpay.sqlite');
  mkdirSync(dirname(file), { recursive: true });
  // Node 22.13+ / 24 includes SQLite; this module is explicitly server-external.
  const { DatabaseSync } = require('node:sqlite');
  const db: Database = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL, processed_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS invoice_jobs (key TEXT PRIMARY KEY, invoice_id TEXT, lease_until INTEGER NOT NULL DEFAULT 0);`);
  shared.__creatorpayDB = db;
  return db;
}
export function transaction<T>(fn: (db: Database) => T): T {
  const db = database();
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(db); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}

export function acquireInvoiceJob(key: string): string | undefined {
  return transaction(db => {
    const row = db.prepare('SELECT invoice_id, lease_until FROM invoice_jobs WHERE key=?').get(key);
    if (row?.lease_until > Date.now()) throw new Error('Invoice request is already running. Wait a moment and retry.');
    db.prepare('INSERT INTO invoice_jobs(key,lease_until) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET lease_until=excluded.lease_until').run(key, Date.now() + 180000);
    return row?.invoice_id || undefined;
  });
}
export function rememberInvoice(key: string, id: string): void {
  database().prepare('UPDATE invoice_jobs SET invoice_id=? WHERE key=?').run(id, key);
}
export function releaseInvoiceJob(key: string): void {
  database().prepare('UPDATE invoice_jobs SET lease_until=0 WHERE key=?').run(key);
}
