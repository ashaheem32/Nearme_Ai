import bcrypt from "bcrypt"
import { db, initializeAuthTables } from "@/lib/db"
import { sendSignupOtpEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { createHash, randomInt } from "node:crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body?.name ?? "").trim()
    const email = String(body?.email ?? "").trim().toLowerCase()
    const password = String(body?.password ?? "")

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
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

    const otp = String(randomInt(100000, 999999))
    const otpHash = createHash("sha256").update(`${email}:${otp}`).digest("hex")
    const passwordHash = await bcrypt.hash(password, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await db.execute({
      sql: `INSERT INTO signup_otps (email, name, password_hash, otp_hash, expires_at, attempts)
            VALUES (?, ?, ?, ?, ?, 0)
            ON CONFLICT(email) DO UPDATE SET
              name = excluded.name,
              password_hash = excluded.password_hash,
              otp_hash = excluded.otp_hash,
              expires_at = excluded.expires_at,
              attempts = 0`,
      args: [email, name, passwordHash, otpHash, expiresAt],
    })

    const emailResult = await sendSignupOtpEmail(email, otp)

    return NextResponse.json({
      success: true,
      otpSent: true,
      fallback: emailResult.fallback,
      message: emailResult.fallback
        ? "OTP generated. SMTP is not configured, check server log for OTP."
        : "OTP sent to your email.",
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: "Could not send OTP right now." },
      { status: 500 },
    )
  }
}
