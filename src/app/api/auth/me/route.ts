import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({
      success: true,
      user,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not fetch session right now." },
      { status: 500 },
    )
  }
}
