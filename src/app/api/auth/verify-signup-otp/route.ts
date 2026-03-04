import { createSession, createUserFromPasswordHash } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { NextResponse } from "next/server"
import { createHash } from "node:crypto"

const MAX_ATTEMPTS = 5

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email ?? "").trim().toLowerCase()
    const otp = String(body?.otp ?? "").trim()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required." },
        { status: 400 },
      )
    }

    await initializeAuthTables()

    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    })
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 },
      )
    }

    const pending = await db.execute({
      sql: "SELECT name, password_hash, otp_hash, expires_at, attempts FROM signup_otps WHERE email = ? LIMIT 1",
      args: [email],
    })
    const row = pending.rows[0]
    if (!row) {
      return NextResponse.json(
        { success: false, message: "No OTP request found. Please register again." },
        { status: 404 },
      )
    }

    const attempts = Number(row.attempts ?? 0)
    if (attempts >= MAX_ATTEMPTS) {
      await db.execute({ sql: "DELETE FROM signup_otps WHERE email = ?", args: [email] })
      return NextResponse.json(
        { success: false, message: "Too many invalid attempts. Please request a new OTP." },
        { status: 429 },
      )
    }

    const expiresAt = new Date(String(row.expires_at))
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      await db.execute({ sql: "DELETE FROM signup_otps WHERE email = ?", args: [email] })
      return NextResponse.json(
        { success: false, message: "OTP expired. Please request a new OTP." },
        { status: 410 },
      )
    }

    const otpHash = createHash("sha256").update(`${email}:${otp}`).digest("hex")
    if (otpHash !== String(row.otp_hash)) {
      await db.execute({
        sql: "UPDATE signup_otps SET attempts = attempts + 1 WHERE email = ?",
        args: [email],
      })
      return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 401 })
    }

    const user = await createUserFromPasswordHash({
      name: String(row.name),
      email,
      passwordHash: String(row.password_hash),
    })
    await createSession(user.id)
    await db.execute({ sql: "DELETE FROM signup_otps WHERE email = ?", args: [email] })

    return NextResponse.json({ success: true, user })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not verify OTP right now." },
      { status: 500 },
    )
  }
}
