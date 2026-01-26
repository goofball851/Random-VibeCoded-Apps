import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { Trash2, Save, ImageOff, Play } from 'lucide-react';

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isSelected, onSelect, onDelete }) => {
  const searchThumbnail = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(game.metadata.coverQuery)}&w=300&h=400&c=7&rs=1`;
  
  const [imgSrc, setImgSrc] = useState<string>(game.metadata.coverUrl || searchThumbnail);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(game.metadata.coverUrl || searchThumbnail);
    setHasError(false);
  }, [game.metadata.coverUrl, searchThumbnail]);

  const handleImageError = () => {
    if (imgSrc === game.metadata.coverUrl && game.metadata.coverUrl !== searchThumbnail) {
        setImgSrc(searchThumbnail);
    } else if (!hasError) {
        setHasError(true);
    }
  };

  return (
    <div 
        onClick={onSelect}
        className={`
            group relative flex flex-col bg-arcade-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1
            ${isSelected 
                ? 'ring-4 ring-arcade-accent scale-[1.02] shadow-glow z-10' 
                : 'border border-arcade-element/50 hover:border-arcade-accent shadow-sm hover:shadow-xl'
            }
        `}
    >
      
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-arcade-surface overflow-hidden">
        {hasError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-arcade-muted">
                <ImageOff size={32} className="mb-2 opacity-50" />
            </div>
        ) : (
            <img 
                src={imgSrc} 
                alt={game.metadata.title}
                onError={handleImageError}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            />
        )}
        
        {/* System Badge (Top Right) */}
        <div className="absolute top-2 right-2">
             <span className="px-2 py-1 text-[9px] font-black bg-black/70 text-white rounded-md uppercase backdrop-blur-sm border border-white/10">
                {SYSTEM_LABELS[game.system].split(' ')[0]}
            </span>
        </div>

         {/* Save State Indicator (Top Left) */}
         {game.hasSaveState && (
            <div className="absolute top-2 left-2 text-blue-400 drop-shadow-md">
                <Save size={16} fill="currentColor" />
            </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col justify-between flex-1">
          <div>
            <h3 className={`font-bold text-sm leading-tight line-clamp-2 mb-1 transition-colors ${isSelected ? 'text-arcade-accent' : 'text-arcade-text group-hover:text-arcade-accent'}`}>
                {game.metadata.title}
            </h3>
            <p className="text-[10px] text-arcade-muted font-medium">
                {game.metadata.releaseYear} • {game.metadata.genre.split(' ')[0]}
            </p>
          </div>

          <div className="flex justify-end mt-3">
              <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(game.id); }}
                  className="relative z-20 p-2 text-arcade-muted hover:text-red-500 hover:bg-arcade-surface rounded-full transition-colors"
                  title="Delete"
              >
                  <Trash2 size={16} />
              </button>
          </div>
      </div>
    </div>
  );
};