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

const API_BASE = process.env.NEXT_PUBLIC_AZURACAST_API;
const STATION_ID = process.env.NEXT_PUBLIC_STATION_ID;
const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL;

const NOW_PLAYING_URL = `${API_BASE}/nowplaying`;

function getAlbumArtUrl(nowPlaying) {
  if (!nowPlaying) return null;
  const song = nowPlaying.now_playing?.song || {};
  const art = song.art || null;
  if (!art) return null;
  if (art.startsWith("http")) return art;
  try {
    const origin = new URL(API_BASE).origin;
    return `${origin}${art}`;
  } catch (e) {
    console.error("Error constructing album art URL:", e);
    return art;
  }
}

function getVideoUrl(nowPlaying) {
  const customFields = nowPlaying?.now_playing?.song?.custom_fields;
  if (!customFields) return null;
  for (const key in customFields) {
    const value = customFields[key];
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (
        trimmedValue.includes("youtube.com/") ||
        trimmedValue.includes("youtu.be/") ||
        trimmedValue.endsWith(".mp4")
      ) {
        return trimmedValue;
      }
    }
  }
  return null;
}

function getYoutubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) return null;
  let videoId = null;
  const watchMatch = youtubeUrl.match(/[?&]v=([^&]+)/);
  if (watchMatch && watchMatch[1]) {
    videoId = watchMatch[1];
  } else {
    const shortMatch = youtubeUrl.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch && shortMatch[1]) {
      videoId = shortMatch[1];
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&enablejsapi=1`;
  }
  return null;
}

export default function AzurePlayerBot() {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [isYtPlayerReady, setIsYtPlayerReady] = useState(false);
  const [isYtApiLoaded, setIsYtApiLoaded] = useState(false);

  const [nowPlaying, setNowPlaying] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [selectedQueueIndex, setSelectedQueueIndex] = useState(null);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch(NOW_PLAYING_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("NowPlaying fetch failed");
      const data = await res.json();
      console.log("Fetched now playing data:", data);
      const stationData = Array.isArray(data) ? data[0] : data;
      if (stationData) {
        setNowPlaying(stationData);
        const nextSong = stationData.playing_next;
        const history = stationData.song_history || [];
        const newQueue = [];
        if (nextSong) {
          newQueue.push({ ...nextSong, is_next: true });
        }
        newQueue.push(...history);
        setQueue(newQueue);
      }
    } catch (err) {
      console.error("Error fetching nowplaying:", err);
    }
  }, []);

  const title =
    nowPlaying?.now_playing?.song?.title ||
    nowPlaying?.now_playing?.song?.text ||
    "Live Radio";
  const artist =
    nowPlaying?.now_playing?.song?.artist ||
    nowPlaying?.now_playing?.song?.album ||
    "";

  const albumArtUrl = getAlbumArtUrl(nowPlaying);
  const coverSrc = albumArtUrl || "/images/radio1.jpeg";
  const videoUrl = getVideoUrl(nowPlaying);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(videoUrl);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const p = audioRef.current.play();
      if (p && typeof p.then === "function") {
        p.catch((err) => {
          console.warn("Autoplay prevented:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // YouTube Player Setup - FIXED
  useEffect(() => {
    if (!youtubeEmbedUrl) {
      if (
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.destroy === "function"
      ) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YouTube player:", e);
        }
        ytPlayerRef.current = null;
      }
      setIsYtPlayerReady(false);
      return;
    }

    const videoId = youtubeEmbedUrl.match(/embed\/([^?]+)/)?.[1];
    if (!videoId) return;

    const setupPlayer = () => {
      // Clean up existing player
      if (
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.destroy === "function"
      ) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YouTube player:", e);
        }
      }

      // Reset ready state
      setIsYtPlayerReady(false);

      try {
        ytPlayerRef.current = new window.YT.Player("youtube-player-container", {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            mute: 1,
            loop: 1,
            playlist: videoId,
            controls: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              console.log("YouTube player ready");
              setIsYtPlayerReady(true);
            },
            onError: (event) => {
              console.error("YouTube player error:", event.data);
              setIsYtPlayerReady(false);
            },
          },
        });
      } catch (e) {
        console.error("Error creating YouTube player:", e);
        setIsYtPlayerReady(false);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      window.onYouTubeIframeAPIReady = setupPlayer;
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        )
      ) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }
  }, [youtubeEmbedUrl]);

  // Control YouTube playback - FIXED with better validation
  useEffect(() => {
    // Only attempt to control if player exists, is ready, and has the required methods
    if (
      ytPlayerRef.current &&
      isYtPlayerReady &&
      typeof ytPlayerRef.current.playVideo === "function" &&
      typeof ytPlayerRef.current.pauseVideo === "function"
    ) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (err) {
        console.error("YouTube player control error:", err);
      }
    }
  }, [isPlaying, isYtPlayerReady]);

  const queueDisplayText = (item) => {
    if (!item || !item.song) return "";
    return item.song.text || `${item.song.title} - ${item.song.artist}`;
  };

  const onSelectQueueItem = (index) => {
    setSelectedQueueIndex(index);
    setShowPlaylist(false);
  };

  return (
    <div className="w-full sm:w-[80%] mx-auto">
      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>

      {/* header */}
      <div
        className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2 w-full rounded-t-lg"
        style={{ backgroundColor: "rgb(31 41 55 / 0.9)" }}
      >
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

      {/* video / art area - FIXED */}
      <div
        className="relative w-full bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <div className="absolute inset-0">
          {/* Background layer - always visible */}
          <div className="absolute inset-0">
            {albumArtUrl ? (
              <Image
                key={albumArtUrl}
                src={albumArtUrl}
                alt="Song artwork background"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <video
                src="/images/bg-video-compressed.mp4"
                className="absolute top-0 left-0 w-full h-full object-cover"
                loop
                muted
                autoPlay
              />
            )}
          </div>

          {/* YouTube Video Layer - shows when playing */}
          {youtubeEmbedUrl && (
            <div
              className={`absolute inset-0 bg-black transition-opacity duration-500 ${
                isPlaying ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div id="youtube-player-container" className="w-full h-full" />
            </div>
          )}

          {/* MP4 Video Layer */}
          {!youtubeEmbedUrl && videoUrl && videoUrl.endsWith(".mp4") && (
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              className="absolute top-0 left-0 w-full h-full object-cover z-10"
              loop
              muted
            />
          )}

          {/* Overlay with animated album art */}
          <div className="absolute inset-0 flex items-end z-20">
            <div className="flex gap-4 items-end p-4 w-full bg-gradient-to-t from-black/95 via-black/70 to-transparent">
              <div className="w-20 h-20 sm:w-28 sm:h-28 relative rounded overflow-hidden">
                {/* Animated album art when playing */}
                <Image
                  src={coverSrc}
                  alt="Album Art"
                  fill
                  className={`object-cover ${
                    isPlaying ? "animate-spin-slow" : ""
                  }`}
                  unoptimized
                />
                {/* Pulsing ring effect when playing */}
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 rounded animate-pulse">
                      <div className="absolute inset-0 rounded border-2 border-purple-500/50" />
                    </div>
                    <div className="absolute inset-0 rounded animate-ping opacity-75">
                      <div className="absolute inset-0 rounded border-2 border-purple-400/30" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-1 truncate">
                  {title}
                </h2>
                <p className="text-gray-300 text-base sm:text-lg truncate">
                  {artist}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded transition-all ${
                      isPlaying
                        ? "bg-red-500/30 text-red-300 animate-pulse"
                        : "bg-purple-500/30 text-purple-300"
                    }`}
                  >
                    {isPlaying ? "● LIVE" : "LIVE"}
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

      <audio ref={audioRef} src={STREAM_URL} crossOrigin="anonymous" />

      {/* controls */}
      <div className="bg-gray-800 w-full rounded-b-lg p-3 sm:p-4">
        <div className="w-full mb-3">
          <div className="flex flex-col items-center gap-3 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setIsShuffle((s) => !s)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${
                  isShuffle
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-gray-500 bg-black/50 text-gray-400"
                } hover:border-white hover:text-white flex items-center justify-center transition-all`}
              >
                <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = 0;
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center transition-all"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-purple-500/50"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
                ) : (
                  <Play className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime += 10;
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center transition-all"
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
              >
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between w-full pt-1">
              <div className="flex items-center gap-2">
                <Volume2 className="text-gray-300" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-32 sm:w-40"
                />
              </div>

              <button
                onClick={() => setShowPlaylist((s) => !s)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center"
              >
                <List />
              </button>
            </div>
          </div>
        </div>

        {showPlaylist && (
          <div className="mt-3 bg-gray-900 rounded-lg p-3 max-h-64 overflow-y-auto">
            <h3 className="text-white font-bold mb-2 text-sm">
              Upcoming & History
            </h3>
            <div className="space-y-2">
              {queue.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No upcoming song or history found.
                </p>
              )}
              {queue.map((item, idx) => (
                <button
                  key={item.sh_id || `next-${idx}`}
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
                    </div>
                    {item.is_next && (
                      <span className="text-xs text-green-400 uppercase font-bold">
                        Next
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
