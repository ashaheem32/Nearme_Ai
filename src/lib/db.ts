import { createClient } from "@libsql/client"
import { mkdirSync } from "node:fs"
import path from "node:path"

const dataDir = path.join(process.cwd(), "data")
mkdirSync(dataDir, { recursive: true })

const sqlitePath = path.join(dataDir, "nearme-auth.db")

export const db = createClient({
  url: `file:${sqlitePath}`,
})

let hasInitialized = false

export async function initializeAuthTables() {
  if (hasInitialized) return

  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);`,
      `CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        recommendations TEXT NOT NULL DEFAULT '[]',
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS user_favorites (
        user_id TEXT NOT NULL,
        place_id TEXT NOT NULL,
        place_data TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, place_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites (user_id);`,
      `CREATE TABLE IF NOT EXISTS signup_otps (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_signup_otps_expires_at ON signup_otps (expires_at);`,
      `CREATE TABLE IF NOT EXISTS account_delete_otps (
        user_id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_account_delete_otps_expires_at ON account_delete_otps (expires_at);`,
    ],
    "write",
  )

  hasInitialized = true
}
