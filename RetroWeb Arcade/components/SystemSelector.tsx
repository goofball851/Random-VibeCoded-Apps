import React from 'react';
import { ConsoleSystem } from '../types';
import { SYSTEM_LABELS } from '../constants';
import { Tv, Smartphone, Gamepad2, Disc, Layers } from 'lucide-react';

interface SystemSelectorProps {
  selectedSystem: ConsoleSystem | 'all';
  onSelect: (system: ConsoleSystem | 'all') => void;
}

const SYSTEM_ICONS: Record<string, React.ElementType> = {
  nes: Tv,
  snes: Gamepad2,
  segaMD: Disc,
  gamegear: Smartphone,
  gb: Smartphone,
  gbc: Smartphone,
  gba: Smartphone,
  nds: Smartphone,
};

// Console-inspired gradient borders/backgrounds (refined for list items)
const SYSTEM_STYLES: Record<string, string> = {
  nes: 'from-red-600 to-red-700',
  snes: 'from-indigo-500 to-purple-600',
  segaMD: 'from-zinc-800 to-zinc-950',
  gamegear: 'from-blue-600 to-blue-700',
  gb: 'from-emerald-600 to-emerald-700',
  gbc: 'from-purple-500 to-purple-600',
  gba: 'from-fuchsia-600 to-pink-700',
  nds: 'from-sky-500 to-blue-600',
};

export const SystemSelector: React.FC<SystemSelectorProps> = ({ selectedSystem, onSelect }) => {
  const systems = Object.values(ConsoleSystem);

  return (
    <div className="w-full flex flex-col gap-3">
        {/* Header */}
        <h3 className="text-xs font-bold uppercase text-arcade-muted tracking-widest px-2 mb-1 hidden lg:block">
            Collections
        </h3>

        {/* 'All Games' Option */}
        <button
            onClick={() => onSelect('all')}
            className={`
                relative group overflow-hidden rounded-xl transition-all duration-200
                w-full p-3 flex items-center gap-3 border text-left
                ${selectedSystem === 'all' 
                    ? 'border-arcade-accent bg-arcade-accent/10 shadow-glow' 
                    : 'border-transparent hover:bg-arcade-panel hover:border-arcade-element'
                }
            `}
        >
            <div className={`p-2 rounded-lg ${selectedSystem === 'all' ? 'bg-arcade-accent text-white' : 'bg-arcade-element/50 text-arcade-muted group-hover:text-arcade-text'}`}>
                 <Layers size={18} />
            </div>
            
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${selectedSystem === 'all' ? 'text-arcade-text' : 'text-arcade-muted group-hover:text-arcade-text'}`}>
                    All Games
                </span>
            </div>
            
            {selectedSystem === 'all' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-arcade-accent shadow-[0_0_10px_rgba(var(--color-accent),0.5)]"></div>
            )}
        </button>

        <div className="h-px bg-arcade-element/50 mx-2 my-1"></div>

        {/* System List */}
        {systems.map((sys) => {
          const isSelected = selectedSystem === sys;
          const Icon = SYSTEM_ICONS[sys] || Gamepad2;
          const label = SYSTEM_LABELS[sys as ConsoleSystem];
          const gradient = SYSTEM_STYLES[sys] || 'from-zinc-700 to-zinc-800';

          return (
            <button
              key={sys}
              onClick={() => onSelect(sys)}
              className={`
                relative group overflow-hidden rounded-xl transition-all duration-200
                w-full p-3 flex items-center gap-3 border text-left
                ${isSelected 
                  ? 'border-transparent shadow-lg scale-[1.02]' 
                  : 'border-transparent hover:bg-arcade-panel hover:border-arcade-element'
                }
              `}
            >
               {/* Active Background Gradient */}
               {isSelected && (
                   <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90 z-0`} />
               )}

               <div className={`relative z-10 p-2 rounded-lg transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-arcade-element/50 text-arcade-muted group-hover:text-arcade-text'}`}>
                    <Icon size={18} />
               </div>

               <div className="relative z-10 flex flex-col">
                   <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-arcade-muted group-hover:text-arcade-text'}`}>
                       {label}
                   </span>
               </div>
               
               {isSelected && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-glow animate-pulse"></div>
               )}
            </button>
          );
        })}
    </div>
  );
};