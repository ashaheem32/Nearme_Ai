import { getCurrentUser } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { sendDeleteAccountOtpEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { createHash, randomInt } from "node:crypto"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await initializeAuthTables()
    const otp = String(randomInt(100000, 999999))
    const otpHash = createHash("sha256").update(`${user.email}:${otp}`).digest("hex")
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await db.execute({
      sql: `INSERT INTO account_delete_otps (user_id, email, otp_hash, expires_at, attempts)
            VALUES (?, ?, ?, ?, 0)
            ON CONFLICT(user_id) DO UPDATE SET
              email = excluded.email,
              otp_hash = excluded.otp_hash,
              expires_at = excluded.expires_at,
              attempts = 0`,
      args: [user.id, user.email, otpHash, expiresAt],
    })

    const emailResult = await sendDeleteAccountOtpEmail(user.email, otp)

    return NextResponse.json({
      success: true,
      fallback: emailResult.fallback,
      message: emailResult.fallback
        ? "OTP generated. SMTP is not configured, check server log for OTP."
        : "OTP sent to your email.",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not send delete OTP right now." },
      { status: 500 },
    )
  }
}
