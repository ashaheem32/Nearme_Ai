import { clearSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not sign out right now." },
      { status: 500 },
    )
  }
}
