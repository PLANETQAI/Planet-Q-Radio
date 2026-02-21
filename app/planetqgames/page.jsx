'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, Cpu, Wand2, Zap, Play, ChevronRight,
  Gamepad2, Target, Car, Trophy, Swords, Shield, Joystick,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon, 
  X, Code, Globe, Crosshair, Music, Video, Download, Pause, Volume2, VolumeX,
  Upload, Trash2, Timer, Heart, Star, Rocket, Camera
} from 'lucide-react';

// ============================================
// AI VIDEO GAME GENERATOR - WEB VERSION
// ============================================

const GENRES = [
  { id: 'action', name: 'Action Games', icon: Swords, color: 'from-red-500 to-orange-500', accent: '#FF4444' },
  { id: 'puzzle', name: 'Puzzle Games', icon: Target, color: 'from-purple-500 to-pink-500', accent: '#A855F7' },
  { id: 'adventure', name: 'Adventure', icon: Trophy, color: 'from-yellow-500 to-amber-500', accent: '#F59E0B' },
  { id: 'arcade', name: 'Arcade', icon: Joystick, color: 'from-cyan-500 to-blue-500', accent: '#06B6D4' },
  { id: 'racing', name: 'Racing', icon: Car, color: 'from-green-500 to-emerald-500', accent: '#10B981' },
  { id: 'rpg', name: 'RPG', icon: Shield, color: 'from-indigo-500 to-purple-500', accent: '#6366F1' },
];

const GENRE_PROMPTS = {
  action: ['A space shooter defending Earth from aliens...', 'A martial arts fighting game...', 'A superhero action game...'],
  puzzle: ['A puzzle platformer with gravity manipulation...', 'A mystery puzzle with ancient riddles...', 'A physics puzzle with portals...'],
  adventure: ['An epic quest through enchanted forests...', 'A treasure hunt on mysterious islands...', 'A time-travel adventure...'],
  arcade: ['A retro space invaders with modern twist...', 'A fast-paced brick breaker...', 'An endless runner through cyberpunk city...'],
  racing: ['A street racing game in neon Tokyo...', 'A futuristic anti-gravity racing...', 'An off-road rally adventure...'],
  rpg: ['A medieval knight quest to slay a dragon...', 'A mage academy learning magic...', 'A cyberpunk RPG in a megacity...'],
};

