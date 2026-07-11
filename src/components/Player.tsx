import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Users, Volume1, Clock } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { SocialButtons } from './SocialButtons';
import { TrackHistory } from '../hooks/useRadio';

interface PlayerProps {
  playing: boolean;
  muted: boolean;
  volume: number;
  song: string;
  artist: string;
  listeners: number;
  cover: string;
  history: TrackHistory[];
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (vol: number) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

export function Player({ playing, muted, volume, song, artist, listeners, cover, history, togglePlay, toggleMute, handleVolumeChange, audioRef }: PlayerProps) {
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col xl:flex-row w-full max-w-[1400px] mx-auto items-center xl:items-start justify-center xl:justify-between gap-8 p-6 relative z-10 pt-16 lg:pt-24 min-h-[60vh]">
      
      {/* Sidebar (Top on mobile, Left on PC) - Logo & History */}
      <div className="flex flex-col select-none w-full xl:w-[350px] flex-shrink-0 animate-slide-up self-center xl:self-start">
        <div className="flex flex-col items-center mb-8 w-48 md:w-64 xl:w-full mx-auto">
          {!imgError ? (
            <img 
              src={`${import.meta.env.BASE_URL}assets/logo.png`} 
              alt="Conexion Vid Radio" 
              className="w-full h-auto drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center select-none w-full text-center">
              <div className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">
                Conexion
              </div>
              <div className="text-8xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] -mt-4">
                Vid
              </div>
              <div className="text-4xl font-bold tracking-widest text-white border-y-2 border-white/50 py-2 mt-2 w-full">
                radio
              </div>
              <div className="text-xl font-medium text-pink-300 transform -rotate-2 mt-3 font-serif italic mb-8">
                La que manda
              </div>
            </div>
          )}
        </div>

        {/* Play History */}
        {history.length > 0 && (
          <div className="bg-[#11131a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} /> Reproducidas Recientemente
            </h3>
            <div className="flex flex-col gap-3">
              {history.map((track, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                  <img src={track.cover} alt="Cover" className="w-[45px] h-[45px] rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow border border-white/10 opacity-80 group-hover:opacity-100" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white/90 truncate group-hover:text-white transition-colors">{track.song}</div>
                    <div className="text-xs font-medium text-white/60 truncate">{track.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Player Box - Wider */}
      <div className="relative overflow-hidden bg-[#242730]/65 backdrop-blur-3xl border border-white/10 rounded-[40px] flex-1 max-w-[1000px] flex flex-col md:flex-row shadow-[0_40px_80px_-10px_rgba(0,0,0,0.9)] animate-slide-up mx-auto min-h-[420px]">
        
        {/* Background Visualizer Nebulous fog */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-40 mix-blend-screen pointer-events-none z-0">
             <AudioVisualizer audioElement={audioRef.current} playing={playing} colorPrimary="rgba(250, 250, 200, " />
        </div>

        {/* Cover Art Section */ }
        <div className="p-8 md:p-12 md:w-[480px] flex-shrink-0 flex flex-col items-center justify-center relative z-10 w-full mb-4 md:mb-0">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[24px] overflow-hidden border-4 border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative bg-black/20">
               <img src={cover} alt="Cover" className="w-full h-full object-cover" />
               <div className="absolute inset-0 rounded-[24px] shadow-inner pointer-events-none border border-white/5"></div>
            </div>
        </div>

        {/* Info & Controls Section */}
        <div className="flex-1 p-8 md:p-12 pl-0 md:pl-2 flex flex-col justify-center relative z-10 text-center md:text-left">
            <div className="mb-10">
               <div className="inline-flex items-center justify-center gap-2 bg-red-500 text-white text-[11px] font-extrabold px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <span className={`w-2.5 h-2.5 bg-white rounded-full ${playing ? 'animate-pulse shadow-[0_0_8px_rgba(255,255,255,1)]' : ''}`}></span>
                  EN VIVO
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-2xl line-clamp-2 md:leading-snug">{song}</h1>
               <h2 className="text-2xl font-bold text-white/70 drop-shadow-md mb-8">{artist}</h2>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="bg-white/10 px-5 py-3 rounded-full flex items-center gap-2 text-white/80 text-sm font-bold border border-white/10 backdrop-blur-md shadow-inner">
                      <Users size={18} className="text-blue-300" /> Oyentes: {listeners}
                  </div>
                  <button onClick={togglePlay} className="bg-white text-black px-8 py-3.5 rounded-full flex items-center gap-3 font-extrabold hover:bg-gray-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95">
                     {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="translate-x-[2px]" />}
                     {playing ? 'PAUSAR' : 'ESCUCHAR'}
                  </button>
                  <div className="flex items-center gap-2 bg-blue-600/30 backdrop-blur-lg border border-blue-400/30 rounded-full pr-4 p-1 transition-colors hover:bg-blue-600/50 shadow-lg">
                      <button onClick={toggleMute} className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
                         <VolumeIcon size={20} />
                      </button>
                      <input 
                         type="range" 
                         min="0" max="1" step="0.01" 
                         value={muted ? 0 : volume} 
                         onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                         className="w-20 md:w-24 accent-blue-300 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                      />
                  </div>
               </div>
            </div>

            {/* Socials container bottom right */}
            <div className="absolute bottom-8 right-8 z-20 md:flex hidden">
               <SocialButtons />
            </div>
            {/* Socials container bottom center for mobile */}
            <div className="flex md:hidden justify-center mt-4 z-20">
               <SocialButtons />
            </div>
        </div>
      </div>
    </div>
  );
}
