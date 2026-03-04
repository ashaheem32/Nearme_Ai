import { getCurrentUser } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHash } from "node:crypto"

const SESSION_COOKIE = "nearme_session"
const MAX_ATTEMPTS = 5

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const otp = String(body?.otp ?? "").trim()

    if (!otp) {
      return NextResponse.json({ success: false, message: "OTP is required." }, { status: 400 })
    }

    await initializeAuthTables()
    const pending = await db.execute({
      sql: "SELECT email, otp_hash, expires_at, attempts FROM account_delete_otps WHERE user_id = ? LIMIT 1",
      args: [user.id],
    })
    const row = pending.rows[0]
    if (!row) {
      return NextResponse.json(
        { success: false, message: "No OTP request found. Request OTP again." },
        { status: 404 },
      )
    }

    const attempts = Number(row.attempts ?? 0)
    if (attempts >= MAX_ATTEMPTS) {
      await db.execute({ sql: "DELETE FROM account_delete_otps WHERE user_id = ?", args: [user.id] })
      return NextResponse.json(
        { success: false, message: "Too many attempts. Request a new OTP." },
        { status: 429 },
      )
    }

    const expiresAt = new Date(String(row.expires_at))
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      await db.execute({ sql: "DELETE FROM account_delete_otps WHERE user_id = ?", args: [user.id] })
      return NextResponse.json(
        { success: false, message: "OTP expired. Request a new OTP." },
        { status: 410 },
      )
    }

    const email = String(row.email)
    const otpHash = createHash("sha256").update(`${email}:${otp}`).digest("hex")
    if (otpHash !== String(row.otp_hash)) {
      await db.execute({
        sql: "UPDATE account_delete_otps SET attempts = attempts + 1 WHERE user_id = ?",
        args: [user.id],
      })
      return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 401 })
    }

    await db.execute({ sql: "DELETE FROM account_delete_otps WHERE user_id = ?", args: [user.id] })
    await db.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [user.id] })
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [user.id] })

    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not delete account right now." },
      { status: 500 },
    )
  }
}
