import { getCurrentUser } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { NextResponse } from "next/server"

function normalizePreferences(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12)
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: true, recommendations: [] })
    }

    await initializeAuthTables()
    const result = await db.execute({
      sql: "SELECT recommendations FROM user_preferences WHERE user_id = ? LIMIT 1",
      args: [user.id],
    })

    const raw = String(result.rows[0]?.recommendations ?? "[]")
    let recommendations: string[] = []

    try {
      recommendations = normalizePreferences(JSON.parse(raw))
    } catch {
      recommendations = []
    }

    return NextResponse.json({ success: true, recommendations })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not fetch preferences." },
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
    const recommendations = normalizePreferences(body?.recommendations)

    await initializeAuthTables()
    await db.execute({
      sql: `INSERT INTO user_preferences (user_id, recommendations)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET recommendations = excluded.recommendations`,
      args: [user.id, JSON.stringify(recommendations)],
    })

    return NextResponse.json({ success: true, recommendations })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not save preferences." },
      { status: 500 },
    )
  }
}
