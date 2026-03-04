import { getCurrentUser } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await initializeAuthTables()
    const result = await db.execute({
      sql: "SELECT full_name, email, phone FROM user_profiles WHERE user_id = ? LIMIT 1",
      args: [user.id],
    })

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      profile: {
        fullName: String(row?.full_name ?? user.name),
        email: String(row?.email ?? user.email),
        phone: String(row?.phone ?? ""),
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not fetch profile." },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const fullName = String(body?.fullName ?? "").trim()
    const email = String(body?.email ?? "").trim().toLowerCase()
    const phone = String(body?.phone ?? "").trim()

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: "Full name and email are required." },
        { status: 400 },
      )
    }

    await initializeAuthTables()
    await db.execute({
      sql: `INSERT INTO user_profiles (user_id, full_name, email, phone)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              full_name = excluded.full_name,
              email = excluded.email,
              phone = excluded.phone`,
      args: [user.id, fullName, email, phone],
    })

    await db.execute({
      sql: "UPDATE users SET name = ?, email = ? WHERE id = ?",
      args: [fullName, email, user.id],
    })

    return NextResponse.json({
      success: true,
      profile: { fullName, email, phone },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ""
    if (message.toLowerCase().includes("unique")) {
      return NextResponse.json(
        { success: false, message: "Email already in use." },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { success: false, message: "Could not update profile." },
      { status: 500 },
    )
  }
}
