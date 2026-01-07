
import React from 'react';
import { ALPHABET_NUMBERS } from '../types';

interface CharacterGridProps {
  completedChars: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({ 
  completedChars, 
  currentIndex, 
  onSelect 
}) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-3">
      {ALPHABET_NUMBERS.map((char, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = completedChars.includes(char);
        
        return (
          <button
            key={char}
            onClick={() => onSelect(index)}
            className={`
              aspect-square flex items-center justify-center text-lg font-black rounded-2xl transition-all duration-300 transform active:scale-95 relative group
              ${isCurrent 
                ? 'bg-indigo-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] scale-110 z-10' 
                : isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                  : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5 hover:border-white/20'}
            `}
          >
            {char}
            {isCompleted && !isCurrent && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            )}
            {isCurrent && (
               <div className="absolute inset-0 border-2 border-indigo-300 rounded-2xl animate-pulse opacity-50" />
            )}
            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors rounded-2xl" />
          </button>
        );
      })}
    </div>
  );
};

export default CharacterGrid;
