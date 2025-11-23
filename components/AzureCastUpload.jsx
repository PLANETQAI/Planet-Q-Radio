"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Music, Video, ListMusic, XCircle, CheckCircle } from "lucide-react";

/*
  CONFIG - These should match the values in your other components
*/
const API_BASE = process.env.NEXT_PUBLIC_AZURACAST_API;
const STATION_ID = process.env.NEXT_PUBLIC_STATION_ID;

// API Endpoints
const PLAYLISTS_URL = `${API_BASE}/station/${STATION_ID}/playlists`;
const UPLOAD_URL = `${API_BASE}/station/${STATION_ID}/files`;

// A simple styled input component to match the project's aesthetic
const StyledInput = ({ className, ...props }) => (
  <input
    className={`w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
    {...props}
  />
);

// A simple styled select component
const StyledSelect = ({ className, children, ...props }) => (
  <select
    className={`w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${className}`}
    {...props}
  >
    {children}
  </select>
);

export default function AzureCastUpload() {
  const [file, setFile] = useState(null);
  const [songSource, setSongSource] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  
  const [status, setStatus] = useState({ type: "idle", message: "Select a file to upload." });

  // Fetch playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setStatus({ type: "loading", message: "Fetching playlists..." });
        const res = await fetch(PLAYLISTS_URL);
        if (!res.ok) throw new Error("Failed to fetch playlists");
        const data = await res.json();
        
        // Filter for standard playlists that we can upload to
        const standardPlaylists = data.filter(p => p.type === 'default');
        setPlaylists(standardPlaylists);
        if (standardPlaylists.length > 0) {
            setSelectedPlaylist(standardPlaylists[0].id);
        }
        setStatus({ type: "idle", message: "Select a file to upload." });
      } catch (error) {
        setStatus({ type: "error", message: error.message || "Could not load playlists." });
      }
    };
    fetchPlaylists();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus({ type: "idle", message: `File selected: ${selectedFile.name}` });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: "error", message: "Please select a file first." });
      return;
    }
    if (!selectedPlaylist) {
        setStatus({ type: "error", message: "Please select a playlist." });
        return;
    }

    setStatus({ type: "loading", message: "Preparing to upload..." });

    let fileToUpload = file;

    // --- Video Processing Placeholder ---
    if (file.type.startsWith("video/")) {
      setStatus({ type: "loading", message: "Extracting audio from video... (This part is a placeholder)" });
      
      // NOTE: Client-side audio extraction is complex and requires a library like ffmpeg.wasm.
      // The following is a placeholder for where that logic would go.
      // For now, we will show an error.
      
      /*
      // Example with ffmpeg.wasm (requires installation and setup)
      try {
        const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg'); // Fictional import
        const ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();
        ffmpeg.FS('writeFile', file.name, await fetchFile(file));
        await ffmpeg.run('-i', file.name, 'output.mp3');
        const data = ffmpeg.FS('readFile', 'output.mp3');
        const mp3Blob = new Blob([data.buffer], { type: 'audio/mpeg' });
        fileToUpload = new File([mp3Blob], `${file.name}.mp3`);
        setStatus({ type: "loading", message: "Audio extracted. Now uploading..." });
      } catch (error) {
        setStatus({ type: "error", message: `Video processing failed: ${error.message}` });
        return;
      }
      */
      
      setStatus({ type: "error", message: "Video processing is not yet implemented. Please upload an MP3 file." });
      return;
    }
    
    // --- Upload Logic ---
    try {
      setStatus({ type: "loading", message: `Uploading ${fileToUpload.name}...` });

      const playlist = playlists.find(p => p.id === parseInt(selectedPlaylist));
      if (!playlist) throw new Error("Could not find selected playlist details.");

      const formData = new FormData();
      formData.append('file', fileToUpload);
      // The 'path' determines the folder in AzuraCast's media manager.
      // For a playlist named "My Playlist", the path is typically "media/My Playlist".
      // We get the playlist name from the fetched data.
      formData.append('path', `media/${playlist.name}`);

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        // AzuraCast API key would be needed here if not using cookies/session auth
        // headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed with status: " + res.status);
      }

      setStatus({ type: "success", message: "Upload successful! AzuraCast will now process the file." });
      setFile(null); // Reset file input
      
      // TODO: After upload, find the song's ID and update its metadata
      // with the "songSource" and a link to the video if applicable.
      // This is a multi-step process:
      // 1. Search for the media item by path.
      // 2. Get its unique song_id.
      // 3. Make a PUT request to /api/station/{id}/song/{song_id} with custom fields.

    } catch (error) {
      setStatus({ type: "error", message: error.message || "An unknown error occurred during upload." });
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case "loading":
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Music className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Upload /> AzuraCast Uploader
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Song File (MP3 or Video)
          </label>
          <StyledInput 
            type="file" 
            accept="audio/mpeg,video/*"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Song Source (Optional)
          </label>
          <StyledInput
            type="text"
            placeholder="e.g., YouTube, SoundCloud, Bandcamp"
            value={songSource}
            onChange={(e) => setSongSource(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">This metadata can be used in the future.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Destination Playlist
          </label>
          <StyledSelect
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
            disabled={playlists.length === 0}
          >
            {playlists.length > 0 ? (
              playlists.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))
            ) : (
              <option>Loading playlists...</option>
            )}
          </StyledSelect>
        </div>

        <div className="pt-4">
          <button
            onClick={handleUpload}
            disabled={!file || status.type === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Upload className="h-5 w-5" />
            <span>{status.type === 'loading' ? 'Uploading...' : 'Upload to AzuraCast'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg mt-4">
            {getStatusIcon()}
            <p className={`text-sm ${
                status.type === 'error' ? 'text-red-400' : 
                status.type === 'success' ? 'text-green-400' : 'text-gray-300'
            }`}>
                {status.message}
            </p>
        </div>
      </div>
    </div>
  );
}
