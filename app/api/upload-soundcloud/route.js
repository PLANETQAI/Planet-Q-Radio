import fs from "fs";
import path from "path";
import { exec } from "child_process";
import axios from "axios";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";

// ----------------------------
// CONFIGURATION
// ----------------------------
const AZURACAST_URL = "https://radio.planetqradio.com";
const STATION_ID = "1";
const API_KEY = "289377d04907aef3:4335b21ead375addcb961085a522c749";
const PLAYLIST_ID = "1";

// ----------------------------
// HELPER FUNCTIONS
// ----------------------------
const sanitizeFilename = (name) => name.replace(/[\\/*?:"<>|]/g, "");

const downloadTrack = (url) => {
  return new Promise((resolve, reject) => {
    // Get metadata
    exec(`yt-dlp -j "${url}"`, (err, stdout) => {
      if (err) return reject(err);

      let metadata;
      try {
        metadata = JSON.parse(stdout);
      } catch {
        metadata = {};
      }

      const trackTitle = sanitizeFilename(metadata.title || `track_${uuidv4()}`);
      const outputFile = path.join(process.cwd(), `${trackTitle}.mp3`);

      console.log(`Downloading: ${trackTitle}...`);
      exec(`yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`, (err2) => {
        if (err2) return reject(err2);
        resolve(outputFile);
      });
    });
  });
};

const uploadToAzuraCast = async (filePath) => {
  const uploadUrl = `${AZURACAST_URL}/api/station/${STATION_ID}/files/upload`;
  const headers = { "X-API-Key": API_KEY };
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(uploadUrl, form, {
      headers: { ...headers, ...form.getHeaders() },
    });
    return response.data.success ? response.data : null;
  } catch (error) {
    console.error("Upload error:", error.message);
    return null;
  }
};

const assignToPlaylist = async (songId) => {
  const url = `${AZURACAST_URL}/api/station/${STATION_ID}/playlist/${PLAYLIST_ID}/media/${songId}`;
  const headers = { "X-API-Key": API_KEY };

  try {
    const response = await axios.put(url, null, { headers });
    if (response.status === 200) {
      console.log("✔ Track added to playlist!");
    } else {
      console.log("✘ Failed to add track to playlist:", response.data);
    }
  } catch (error) {
    console.error("Playlist assignment error:", error.message);
  }
};

// ----------------------------
// NEXT.js 14 ROUTE
// ----------------------------
export async function POST(req) {
  try {
    const { link } = await req.json();
    if (!link) return new Response(JSON.stringify({ error: "No link provided" }), { status: 400 });

    const file = await downloadTrack(link);

    const uploadResult = await uploadToAzuraCast(file);
    if (uploadResult && uploadResult.file && uploadResult.file.id) {
      await assignToPlaylist(uploadResult.file.id);
      fs.existsSync(file) && fs.unlinkSync(file);
      return new Response(JSON.stringify({ status: "success", file: uploadResult.file }), { status: 200 });
    } else {
      fs.existsSync(file) && fs.unlinkSync(file);
      return new Response(JSON.stringify({ status: "upload_failed" }), { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500 });
  }
}
