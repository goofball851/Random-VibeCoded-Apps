
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Music, 
  Upload, Volume2, VolumeX, Shuffle, Repeat,
  Sparkles, Palette, Settings, Smile
} from 'lucide-react';
import { Track, PlayerState, MascotMood } from './types';
import Visualizer from './components/Visualizer';
import Playlist from './components/Playlist';
import BlobCharacter from './components/characters/BlobCharacter';
import RiveCharacter from './components/characters/RiveCharacter';

const App: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>({
    isPlaying: false,
    currentTrackIndex: -1,
    playlist: [],
    volume: 0.7,
    currentTime: 0,
    duration: 0,
  });
  
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>(MascotMood.IDLE);
  const [characterType, setCharacterType] = useState<'blob' | 'rive'>('blob');
  const [riveFileUrl, setRiveFileUrl] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [idleTime, setIdleTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const setupAudioContext = useCallback(() => {
    if (!audioCtxRef.current && audioRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      // Check for .riv files
      const riveFile = fileArray.find(f => f.name.toLowerCase().endsWith('.riv'));
      if (riveFile) {
        if (riveFileUrl) URL.revokeObjectURL(riveFileUrl);
        const url = URL.createObjectURL(riveFile);
        setRiveFileUrl(url);
        setCharacterType('rive');
      }

      const newTracks: Track[] = fileArray
        .filter(file => file.type.startsWith('audio/'))
        .map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Cartoon Mix",
          file: file,
          blobUrl: URL.createObjectURL(file)
        }));

      if (newTracks.length > 0) {
        setPlayer(prev => {
          const updatedPlaylist = [...prev.playlist, ...newTracks];
          const isFirstTrack = prev.currentTrackIndex === -1;
          return {
            ...prev,
            playlist: updatedPlaylist,
            currentTrackIndex: isFirstTrack ? 0 : prev.currentTrackIndex,
            isPlaying: isFirstTrack ? true : prev.isPlaying
          };
        });
      }
    }
  };

  const togglePlay = () => {
    if (player.playlist.length === 0) return;
    setupAudioContext();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (player.isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlayer(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    setIdleTime(0);
  };

  const nextTrack = () => {
    if (player.playlist.length === 0) return;
    const nextIdx = (player.currentTrackIndex + 1) % player.playlist.length;
    setPlayer(prev => ({ ...prev, currentTrackIndex: nextIdx, isPlaying: true }));
    setIdleTime(0);
  };

  const prevTrack = () => {
    if (player.playlist.length === 0) return;
    const prevIdx = (player.currentTrackIndex - 1 + player.playlist.length) % player.playlist.length;
    setPlayer(prev => ({ ...prev, currentTrackIndex: prevIdx, isPlaying: true }));
    setIdleTime(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPlayer(prev => ({ ...prev, volume: val }));
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : val;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setPlayer(prev => {
        const updatedPlaylist = [...prev.playlist];
        if (prev.currentTrackIndex !== -1) {
          updatedPlaylist[prev.currentTrackIndex].duration = duration;
        }
        return { ...prev, duration, playlist: updatedPlaylist };
      });
    }
  };

  const handleReorderPlaylist = (startIndex: number, endIndex: number) => {
    setPlayer(prev => {
      const newPlaylist = [...prev.playlist];
      const [removed] = newPlaylist.splice(startIndex, 1);
      newPlaylist.splice(endIndex, 0, removed);
      let newIdx = prev.currentTrackIndex;
      if (prev.currentTrackIndex !== -1) {
        const currentTrackId = prev.playlist[prev.currentTrackIndex].id;
        newIdx = newPlaylist.findIndex(t => t.id === currentTrackId);
      }
      return { ...prev, playlist: newPlaylist, currentTrackIndex: newIdx };
    });
  };

  const handleDeleteTrack = (id: string) => {
    setPlayer(prev => {
      const trackToDeleteIdx = prev.playlist.findIndex(t => id === t.id);
      const newPlaylist = prev.playlist.filter(t => t.id !== id);
      let nextIdx = prev.currentTrackIndex;
      if (trackToDeleteIdx === prev.currentTrackIndex) {
        if (newPlaylist.length === 0) nextIdx = -1;
        else nextIdx = nextIdx % newPlaylist.length;
      } else if (trackToDeleteIdx < prev.currentTrackIndex) {
        nextIdx--;
      }
      return { 
        ...prev, 
        playlist: newPlaylist, 
        currentTrackIndex: nextIdx,
        isPlaying: newPlaylist.length > 0 && prev.isPlaying && trackToDeleteIdx !== prev.currentTrackIndex
      };
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
    setIdleTime(0);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : player.volume;
    }
  }, [player.volume, isMuted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdleTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (player.isPlaying) {
      setMascotMood(MascotMood.DANCING);
    } else if (idleTime > 15) {
      setMascotMood(MascotMood.SLEEPING);
    } else {
      setMascotMood(MascotMood.IDLE);
    }
  }, [player.isPlaying, idleTime]);

  const currentTrack = player.currentTrackIndex !== -1 ? player.playlist[player.currentTrackIndex] : null;

  return (
    <div 
      className="flex h-screen w-screen bg-[#2D1B4D] text-white overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); handleFiles(e.dataTransfer.files); }}
    >
      <aside className="w-[30%] min-w-[360px] bg-[#402E7A] border-r-8 border-[#00000033] flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-20 relative">
        <div className="p-5 space-y-4 flex flex-col h-full overflow-hidden">
          
          <div className="flex items-center space-x-3 bg-[#FFD93D] p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] rotate-[-1deg] shrink-0">
            <div className="w-8 h-8 bg-[#FF6B6B] rounded-full flex items-center justify-center border-2 border-black">
               <Sparkles size={18} fill="white" className="text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tighter text-black uppercase">Jam Box</h2>
          </div>

          <div className="bg-[#6C4AB6] p-4 rounded-[2rem] border-4 border-black shadow-[6px_6px_0px_#000] space-y-3 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-[#8D72E1] px-3 py-2 rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000]">
                 <h1 className="text-sm font-black truncate text-white uppercase">{currentTrack?.name || "Ready!"}</h1>
                 <p className="text-[9px] font-bold text-[#FFD93D] uppercase tracking-widest truncate">{currentTrack?.artist || "FEED ME AUDIO"}</p>
              </div>
              <button 
                onClick={togglePlay}
                className="cartoon-btn w-12 h-12 bg-[#FFD93D] rounded-full border-2 border-black flex items-center justify-center shrink-0 hover:scale-110 active:scale-90"
              >
                {player.isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} className="ml-0.5 text-black" fill="black" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <button onClick={prevTrack} className="cartoon-btn p-1.5 bg-[#FF6B6B] rounded-lg border-2 border-black shadow-md hover:scale-110">
                    <SkipBack size={16} fill="black" className="text-black" />
                 </button>
                 <button onClick={nextTrack} className="cartoon-btn p-1.5 bg-[#FF6B6B] rounded-lg border-2 border-black shadow-md hover:scale-110">
                    <SkipForward size={16} fill="black" className="text-black" />
                 </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex bg-black/30 p-1 rounded-xl border-2 border-black">
                   <button 
                    onClick={() => setCharacterType('blob')}
                    className={`p-1.5 rounded-lg transition-all ${characterType === 'blob' ? 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_#000]' : 'text-white/40 hover:text-white/70'}`}
                    title="Jelly Mascot"
                   >
                     <Smile size={16} />
                   </button>
                   <button 
                    onClick={() => setCharacterType('rive')}
                    className={`p-1.5 rounded-lg transition-all ${characterType === 'rive' ? 'bg-[#4D96FF] text-black shadow-[2px_2px_0px_#000]' : 'text-white/40 hover:text-white/70'}`}
                    title="Rive Custom Loader"
                   >
                     <Settings size={16} className={characterType === 'rive' ? 'animate-spin-slow' : ''} />
                   </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-3 group/seek">
                <Music size={14} className="text-white/50 group-hover/seek:text-[#4D96FF] transition-colors" />
                <input 
                  type="range" min="0" max={player.duration || 0} step="0.1" value={player.currentTime}
                  onChange={handleSeek} className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-3 group/volume">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`transition-all transform ${isMuted ? 'scale-110 text-[#FF6B6B]' : 'text-white/50 group-hover/volume:text-[#FFD93D] group-hover/volume:scale-125'}`}
                >
                   {isMuted || player.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : player.volume}
                  onChange={handleVolumeChange} className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
             <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD93D]">The Mix Tape</h3>
                <label className="cursor-pointer text-[9px] font-black bg-[#FF6B6B] text-white px-2.5 py-1 rounded-full border-2 border-black hover:bg-[#ff8e8e] transition-colors">
                  + ADD
                  <input type="file" multiple accept="audio/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </label>
             </div>
             <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar bg-black/10 rounded-2xl p-2 border-4 border-black/5">
                <Playlist 
                  playlist={player.playlist} 
                  currentIndex={player.currentTrackIndex}
                  currentTime={player.currentTime}
                  onSelect={(idx) => setPlayer(prev => ({ ...prev, currentTrackIndex: idx, isPlaying: true }))}
                  onDelete={handleDeleteTrack}
                  onReorder={handleReorderPlaylist}
                />
             </div>
          </div>
        </div>
      </aside>

      <main 
        ref={stageRef}
        onMouseMove={handleMouseMove}
        className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[#2D1B4D] overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Visualizer analyser={analyserRef.current} isPlaying={player.isPlaying} />
        </div>

        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="particle text-[#FFD93D]/20 select-none"
            style={{ 
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 20}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          >
            {i % 2 === 0 ? '★' : '♫'}
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center justify-center cursor-pointer group" onClick={togglePlay}>
           <div className={`absolute -inset-32 bg-cyan-400/20 rounded-full blur-[120px] transition-all duration-700 ${player.isPlaying ? 'scale-125 opacity-40' : 'scale-100 opacity-20'}`} />
           <div className="transform group-hover:scale-105 active:scale-95 transition-all duration-300">
             {characterType === 'blob' ? (
                <BlobCharacter mood={mascotMood} isPlaying={player.isPlaying} analyser={analyserRef.current} mousePos={mousePos} />
             ) : (
                <RiveCharacter mood={mascotMood} isPlaying={player.isPlaying} analyser={analyserRef.current} mousePos={mousePos} riveFileUrl={riveFileUrl} />
             )}
           </div>
           <div className="mt-12 bg-white text-black font-black px-8 py-3 rounded-full border-4 border-black shadow-[6px_6px_0px_#000] rotate-[3deg] group-hover:rotate-0 transition-all opacity-0 group-hover:opacity-100 pointer-events-none text-center">
              {characterType === 'rive' && !riveFileUrl ? "DROP A .RIV FILE!" : mascotMood === MascotMood.SLEEPING ? "CLICK TO WAKE UP!" : player.isPlaying ? "BOOP ME!" : "PLAY ME!"}
           </div>
        </div>

        {isDraggingFile && (
          <div className="absolute inset-12 z-50 bg-[#FFD93D] rounded-[5rem] flex flex-col items-center justify-center border-8 border-dashed border-black animate-in fade-in zoom-in duration-300 shadow-2xl">
             <div className="w-40 h-40 bg-[#FF6B6B] rounded-full flex items-center justify-center mb-6 border-4 border-black shadow-[8px_8px_0px_#000]">
                <Upload size={64} className="text-white animate-bounce" />
             </div>
             <h2 className="text-6xl font-black text-black tracking-tighter uppercase">Drop Files!</h2>
             <p className="text-black/60 font-black mt-2">Audio or .riv animations</p>
          </div>
        )}
      </main>

      <audio 
        ref={audioRef}
        src={currentTrack?.blobUrl}
        onTimeUpdate={() => setPlayer(prev => ({ ...prev, currentTime: audioRef.current?.currentTime || 0 }))}
        onLoadedMetadata={handleMetadataLoaded}
        onEnded={nextTrack}
        autoPlay={player.isPlaying}
      />
    </div>
  );
};

export default App;
