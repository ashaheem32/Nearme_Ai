import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const placeId = searchParams.get("placeId");

        if (!placeId) {
            return NextResponse.json(
                { error: "Missing required parameter: placeId" },
                { status: 400 }
            );
        }

        if (!GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "Server configuration error: Missing Google API Key" },
                { status: 500 }
            );
        }

        // Fetch place details from Google Places API
        // Requesting fields: name, formatted_address, formatted_phone_number, website, opening_hours, photos, rating, user_ratings_total, geometry, types, reviews
        const fields = "name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,geometry,types,reviews,price_level,vicinity";
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK") {
            console.error("Google Places Details API error:", data);
            return NextResponse.json(
                { error: "Failed to fetch place details", details: data.status },
                { status: 500 }
            );
        }

        const result = data.result;

        // Transform to our Place interface format
        const place = {
            id: placeId,
            name: result.name,
            category: result.types?.[0]?.replace(/_/g, " ") || "Place",
            rating: result.rating || 0,
            reviewCount: result.user_ratings_total || 0,
            distance: "", // Cannot calculate without user location, handled by client or passed in
            image: result.photos?.[0]
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${result.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
            price: result.price_level ? "₹".repeat(result.price_level) : "₹₹",
            isOpen: result.opening_hours?.open_now ?? true,
            address: result.formatted_address || result.vicinity,
            phone: result.formatted_phone_number,
            website: result.website,
            hours: result.opening_hours?.weekday_text?.join("\n"),
            description: result.editorial_summary?.overview || `A popular ${result.types?.[0]?.replace(/_/g, " ") || "place"} in ${result.vicinity || "the area"}.`,
            images: result.photos?.map((photo: any) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
            ) || [],
            amenities: result.types?.slice(0, 6).map((t: string) => t.replace(/_/g, " ")),
            location: result.geometry?.location,
            reviews: result.reviews?.map((review: any) => ({
                id: review.time,
                author: review.author_name,
                avatar: review.profile_photo_url,
                rating: review.rating,
                date: review.relative_time_description,
                text: review.text,
                helpful: 0
            }))
        };

        return NextResponse.json({ success: true, place });
    } catch (error: any) {
        console.error("Place Details API error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
