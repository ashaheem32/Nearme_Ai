import { createSession, verifyUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email ?? "").trim()
    const password = String(body?.password ?? "")

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      )
    }

    const user = await verifyUser(email, password)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      )
    }

    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not sign in right now." },
      { status: 500 },
    )
  }
}
