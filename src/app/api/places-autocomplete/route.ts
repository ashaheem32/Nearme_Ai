import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const input = searchParams.get("input");

        if (!input) {
            return NextResponse.json(
                { error: "Missing required parameter: input" },
                { status: 400 }
            );
        }

        if (!GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "Server configuration error: Missing Google API Key" },
                { status: 500 }
            );
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            input
        )}&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            console.error("Google Places Autocomplete API error:", data);
            return NextResponse.json(
                { error: "Failed to fetch suggestions", details: data.status },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            predictions: data.predictions || [],
        });
    } catch (error: any) {
        console.error("Places Autocomplete API error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
