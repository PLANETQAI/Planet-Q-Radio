import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // These values should be stored securely in your environment variables
    const azuracastApiUrl = `${process.env.NEXT_PUBLIC_AZURACAST_API}/station/1/playlists`;
    const apiKey = process.env.AZURACAST_API_KEY;

    if (!apiKey) {
      console.error("AZURACAST_KEY environment variable not set.");
      throw new Error("AzuraCast API key is not configured on the server.");
    }

    const result = await fetch(azuracastApiUrl, {
      headers: {
        "X-API-Key": apiKey,
      },
      // It's good practice to revalidate data fetched server-side.
      // This will cache the result for 1 hour.
      next: { revalidate: 3600 },
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("Azuracast API Error:", errorText);
      throw new Error(
        `Failed to fetch from AzuraCast API: ${result.status} ${result.statusText}`
      );
    }

    const data = await result.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/playlists route:", error.message);
    return NextResponse.json(
      {
        message: "An error occurred while fetching playlists.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
