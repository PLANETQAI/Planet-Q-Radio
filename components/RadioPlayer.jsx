"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useRef } from "react";
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

// Sample playlist - Replace with your actual tracks
const PLAYLIST = [
  {
    id: 1,
    title: "CNC - Something In Me",
    artist: "CNC",
    soundcloudUrl:
      "https://soundcloud.com/cncofficialmusic/cnc-something-in-me-free-download?si=110cbd700cbb425090fc858100f0a1ad&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
    trackId: "2216501942",
    type: "soundcloud",
  },
  {
    id: 2,
    title: "Sample YouTube Track",
    artist: "Artist Name",
    youtubeUrl: "https://www.youtube.com/watch?v=jHL95qTz62o",
    videoId: "dQw4w9WgXcQ",
    type: "youtube",
  },
];

function PlayerBot() {
  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const iframeRef = useRef(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

  const playNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * PLAYLIST.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) =>
        prev === PLAYLIST.length - 1 ? 0 : prev + 1
      );
    }
    setIsPlaying(true);
  };

  const playPrevious = () => {
    setCurrentTrackIndex((prev) =>
      prev === 0 ? PLAYLIST.length - 1 : prev - 1
    );
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  const getSoundCloudEmbedUrl = (trackId) => {
    return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&auto_play=${
      isPlaying ? "true" : "false"
    }&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
  };

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${
      isPlaying ? "1" : "0"
    }&controls=1`;
  };

  return (
    <div className="w-full sm:w-[80%] h-[80vh]" onClick={preventPropagation}>
      <div
        className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2 w-full rounded-t-lg"
        style={{
          backgroundColor: "rgb(31 41 55 / 0.9)",
        }}
      >
        {/* Left Radio Circle */}
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

        {/* Center Chat Link */}
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

        {/* Right Radio Circle */}
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

      {/* Video/Audio Display - Main Player Area */}
      <div
        className="relative w-full bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <div className="absolute inset-0">
          {currentTrack.type === "youtube" ? (
            // YouTube Video Player
            <iframe
              key={`youtube-${currentTrack.id}-${isPlaying}`}
              ref={iframeRef}
              src={getYouTubeEmbedUrl(currentTrack.videoId)}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : currentTrack.type === "soundcloud" ? (
            // SoundCloud Player
            <iframe
              key={`soundcloud-${currentTrack.id}-${isPlaying}`}
              ref={iframeRef}
              width="100%"
              height="100%"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={getSoundCloudEmbedUrl(currentTrack.trackId)}
              className="absolute top-0 left-0 w-full h-full"
            />
          ) : (
            // Default background video
            <video
              src="/images/bg-video-compressed.mp4"
              className="absolute top-0 left-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
            ></video>
          )}

          {/* Track Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-1 truncate">
              {currentTrack.title}
            </h2>
            <p className="text-gray-300 text-base sm:text-lg truncate">
              {currentTrack.artist}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">
                {currentTrack.type.toUpperCase()}
              </span>
              <span className="text-gray-400 text-xs">
                Track {currentTrackIndex + 1} of {PLAYLIST.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="bg-gray-800 w-full rounded-b-lg p-3 sm:p-4">
        {/* Main Controls */}
        <div className="w-full mb-3">
          {/* Left side - Playback controls */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${
                isShuffle
                  ? "border-purple-500 bg-purple-500/20 text-purple-400"
                  : "border-gray-500 bg-black/50 text-gray-400"
              } hover:border-white hover:text-white flex items-center justify-center transition-all`}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={playPrevious}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center transition-all"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-purple-500/50"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-500 bg-black/50 text-gray-400 hover:border-white hover:text-white flex items-center justify-center transition-all"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${
                isRepeat
                  ? "border-purple-500 bg-purple-500/20 text-purple-400"
                  : "border-gray-500 bg-black/50 text-gray-400"
              } hover:border-white hover:text-white flex items-center justify-center transition-all`}
            >
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Playlist Dropdown */}
        {showPlaylist && (
          <div className="mt-3 bg-gray-900 rounded-lg p-3 max-h-64 overflow-y-auto">
            <h3 className="text-white font-bold mb-2 text-sm">Playlist</h3>
            <div className="space-y-2">
              {PLAYLIST.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  className={`w-full text-left p-2 rounded-lg transition-all ${
                    index === currentTrackIndex
                      ? "bg-purple-500/30 border border-purple-500"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {track.title}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-xs text-purple-400 uppercase">
                      {track.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerBot;
