import React from 'react';
import { Header } from './components/Header';
import { Player } from './components/Player';
import { AudioVisualizer } from './components/AudioVisualizer';
import { useRadio } from './hooks/useRadio';
import { Pause, Volume2, VolumeX, Play, Volume1 } from 'lucide-react';

export default function App() {
  const { playing, muted, volume, song, artist, listeners, cover, history, togglePlay, toggleMute, handleVolumeChange, audioRef } = useRadio();
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="min-h-screen bg-[#000511] flex flex-col font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white pb-32">
      {/* Background with Zoom Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
         <div 
           className="absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center animate-zoom-in-out opacity-90"
           style={{ backgroundImage: `url(${cover})`, transition: 'background-image 1.5s ease-in-out' }}
         ></div>
         <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <Header />

      {/* Hero Player Section */}
      <main className="flex-1 flex flex-col relative z-10 w-full items-center justify-center">
         <Player 
             playing={playing}
             muted={muted}
             volume={volume}
             song={song}
             artist={artist}
             listeners={listeners}
             cover={cover}
             history={history}
             togglePlay={togglePlay}
             toggleMute={toggleMute}
             handleVolumeChange={handleVolumeChange}
             audioRef={audioRef}
         />
         <audio ref={audioRef} src="https://laradiossl.online:12000/live" crossOrigin="anonymous" />
      </main>

      {/* Fixed Mini Player for consistency during scrolling - with Nebulous visualizer */}
      {playing && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-8 md:right-8 md:translate-x-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-full lg:max-w-4xl bg-[#11131a]/90 backdrop-blur-3xl border-t md:border border-white/10 md:rounded-[24px] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 p-3 sm:px-6 flex items-center gap-3 sm:gap-6 animate-slide-up h-[80px] sm:h-[90px] overflow-hidden">
            {/* Background Nebulous Visualizer for Mini Player */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none z-0 overflow-hidden">
               <AudioVisualizer audioElement={audioRef.current} playing={true} colorPrimary="rgba(200, 220, 255, 0.4)" />
            </div>

            <img src={cover} alt="Cover" className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[14px] bg-black/20 object-cover shadow-[0_0_15px_rgba(0,0,0,0.5)] relative z-10 border border-white/10" />
            <div className="flex-1 min-w-0 relative z-10 drop-shadow-md">
                <div className="text-sm sm:text-base md:text-lg font-black text-white truncate">{song}</div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-white/70 truncate">{artist}</div>
            </div>
            
            {/* Player Controls Mini */}
            <div className="flex items-center gap-2 sm:gap-4 relative z-10 sm:pl-4 pl-2 border-l border-white/10 rounded-l-3xl h-full">
                <button onClick={toggleMute} className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors">
                     <VolumeIcon size={20} />
                </button>
                <div className="hidden sm:flex w-24">
                   <input 
                       type="range" 
                       min="0" max="1" step="0.01" 
                       value={muted ? 0 : volume} 
                       onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                       className="w-full accent-blue-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                   />
                </div>
                <button onClick={togglePlay} className="w-12 h-12 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 sm:ml-2">
                    <Pause size={18} fill="currentColor" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
