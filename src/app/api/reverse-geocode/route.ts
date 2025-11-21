import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: "Missing lat or lng" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    )

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json({
        success: true,
        locationName: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
      })
    }

    const result = data.results[0]
    const addressComponents = result.address_components

    let city = ""
    let state = ""
    let area = ""

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        city = component.long_name
      } else if (component.types.includes("administrative_area_level_2") && !city) {
        city = component.long_name
      } else if (component.types.includes("administrative_area_level_1")) {
        state = component.short_name
      } else if (component.types.includes("sublocality") || component.types.includes("sublocality_level_1")) {
        area = component.long_name
      }
    }

    let locationName = ""

    if (area && city && state) {
      locationName = `${area}, ${city}, ${state}`
    } else if (city && state) {
      locationName = `${city}, ${state}`
    } else if (city) {
      locationName = city
    } else if (state) {
      locationName = state
    } else {
      // Use formatted address as fallback
      const parts = result.formatted_address.split(',')
      locationName = parts.length >= 2 
        ? `${parts[0].trim()}, ${parts[1].trim()}`
        : parts[0].trim()
    }

    return NextResponse.json({
      success: true,
      locationName: locationName || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
    })

  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reverse geocode" },
      { status: 500 }
    )
  }
}