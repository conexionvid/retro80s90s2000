import { useState, useEffect, useRef } from 'react';

export interface TrackHistory {
  song: string;
  artist: string;
  cover: string;
}

export function useRadio() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [song, setSong] = useState('Cargando canción...');
  const [artist, setArtist] = useState('Esperando metadata...');
  const [listeners, setListeners] = useState(0);
  const [cover, setCover] = useState('https://images.unsplash.com/photo-1614680376593-902f74a144e5?auto=format&fit=crop&q=80&w=600');
  const [history, setHistory] = useState<TrackHistory[]>([]);
  
  const lastSongRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<TrackHistory | null>(null);

  useEffect(() => {
    (window as any).handleMetadata = async (data: any) => {
      try {
        const songTitle = data.songtitle || 'RADIO ONLINE';
        setListeners(data.currentlisteners || 0);

        if (songTitle === lastSongRef.current) return;
        lastSongRef.current = songTitle;

        let currentArtist = 'EN VIVO';
        let currentSongStr = songTitle;

        if (songTitle.includes('-')) {
            const split = songTitle.split('-');
            currentArtist = split[0].trim();
            currentSongStr = split.slice(1).join('-').trim();
        }

        let newCover = 'https://images.unsplash.com/photo-1614680376593-902f74a144e5?auto=format&fit=crop&q=80&w=600';

        try {
          const cleanString = (str: string) => str.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();
          
          const searchTerms = [
            `${currentArtist} ${currentSongStr}`,
            `${cleanString(currentArtist)} ${cleanString(currentSongStr)}`,
            cleanString(currentSongStr),
            cleanString(currentArtist)
          ];

          for (const term of searchTerms) {
            if (!term.trim()) continue;
            const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`);
            const itunesData = await res.json();
            if (itunesData.results && itunesData.results.length > 0) {
              const coverUrl = itunesData.results[0].artworkUrl100 || itunesData.results[0].artworkUrl60 || '';
              if (coverUrl) {
                  newCover = coverUrl.replace(/100x100|60x60/, '600x600');
                  break;
              }
            }
          }
        } catch (err) {
            console.error('Failed to fetch cover from iTunes:', err);
        }

        // Add to history if a track was already playing
        if (currentTrackRef.current && currentTrackRef.current.song !== 'Cargando canción...') {
            const oldTrack = currentTrackRef.current;
            setHistory(prev => {
                const newHistory = [oldTrack, ...prev];
                return newHistory.slice(0, 5); // Keep last 5
            });
        }

        currentTrackRef.current = { song: currentSongStr, artist: currentArtist, cover: newCover };

        setSong(currentSongStr);
        setArtist(currentArtist);
        setCover(newCover);

      } catch (e) {
          console.error(e);
      }
    };

    const fetchMetadata = () => {
      const scriptId = 'jsonpScript';
      const oldScript = document.getElementById(scriptId);
      if (oldScript) oldScript.remove();
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://laradiossl.online:12000/stats?sid=1&json=1&callback=handleMetadata';
      document.body.appendChild(script);
    };

    const interval = setInterval(fetchMetadata, 10000);
    fetchMetadata();

    return () => clearInterval(interval);
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (e) {
      console.error('Playback failed:', e);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !muted;
    audioRef.current.muted = newMuted;
    setMuted(newMuted);
    if (!newMuted && volume === 0) {
        handleVolumeChange(1);
    }
  };

  return { playing, muted, volume, song, artist, listeners, cover, history, togglePlay, toggleMute, handleVolumeChange, audioRef };
}
