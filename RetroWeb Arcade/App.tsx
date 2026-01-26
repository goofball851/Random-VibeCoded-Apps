import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ConsoleSystem, Game, StoredGame } from './types';
import { KEYBOARD_CONTROLS, GAMEPAD_CONTROLS } from './constants';
import { getAllGames, saveGame, deleteGame, exportMetadata, clearLibrary } from './services/db';
import { generateGameMetadata } from './services/geminiService';
import { detectSystem } from './services/romDetection';
import { SystemSelector } from './components/SystemSelector';
import { GameCard } from './components/GameCard';
import { Emulator } from './components/Emulator';
import { Button } from './components/Button';
import { Upload, Info, Keyboard, Gamepad2, Search, ArrowDownAZ, Calendar, Clock, Filter, LayoutGrid, Settings, Palette, Sun, CloudSun, FileUp, RotateCcw, PenTool, Check, Plus, Trash2, Download, CloudDownload, Zap, Hash, Monitor, Sparkles, Play, Share2, Loader2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type SortOption = 'recent' | 'az' | 'year-desc' | 'year-asc';

// Theme Data Structures
interface ThemePalette {
    surface: string; 
    panel: string;
    element: string;
    text: string;
    muted: string;
    accent: string;
    highlight: string;
    bgBody: string; 
}

interface ThemeItem {
    id: string;
    name: string;
    palette: ThemePalette;
    isCustom: boolean;
}

// Optimized Palettes - Backgrounds set to tinted whites per request
const DEFAULT_PALETTES: Record<string, ThemePalette> = {
    afternoon: {
        surface: '39 39 42',    // Zinc 800
        panel: '63 63 70',      // Zinc 700
        element: '82 82 91',    // Zinc 600
        text: '250 250 250',    // Zinc 50
        muted: '161 161 170',   // Zinc 400
        accent: '139 92 246',   // Violet 500
        highlight: '167 139 250', // Violet 400
        bgBody: '#fbf7ff'       // Very light Violet tint
    },
    morning: {
        surface: '243 244 246', // Gray 100
        panel: '255 255 255',   // White
        element: '229 231 235', // Gray 200
        text: '31 41 55',       // Gray 800
        muted: '107 114 128',   // Gray 500
        accent: '0 122 255',    // System Blue
        highlight: '88 86 214', // Purple
        bgBody: '#f0f7ff'       // Very light Blue tint
    },
    // NES Inspired
    nes: {
        surface: '64 64 64',    // Grey
        panel: '82 82 82',      // Light Grey
        element: '115 115 115', // Lighter Grey
        text: '245 245 245',    // White
        muted: '163 163 163',   // Neutral 400
        accent: '220 38 38',    // Red 600
        highlight: '239 68 68', // Red 500
        bgBody: '#fff1f1'       // Very light Red tint
    },
    // SNES Inspired
    snes: {
        surface: '49 46 129',   // Indigo 900
        panel: '67 56 202',     // Indigo 700
        element: '99 102 241',  // Indigo 500
        text: '224 231 255',    // Indigo 50
        muted: '165 180 252',   // Indigo 300
        accent: '124 58 237',   // Violet 600
        highlight: '139 92 246',// Violet 500
        bgBody: '#f5f3ff'       // Very light Indigo tint
    },
    // Game Boy Inspired
    gb: {
        surface: '63 71 59',    // Camo Green
        panel: '86 99 79',      // Light Camo
        element: '120 133 113', // Sage
        text: '236 252 201',    // Pale Green
        muted: '163 184 148',   // Sage Muted
        accent: '132 204 22',   // Lime 500
        highlight: '163 230 53', // Lime 400
        bgBody: '#f7fee7'       // Very light Lime tint
    },
    // Genesis Inspired
    genesis: {
        surface: '38 38 38',    // Neutral 800
        panel: '50 50 50',      // Neutral 700
        element: '82 82 82',    // Neutral 600
        text: '255 255 255',    // White
        muted: '163 163 163',   // Neutral 400
        accent: '37 99 235',    // Blue 600
        highlight: '59 130 246', // Blue 500
        bgBody: '#eff6ff'       // Very light Blue tint
    }
};

const DEFAULT_THEME_REGISTRY: Record<string, ThemeItem> = {
    afternoon: { id: 'afternoon', name: 'Slate Glass', palette: DEFAULT_PALETTES.afternoon, isCustom: false },
    morning: { id: 'morning', name: 'OLED White', palette: DEFAULT_PALETTES.morning, isCustom: false },
    nes: { id: 'nes', name: '8-Bit Grey', palette: DEFAULT_PALETTES.nes, isCustom: false },
    snes: { id: 'snes', name: '16-Bit Indigo', palette: DEFAULT_PALETTES.snes, isCustom: false },
    gb: { id: 'gb', name: 'Dot Matrix', palette: DEFAULT_PALETTES.gb, isCustom: false },
    genesis: { id: 'genesis', name: 'Mega Drive', palette: DEFAULT_PALETTES.genesis, isCustom: false },
};

// Robust Conversion Utilities
const rgbToHex = (rgb: string) => {
    if (!rgb) return "#000000";
    try {
        const parts = rgb.split(' ').map(num => Math.min(255, Math.max(0, parseInt(num))));
        if (parts.length !== 3 || parts.some(isNaN)) return "#000000";
        return "#" + parts.map(c => c.toString(16).padStart(2, '0')).join('');
    } catch(e) {
        return "#000000";
    }
};

const hexToRgb = (hex: string) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r} ${g} ${b}`;
};

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [pendingGame, setPendingGame] = useState<Game | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<ConsoleSystem | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  
  // Selection State
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [controlsTab, setControlsTab] = useState<'keyboard' | 'gamepad'>('keyboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme State
  const [themeRegistry, setThemeRegistry] = useState<Record<string, ThemeItem>>(DEFAULT_THEME_REGISTRY);
  const [activeThemeId, setActiveThemeId] = useState<string>('afternoon');
  const [appToast, setAppToast] = useState<string | null>(null);
  
  const [controllerConnected, setControllerConnected] = useState(false);
  const [autoExitMinutes, setAutoExitMinutes] = useState<number>(0);

  // Apply Theme
  const applyTheme = useCallback((palette: ThemePalette) => {
      const root = document.documentElement;
      root.style.setProperty('--color-surface', palette.surface);
      root.style.setProperty('--color-panel', palette.panel);
      root.style.setProperty('--color-element', palette.element);
      root.style.setProperty('--color-text', palette.text);
      root.style.setProperty('--color-muted', palette.muted);
      root.style.setProperty('--color-accent', palette.accent);
      root.style.setProperty('--color-highlight', palette.highlight);
      root.style.setProperty('--bg-body', palette.bgBody);
      
      // Determine if light or dark mode based on brightness of bgBody
      // Simple check: if bgBody is light, add theme-morning class
      const rgb = hexToRgb(palette.bgBody).split(' ').map(Number);
      const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      
      if (brightness > 125) {
          root.classList.add('theme-morning');
          root.classList.remove('theme-afternoon');
      } else {
          root.classList.add('theme-afternoon');
          root.classList.remove('theme-morning');
      }
  }, []);

  // Show Toast Helper
  const showAppToast = (msg: string) => {
      setAppToast(msg);
      setTimeout(() => setAppToast(null), 3000);
  };

  // Effects
  useEffect(() => { localStorage.setItem('arcade-themes-v2', JSON.stringify(themeRegistry)); }, [themeRegistry]);
  useEffect(() => { localStorage.setItem('arcade-active-theme-id', activeThemeId); }, [activeThemeId]);
  
  useEffect(() => {
      const active = themeRegistry[activeThemeId] || themeRegistry['afternoon'];
      if (active) applyTheme(active.palette);
  }, [themeRegistry, activeThemeId, applyTheme]);

  useEffect(() => {
    refreshLibrary();
    const savedRegistry = localStorage.getItem('arcade-themes-v2');
    let initialRegistry = DEFAULT_THEME_REGISTRY;
    if (savedRegistry) {
        try { 
            const parsed = JSON.parse(savedRegistry);
            // Merge defaults into saved registry to ensure new themes appear
            initialRegistry = { ...DEFAULT_THEME_REGISTRY, ...parsed };
        } catch(e) {}
    }
    const savedId = localStorage.getItem('arcade-active-theme-id') || 'afternoon';
    
    setThemeRegistry(initialRegistry);
    setActiveThemeId(initialRegistry[savedId] ? savedId : 'afternoon');

    const handleConnect = () => setControllerConnected(true);
    const handleDisconnect = () => setControllerConnected(false);
    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);
    return () => {
        window.removeEventListener('gamepadconnected', handleConnect);
        window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, []);

  const refreshLibrary = async () => {
    try {
      const stored = await getAllGames();
      setGames(stored.map(({ blob, ...rest }) => rest));
    } catch (e) { console.error(e); }
  };

  const updateActiveThemeColor = (key: keyof ThemePalette, hexValue: string) => {
      let finalValue = hexValue;
      
      // Convert HEX to RGB "R G B" format for all vars except bgBody
      if (key !== 'bgBody') {
        finalValue = hexToRgb(hexValue);
      }

      setThemeRegistry(prev => {
          const activeTheme = prev[activeThemeId];
          const updatedPalette = { ...activeTheme.palette, [key]: finalValue };
          return { ...prev, [activeThemeId]: { ...activeTheme, palette: updatedPalette } };
      });
  };

  const handleCreatePreset = () => {
      const name = prompt("Enter a name for your new theme preset:");
      if (!name) return;

      const newId = uuidv4();
      const currentPalette = { ...themeRegistry[activeThemeId].palette }; // Deep copy current palette (with any edits)
      
      const newTheme: ThemeItem = {
          id: newId,
          name: name,
          palette: currentPalette,
          isCustom: true
      };

      setThemeRegistry(prev => ({ ...prev, [newId]: newTheme }));
      setActiveThemeId(newId);
      showAppToast(`Theme "${name}" saved!`);
  };

  const handleExportTheme = (theme: ThemeItem) => {
      const json = JSON.stringify(theme, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme_${theme.name.replace(/\s+/g, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showAppToast("Theme exported!");
  };

  const handleImportTheme = async (file: File) => {
      try {
          const text = await file.text();
          const theme = JSON.parse(text) as ThemeItem;
          // Basic validation
          if (theme.palette && theme.name && theme.palette.bgBody) {
              const newId = uuidv4();
              const newTheme = { ...theme, id: newId, isCustom: true };
              setThemeRegistry(prev => ({ ...prev, [newId]: newTheme }));
              setActiveThemeId(newId);
              showAppToast(`Theme "${theme.name}" imported!`);
          } else {
              throw new Error("Invalid theme structure");
          }
      } catch (e) {
          showAppToast("Failed to import theme: Invalid file");
      }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!themeRegistry[id].isCustom) return;
      if (!window.confirm(`Delete theme "${themeRegistry[id].name}"?`)) return;

      setThemeRegistry(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
      });

      if (activeThemeId === id) {
          setActiveThemeId('afternoon');
      }
      showAppToast("Theme deleted");
  };

  const resetCurrentTheme = () => {
      if (!window.confirm("Reset this theme to its original colors?")) return;
      
      if (themeRegistry[activeThemeId].isCustom) {
          showAppToast("Cannot reset custom themes");
          return;
      }

      const defaultPalette = DEFAULT_PALETTES[activeThemeId];
      if (defaultPalette) {
          setThemeRegistry(prev => {
             const updatedTheme = { ...prev[activeThemeId], palette: { ...defaultPalette } }; // Clone default
             return { ...prev, [activeThemeId]: updatedTheme };
          });
          showAppToast("Theme reset to defaults");
      }
  };

  const processFile = async (file: File) => {
      // Check if it's a JSON profile or theme
      if (file.name.endsWith('.json')) {
          const text = await file.text();
          try {
              const json = JSON.parse(text);
              // Check if it's a full profile
              if (json.profile && json.profile.settings) {
                  const { settings, games: importedGames } = json.profile;
                  if (settings.themeRegistry) setThemeRegistry(settings.themeRegistry);
                  if (settings.activeThemeId) setActiveThemeId(settings.activeThemeId);
                  showAppToast(`Profile restored!`);
                  return; 
              }
              // Check if it's a single theme
              if (json.palette && json.name) {
                   const newId = uuidv4();
                   const newTheme = { ...json, id: newId, isCustom: true };
                   setThemeRegistry(prev => ({ ...prev, [newId]: newTheme }));
                   setActiveThemeId(newId);
                   showAppToast(`Theme "${json.name}" imported!`);
                   return;
              }
          } catch(e) { console.warn("Not a valid JSON", e); showAppToast("Invalid JSON File"); }
      }

      // ROM Processing
      try {
        const detectedSystem = await detectSystem(file);
        const metadata = await generateGameMetadata(file.name, detectedSystem);
        const newGame: StoredGame = {
            id: uuidv4(),
            filename: file.name,
            system: detectedSystem,
            addedAt: Date.now(),
            metadata,
            blob: file
        };
        await saveGame(newGame);
      } catch (e) {
          console.error(e);
      }
  };

  const processFilesList = async (files: FileList) => {
    if (!files.length) return;
    setIsUploading(true);
    setUploadError(null);
    try {
        for (let i = 0; i < files.length; i++) {
            if (files[i].name.startsWith('.')) continue;
            try { await processFile(files[i]); } catch (e: any) { console.warn(e); }
        }
        await refreshLibrary();
    } catch (err: any) { setUploadError(err.message); } 
    finally { setIsUploading(false); }
  };

  const handleExportProfile = async () => {
      try {
          const settings = { themeRegistry, activeThemeId, autoExitMinutes };
          const json = await exportMetadata(settings);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `retroweb_profile_${new Date().toISOString().slice(0,10)}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showAppToast("Profile backup created!");
      } catch (e) { showAppToast("Failed to export profile"); }
  };

  const handleDelete = async (id: string) => {
    try {
        if (window.confirm("Delete this game?")) {
            await deleteGame(id);
            if (selectedGameId === id) setSelectedGameId(null);
            await refreshLibrary();
            showAppToast("Game deleted");
        }
    } catch (e) {
        showAppToast("Failed to delete game");
    }
  };

  const filteredGames = useMemo(() => {
      return games
        .filter(g => {
          const matchesSystem = selectedSystem === 'all' || g.system === selectedSystem;
          const matchesSearch = g.metadata.title.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSystem && matchesSearch;
        })
        .sort((a, b) => {
          switch (sortOption) {
            case 'az': return a.metadata.title.localeCompare(b.metadata.title);
            case 'year-desc': return (parseInt(b.metadata.releaseYear) || 0) - (parseInt(a.metadata.releaseYear) || 0);
            case 'year-asc': return (parseInt(a.metadata.releaseYear) || 0) - (parseInt(b.metadata.releaseYear) || 0);
            case 'recent': default: return b.addedAt - a.addedAt;
          }
        });
  }, [games, selectedSystem, searchQuery, sortOption]);

  const activeTheme = themeRegistry[activeThemeId] || themeRegistry['afternoon'];
  const systemThemes = (Object.values(themeRegistry) as ThemeItem[]).filter(t => !t.isCustom);
  const customThemes = (Object.values(themeRegistry) as ThemeItem[]).filter(t => t.isCustom);
  
  // Hero Game Logic:
  // 1. If a game is explicitly selected, show it.
  // 2. If nothing selected but we have games, show the first one.
  const heroGame = useMemo(() => {
      if (selectedGameId) {
          return games.find(g => g.id === selectedGameId) || null;
      }
      return filteredGames.length > 0 ? filteredGames[0] : null;
  }, [selectedGameId, games, filteredGames]);

  // Image fallback helper
  const getGameImage = (game: Game) => {
      return game.metadata.coverUrl || `https://tse2.mm.bing.net/th?q=${encodeURIComponent(game.metadata.coverQuery)}&w=300&h=400&c=7&rs=1`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, game: Game) => {
      const fallback = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(game.metadata.coverQuery)}&w=300&h=400&c=7&rs=1`;
      if (e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
      }
  };

  // State for new preset name input
  const [newPresetName, setNewPresetName] = useState("");

  return (
    <div 
        className="min-h-screen bg-arcade-surface text-arcade-text font-sans transition-colors duration-500 overflow-x-hidden selection:bg-arcade-accent selection:text-white"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
        onDrop={async (e) => {
            e.preventDefault(); setIsDragOver(false);
            if (e.dataTransfer.files.length) await processFilesList(e.dataTransfer.files);
        }}
    >
      {/* App Toast Notification */}
      {appToast && (
          <div className="fixed top-24 right-6 z-[100] bg-arcade-accent text-white px-6 py-3 rounded-xl shadow-glow animate-in fade-in slide-in-from-right-4 font-bold flex items-center gap-2 pointer-events-none">
              <Check size={18} />
              {appToast}
          </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-arcade-surface/80 backdrop-blur-xl border-b border-arcade-element">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-arcade-accent to-arcade-highlight flex items-center justify-center shadow-glow ${controllerConnected ? 'animate-pulse' : ''}`}>
                    <Gamepad2 size={24} className="text-white" />
                </div>
                <div>
                     <h1 className="text-xl font-black tracking-tight leading-none">RetroWeb</h1>
                     <p className="text-[10px] font-bold text-arcade-muted uppercase tracking-widest">Arcade OS 2.0</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-arcade-muted group-focus-within:text-arcade-accent transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search Library..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 pl-10 pr-4 py-2 bg-arcade-panel border border-arcade-element rounded-full text-sm focus:ring-2 focus:ring-arcade-accent/30 outline-none transition-all focus:w-80 shadow-inner"
                    />
                </div>

                <div className="h-6 w-px bg-arcade-element mx-2"></div>

                <button onClick={() => setShowControls(true)} className="p-2.5 rounded-full text-arcade-muted hover:bg-arcade-panel hover:text-arcade-text transition-all hover:scale-110">
                    <Keyboard size={20} />
                </button>
                <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-full text-arcade-muted hover:bg-arcade-panel hover:text-arcade-text transition-all hover:scale-110">
                    <Settings size={20} />
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        
        {/* Spotlight Hero Section */}
        {heroGame && (
             <div className="mb-8 relative rounded-3xl overflow-hidden h-64 md:h-80 w-full group cursor-pointer shadow-cabinet border border-arcade-element/50" onClick={() => setPendingGame(heroGame)}>
                 {/* Background Blur */}
                 <div className="absolute inset-0 z-0">
                    <img 
                        src={getGameImage(heroGame)} 
                        onError={(e) => handleImageError(e, heroGame)}
                        className="w-full h-full object-cover opacity-60 blur-xl scale-110 group-hover:scale-125 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-arcade-surface via-arcade-surface/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-arcade-surface via-transparent to-transparent" />
                 </div>
                 
                 <div className="absolute bottom-0 left-0 p-8 z-10 max-w-2xl">
                     <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-4 inline-block shadow-sm">
                         {selectedGameId === heroGame.id ? "Selected Title" : "Featured Title"}
                     </span>
                     <h2 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md tracking-tight leading-none">
                         {heroGame.metadata.title}
                     </h2>
                     <p className="text-white/80 line-clamp-2 mb-6 font-medium text-lg drop-shadow">
                         {heroGame.metadata.description}
                     </p>
                     
                     <div className="flex gap-4">
                         <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-glow flex items-center gap-2">
                             <Play fill="currentColor" size={16} /> Start Game
                         </button>
                         <div className="px-6 py-3 bg-black/40 backdrop-blur-md text-white border border-white/10 font-bold rounded-full flex items-center gap-2">
                            <Info size={18} /> {heroGame.metadata.releaseYear}
                         </div>
                     </div>
                 </div>

                 {/* Cover Art Floating */}
                 <div className="absolute right-8 bottom-[-20px] md:bottom-[-40px] w-48 md:w-64 rotate-3 group-hover:rotate-0 transition-transform duration-500 z-10 drop-shadow-2xl">
                     <img 
                        src={getGameImage(heroGame)} 
                        onError={(e) => handleImageError(e, heroGame)}
                        className="rounded-lg shadow-2xl border-4 border-white/5" 
                     />
                 </div>
             </div>
        )}

        {/* Main Content Layout with Sticky Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Vertical System Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 sticky top-24 z-10">
                <SystemSelector selectedSystem={selectedSystem} onSelect={setSelectedSystem} />
            </aside>

            {/* Main Library Area */}
            <div className="flex-1 w-full min-w-0">
                {/* Library Controls */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <LayoutGrid className="text-arcade-accent" size={20} />
                        Library
                        <span className="text-sm font-normal text-arcade-muted ml-2">({filteredGames.length} items)</span>
                    </h3>

                    <div className="flex gap-2">
                        {/* Persistent Upload Button */}
                        <label className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide cursor-pointer transition-all border
                            ${isUploading 
                                ? 'bg-arcade-panel border-arcade-accent text-arcade-accent cursor-wait' 
                                : 'bg-arcade-accent text-white border-transparent hover:brightness-110 shadow-glow hover:scale-105'
                            }
                        `}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={14} />
                                    <span>Processing Game...</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={14} />
                                    <span>Add ROM</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                onChange={(e) => { if(e.target.files) processFilesList(e.target.files); }} 
                                disabled={isUploading}
                            />
                        </label>

                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="pl-3 pr-8 py-2 bg-arcade-panel border border-arcade-element rounded-lg text-xs font-bold uppercase tracking-wide outline-none cursor-pointer hover:border-arcade-muted transition-colors"
                        >
                            <option value="recent">Recent</option>
                            <option value="az">A-Z</option>
                            <option value="year-desc">Year (New)</option>
                            <option value="year-asc">Year (Old)</option>
                        </select>
                    </div>
                </div>

                {/* Drop Zone / Empty State */}
                {(isDragOver || filteredGames.length === 0) && (
                    <div className={`
                        mb-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center p-16 transition-all animate-fade-in
                        ${isDragOver 
                            ? 'border-arcade-accent bg-arcade-accent/5 scale-[1.01]' 
                            : 'border-arcade-element bg-arcade-panel/30 hover:bg-arcade-panel/50'
                        }
                    `}>
                        <div className="p-6 bg-arcade-panel rounded-full mb-6 shadow-xl ring-1 ring-white/5">
                            <CloudDownload size={48} className={isDragOver ? "text-arcade-accent animate-bounce" : "text-arcade-muted"} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {isDragOver ? "Drop to Install" : "Library Empty"}
                        </h3>
                        <p className="text-arcade-muted mb-8 max-w-sm mx-auto leading-relaxed">
                            Drag & drop ROM files (NES, SNES, GBA, etc.) or restore a backup JSON profile to get started.
                        </p>
                        <label className="cursor-pointer bg-arcade-accent text-white px-8 py-3 rounded-full font-bold shadow-glow hover:scale-105 transition-all">
                            Browse Files
                            <input type="file" className="hidden" multiple onChange={(e) => { if(e.target.files) processFilesList(e.target.files); }} />
                        </label>
                        {isUploading && <p className="mt-6 text-sm font-mono text-arcade-accent animate-pulse">Processing Game...</p>}
                    </div>
                )}

                {/* Game Grid */}
                {filteredGames.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredGames.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={game} 
                                isSelected={selectedGameId === game.id}
                                onSelect={() => setSelectedGameId(game.id)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in" onClick={() => setShowSettings(false)}>
              <div className="bg-arcade-surface border border-arcade-element p-0 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  
                  {/* Header */}
                  <div className="flex justify-between items-center p-6 border-b border-arcade-element bg-arcade-panel/50">
                      <h2 className="text-2xl font-black flex items-center gap-3"><Settings className="text-arcade-accent" /> System Settings</h2>
                      <button onClick={() => setShowSettings(false)} className="hover:bg-arcade-element p-2 rounded-full transition-colors"><RotateCcw className="rotate-45" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      {/* Theme Presets */}
                      <div className="space-y-6 mb-10">
                          <div className="flex justify-between items-end border-b border-arcade-element pb-2">
                             <h3 className="text-xs font-bold uppercase text-arcade-muted tracking-widest">Interface Themes</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {systemThemes.map(theme => (
                                  <button 
                                    key={theme.id} onClick={() => { setActiveThemeId(theme.id); applyTheme(theme.palette); }}
                                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group
                                    ${activeThemeId === theme.id ? 'border-arcade-accent bg-arcade-panel ring-2 ring-arcade-accent shadow-glow' : 'border-arcade-element hover:bg-arcade-panel'}`}
                                  >
                                      <div className="font-bold text-sm mb-1 z-10 relative">{theme.name}</div>
                                      
                                      {/* Color Swatches */}
                                      <div className="flex gap-1.5 mt-3">
                                          <div className="w-4 h-4 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: `rgb(${theme.palette.surface})` }}></div>
                                          <div className="w-4 h-4 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: `rgb(${theme.palette.accent})` }}></div>
                                          <div className="w-4 h-4 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: `rgb(${theme.palette.text})` }}></div>
                                      </div>
                                  </button>
                              ))}
                          </div>

                           {/* Custom Themes Section */}
                           {customThemes.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-[10px] font-bold text-arcade-muted uppercase tracking-wider mb-3">User Presets</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {customThemes.map(theme => (
                                            <button 
                                                key={theme.id}
                                                onClick={() => { setActiveThemeId(theme.id); applyTheme(theme.palette); }}
                                                className={`p-3 rounded-xl border transition-all relative overflow-hidden group
                                                ${activeThemeId === theme.id
                                                    ? 'bg-arcade-panel border-arcade-accent ring-1 ring-arcade-accent/50' 
                                                    : 'bg-arcade-panel border-arcade-element hover:border-arcade-accent/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full" style={{ background: `rgb(${theme.palette.accent})` }} />
                                                    <span className="text-xs font-bold truncate flex-1 text-left">{theme.name}</span>
                                                    <div onClick={(e) => handleDeletePreset(theme.id, e)} className="p-1 hover:text-red-500 cursor-pointer"><Trash2 size={12}/></div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                      </div>

                      {/* Deep Customization */}
                      <div className="bg-arcade-panel rounded-2xl border border-arcade-element p-6 space-y-6 shadow-inner">
                           <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2"><Palette size={16} className="text-arcade-accent"/> Theme Editor</h3>
                                
                                <div className="flex gap-2">
                                     <label className="cursor-pointer text-xs flex items-center gap-1 text-arcade-muted hover:text-arcade-text transition-colors px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-element hover:border-arcade-accent">
                                         <Share2 size={14} /> Import
                                         <input type="file" className="hidden" accept=".json" onChange={(e) => { if(e.target.files?.[0]) handleImportTheme(e.target.files[0]); }} />
                                     </label>
                                    <button onClick={() => handleExportTheme(activeTheme)} className="text-xs flex items-center gap-1 text-arcade-muted hover:text-arcade-text transition-colors px-3 py-1.5 rounded-lg bg-arcade-surface border border-arcade-element hover:border-arcade-accent">
                                         <Download size={14} /> Export
                                     </button>
                                     
                                     {/* Inline Save Preset UI */}
                                     <div className="flex items-center gap-2 bg-arcade-surface p-1 rounded-lg border border-arcade-element">
                                         <input 
                                             type="text" 
                                             placeholder="New Theme Name" 
                                             value={newPresetName}
                                             onChange={(e) => setNewPresetName(e.target.value)}
                                             className="w-24 bg-transparent text-xs px-2 outline-none"
                                         />
                                         <button 
                                            onClick={() => {
                                                if(!newPresetName) return;
                                                const newId = uuidv4();
                                                const currentPalette = { ...themeRegistry[activeThemeId].palette };
                                                const newTheme: ThemeItem = { id: newId, name: newPresetName, palette: currentPalette, isCustom: true };
                                                setThemeRegistry(prev => ({ ...prev, [newId]: newTheme }));
                                                setActiveThemeId(newId);
                                                setNewPresetName("");
                                                showAppToast(`Theme "${newPresetName}" saved!`);
                                            }}
                                            className="text-xs flex items-center gap-1 text-arcade-accent hover:text-white transition-colors px-2 py-1 rounded bg-arcade-accent/10 hover:bg-arcade-accent"
                                         >
                                            <Plus size={12} /> Save
                                         </button>
                                     </div>

                                     {!activeTheme.isCustom && (
                                         <button onClick={resetCurrentTheme} className="text-xs flex items-center gap-1 text-arcade-muted hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                                             Reset Default
                                         </button>
                                     )}
                                </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-arcade-muted flex justify-between">Surface Color <span>Hex</span></label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-16 rounded-lg overflow-hidden border border-arcade-element shadow-sm relative shrink-0">
                                            <input type="color" value={rgbToHex(activeTheme.palette.surface)} onChange={(e) => updateActiveThemeColor('surface', e.target.value)} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
                                        </div>
                                        <code className="text-xs bg-black/20 px-2 py-1 rounded text-arcade-muted font-mono">{rgbToHex(activeTheme.palette.surface)}</code>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-arcade-muted flex justify-between">Accent Color <span>Hex</span></label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-16 rounded-lg overflow-hidden border border-arcade-element shadow-sm relative shrink-0">
                                            <input type="color" value={rgbToHex(activeTheme.palette.accent)} onChange={(e) => updateActiveThemeColor('accent', e.target.value)} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
                                        </div>
                                        <code className="text-xs bg-black/20 px-2 py-1 rounded text-arcade-muted font-mono">{rgbToHex(activeTheme.palette.accent)}</code>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-arcade-muted flex justify-between">Panel Color <span>Hex</span></label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-16 rounded-lg overflow-hidden border border-arcade-element shadow-sm relative shrink-0">
                                            <input type="color" value={rgbToHex(activeTheme.palette.panel)} onChange={(e) => updateActiveThemeColor('panel', e.target.value)} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
                                        </div>
                                        <code className="text-xs bg-black/20 px-2 py-1 rounded text-arcade-muted font-mono">{rgbToHex(activeTheme.palette.panel)}</code>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-arcade-muted flex justify-between">Background <span>Hex</span></label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-16 rounded-lg overflow-hidden border border-arcade-element shadow-sm relative shrink-0">
                                            <input type="color" value={activeTheme.palette.bgBody} onChange={(e) => updateActiveThemeColor('bgBody', e.target.value)} className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
                                        </div>
                                        <code className="text-xs bg-black/20 px-2 py-1 rounded text-arcade-muted font-mono">{activeTheme.palette.bgBody}</code>
                                    </div>
                                </div>
                           </div>
                      </div>
                      
                      {/* Data Management */}
                      <div className="mt-10 pt-6 border-t border-arcade-element">
                          <h3 className="text-xs font-bold uppercase text-arcade-muted tracking-widest mb-4">Storage & Backup</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <button onClick={handleExportProfile} className="flex items-center justify-between p-4 rounded-xl bg-arcade-panel border border-arcade-element hover:border-arcade-accent hover:shadow-glow transition-all group">
                                  <div className="flex flex-col items-start">
                                      <span className="text-sm font-bold">Backup Full Profile</span>
                                      <span className="text-[10px] text-arcade-muted">Games, Themes, Settings (JSON)</span>
                                  </div>
                                  <Download size={20} className="text-arcade-muted group-hover:text-arcade-accent" />
                              </button>
                              <label className="flex items-center justify-between p-4 rounded-xl bg-arcade-panel border border-arcade-element hover:border-arcade-accent hover:shadow-glow transition-all cursor-pointer group">
                                  <div className="flex flex-col items-start">
                                      <span className="text-sm font-bold">Restore Profile</span>
                                      <span className="text-[10px] text-arcade-muted">Import from JSON file</span>
                                  </div>
                                  <CloudDownload size={20} className="text-arcade-muted group-hover:text-arcade-accent" />
                                  <input type="file" className="hidden" accept=".json" onChange={(e) => { if(e.target.files?.[0]) processFile(e.target.files[0]); }} />
                              </label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Emulator Overlay */}
      {activeGame && <Emulator game={activeGame} autoExitMinutes={0} onExit={() => { setActiveGame(null); refreshLibrary(); }} />}

      {/* Boot Legal Screen */}
      {pendingGame && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-md animate-fade-in" onClick={() => setPendingGame(null)}>
            <div className="bg-arcade-surface p-8 rounded-3xl max-w-md w-full text-center border border-arcade-element shadow-2xl scale-100 animate-slide-up" onClick={e => e.stopPropagation()}>
                
                {/* Image Section */}
                <div className="mx-auto mb-6 w-32 shadow-cabinet rounded-lg overflow-hidden border border-white/10 rotate-3 transition-transform hover:rotate-0">
                     <img 
                        src={getGameImage(pendingGame)}
                        alt={pendingGame.metadata.title}
                        className="w-full h-auto object-cover aspect-[3/4]"
                        onError={(e) => handleImageError(e, pendingGame)}
                     />
                </div>

                <h3 className="text-2xl font-black mb-2">{pendingGame.metadata.title}</h3>
                <p className="text-arcade-muted text-sm mb-8 px-4">Launching emulation core. Press <strong className="text-arcade-text">Shift + F2</strong> to save anytime.</p>
                <div className="flex justify-center gap-4">
                    <Button variant="ghost" onClick={() => setPendingGame(null)}>Cancel</Button>
                    <Button onClick={() => { setActiveGame(pendingGame); setPendingGame(null); }}>Start Game</Button>
                </div>
            </div>
        </div>
      )}

      {/* Controls Modal */}
      {showControls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowControls(false)}>
            <div className="bg-arcade-surface border border-arcade-element p-8 rounded-3xl max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Controls</h2>
                    <div className="flex p-1 bg-arcade-panel rounded-lg">
                        <button className={`px-4 py-1 rounded text-xs font-bold ${controlsTab === 'keyboard' ? 'bg-arcade-element text-arcade-text' : 'text-arcade-muted'}`} onClick={() => setControlsTab('keyboard')}>Keyboard</button>
                        <button className={`px-4 py-1 rounded text-xs font-bold ${controlsTab === 'gamepad' ? 'bg-arcade-accent text-white' : 'text-arcade-muted'}`} onClick={() => setControlsTab('gamepad')}>Gamepad</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {(controlsTab === 'keyboard' ? KEYBOARD_CONTROLS : GAMEPAD_CONTROLS).map((c, i) => (
                        <div key={i} className="flex justify-between p-3 bg-arcade-panel rounded-xl border border-arcade-element"><span className="text-sm text-arcade-muted">{c.action}</span><code className="text-xs bg-black/20 px-2 py-1 rounded font-bold font-mono">{c.keys.join(' / ')}</code></div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;