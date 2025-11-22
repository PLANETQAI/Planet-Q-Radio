"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle,
  List,
} from "lucide-react";

// ----------------------------
// CONFIG
// ----------------------------
const STATION_ID = 1;
const API_BASE = "https://your-azuracast-domain.com"; // REPLACE THIS
const STREAM_URL = `${API_BASE}/radio/8000/radio.mp3`;

// AzuraCast endpoints
const NOW_PLAYING_URL = `${API_BASE}/api/stations/${STATION_ID}/nowplaying`;
const QUEUE_URL = `${API_BASE}/api/stations/${STATION_ID}/queue`;

export default function PlayerBot() {
  const audioRef = useRef(null);

  const [nowPlaying, setNowPlaying] = useState(null);
  const [playlist, setPlaylist] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // ----------------------------
  // FETCH NOW PLAYING + QUEUE
  // ----------------------------

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch(NOW_PLAYING_URL);
      const data = await res.json();
      setNowPlaying(data);
    } catch (err) {
      console.log("Error fetching now playing", err);
    }
  }, []);

  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await fetch(QUEUE_URL);
      const data = await res.json();
      setPlaylist(data);
    } catch (err) {
      console.log("Error fetching playlist", err);
    }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    fetchPlaylist();
    const interval = setInterval(() => {
      fetchNowPlaying();
      fetchPlaylist();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------
  // PLAY / PAUSE
  // ----------------------------
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  };

  // ----------------------------
  // DETECT TYPE (AUDIO / YOUTUBE / SOUNDCLOUD)
  // ----------------------------
  const detectType = () => {
    if (!nowPlaying) return "audio";

    const meta = nowPlaying.now_playing?.song?.custom_fields || {};

    if (meta.youtube_id) return "youtube";
    if (meta.soundcloud_id) return "soundcloud";

    return "audio";
  };

  const trackType = detectType();

  const getYouTubeUrl = () => {
    const id =
      nowPlaying?.now_playing?.song?.custom_fields?.youtube_id || "dQw4w9WgXcQ";
    return `https://www.youtube.com/embed/${id}?autoplay=${
      isPlaying ? 1 : 0
    }&controls=1`;
  };

  const getSoundCloudUrl = () => {
    const id =
      nowPlaying?.now_playing?.song?.custom_fields?.soundcloud_id || "";
    return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&auto_play=${
      isPlaying ? "true" : "false"
    }&visual=true`;
  };

  const metaTitle = nowPlaying?.now_playing?.song?.title || "Loading...";
  const metaArtist = nowPlaying?.now_playing?.song?.artist || "";
  const metaArt = nowPlaying?.now_playing?.song?.art;

  // ----------------------------
  // UI START
  // ----------------------------

  return (
    <div className="w-full sm:w-[80%] h-[80vh]">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-3 w-full rounded-t-lg bg-gray-800/90">
        {/* LEFT RADIO ICON */}
        <div className="relative w-20 h-20 overflow-hidden rounded-full">
          <video autoPlay loop muted className="object-cover w-full h-full">
            <source src="/images/anicircle.mp4" type="video/mp4" />
          </video>
          <Image
            src="/images/radio1.jpeg"
            alt="Radio"
            fill
            className="absolute inset-0 p-2 rounded-full object-cover"
          />
        </div>

        {/* CENTER CHAT BUTTON */}
        <div className="flex flex-col items-center">
          <Link
            href={"/chat"}
            className="rounded-full overflow-hidden w-32 h-32 flex items-center justify-center hover:shadow-[0_0_15px_rgba(0,255,255,0.8)]"
          >
            <video autoPlay loop muted className="object-cover w-full h-full">
              <source src="/videos/generator.mp4" type="video/mp4" />
            </video>
          </Link>
          <p className="text-blue-400 text-xl font-bold mt-2">Quayla</p>
        </div>

        {/* RIGHT ICON */}
        <div className="relative w-20 h-20 overflow-hidden rounded-full">
          <video autoPlay loop muted className="object-cover w-full h-full">
            <source src="/images/anicircle.mp4" type="video/mp4" />
          </video>
          <Image
            src="/images/radio1.jpeg"
            alt="Radio"
            fill
            className="absolute inset-0 p-2 rounded-full object-cover"
          />
        </div>
      </div>

      {/* MAIN PLAYER (video/audio) */}
      <div
        className="relative w-full bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <div className="absolute inset-0">
          {/* YOUTUBE */}
          {trackType === "youtube" && (
            <iframe
              src={getYouTubeUrl()}
              className="absolute w-full h-full"
              allow="autoplay"
              allowFullScreen
            />
          )}

          {/* SOUNDCLOUD */}
          {trackType === "soundcloud" && (
            <iframe
              src={getSoundCloudUrl()}
              className="absolute w-full h-full"
              allow="autoplay"
            />
          )}

          {/* DEFAULT AUDIO STREAM */}
          {trackType === "audio" && (
            <video
              src="/images/bg-video-compressed.mp4"
              className="absolute object-cover w-full h-full"
              autoPlay
              muted
              loop
            />
          )}

          {/* Track Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
            <h2 className="text-white text-2xl font-bold truncate">
              {metaTitle}
            </h2>
            <p className="text-gray-300">{metaArtist}</p>
          </div>
        </div>
      </div>

      {/* AUDIO TAG */}
      <audio ref={audioRef} src={STREAM_URL} />

      {/* CONTROLS */}
      <div className="bg-gray-900 p-4 rounded-b-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`w-10 h-10 rounded-full border ${
              isShuffle
                ? "border-purple-500 text-purple-400"
                : "border-gray-600 text-gray-400"
            } flex items-center justify-center`}
          >
            <Shuffle />
          </button>

          <button
            onClick={() => (audioRef.current.currentTime = 0)}
            className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center text-gray-400"
          >
            <SkipBack />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full text-white flex items-center justify-center shadow-lg"
          >
            {isPlaying ? <Pause /> : <Play className="ml-1" />}
          </button>

          <button
            onClick={() => (audioRef.current.currentTime += 5)}
            className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center text-gray-400"
          >
            <SkipForward />
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`w-10 h-10 rounded-full border ${
              isRepeat
                ? "border-purple-500 text-purple-400"
                : "border-gray-600 text-gray-400"
            } flex items-center justify-center`}
          >
            <Repeat />
          </button>
        </div>

        {/* PLAYLIST */}
        {showPlaylist && (
          <div className="mt-4 bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
            <h3 className="text-white text-lg font-bold mb-2">
              Upcoming Tracks
            </h3>
            {playlist.map((track, idx) => (
              <div key={idx} className="p-2 border-b border-gray-700">
                <p className="text-white">{track.cued_song.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
