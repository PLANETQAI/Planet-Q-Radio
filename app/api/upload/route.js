import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const playlistId = formData.get("playlistId");
    const title = formData.get("title") || "";
    const artist = formData.get("artist") || "";
    const video_url = formData.get("video_url") || "";

    // --- Basic Validation ---
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "A file is required for upload." },
        { status: 400 }
      );
    }
    if (!playlistId) {
      return NextResponse.json(
        { message: "No playlist selected." },
        { status: 400 }
      );
    }

    const apiKey = process.env.AZURACAST_API_KEY;
    if (!apiKey) {
      throw new Error("Server is not configured for AzuraCast API.");
    }

    // --- Fetch playlists to verify playlist exists ---
    const playlistsRes = await fetch(
      `${process.env.NEXT_PUBLIC_AZURACAST_API}/station/1/playlists`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );
    if (!playlistsRes.ok) {
      throw new Error("Failed to fetch playlists from AzuraCast.");
    }
    const playlists = await playlistsRes.json();
    const playlist = playlists.find((p) => p.id === parseInt(playlistId));
    if (!playlist) {
      throw new Error("Selected playlist could not be found.");
    }

    // --- Upload file to AzuraCast ---

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadFormData = new FormData();
    uploadFormData.append(
      "file",
      new Blob([buffer], { type: file.type }),
      file.name
    );
    uploadFormData.append("path", `media/${playlist.name}`);
    uploadFormData.append("path", `media/${playlist.name}`);

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_AZURACAST_API}/station/1/files`,
      {
        method: "POST",
        headers: { "X-API-Key": apiKey },
        body: uploadFormData,
      }
    );

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errData.message || "Upload failed." },
        { status: uploadRes.status }
      );
    }

    const uploadedFile = await uploadRes.json();
    const mediaId = uploadedFile?.id || uploadedFile[0]?.id;

    if (!mediaId) {
      throw new Error("Could not retrieve media ID from AzuraCast upload.");
    }

    // --- Update metadata including video_url ---
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_AZURACAST_API}/station/1/media/${mediaId}`,
      {
        method: "PUT",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          artist,
          custom_fields: video_url ? { video_url } : {},
        }),
      }
    );

    if (!updateRes.ok) {
      const errUpdate = await updateRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errUpdate.message || "Failed to update media metadata." },
        { status: updateRes.status }
      );
    }

    const updatedData = await updateRes.json();

    return NextResponse.json({
      message: "Upload successful and metadata updated.",
      data: updatedData,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
