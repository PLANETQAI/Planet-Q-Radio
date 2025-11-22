"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

/*
  CONFIG - change as needed
  - API_BASE: your AzuraCast base
  - STATION_ID: 4 (you gave)
  - STREAM_URL: placeholder {STREAM_URL} (replace or set NEXT_PUBLIC_STREAM_URL)
*/
const API_BASE = process.env.NEXT_PUBLIC_AZURACAST_API;
const STATION_ID = process.env.NEXT_PUBLIC_STATION_ID;
const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL;

const NOW_PLAYING_URL = `${API_BASE}/api/stations/${STATION_ID}/nowplaying`;
const QUEUE_URL = `${API_BASE}/api/stations/${STATION_ID}/queue`;

// Helpful small util to safely pick album art from common possible fields
function getAlbumArt(nowPlaying) {
  if (!nowPlaying) return null;
  // Common AzuraCast fields:
  const song = nowPlaying.now_playing?.song || {};
  // try common keys
  return (
    song.art ||
    song.art_url ||
    song.album_art ||
    song.thumbnail ||
    nowPlaying.station?.branding?.cover ||
    null
  );
}

export default function PlayerBot() {
  const audioRef = useRef(null);

  // metadata
  const [nowPlaying, setNowPlaying] = useState(null);
  const [queue, setQueue] = useState([]);

  // UI states
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Selected queue item (for display only)
  const [selectedQueueIndex, setSelectedQueueIndex] = useState(null);

  // Fetch now playing
  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch(NOW_PLAYING_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("NowPlaying fetch failed");
      const data = await res.json();
      setNowPlaying(data);
    } catch (err) {
      // silently fail but keep previous state
      console.error("Error fetching nowplaying:", err);
    }
  }, []);

  // Fetch queue / upcoming
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(QUEUE_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Queue fetch failed");
      const data = await res.json();
      // queue shape can vary by AzuraCast version - try to normalize
      // if data is an array of cue objects or an object with "queue"
      if (Array.isArray(data)) setQueue(data);
      else if (Array.isArray(data.queue)) setQueue(data.queue);
      else setQueue([]);
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  }, []);

  useEffect(() => {
    // initial load
    fetchNowPlaying();
    fetchQueue();

    // autopoll every 5 seconds
    const interval = setInterval(() => {
      fetchNowPlaying();
      fetchQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNowPlaying, fetchQueue]);

  // audio element management
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    // If user toggles isPlaying, control audio element
    if (!audioRef.current) return;

    if (isPlaying) {
      const p = audioRef.current.play();
      // handle autoplay promise rejection
      if (p && typeof p.then === "function") {
        p.catch((err) => {
          // Autoplay blocked by browser - set isPlaying false
          console.warn("Autoplay prevented:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // metadata helpers
  const title =
    nowPlaying?.now_playing?.song?.title ||
    nowPlaying?.now_playing?.song?.text ||
    "Live Radio";
  const artist =
    nowPlaying?.now_playing?.song?.artist ||
    nowPlaying?.now_playing?.song?.album ||
    "";
  const albumArt = getAlbumArt(nowPlaying);
  const coverSrc = albumArt || "/images/default-album.png"; // ensure you have this fallback image

  // For queue item display: normalize for display string
  const queueDisplayText = (item) => {
    // AzuraCast's queue item commonly present as {cued_song: {text: "..."}}
    if (!item) return "";
    if (item.cued_song?.text) return item.cued_song.text;
    if (item.text) return item.text;
    // sometimes cue contains song object
    if (item.song?.title)
      return `${item.song.title} — ${item.song.artist || ""}`;
    // fallback to JSON
    return JSON.stringify(item).slice(0, 120);
  };

  // clicking a playlist item will select it (display only)
  const onSelectQueueItem = (index) => {
    setSelectedQueueIndex(index);
    setShowPlaylist(false);
  };

  return (
    <div
      className="w-full sm:w-[80%] h-[80vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2 w-full rounded-t-lg"
        style={{
          backgroundColor: "rgb(31 41 55 / 0.9)",
        }}
      >
        {/* left circle */}
        <div className="relative w-16 sm:w-20 md:w-24 aspect-square overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
            <video
              autoPlay
              loop
              muted
              className="w-[150%] h-auto object-cover rounded-full"
            >
              <source src="/images/anicircle.mp4" type="video/mp4" />
            </video>
            <Image
              src="/images/radio1.jpeg"
              alt="Radio Left"
              width={100}
              height={100}
              className="absolute p-1 sm:p-2 rounded-full"
            />
          </div>
        </div>

        {/* center */}
        <div className="flex justify-center items-center flex-col gap-4">
          <Link
            href={"/chat"}
            className="rounded-full overflow-hidden aspect-square flex justify-center items-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 hover:shadow-[0_0_15px_rgba(0,300,300,0.8)] hover:cursor-pointer mx-2"
          >
            <video
              loop
              autoPlay
              muted
              preload="true"
              className="rounded-full w-full h-full object-cover"
            >
              <source src="/videos/generator.mp4" type="video/mp4" />
            </video>
          </Link>
          <p
            className="text-blue-500 text-lg font-bold animate-pulse"
            style={{
              fontFamily: "cursive",
              color: "#00d4ff",
              textShadow: "0 0 20px rgba(0, 212, 255, 0.5)",
              letterSpacing: "1px",
              lineHeight: "1.2",
            }}
          >
            Quayla
          </p>
        </div>

        {/* right */}
        <div className="relative w-16 sm:w-20 md:w-24 aspect-square overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
            <video
              autoPlay
              loop
              muted
              className="w-[150%] h-auto object-cover rounded-full"
            >
              <source src="/images/anicircle.mp4" type="video/mp4" />
            </video>
            <Image
              src="/images/radio1.jpeg"
              alt="Radio Right"
              width={100}
              height={100}
              className="absolute p-1 sm:p-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* video / art area */}
      <div
        className="relative w-full bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <div className="absolute inset-0">
          {/* background visual (animated) */}
          <video
            src="/images/bg-video-compressed.mp4"
            className="absolute top-0 left-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
          />

          {/* overlay track info + album art */}
          <div className="absolute inset-0 flex items-end">
            <div className="flex gap-4 items-end p-4 w-full bg-gradient-to-t from-black/95 via-black/70 to-transparent">
              <div className="w-20 h-20 sm:w-28 sm:h-28 relative rounded overflow-hidden">
                {/* album art (fallback if missing) */}
                <Image
                  src={coverSrc}
                  alt="Album Art"
                  fill
                  className="object-cover"
                  // Next/Image requires domain config if external. If AzuraCast returns external URL,
                  // configure next.config.js domains or use a normal <img> tag.
                />
              </div>

              <div className="flex-1">
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-1 truncate">
                  {title}
                </h2>
                <p className="text-gray-300 text-base sm:text-lg truncate">
                  {artist}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">
                    LIVE
                  </span>
                  <span className="text-gray-400 text-xs">
                    Station: {nowPlaying?.station?.name || "Planet Q"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* audio element (live stream) */}
      <audio ref={audioRef} src={STREAM_URL} />

      {/* controls */}
      <div className="bg-gray-800 w-full rounded-b-lg p-3 sm:p-4">
        <div className="w-full mb-3">
          <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
            <button
              onClick={() => setIsShuffle((s) => !s)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${
                isShuffle
                  ? "border-purple-500 bg-purple-500/20 text-purple-400"
                  : "border-gray-500 bg-black/50 text-gray-400"
              } hover:border-white hover:text-white flex items-center justify-center transition-all`}
              title="Shuffle (visual only)"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => {
                // Reset to start; for live stream this does not change what is playing on the server.
                if (audioRef.current) audioRef.current.currentTime = 0;
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center transition-all"
              title="Rewind (client only)"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-purple-500/50"
              title="Play / Pause stream"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </button>

            <button
              onClick={() => {
                // For live stream skipping forward has no effect server-side;
                // advance 10s locally if the stream supports it (usually not useful for live).
                if (audioRef.current) audioRef.current.currentTime += 10;
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center transition-all"
              title="Forward (client only)"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setIsRepeat((r) => !r)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${
                isRepeat
                  ? "border-purple-500 bg-purple-500/20 text-purple-400"
                  : "border-gray-500 bg-black/50 text-gray-400"
              } hover:border-white hover:text-white flex items-center justify-center transition-all`}
              title="Repeat (visual only)"
            >
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* volume slider */}
            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="text-gray-300" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-40"
              />
            </div>

            {/* playlist toggle */}
            <button
              onClick={() => setShowPlaylist((s) => !s)}
              className="ml-4 w-10 h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center"
              title="Show upcoming playlist"
            >
              <List />
            </button>
          </div>
        </div>

        {/* playlist dropdown */}
        {showPlaylist && (
          <div className="mt-3 bg-gray-900 rounded-lg p-3 max-h-64 overflow-y-auto">
            <h3 className="text-white font-bold mb-2 text-sm">
              Upcoming / Queue
            </h3>
            <div className="space-y-2">
              {queue.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No upcoming items found.
                </p>
              )}
              {queue.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQueueItem(idx)}
                  className={`w-full text-left p-2 rounded-lg transition-all ${
                    idx === selectedQueueIndex
                      ? "bg-purple-500/30 border border-purple-500"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {queueDisplayText(item)}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {item.cued_by || ""}
                      </p>
                    </div>
                    <span className="text-xs text-purple-400 uppercase">
                      {item.type || ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* selected queue detail (display only) */}
        {selectedQueueIndex !== null && queue[selectedQueueIndex] && (
          <div className="mt-3 bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-semibold">Selected Item</h4>
            <p className="text-gray-300 text-sm mt-2">
              {queueDisplayText(queue[selectedQueueIndex])}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
