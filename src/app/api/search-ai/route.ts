import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, lat, lng, vibe, radius = 2000 } = body;

    if (!query || !lat || !lng) {
      return NextResponse.json(
        { error: "Missing required parameters: query, lat, lng" },
        { status: 400 }
      );
    }

    // Use AI to understand the query and extract search intent
    const aiPrompt = `You are a local search assistant for India. Analyze this search query and return a JSON object with:
    - "placeType": the type of place they're looking for (restaurant, cafe, gym, spa, etc.)
    - "keywords": relevant search keywords
    - "category": category name
    ${vibe ? `- The user wants a "${vibe}" vibe/atmosphere` : ""}
    
    Query: "${query}"
    
    Return ONLY valid JSON, no other text.`;

    let aiResponse: any = {};
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a search intent analyzer. Return only valid JSON matching the requested format.",
          },
          { role: "user", content: aiPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      aiResponse = JSON.parse(
        completion.choices[0].message.content || "{}"
      );
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError);
      
      // Check for quota exceeded errors
      if (openaiError.status === 429 || openaiError.code === 'insufficient_quota') {
        return NextResponse.json(
          { 
            error: "OpenAI API credits exhausted",
            errorType: "QUOTA_EXCEEDED",
            message: "Your OpenAI API free credits have been used up. Please add billing details or upgrade your plan at https://platform.openai.com/account/billing"
          },
          { status: 429 }
        );
      }
      
      // Fallback to basic search without AI enhancement
      aiResponse = {
        keywords: query,
        category: "Place",
        placeType: query.split(" ")[0]
      };
    }

    // Use Google Places API to get real places
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
      aiResponse.keywords || query
    )}&key=${GOOGLE_API_KEY}`;

    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    // Handle Google API errors
    if (placesData.status === "OVER_QUERY_LIMIT" || placesData.status === "REQUEST_DENIED") {
      return NextResponse.json(
        { 
          error: "Google Places API limit reached",
          errorType: "GOOGLE_QUOTA_EXCEEDED",
          message: placesData.status === "OVER_QUERY_LIMIT" 
            ? "Google Places API daily quota exceeded. Please enable billing or wait until quota resets."
            : "Google Places API access denied. Please check your API key and enable required APIs with billing at https://console.cloud.google.com/billing",
          status: placesData.status
        },
        { status: 429 }
      );
    }

    if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", placesData);
      return NextResponse.json(
        { error: "Failed to fetch places", details: placesData.status },
        { status: 500 }
      );
    }

    // Transform Google Places data to our format
    const places =
      placesData.results?.slice(0, 20).map((place: any) => {
        const photos = place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop";

        // Calculate distance
        const placeLat = place.geometry.location.lat;
        const placeLng = place.geometry.location.lng;
        const distance = calculateDistance(lat, lng, placeLat, placeLng);

        // Determine price level
        const priceLevel = place.price_level
          ? "₹".repeat(place.price_level)
          : "₹₹";

        return {
          id: place.place_id,
          name: place.name,
          category:
            place.types?.[0]?.replace(/_/g, " ") || aiResponse.category || "Place",
          rating: place.rating || 4.0,
          reviewCount: place.user_ratings_total || 0,
          distance: `${distance.toFixed(1)} km`,
          distanceValue: distance,
          image: photos,
          price: priceLevel,
          isOpen: place.opening_hours?.open_now ?? true,
          address: place.vicinity,
          placeId: place.place_id,
          location: {
            lat: placeLat,
            lng: placeLng,
          },
        };
      }) || [];

    return NextResponse.json({
      success: true,
      query,
      vibe,
      aiInsights: aiResponse,
      places,
      location: { lat, lng },
      count: places.length,
    });
  } catch (error: any) {
    console.error("Search AI error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}