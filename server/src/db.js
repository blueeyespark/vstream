import Database from "better-sqlite3";
import crypto from "node:crypto";
import path from "node:path";

export function createDatabase(dataDir) {
  const db = new Database(path.join(dataDir, "blue.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
    CREATE INDEX IF NOT EXISTS idx_entities_owner ON entities(owner_user_id);
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stored_name TEXT NOT NULL UNIQUE,
      original_name TEXT NOT NULL,
      mime_type TEXT,
      size_bytes INTEGER NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner_user_id);
  `);
  return db;
}

export const newId = () => crypto.randomUUID();