const AI_MUSIC_TRACKS = [
  { name: 'Epic Battle', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre: 'action' },
  { name: 'Mystery Ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre: 'puzzle' },
  { name: 'Adventure Theme', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', genre: 'adventure' },
  { name: 'Retro Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', genre: 'arcade' },
  { name: 'Speed Rush', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', genre: 'racing' },
  { name: 'Fantasy Orchestra', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', genre: 'rpg' },
];

// AI Music Manager
const AIMusicManager = ({ genre, isPlaying }) => {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [userMusic, setUserMusic] = useState(null);
  const fileInputRef = useRef(null);

  const currentTrack = userMusic || (AI_MUSIC_TRACKS.find(t => t.genre === genre) || AI_MUSIC_TRACKS[0]).url;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying && currentTrack) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume, isMuted]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setUserMusic(URL.createObjectURL(file));
  };

  const deleteMusic = () => {
    if (userMusic) { URL.revokeObjectURL(userMusic); setUserMusic(null); }
  };

  return (
    <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
      <audio ref={audioRef} src={currentTrack} loop />
      <Music className="w-4 h-4 text-purple-400" />
      <button onClick={() => setIsMuted(!isMuted)} className="p-1 hover:bg-gray-700 rounded">
        {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
      </button>
      <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-16 h-1 bg-gray-600 rounded-lg cursor-pointer" />
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
      <button onClick={() => fileInputRef.current?.click()} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Upload Music">
        <Upload className="w-4 h-4" />
      </button>
      {userMusic && <button onClick={deleteMusic} className="p-1 hover:bg-red-900/50 rounded text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>}
    </div>
  );
};

// Video Capture Manager
const VideoCaptureManager = ({ isRecording, onRecordingChange }) => {
  const [recordedUrl, setRecordedUrl] = useState(null);

  const downloadVideo = () => {
    if (recordedUrl) {
      const a = document.createElement('a');
      a.href = recordedUrl;
      a.download = `game-capture-${Date.now()}.webm`;
      a.click();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <button onClick={() => onRecordingChange(true)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
          <Camera className="w-4 h-4" />Record
        </button>
      ) : (
        <button onClick={() => { onRecordingChange(false); setRecordedUrl('#'); }} className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-lg text-white text-sm animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />Stop
        </button>
      )}
      {recordedUrl && (
        <button onClick={downloadVideo} className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 text-sm">
          <Download className="w-4 h-4" />Download
        </button>
      )}
    </div>
  );
};

// AI Director Hook
const useAIDirector = (isPlaying, elapsedTime) => {
  const [state, setState] = useState({ phase: 0, waveCount: 2, difficulty: 1, timeScale: 1, eventMessage: null });

  useEffect(() => {
    if (!isPlaying) return;
    if (elapsedTime < 40) setState({ phase: 1, waveCount: 2, difficulty: 1, timeScale: 1, eventMessage: 'Wave 1 - Warm Up!' });
    else if (elapsedTime < 100) setState({ phase: 2, waveCount: 4, difficulty: 1.5, timeScale: 1, eventMessage: 'Wave 2 - Getting Intense!' });
    else if (elapsedTime < 180) setState({ phase: 3, waveCount: 6, difficulty: 2, timeScale: 1, eventMessage: 'Wave 3 - Challenge Mode!' });
    else if (elapsedTime < 260) setState({ phase: 4, waveCount: 6, difficulty: 2, timeScale: 0.7, eventMessage: 'Slow Motion Event!' });
    else if (elapsedTime < 270) setState({ phase: 5, waveCount: 8, difficulty: 2.5, timeScale: 1, eventMessage: 'Final Wave - Boss Rush!' });
    else setState({ phase: 6, waveCount: 0, difficulty: 1, timeScale: 1, eventMessage: 'Victory!' });
  }, [isPlaying, elapsedTime]);

  return state;
};

// Full Game Engine
const FullGameEngine = ({ genre, prompt, controlScheme, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(200);
  const [playerY, setPlayerY] = useState(200);
  const [playerVelocityY, setPlayerVelocityY] = useState(0);
  const [isGrounded, setIsGrounded] = useState(true);
  const [isBoosting, setIsBoosting] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [effects, setEffects] = useState([]);
  const [activeBtn, setActiveBtn] = useState(null);
  const [activeDpad, setActiveDpad] = useState(null);
  
  const bulletIdRef = useRef(0);
  const GAME_W = 500, GAME_H = 350, SPEED = 8, BOOST_SPEED = 16, JUMP_FORCE = 15, GRAVITY = 0.8, GAME_DURATION = 300;
  
  const genreConfig = GENRES.find(g => g.id === genre);
  const accent = genreConfig?.accent || '#4ECDC4';
  const director = useAIDirector(isPlaying && !isPaused, elapsedTime);

  const spawnEnemies = useCallback((count) => {
    const newEnemies = [];
    for (let i = 0; i < count; i++) {
      newEnemies.push({ id: Date.now() + i, x: Math.random() * (GAME_W - 100) + 50, y: Math.random() * 100 + 30, hp: Math.ceil(director.difficulty) });
    }
    setEnemies(prev => [...prev, ...newEnemies]);
  }, [director.difficulty]);

  useEffect(() => {
    if (isPlaying && enemies.length === 0) spawnEnemies(director.waveCount);
  }, [isPlaying, enemies.length, director.waveCount, spawnEnemies]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        if (prev >= GAME_DURATION) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1000 / director.timeScale);
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, director.timeScale]);

  useEffect(() => {
    if (!isPlaying || isPaused || director.phase === 6) return;
    const spawner = setInterval(() => { if (enemies.length < director.waveCount) spawnEnemies(1); }, 3000 / director.difficulty);
    return () => clearInterval(spawner);
  }, [isPlaying, isPaused, enemies.length, director, spawnEnemies]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    const gameLoop = setInterval(() => {
      setPlayerVelocityY(prev => prev + GRAVITY);
      setPlayerY(prev => {
        const newY = prev + playerVelocityY;
        if (newY > GAME_H - 80) { setIsGrounded(true); setPlayerVelocityY(0); return GAME_H - 80; }
        setIsGrounded(false);
        return newY;
      });

      setBullets(prev => {
        const updated = prev.map(b => ({ ...b, y: b.y - 15 })).filter(b => b.y > -20);
        updated.forEach(bullet => {
          setEnemies(curr => {
            const hit = curr.find(e => Math.abs(bullet.x - e.x) < 25 && Math.abs(bullet.y - e.y) < 25);
            if (hit) {
              hit.hp--;
              setEffects(p => [...p, { id: Date.now(), x: hit.x, y: hit.y, type: 'hit' }]);
              if (hit.hp <= 0) {
                setScore(s => s + 100 * director.difficulty);
                setEffects(p => [...p, { id: Date.now() + 1, x: hit.x, y: hit.y, type: 'explosion' }]);
                return curr.filter(e => e.id !== hit.id);
              }
            }
            return curr;
          });
        });
        return updated;
      });

      setEnemies(prev => prev.map(e => {
        const dx = playerX - e.x, dy = playerY - e.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 30) { setHealth(h => Math.max(0, h - 5)); setEffects(p => [...p, { id: Date.now(), x: playerX, y: playerY, type: 'damage' }]); }
        return { ...e, x: e.x + (dx / dist) * 1.5 * director.difficulty, y: Math.max(30, Math.min(GAME_H - 100, e.y + Math.sin(Date.now() / 500 + e.id) * 2)) };
      }));

      setEffects(prev => prev.filter(e => Date.now() - e.id < 500));
      
    }, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [isPlaying, isPaused, playerX, playerY, playerVelocityY, director]);

  useEffect(() => {
    if (health <= 0) {
      setLives(l => l - 1);
      setHealth(100);
      if (lives <= 1) setIsPlaying(false);
    }
  }, [health, lives]);

  const move = (dir) => {
    if (!isPlaying || isPaused) return;
    setActiveDpad(dir);
    const spd = isBoosting ? BOOST_SPEED : SPEED;
    if (dir === 'up' && isGrounded) { setPlayerVelocityY(-JUMP_FORCE); setIsGrounded(false); }
    if (dir === 'down') setPlayerY(y => Math.min(GAME_H - 80, y + spd));
    if (dir === 'left') setPlayerX(x => Math.max(20, x - spd));
    if (dir === 'right') setPlayerX(x => Math.min(GAME_W - 40, x + spd));
  };

  const action = (btn) => {
    if (!isPlaying || isPaused) return;
    setActiveBtn(btn);
    if (btn === 'A') setBullets(prev => [...prev, { id: bulletIdRef.current++, x: playerX + 12, y: playerY - 10 }]);
    if (btn === 'B' && isGrounded) { setPlayerVelocityY(-JUMP_FORCE); setIsGrounded(false); }
    if (btn === 'C') [-20, 0, 20].forEach((off, i) => setTimeout(() => setBullets(prev => [...prev, { id: bulletIdRef.current++, x: playerX + 12 + off, y: playerY - 10 }]), i * 50));
    if (btn === 'D') { setIsBoosting(true); setTimeout(() => setIsBoosting(false), 2000); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const remainingTime = GAME_DURATION - elapsedTime;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex flex-wrap justify-between items-center p-3 sm:p-4 border-b border-gray-700 gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">AI Game Engine</h2>
            <span className="px-2 py-1 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: accent + '30', color: accent }}>{genre}</span>
          </div>
          <div className="flex items-center gap-2">
            <AIMusicManager genre={genre} isPlaying={isPlaying && !isPaused} />
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700"><X className="w-4 h-4 text-white" /></button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Timer className="w-4 h-4 text-cyan-400" /><span className={`font-mono font-bold ${remainingTime < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{formatTime(remainingTime)}</span></div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /><span className="font-mono font-bold text-yellow-400">{score.toString().padStart(6, '0')}</span></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">{[...Array(lives)].map((_, i) => <Heart key={i} className="w-4 h-4 text-red-500 fill-red-500" />)}</div>
              <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden"><div className="h-full transition-all duration-300 rounded-full" style={{ width: `${health}%`, backgroundColor: health > 50 ? '#22C55E' : health > 25 ? '#EAB308' : '#EF4444' }} /></div>
            </div>
          </div>

          {director.eventMessage && isPlaying && (
            <div className="text-center mb-2"><span className="px-4 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-sm font-bold animate-pulse">{director.eventMessage}</span></div>
          )}

          <div className="relative rounded-xl overflow-hidden border-2 border-gray-700" style={{ height: GAME_H, background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }}>
            {[...Array(30)].map((_, i) => <div key={i} className="absolute rounded-full bg-white animate-pulse" style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`, opacity: Math.random() * 0.5 + 0.3 }} />)}
            
            {enemies.map(e => (
              <div key={e.id} className="absolute transition-all duration-100" style={{ left: e.x, top: e.y }}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/50"><div className="flex gap-1"><div className="w-2 h-2 bg-white rounded-full animate-pulse" /><div className="w-2 h-2 bg-white rounded-full animate-pulse" /></div></div>
                <div className="absolute -top-2 left-0 w-10 h-1 bg-gray-700 rounded-full"><div className="h-full bg-red-400 rounded-full" style={{ width: `${(e.hp / Math.ceil(director.difficulty)) * 100}%` }} /></div>
              </div>
            ))}
            
            {bullets.map(b => <div key={b.id} className="absolute w-2 h-5 rounded-full" style={{ left: b.x, top: b.y, backgroundColor: accent, boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}` }} />)}
            {effects.map(e => <div key={e.id} className={`absolute rounded-full animate-ping ${e.type === 'explosion' ? 'w-12 h-12 bg-orange-500' : e.type === 'damage' ? 'w-8 h-8 bg-red-500' : 'w-6 h-6 bg-yellow-500'}`} style={{ left: e.x - 20, top: e.y - 20, opacity: 0.8 }} />)}
            
            <div className="absolute transition-all duration-75" style={{ left: playerX, top: playerY }}>
              <div className="absolute w-14 h-16 rounded-full opacity-20" style={{ backgroundColor: accent, top: -5, left: -5 }} />
              {isBoosting && <div className="absolute w-16 rounded-full border-2 animate-ping" style={{ borderColor: '#FFD700', top: -8, left: -6, height: 72 }} />}
              <div className="flex flex-col items-center">
                <div className="w-6 h-5 rounded-full mb-0.5" style={{ backgroundColor: accent }} />
                <div className="w-8 h-9 rounded-md flex justify-center pt-1" style={{ backgroundColor: accent }}>
                  <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-white rounded-full" /><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>
                </div>
              </div>
              {isBoosting && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2"><Rocket className="w-4 h-4 text-yellow-400 animate-bounce" /></div>}
            </div>

            {(!isPlaying || isPaused) && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                {elapsedTime >= GAME_DURATION ? (
                  <><h3 className="text-3xl font-bold text-white mb-2">Game Complete!</h3><p className="text-xl text-yellow-400 mb-4">Final Score: {score}</p><button onClick={() => { setElapsedTime(0); setScore(0); setHealth(100); setLives(3); setIsPlaying(true); }} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-white">Play Again</button></>
                ) : lives <= 0 ? (
                  <><h3 className="text-3xl font-bold text-red-500 mb-2">Game Over</h3><p className="text-xl text-white mb-4">Score: {score}</p><button onClick={() => { setElapsedTime(0); setScore(0); setHealth(100); setLives(3); setEnemies([]); setIsPlaying(true); }} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-white">Try Again</button></>
                ) : (
                  <><h3 className="text-2xl font-bold text-white mb-2">{isPaused ? 'Paused' : '5-Minute Challenge'}</h3><p className="text-gray-400 mb-4 text-center px-4 max-w-md">{prompt}</p><button onClick={() => { setIsPlaying(true); setIsPaused(false); }} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-bold text-white text-lg flex items-center gap-2 hover:scale-105 transition-transform"><Play className="w-6 h-6" />{isPaused ? 'Resume' : 'Start Game'}</button></>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4 px-2">
            {controlScheme === 'dpad' && (
              <div className="flex flex-col items-center">
                <button className="w-12 h-12 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: activeDpad === 'up' ? accent : '#1f2937' }} onMouseDown={() => move('up')} onMouseUp={() => setActiveDpad(null)} onTouchStart={() => move('up')} onTouchEnd={() => setActiveDpad(null)}><ChevronUp className="w-6 h-6 text-white" /></button>
                <div className="flex">
                  <button className="w-12 h-12 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: activeDpad === 'left' ? accent : '#1f2937' }} onMouseDown={() => move('left')} onMouseUp={() => setActiveDpad(null)} onTouchStart={() => move('left')} onTouchEnd={() => setActiveDpad(null)}><ChevronLeft className="w-6 h-6 text-white" /></button>
                  <div className="w-12 h-12 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-gray-700" /></div>
                  <button className="w-12 h-12 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: activeDpad === 'right' ? accent : '#1f2937' }} onMouseDown={() => move('right')} onMouseUp={() => setActiveDpad(null)} onTouchStart={() => move('right')} onTouchEnd={() => setActiveDpad(null)}><ChevronRightIcon className="w-6 h-6 text-white" /></button>
                </div>
                <button className="w-12 h-12 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: activeDpad === 'down' ? accent : '#1f2937' }} onMouseDown={() => move('down')} onMouseUp={() => setActiveDpad(null)} onTouchStart={() => move('down')} onTouchEnd={() => setActiveDpad(null)}><ChevronDown className="w-6 h-6 text-white" /></button>
              </div>
            )}
            {controlScheme === 'swipe' && <div className="flex flex-col items-center text-gray-400"><Gamepad2 className="w-12 h-12 mb-2" /><span className="text-sm">Swipe to Move</span></div>}
            
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => isPlaying && setIsPaused(!isPaused)} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700">{isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}</button>
              <VideoCaptureManager isRecording={isRecording} onRecordingChange={setIsRecording} />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {[{ id: 'A', label: 'FIRE', bg: '#EF4444', Icon: Crosshair }, { id: 'B', label: 'JUMP', bg: '#06B6D4', Icon: ChevronUp }, { id: 'C', label: 'SPECIAL', bg: '#EAB308', Icon: Sparkles, dark: true }, { id: 'D', label: 'BOOST', bg: '#22C55E', Icon: Rocket, dark: true }].map(btn => (
                <button key={btn.id} className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all active:scale-90 ${activeBtn === btn.id ? 'scale-90 border-white shadow-lg' : 'border-white/20'}`} style={{ backgroundColor: btn.bg, boxShadow: activeBtn === btn.id ? `0 0 20px ${btn.bg}` : 'none' }} onMouseDown={() => action(btn.id)} onMouseUp={() => setActiveBtn(null)} onTouchStart={() => action(btn.id)} onTouchEnd={() => setActiveBtn(null)}>
                  <btn.Icon className={`w-4 h-4 ${btn.dark ? 'text-gray-900' : 'text-white'}`} />
                  <span className={`text-[10px] font-bold ${btn.dark ? 'text-gray-900' : 'text-white'}`}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-medium text-gray-300">Game Details</h3><span className="text-xs text-gray-500">Phase {director.phase}/6 - Difficulty x{director.difficulty.toFixed(1)}</span></div>
            <p className="text-sm text-gray-400">{prompt}</p>
          </div>
          <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium text-white flex items-center justify-center gap-2 hover:opacity-90"><Code className="w-4 h-4" />Export Game Code</button>
        </div>
      </div>
    </div>
  );
};

// Video Card
const VideoCard = ({ videoUrl, title, description, Icon, gradientFrom, gradientTo, isSelected }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); setIsPlaying(false); }
    else { video.currentTime = 0; video.play(); setIsPlaying(true); }
  };

  return (
    <div className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 group ${isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-purple-500' : 'opacity-70 hover:opacity-100'}`}>
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl blur-lg ${isSelected ? 'opacity-40' : 'opacity-0'} group-hover:opacity-30 transition-opacity`} />
      <div className="relative bg-gray-900/90 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="aspect-video relative overflow-hidden" onClick={handlePlayClick}>
          <video ref={videoRef} src={videoUrl} className="w-full h-full object-cover" muted playsInline onEnded={() => setIsPlaying(false)} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}>
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function PlanetQGames() {
  const [selectedGenre, setSelectedGenre] = useState('action');
  const [prompt, setPrompt] = useState('');
  const [characterDesc, setCharacterDesc] = useState('');
  const [controlScheme, setControlScheme] = useState('dpad');
  const [platform, setPlatform] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const generate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => { setShowGame(true); setIsGenerating(false); }, 2000);
  };

  const examples = GENRE_PROMPTS[selectedGenre] || [];

  const videos = [
    { videoUrl: 'https://customer-assets.emergentagent.com/job_voice-chat-link/artifacts/daashrra_652f88f5-1a93-49c6-b083-0f9bbba1b979.mp4', title: '3D Open World', description: 'Explore vast landscapes and endless possibilities', Icon: Globe, gradientFrom: 'from-emerald-500', gradientTo: 'to-cyan-500', isSelected: true },
    { videoUrl: 'https://customer-assets.emergentagent.com/job_voice-chat-link/artifacts/9oqn4ok2_generated-video-7fe81dd4-1790-48e2-876a-3fc643c25469.mp4', title: 'Shooter Game', description: 'Fast-paced action and intense combat', Icon: Crosshair, gradientFrom: 'from-red-500', gradientTo: 'to-orange-500', isSelected: false },
    { videoUrl: 'https://customer-assets.emergentagent.com/job_voice-chat-link/artifacts/3362kdch_generated-video-13e65f16-8497-4a44-8177-d5aed415acf1.mp4', title: 'Racing Game', description: 'High-speed thrills and competitive racing', Icon: Car, gradientFrom: 'from-blue-500', gradientTo: 'to-purple-500', isSelected: false },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-4 overflow-hidden bg-[#050816]" style={{ fontFamily: 'Oxanium, sans-serif' }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'center top' }} />
        </div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Gamepad2 className="w-10 h-10 sm:w-14 sm:h-14 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff00ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 40px rgba(168, 85, 247, 0.5)' }}>
              AI Video Game Generator
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">Transform your imagination into playable 5-minute games with AI</p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {GENRES.slice(0, 4).map((genre) => {
              const Icon = genre.icon;
              const isSelected = selectedGenre === genre.id;
              return (
                <button key={genre.id} onClick={() => setSelectedGenre(genre.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${isSelected ? `bg-gradient-to-r ${genre.color} border-transparent shadow-lg shadow-purple-500/25` : 'bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50'}`}>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{genre.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">What You Can Create</span>
            </h2>
            <p className="text-gray-400 text-sm">AI-generated game previews - Powered by next-gen technology</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {videos.map((video, index) => <VideoCard key={index} {...video} />)}
          </div>
        </div>

        {/* Prompt Box */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40" />
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
                <div className="hidden sm:flex items-center gap-2 text-gray-400"><Cpu className="w-4 h-4" /><span className="text-sm">AI Game Engine v2.0</span></div>
              </div>
              <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /><span className="text-sm text-purple-400">Powered by Planet Q AI</span></div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Select Game Genre</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => {
                    const Icon = g.icon;
                    const sel = selectedGenre === g.id;
                    return <button key={g.id} onClick={() => setSelectedGenre(g.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${sel ? `bg-gradient-to-r ${g.color} border-transparent shadow-lg` : 'bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50'}`}><Icon className={`w-4 h-4 ${sel ? 'text-white' : 'text-gray-400'}`} /><span className={`text-sm font-medium ${sel ? 'text-white' : 'text-gray-400'}`}>{g.name}</span></button>;
                  })}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Describe Your Game</label>
                <div className="relative">
                  <Wand2 className="absolute left-4 top-4 w-5 h-5 text-purple-400" />
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your dream game... What makes it unique?" className="w-full h-32 sm:h-40 bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50" maxLength={500} />
                  <span className="absolute right-4 bottom-4 text-xs text-gray-500">{prompt.length} / 500</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex, i) => <button key={i} onClick={() => setPrompt(ex)} className="text-xs px-3 py-1.5 bg-gray-800/50 hover:bg-purple-500/20 border border-gray-700/50 rounded-full text-gray-400 hover:text-purple-300 truncate max-w-[200px]">{ex.substring(0, 35)}...</button>)}
                  </div>
                </div>
              </div>

              {/* Character */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Character Description (Optional)</label>
                <input type="text" value={characterDesc} onChange={(e) => setCharacterDesc(e.target.value)} placeholder="Describe your main character..." className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50" maxLength={200} />
              </div>

              {/* Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Control Scheme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setControlScheme('dpad')} className={`p-4 rounded-xl border-2 transition-all ${controlScheme === 'dpad' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
                    <div className="flex items-center justify-center gap-3 mb-2"><div className="grid grid-cols-2 gap-1"><div className="w-4 h-4 rounded-full bg-red-500" /><div className="w-4 h-4 rounded-full bg-cyan-500" /><div className="w-4 h-4 rounded-full bg-yellow-500" /><div className="w-4 h-4 rounded-full bg-green-500" /></div></div>
                    <p className={`text-sm font-medium ${controlScheme === 'dpad' ? 'text-purple-400' : 'text-gray-400'}`}>D-Pad + ABCD</p>
                  </button>
                  <button onClick={() => setControlScheme('swipe')} className={`p-4 rounded-xl border-2 transition-all ${controlScheme === 'swipe' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <p className={`text-sm font-medium ${controlScheme === 'swipe' ? 'text-purple-400' : 'text-gray-400'}`}>Swipe Controls</p>
                  </button>
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Export Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'javascript', Icon: Globe, name: 'JavaScript' }, { id: 'unity', Icon: Gamepad2, name: 'Unity' }, { id: 'unreal', Icon: Zap, name: 'Unreal' }].map(p => (
                    <button key={p.id} onClick={() => setPlatform(p.id)} className={`p-3 rounded-xl border-2 transition-all ${platform === p.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
                      <p.Icon className={`w-6 h-6 mx-auto mb-1 ${platform === p.id ? 'text-purple-400' : 'text-gray-400'}`} />
                      <p className={`text-xs font-medium ${platform === p.id ? 'text-purple-400' : 'text-gray-400'}`}>{p.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><Timer className="w-4 h-4 text-cyan-400" /><span>5-Min Gameplay</span></div>
                  <div className="hidden sm:flex items-center gap-2"><Video className="w-4 h-4 text-red-400" /><span>Video Capture</span></div>
                </div>
                <button onClick={generate} disabled={isGenerating || !prompt.trim()} className={`group flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all ${isGenerating || !prompt.trim() ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:shadow-lg hover:scale-105'}`}>
                  <span className="text-white flex items-center gap-3">
                    {isGenerating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</> : <><Sparkles className="w-5 h-5" />Generate Game<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ Icon: Cpu, title: 'AI Director', desc: 'Dynamic difficulty & wave management', color: 'cyan' }, { Icon: Timer, title: '5-Min Gameplay', desc: 'Complete game sessions with progression', color: 'yellow' }, { Icon: Video, title: 'Video Capture', desc: 'Record and export your gameplay', color: 'red' }].map((f, i) => (
            <div key={i} className="group bg-gray-900/50 p-5 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-all">
              <div className={`w-12 h-12 rounded-lg bg-${f.color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><f.Icon className={`w-6 h-6 text-${f.color}-400`} /></div>
              <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-gray-600 text-sm">© 2025 Planet Q Games - AI Video Game Generator</p>
      </div>

      {showGame && <FullGameEngine genre={selectedGenre} prompt={prompt || `A ${selectedGenre} game adventure`} controlScheme={controlScheme} onClose={() => setShowGame(false)} />}
    </div>
  );
}
