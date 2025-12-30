
import React, { useState } from 'react';
import { Trash2, Play, GripVertical, Music } from 'lucide-react';
import { Track } from '../types';

interface PlaylistProps {
  playlist: Track[];
  currentIndex: number;
  currentTime: number;
  onSelect: (index: number) => void;
  onDelete: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ playlist, currentIndex, currentTime, onSelect, onDelete, onReorder }) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== index) {
      onReorder(draggedIdx, index);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  if (playlist.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-white/10 rounded-3xl p-6 opacity-30 text-white italic">
        <Music size={24} className="mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest text-center">Tapes Required</span>
      </div>
    );
  }

  const colors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#FF9A76'];

  return (
    <div className="space-y-2">
      {playlist.map((track, idx) => {
        const isActive = idx === currentIndex;
        const progress = isActive && track.duration ? (currentTime / track.duration) * 100 : 0;
        
        return (
          <div 
            key={track.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
            style={{ backgroundColor: isActive ? '#FFFFFF' : colors[idx % colors.length] }}
            className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-move border-2 border-black shadow-[3px_3px_0px_#000]
              ${isActive ? 'scale-[1.02] z-10' : 'hover:-translate-y-0.5'}
              ${draggedIdx === idx ? 'opacity-20' : 'opacity-100'}
              ${dragOverIdx === idx && draggedIdx !== idx ? 'translate-y-1' : ''}
            `}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
              <GripVertical size={14} className="text-black/30 group-hover:text-black/60 shrink-0" />
              
              <div className="flex flex-col cursor-pointer overflow-hidden flex-1" onClick={() => onSelect(idx)}>
                <div className="flex items-center space-x-2 overflow-hidden mb-1">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-black transition-colors ${isActive ? 'bg-[#FF6B6B] text-white' : 'bg-black/10 text-black'}`}>
                    {isActive ? <Play size={12} fill="white" /> : <Music size={12} />}
                  </div>
                  <p className={`text-xs font-black truncate leading-tight ${isActive ? 'text-[#FF6B6B]' : 'text-black'}`}>
                    {track.name}
                  </p>
                </div>
                
                {/* TRACK PROGRESS BAR (relative to currently playing track duration) */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden border border-black/20">
                    <div 
                      className={`h-full transition-all duration-300 ${isActive ? 'bg-[#4D96FF]' : 'bg-transparent'}`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <span className="text-[8px] font-black text-black/50 tabular-nums">
                    {formatDuration(isActive ? currentTime : track.duration)}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(track.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-black/40 hover:text-[#FF6B6B] transition-all rounded-lg shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Playlist;
