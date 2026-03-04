import { getCurrentUser } from "@/lib/auth"
import { db, initializeAuthTables } from "@/lib/db"
import { NextResponse } from "next/server"

type FavoritePlaceInput = {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  distance: string
  image: string
  price?: string
  isOpen?: boolean
}

function normalizePlace(input: unknown): FavoritePlaceInput | null {
  if (!input || typeof input !== "object") return null
  const value = input as Record<string, unknown>
  const id = String(value.id ?? "").trim()
  const name = String(value.name ?? "").trim()
  const category = String(value.category ?? "").trim()
  const distance = String(value.distance ?? "").trim()
  const image = String(value.image ?? "").trim()

  if (!id || !name || !category || !distance || !image) return null

  return {
    id,
    name,
    category,
    rating: Number(value.rating ?? 0),
    reviewCount: Number(value.reviewCount ?? 0),
    distance,
    image,
    price: value.price ? String(value.price) : undefined,
    isOpen: typeof value.isOpen === "boolean" ? value.isOpen : undefined,
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await initializeAuthTables()
    const result = await db.execute({
      sql: "SELECT place_id, place_data FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC",
      args: [user.id],
    })

    const favorites = result.rows
      .map((row) => {
        try {
          const data = JSON.parse(String(row.place_data ?? "{}"))
          return normalizePlace(data)
        } catch {
          return null
        }
      })
      .filter((item): item is FavoritePlaceInput => item !== null)

    return NextResponse.json({ success: true, favorites })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not fetch favorites." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const place = normalizePlace(body?.place)
    if (!place) {
      return NextResponse.json(
        { success: false, message: "Invalid place payload." },
        { status: 400 },
      )
    }

    await initializeAuthTables()
    await db.execute({
      sql: `INSERT INTO user_favorites (user_id, place_id, place_data)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, place_id) DO UPDATE SET place_data = excluded.place_data`,
      args: [user.id, place.id, JSON.stringify(place)],
    })

    return NextResponse.json({ success: true, favorite: place })
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not save favorite." },
      { status: 500 },
    )
  }
}
