import { useState, useRef } from "react";
import { Pause, Play } from "lucide-react"; // or any icons you prefer

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <button
        onClick={togglePlay}
        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
      >
        <div className="transition-all duration-300 transform scale-100 text-white">
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </div>
      </button>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />
    </div>
  );
};

export default AudioPlayer;
