"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Music,
  Link,
  File,
  ListMusic,
  XCircle,
  CheckCircle,
  Loader2,
  Download,
  Cloud,
  Youtube,
} from "lucide-react";

/*
  CONFIG - Update these with your actual API endpoints
*/
const API_BASE = process.env.NEXT_PUBLIC_AZURACAST_API;
const STATION_ID = process.env.NEXT_PUBLIC_STATION_ID;

// Your backend API endpoints
const YOUR_API_UPLOAD = "/api/upload";
const PLAYLISTS_URL = "/api/playlists";

export default function AzureCastUpload() {
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");

  const [status, setStatus] = useState({
    type: "idle",
    message: "Ready to upload",
  });

  const fileInputRef = useRef(null);

  // Fetch playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(PLAYLISTS_URL);
        if (!res.ok) throw new Error("Failed to fetch playlists");
        const data = await res.json();

        const standardPlaylists = data.filter((p) => p.type === "default");
        setPlaylists(standardPlaylists);
        if (standardPlaylists.length > 0) {
          setSelectedPlaylist(standardPlaylists[0].id);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
        setStatus({
          type: "error",
          message: "Could not load playlists",
        });
      }
    };
    fetchPlaylists();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus({
        type: "idle",
        message: `Selected: ${selectedFile.name}`,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatus({
        type: "idle",
        message: `Selected: ${droppedFile.name}`,
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: "error", message: "Please select an MP3 file first" });
      return;
    }
    if (!selectedPlaylist) {
      setStatus({ type: "error", message: "Please select a playlist" });
      return;
    }

    try {
      setStatus({ type: "loading", message: "Processing..." });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("playlistId", selectedPlaylist);

      if (songTitle) formData.append("title", songTitle);
      if (songArtist) formData.append("artist", songArtist);
      if (youtubeUrl) formData.append("video_url", youtubeUrl);

      const res = await fetch(YOUR_API_UPLOAD, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await res.json();

      setStatus({
        type: "success",
        message: result.message || "Upload successful!",
      });

      // Reset form
      setFile(null);
      setYoutubeUrl("");
      setSongTitle("");
      setSongArtist("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ type: "idle", message: "Ready to upload" });
      }, 5000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Upload failed",
      });
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case "loading":
        return <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Music className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Music</h2>
            <p className="text-purple-100 text-sm">
              Add songs to your radio station
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-b-2xl p-6 shadow-2xl border border-gray-700 border-t-0">
        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="mb-6 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-900/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,.mp3"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-purple-500/20 rounded-full">
              <Upload className="h-8 w-8 text-purple-400" />
            </div>
            {file ? (
              <>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-white font-medium">
                  Drop your MP3 file here or click to browse
                </p>
                <p className="text-gray-400 text-sm">
                  Supports MP3 audio files only
                </p>
              </>
            )}
          </div>
        </div>

        {/* Song Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Song Title (Optional)
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Enter song title"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artist (Optional)
            </label>
            <input
              type="text"
              value={songArtist}
              onChange={(e) => setSongArtist(e.target.value)}
              placeholder="Enter artist name"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* YouTube Video Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Youtube className="inline h-4 w-4 mr-1" />
            YouTube Video Link (Optional)
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Add a YouTube link if this song is from a video
          </p>
        </div>

        {/* Playlist Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <ListMusic className="inline h-4 w-4 mr-1" />
            Destination Playlist
          </label>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
            disabled={playlists.length === 0}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
          >
            {playlists.length > 0 ? (
              playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            ) : (
              <option>Loading playlists...</option>
            )}
          </select>
        </div>

        {/* Status Message */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
            status.type === "error"
              ? "bg-red-500/10 border border-red-500/30"
              : status.type === "success"
              ? "bg-green-500/10 border border-green-500/30"
              : status.type === "loading"
              ? "bg-purple-500/10 border border-purple-500/30"
              : "bg-gray-700/50 border border-gray-600"
          }`}
        >
          {getStatusIcon()}
          <p
            className={`text-sm font-medium ${
              status.type === "error"
                ? "text-red-400"
                : status.type === "success"
                ? "text-green-400"
                : status.type === "loading"
                ? "text-purple-400"
                : "text-gray-300"
            }`}
          >
            {status.message}
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={status.type === "loading" || !file}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none group"
        >
          {status.type === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Upload to AzuraCast</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
