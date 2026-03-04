import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { randomUUID } from "node:crypto"
import { db, initializeAuthTables } from "@/lib/db"

const SESSION_COOKIE = "nearme_session"
const SESSION_TTL_DAYS = 7

type UserRecord = {
  id: string
  name: string
  email: string
}

export async function createUser(input: { name: string; email: string; password: string }) {
  await initializeAuthTables()
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  const passwordHash = await bcrypt.hash(input.password, 10)
  return createUserFromPasswordHash({ name, email, passwordHash })
}

export async function createUserFromPasswordHash(input: {
  name: string
  email: string
  passwordHash: string
}) {
  await initializeAuthTables()
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  const passwordHash = input.passwordHash
  const userId = randomUUID()

  await db.execute({
    sql: "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    args: [userId, name, email, passwordHash],
  })

  await db.execute({
    sql: "INSERT INTO user_profiles (user_id, full_name, email, phone) VALUES (?, ?, ?, ?)",
    args: [userId, name, email, ""],
  })

  await db.execute({
    sql: "INSERT INTO user_preferences (user_id, recommendations) VALUES (?, ?)",
    args: [userId, "[]"],
  })

  return { id: userId, name, email }
}

export async function verifyUser(email: string, password: string): Promise<UserRecord | null> {
  await initializeAuthTables()
  const normalizedEmail = email.trim().toLowerCase()

  const result = await db.execute({
    sql: "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    args: [normalizedEmail],
  })

  const row = result.rows[0]
  if (!row) return null

  const passwordHash = String(row.password_hash ?? "")
  const isValid = await bcrypt.compare(password, passwordHash)
  if (!isValid) return null

  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
  }
}

export async function createSession(userId: string) {
  await initializeAuthTables()

  const sessionId = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS)

  await db.execute({
    sql: "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionId, userId, expiresAt.toISOString()],
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    await initializeAuthTables()
    await db.execute({
      sql: "DELETE FROM sessions WHERE id = ?",
      args: [sessionId],
    })
  }

  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  await initializeAuthTables()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  const result = await db.execute({
    sql: `SELECT u.id, u.name, u.email, s.expires_at
          FROM sessions s
          INNER JOIN users u ON s.user_id = u.id
          WHERE s.id = ?
          LIMIT 1`,
    args: [sessionId],
  })

  const row = result.rows[0]
  if (!row) return null

  const expiresAt = new Date(String(row.expires_at))
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    await db.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [sessionId] })
    cookieStore.delete(SESSION_COOKIE)
    return null
  }

  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
  }
}
