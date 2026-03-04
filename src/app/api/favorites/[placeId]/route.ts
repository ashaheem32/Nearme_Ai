import { getCurrentUser } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ placeId: string }>
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { placeId } = await context.params
    if (!placeId) {
      return NextResponse.json({ success: false, message: "placeId is required." }, { status: 400 })
    }

    await initializeAuthTables()
    await db.execute({
      sql: "DELETE FROM user_favorites WHERE user_id = ? AND place_id = ?",
      args: [user.id, decodeURIComponent(placeId)],
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not remove favorite." },
      { status: 500 },
    )
  }
}
