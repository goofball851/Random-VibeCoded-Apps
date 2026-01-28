import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Plus, 
  Settings, 
  Layout, 
  Maximize2, 
  ExternalLink, 
  X, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Copy, 
  MoreVertical,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Info,
  Layers,
  GripVertical,
  Eye,
  Camera,
  ImageIcon,
  Upload,
  Palette,
  Droplets,
  Menu,
  Monitor,
  Maximize,
  Smartphone,
  AlignLeft,
  AlignRight,
  Maximize2 as ExpandIcon,
  Minimize2 as ContractIcon,
  Terminal,
  Type,
  Move,
  Bold,
  Italic,
  MousePointer2,
  Box,
  Scaling,
  AppWindow,
  Sun,
  Moon,
  Wind,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  RefreshCcw,
  LayoutGrid,
  Link2,
  Database,
  Save,
  RotateCcw,
  History,
  Archive,
  ArrowLeft,
  Command,
  FileImage,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Bookmark,
  Pencil,
  Grid,
  Cpu,
  Github,
  Globe,
  BadgeCheck,
  Briefcase,
  History as HistoryIcon
} from 'lucide-react';
import { WebApp, ThemeConfig, AppState, UserPreset, LandingPreset } from './types';
import { PRESET_APPS, PRESET_THEMES, PRESET_WALLPAPERS, CHROME_PRESET_COLORS } from './constants';
import { getFaviconUrl, formatUrl, generateId } from './utils/helpers';

type PrefTab = 'interface' | 'theme' | 'landing' | 'atmosphere' | 'workspaces' | 'archive' | 'dashboard' | 'about';
type AppLoadStatus = 'loading' | 'success' | 'error';
type LandingViewMode = 'hero' | 'gallery';

const DEFAULT_LANDING_CONFIG: LandingPreset['config'] = {
  landingTitle: 'PocketWeb',
  landingSubtitle: 'Your World in Your Pocket',
  landingButtonText: 'Initialize System',
  landingPosition: 'bottom-right',
  showLandingSubtitle: true,
  landingFontFamily: 'sans',
  landingIsItalic: true,
  landingFontWeight: 'black',
  landingTextColor: null,
  landingAccentColor: null,
  landingButtonVariant: 'heavy',
  landingScale: 100,
};

// Sub-components
const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  chromeBg: string; 
  chromeText: string; 
  chromeBorder: string; 
  onBack?: () => void; 
  showBack?: boolean 
}> = ({ isOpen, onClose, title, children, chromeBg, chromeText, chromeBorder, onBack, showBack }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) modalRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;
  
  const modalId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300">
      <div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalId}
        className="w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] focus:outline-none"
        style={{ backgroundColor: chromeBg, color: chromeText, borderColor: chromeBorder }}
      >
        <header className="flex items-center justify-between p-6 md:p-10 border-b flex-shrink-0" style={{ borderColor: chromeBorder }}>
          <div className="flex items-center space-x-6">
            {showBack && (
              <button onClick={onBack} className="p-4 rounded-3xl transition-all shadow-xl group bg-white/5 hover:bg-white/10 outline-none">
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div>
              <h2 id={modalId} className="text-3xl font-black tracking-tighter uppercase italic leading-none">{title}</h2>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.4em] mt-2">PocketWeb Pro Configurator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-3xl transition-all shadow-xl hover:rotate-90 bg-white/5 hover:bg-white/10 outline-none">
            <X size={24} />
          </button>
        </header>
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const loadState = (): Partial<AppState> => {
    try {
      const saved = localStorage.getItem('pocketweb_workspace_state');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  };

  const initialState = loadState();

  const [apps, setApps] = useState<WebApp[]>(initialState.apps || []);
  const [activeAppId, setActiveAppId] = useState<string | null>(initialState.activeAppId || null);
  const [theme, setTheme] = useState<ThemeConfig>(initialState.theme || PRESET_THEMES[0]);
  const [globalDarkMode, setGlobalDarkMode] = useState<boolean>(initialState.globalDarkMode !== undefined ? initialState.globalDarkMode : true);
  const [chromeBgColor, setChromeBgColor] = useState<string | null>(initialState.chromeBgColor || null);
  const [chromeAccentColor, setChromeAccentColor] = useState<string | null>(initialState.chromeAccentColor || null);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(initialState.sidebarExpanded !== undefined ? initialState.sidebarExpanded : true);
  const [zoomLevel, setZoomLevel] = useState<number>(initialState.zoomLevel || 100);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(initialState.wallpaperUrl || PRESET_WALLPAPERS[0].url);
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(initialState.wallpaperOpacity !== undefined ? initialState.wallpaperOpacity : 20);
  const [wallpaperColor, setWallpaperColor] = useState<string>(initialState.wallpaperColor || '#0f172a');
  const [wallpaperBlur, setWallpaperBlur] = useState<number>(initialState.wallpaperBlur !== undefined ? initialState.wallpaperBlur : 0);
  const [uiDensity, setUiDensity] = useState<'comfortable' | 'compact'>(initialState.uiDensity || 'comfortable');
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(initialState.sidebarPosition || 'left');
  const [wallpaperFit, setWallpaperFit] = useState<'cover' | 'contain' | 'fill'>(initialState.wallpaperFit || 'cover');
  
  const [appStatuses, setAppStatuses] = useState<Record<string, AppLoadStatus>>({});
  const [appRetryKeys, setAppRetryKeys] = useState<Record<string, number>>({});
  const loadTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [landingTitle, setLandingTitle] = useState(initialState.landingTitle || DEFAULT_LANDING_CONFIG.landingTitle);
  const [landingSubtitle, setLandingSubtitle] = useState(initialState.landingSubtitle || DEFAULT_LANDING_CONFIG.landingSubtitle);
  const [landingButtonText, setLandingButtonText] = useState(initialState.landingButtonText || DEFAULT_LANDING_CONFIG.landingButtonText);
  const [landingPosition, setLandingPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>(initialState.landingPosition || DEFAULT_LANDING_CONFIG.landingPosition);
  const [showLandingSubtitle, setShowLandingSubtitle] = useState(initialState.showLandingSubtitle !== undefined ? initialState.showLandingSubtitle : DEFAULT_LANDING_CONFIG.showLandingSubtitle);
  const [landingScale, setLandingScale] = useState(initialState.landingScale || DEFAULT_LANDING_CONFIG.landingScale);
  const [landingViewMode, setLandingViewMode] = useState<LandingViewMode>(initialState.landingViewMode || 'hero');
  
  const [landingFontFamily, setLandingFontFamily] = useState<AppState['landingFontFamily']>(initialState.landingFontFamily || DEFAULT_LANDING_CONFIG.landingFontFamily);
  const [landingIsItalic, setLandingIsItalic] = useState(initialState.landingIsItalic !== undefined ? initialState.landingIsItalic : DEFAULT_LANDING_CONFIG.landingIsItalic);
  const [landingFontWeight, setLandingFontWeight] = useState<AppState['landingFontWeight']>(initialState.landingFontWeight || DEFAULT_LANDING_CONFIG.landingFontWeight);
  const [landingTextColor, setLandingTextColor] = useState<string | null>(initialState.landingTextColor || DEFAULT_LANDING_CONFIG.landingTextColor);
  const [landingAccentColor, setLandingAccentColor] = useState<string | null>(initialState.landingAccentColor || DEFAULT_LANDING_CONFIG.landingAccentColor);
  const [landingButtonVariant, setLandingButtonVariant] = useState<AppState['landingButtonVariant']>(initialState.landingButtonVariant || DEFAULT_LANDING_CONFIG.landingButtonVariant);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [displayWallpaperUrl, setDisplayWallpaperUrl] = useState(wallpaperUrl);
  const [nextWallpaperUrl, setNextWallpaperUrl] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState(false);
  const [viewportMeta, setViewportMeta] = useState({ width: 1920, height: 1080, ratio: '16:9' });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [prefActiveTab, setPrefActiveTab] = useState<PrefTab>('dashboard');
  
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [customWallpaperInput, setCustomWallpaperInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasSnapshot, setHasSnapshot] = useState<boolean>(!!localStorage.getItem('pocketweb_snapshot'));
  const [userPresets, setUserPresets] = useState<UserPreset[]>(() => {
    try {
      const saved = localStorage.getItem('pocketweb_user_presets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newPresetName, setNewPresetName] = useState('');

  const [landingPresets, setLandingPresets] = useState<LandingPreset[]>(() => {
    try {
      const saved = localStorage.getItem('pocketweb_landing_presets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newLandingPresetName, setNewLandingPresetName] = useState('');

  const systemLandingPresets = useMemo<LandingPreset[]>(() => [{
    id: 'system-default',
    name: 'PocketWeb Default',
    config: DEFAULT_LANDING_CONFIG
  }], []);

  const allLandingPresets = useMemo(() => [...systemLandingPresets, ...landingPresets], [systemLandingPresets, landingPresets]);

  const workspaceBg = chromeBgColor || theme.bgPrimary;
  const chromeBg = chromeBgColor || (globalDarkMode ? '#0f172a' : '#ffffff');
  const chromeText = globalDarkMode ? '#f8fafc' : '#0f172a';
  const chromeBorder = globalDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const chromeAccent = chromeAccentColor || theme.accent;

  const actualLandingAccentColor = landingAccentColor || chromeAccent;
  const actualLandingTextColor = landingTextColor || theme.text;

  const landingContainerClasses = useMemo(() => {
    switch (landingPosition) {
      case 'top-left': return 'justify-start items-start text-left';
      case 'top-right': return 'justify-start items-end text-right';
      case 'bottom-left': return 'justify-end items-start text-left';
      case 'bottom-right': return 'justify-end items-end text-right';
      default: return 'justify-center items-center text-center';
    }
  }, [landingPosition]);

  const landingTransformOrigin = useMemo(() => {
    switch (landingPosition) {
      case 'top-left': return '0 0';
      case 'top-right': return '100% 0';
      case 'bottom-left': return '0 100%';
      case 'bottom-right': return '100% 100%';
      default: return 'center';
    }
  }, [landingPosition]);

  const landingBorderClasses = useMemo(() => {
    const isRight = landingPosition.includes('right');
    return isRight ? 'border-r-8 pr-8 py-4' : 'border-l-8 pl-8 py-4';
  }, [landingPosition]);

  const fontStack = useMemo(() => {
    switch (landingFontFamily) {
      case 'sans': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  }, [landingFontFamily]);

  const fontWeightClass = useMemo(() => {
    switch (landingFontWeight) {
      case 'light': return 'font-light';
      case 'normal': return 'font-normal';
      case 'bold': return 'font-bold';
      case 'black': return 'font-black';
      default: return 'font-black';
    }
  }, [landingFontWeight]);

  useEffect(() => {
    const handleResize = () => {
      setViewportMeta({ width: window.innerWidth, height: window.innerHeight, ratio: (window.innerWidth/window.innerHeight).toFixed(2) });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentState = useCallback((): AppState => ({ 
    apps, activeAppId, theme, globalDarkMode, chromeBgColor, chromeAccentColor, sidebarExpanded, zoomLevel,
    wallpaperUrl, wallpaperOpacity, wallpaperColor, wallpaperBlur,
    uiDensity, sidebarPosition, wallpaperFit,
    landingTitle, landingSubtitle, landingButtonText, landingPosition, showLandingSubtitle,
    landingFontFamily, landingIsItalic, landingFontWeight, landingTextColor, landingAccentColor, landingButtonVariant,
    landingScale, landingViewMode
  }), [apps, activeAppId, theme, globalDarkMode, chromeBgColor, chromeAccentColor, sidebarExpanded, zoomLevel, wallpaperUrl, wallpaperOpacity, wallpaperColor, wallpaperBlur, uiDensity, sidebarPosition, wallpaperFit, landingTitle, landingSubtitle, landingButtonText, landingPosition, showLandingSubtitle, landingFontFamily, landingIsItalic, landingFontWeight, landingTextColor, landingAccentColor, landingButtonVariant, landingScale, landingViewMode]);

  useEffect(() => {
    localStorage.setItem('pocketweb_workspace_state', JSON.stringify(getCurrentState()));
  }, [getCurrentState]);

  useEffect(() => {
    if (wallpaperUrl !== displayWallpaperUrl) {
      setNextWallpaperUrl(wallpaperUrl);
      setIsCrossFading(true);
      setTimeout(() => {
        setDisplayWallpaperUrl(wallpaperUrl);
        setNextWallpaperUrl(null);
        setIsCrossFading(false);
      }, 800);
    }
  }, [wallpaperUrl, displayWallpaperUrl]);

  const saveNamedPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: UserPreset = {
      id: generateId(),
      name: newPresetName.trim(),
      state: getCurrentState(),
      updatedAt: Date.now()
    };
    const updated = [...userPresets, newPreset];
    setUserPresets(updated);
    localStorage.setItem('pocketweb_user_presets', JSON.stringify(updated));
    setNewPresetName('');
  };

  const updateWorkspace = (id: string) => {
    const updated = userPresets.map(p => p.id === id ? { ...p, state: getCurrentState(), updatedAt: Date.now() } : p);
    setUserPresets(updated);
    localStorage.setItem('pocketweb_user_presets', JSON.stringify(updated));
    alert("Workspace Synced to Disk.");
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Purge this workspace?")) {
      const updated = userPresets.filter(p => p.id !== id);
      setUserPresets(updated);
      localStorage.setItem('pocketweb_user_presets', JSON.stringify(updated));
    }
  };

  const applyState = (data: AppState) => {
    setApps(data.apps);
    setActiveAppId(data.activeAppId);
    setTheme(data.theme);
    setGlobalDarkMode(data.globalDarkMode);
    setChromeBgColor(data.chromeBgColor);
    setChromeAccentColor(data.chromeAccentColor);
    setSidebarExpanded(data.sidebarExpanded);
    setZoomLevel(data.zoomLevel);
    setWallpaperUrl(data.wallpaperUrl);
    setWallpaperOpacity(data.wallpaperOpacity);
    setWallpaperBlur(data.wallpaperBlur);
    setWallpaperColor(data.wallpaperColor || '#0f172a');
    setLandingTitle(data.landingTitle);
    setLandingAccentColor(data.landingAccentColor);
    if (data.landingViewMode) setLandingViewMode(data.landingViewMode);
  };

  const saveSnapshot = () => {
    const state = getCurrentState();
    localStorage.setItem('pocketweb_snapshot', JSON.stringify(state));
    setHasSnapshot(true);
    alert("System Snapshot Compressed & Archived.");
  };

  const loadSnapshot = () => {
    const saved = localStorage.getItem('pocketweb_snapshot');
    if (saved) {
      const data: AppState = JSON.parse(saved);
      applyState(data);
      alert("Snapshot Decompressed. Re-Initializing Matrix...");
    }
  };

  const deleteSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Permanently wipe the archived snapshot?")) {
      localStorage.removeItem('pocketweb_snapshot');
      setHasSnapshot(false);
    }
  };

  const factoryReset = () => {
    if (window.confirm("DANGER: This will wipe all apps, custom themes, presets, and local configuration. Reset to Kernel Factory Defaults?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const startAppLoad = (id: string) => {
    setAppStatuses(prev => ({ ...prev, [id]: 'loading' }));
    if (loadTimeoutRef.current[id]) clearTimeout(loadTimeoutRef.current[id]);
    loadTimeoutRef.current[id] = setTimeout(() => {
      setAppStatuses(prev => ({ ...prev, [id]: prev[id] === 'loading' ? 'error' : prev[id] }));
    }, 12000);
  };

  const onAppLoad = (id: string) => {
    if (loadTimeoutRef.current[id]) clearTimeout(loadTimeoutRef.current[id]);
    setAppStatuses(prev => ({ ...prev, [id]: 'success' }));
  };

  const retryApp = (id: string) => {
    setAppRetryKeys(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    startAppLoad(id);
  };

  const addApp = (app: WebApp) => {
    setApps([...apps, app]);
    setActiveAppId(app.id);
    setIsAddModalOpen(false);
  };

  const removeApp = (id: string) => {
    const filtered = apps.filter(a => a.id !== id);
    setApps(filtered);
    if (activeAppId === id) setActiveAppId(filtered.length > 0 ? filtered[0].id : null);
  };

  const saveLandingPreset = () => {
    if (!newLandingPresetName.trim()) return;
    const newPreset: LandingPreset = {
      id: generateId(),
      name: newLandingPresetName.trim(),
      config: { 
        landingTitle, 
        landingSubtitle, 
        landingButtonText, 
        landingPosition, 
        showLandingSubtitle, 
        landingFontFamily, 
        landingIsItalic, 
        landingFontWeight, 
        landingTextColor, 
        landingAccentColor, 
        landingButtonVariant, 
        landingScale 
      }
    };
    const updated = [...landingPresets, newPreset];
    setLandingPresets(updated);
    localStorage.setItem('pocketweb_landing_presets', JSON.stringify(updated));
    setNewLandingPresetName('');
  };

  const applyLandingPreset = (preset: LandingPreset) => {
    const c = preset.config;
    setLandingTitle(c.landingTitle);
    setLandingSubtitle(c.landingSubtitle);
    setLandingButtonText(c.landingButtonText);
    setLandingPosition(c.landingPosition);
    setShowLandingSubtitle(c.showLandingSubtitle);
    setLandingFontFamily(c.landingFontFamily);
    setLandingIsItalic(c.landingIsItalic);
    setLandingFontWeight(c.landingFontWeight);
    setLandingTextColor(c.landingTextColor);
    setLandingAccentColor(c.landingAccentColor);
    setLandingButtonVariant(c.landingButtonVariant);
    setLandingScale(c.landingScale);
  };

  const deleteLandingPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete style preset?")) {
      const updated = landingPresets.filter(p => p.id !== id);
      setLandingPresets(updated);
      localStorage.setItem('pocketweb_landing_presets', JSON.stringify(updated));
    }
  };

  const activeApp = apps.find(a => a.id === activeAppId);
  const densityClasses = uiDensity === 'compact' ? 'p-1.5' : 'p-3';
  const iconSize = uiDensity === 'compact' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className={`flex h-screen w-full transition-all duration-500 overflow-hidden ${sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`} style={{ backgroundColor: chromeBg, color: chromeText }}>
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 relative z-20 ${sidebarPosition === 'left' ? 'border-r' : 'border-l'} ${sidebarExpanded ? 'w-64' : 'w-24'}`} style={{ backgroundColor: chromeBg, borderColor: chromeBorder }}>
        <div className="p-6 flex items-center justify-between border-b h-20 flex-shrink-0" style={{ borderColor: chromeBorder }}>
          {sidebarExpanded && <span className="font-black text-2xl tracking-tighter uppercase italic">PocketWeb</span>}
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)} className="p-2 rounded-xl transition-transform active:scale-90 hover:bg-white/10 outline-none">
            {sidebarExpanded ? (sidebarPosition === 'left' ? <ChevronLeft /> : <ChevronRight />) : (sidebarPosition === 'left' ? <ChevronRight /> : <ChevronLeft />)}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-5 space-y-1.5 px-3 custom-scrollbar">
          {apps.map((app) => (
            <div key={app.id} role="button" onClick={() => setActiveAppId(app.id)} className={`group flex items-center rounded-2xl cursor-pointer transition-all ${densityClasses} ${activeAppId === app.id ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`} style={{ borderLeft: activeAppId === app.id && sidebarPosition === 'left' ? `5px solid ${chromeAccent}` : 'none', borderRight: activeAppId === app.id && sidebarPosition === 'right' ? `5px solid ${chromeAccent}` : 'none' }}>
              <img src={getFaviconUrl(app.url)} alt="" className={`${iconSize} rounded-xl flex-shrink-0`} />
              {sidebarExpanded && (
                <div className="ml-4 flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate text-sm font-black uppercase opacity-80">{app.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeApp(app.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={14} /></button>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setIsAddModalOpen(true)} className={`w-full flex items-center ${densityClasses} rounded-2xl border border-dashed mt-8 group transition-all hover:bg-white/10 border-white/20`}>
            <Plus size={sidebarExpanded ? 20 : 28} className={`${sidebarExpanded ? 'mr-4' : 'mx-auto'}`} />
            {sidebarExpanded && <span className="text-xs font-black uppercase tracking-widest opacity-40">Add Tool</span>}
          </button>
        </nav>
        <div className="p-4 border-t bg-black/10 flex-shrink-0 space-y-2" style={{ borderColor: chromeBorder }}>
          <button onClick={() => setGlobalDarkMode(!globalDarkMode)} className="w-full flex items-center p-3 rounded-2xl transition-all group hover:bg-white/10 outline-none">
            {globalDarkMode ? <Sun size={24} className={sidebarExpanded ? 'mr-4' : 'mx-auto'} /> : <Moon size={24} className={sidebarExpanded ? 'mr-4' : 'mx-auto'} />}
            {sidebarExpanded && <span className="text-xs font-black uppercase">{globalDarkMode ? "Daylight" : "Nocturnal"}</span>}
          </button>
          <button onClick={() => { setPrefActiveTab('dashboard'); setIsThemeModalOpen(true); }} className="w-full flex items-center p-3 rounded-2xl transition-all hover:bg-white/10 outline-none">
            <Settings size={24} className={sidebarExpanded ? 'mr-4' : 'mx-auto'} />
            {sidebarExpanded && <span className="text-xs font-black uppercase">Preferences</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full" style={{ backgroundColor: workspaceBg }}>
        <div className="fixed inset-0 z-0 bg-black pointer-events-none" style={{ backgroundColor: wallpaperColor }}>
           <div className={`absolute inset-0 w-full h-full transition-all duration-1000 ${isCrossFading ? 'opacity-0 scale-105' : ''}`}
            style={{ opacity: wallpaperOpacity / 100, filter: `blur(${wallpaperBlur}px)` }}>
            <img src={displayWallpaperUrl} className={`absolute inset-0 w-full h-full object-${wallpaperFit}`} alt="" />
          </div>
        </div>

        {activeApp ? (
          <>
            <div className="flex items-center justify-between px-6 py-2 border-b z-10 h-16 md:h-20 shadow-2xl flex-shrink-0" style={{ backgroundColor: chromeBg + 'e0', backdropFilter: 'blur(40px)', borderColor: chromeBorder }}>
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsMobileSidebarOpen(true)} className="p-3 md:hidden rounded-2xl bg-white/10"><Menu size={24} /></button>
                <div className="p-2 bg-black/20 rounded-xl"><img src={getFaviconUrl(activeApp.url)} className="w-8 h-8 rounded-lg" alt="" /></div>
                <span className="font-black text-lg md:text-xl tracking-tighter uppercase italic">{activeApp.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setActiveAppId(null)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10"><LayoutGrid size={20} /></button>
                <button onClick={() => retryApp(activeApp.id)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10"><RefreshCw size={20} /></button>
                <button onClick={() => window.open(activeApp.url, '_blank')} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10"><ExternalLink size={20} /></button>
              </div>
            </div>
            <div className="flex-1 relative z-0">
              {appStatuses[activeApp.id] === 'loading' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in z-10">
                  <Loader2 size={64} className="animate-spin text-blue-400 opacity-80" />
                </div>
              )}
              <iframe key={`${activeApp.id}-${appRetryKeys[activeApp.id] || 0}`} src={activeApp.url} onLoad={() => onAppLoad(activeApp.id)} className="w-full h-full border-none shadow-inner bg-white/5" style={{ transform: `scale(${zoomLevel/100})`, transformOrigin: '0 0', width: `${10000/zoomLevel}%`, height: `${10000/zoomLevel}%`, visibility: appStatuses[activeApp.id] === 'success' ? 'visible' : 'hidden' }} />
            </div>
          </>
        ) : (
          <div className={`flex-1 flex flex-col p-6 md:p-12 relative z-10 overflow-y-auto custom-scrollbar ${landingContainerClasses}`}>
            {apps.length > 0 && (
              <div className="absolute top-10 right-10 flex bg-black/20 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 z-50">
                <button onClick={() => setLandingViewMode('hero')} className={`p-3 rounded-xl ${landingViewMode === 'hero' ? 'bg-white text-black' : 'text-white/40'}`}><Layout size={20}/></button>
                <button onClick={() => setLandingViewMode('gallery')} className={`p-3 rounded-xl ${landingViewMode === 'gallery' ? 'bg-white text-black' : 'text-white/40'}`}><Grid size={20}/></button>
              </div>
            )}

            {landingViewMode === 'hero' || apps.length === 0 ? (
               <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-1000 flex flex-col items-inherit" style={{ transform: `scale(${landingScale / 100})`, transformOrigin: landingTransformOrigin }}>
                <div className={`${landingBorderClasses}`} style={{ borderColor: actualLandingAccentColor + '40' }}>
                  <h1 className={`text-4xl md:text-7xl tracking-tighter uppercase leading-[0.85] opacity-90 ${fontStack} ${fontWeightClass} ${landingIsItalic ? 'italic' : ''}`} style={{ color: actualLandingTextColor }}>{landingTitle}</h1>
                  {showLandingSubtitle && <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em] mt-3" style={{ color: actualLandingTextColor }}>{landingSubtitle}</p>}
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className={`px-10 py-6 rounded-3xl font-black text-xl transition-all uppercase tracking-widest flex items-center space-x-4 max-w-fit ${landingButtonVariant === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20' : ''}`} style={{ backgroundColor: landingButtonVariant === 'glass' ? undefined : actualLandingAccentColor, color: landingButtonVariant === 'glass' ? actualLandingTextColor : (globalDarkMode ? '#000' : '#fff') }}>
                  <Plus size={20} /><span>{landingButtonText}</span>
                </button>
              </div>
            ) : (
              <div className="w-full animate-in fade-in duration-700 pb-20">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic opacity-80 mb-12">Registry Nodes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {apps.map((app) => (
                    <div key={app.id} onClick={() => setActiveAppId(app.id)} className="group relative aspect-video rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden cursor-pointer hover:bg-white/10 hover:scale-[1.02] transition-all">
                      <div className="flex items-start justify-between relative z-10">
                        <div className="p-4 rounded-3xl bg-black/20"><img src={getFaviconUrl(app.url)} className="w-10 h-10 rounded-xl" alt="" /></div>
                        <button onClick={(e) => { e.stopPropagation(); removeApp(app.id); }} className="p-3 rounded-2xl hover:bg-red-500 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"><X size={18} /></button>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tighter truncate">{app.name}</h3>
                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest truncate">{app.url}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setIsAddModalOpen(true)} className="aspect-video rounded-[2.5rem] border-2 border-dashed border-white/10 hover:bg-white/5 transition-all flex flex-col items-center justify-center space-y-4 text-white/20"><Plus size={32} /><span className="text-[10px] font-black uppercase tracking-widest">Inject Node</span></button>
                </div>

                {userPresets.length > 0 && (
                  <div className="mt-20">
                    <h2 className="text-2xl font-black uppercase tracking-tighter opacity-40 mb-8">Archived Workspaces</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userPresets.map(preset => (
                        <div key={preset.id} onClick={() => applyState(preset.state)} className="group p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex justify-between items-center">
                          <div className="flex items-center space-x-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"><Briefcase size={20} /></div>
                            <div className="flex flex-col">
                              <span className="font-black uppercase text-sm tracking-widest">{preset.name}</span>
                              <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{preset.state.apps.length} Nodes // v{new Date(preset.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Preferences Modal */}
      <Modal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} title={prefActiveTab === 'dashboard' ? "Control Center" : prefActiveTab} chromeBg={chromeBg} chromeText={chromeText} chromeBorder={chromeBorder} showBack={prefActiveTab !== 'dashboard'} onBack={() => setPrefActiveTab('dashboard')}>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {prefActiveTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'workspaces', label: 'Workspaces', desc: 'Manage saved sessions', icon: Briefcase, color: 'emerald' },
                { id: 'interface', label: 'Interface', desc: 'Density & Dock', icon: Layout, color: 'blue' },
                { id: 'theme', label: 'Theme & UI', desc: 'Colors & Styles', icon: Palette, color: 'pink' },
                { id: 'landing', label: 'Home Hub', desc: 'Dashboard styling', icon: Terminal, color: 'amber' },
                { id: 'atmosphere', label: 'Atmosphere', desc: 'Visual rendering', icon: Wind, color: 'indigo' },
                { id: 'archive', label: 'System', desc: 'Archiving & Core', icon: Database, color: 'slate' },
                { id: 'about', label: 'About PocketWeb', desc: 'Metadata & System Kernel Info', icon: Info, color: 'slate' }
              ].map(item => (
                <button key={item.id} onClick={() => setPrefActiveTab(item.id as PrefTab)} className="group flex flex-col p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left space-y-4">
                  <div className={`p-4 rounded-2xl bg-${item.color}-500/10 text-${item.color}-400 group-hover:bg-${item.color}-500 group-hover:text-white transition-all`}><item.icon size={24} /></div>
                  <div className="space-y-1">
                    <span className="block font-black uppercase text-sm tracking-widest">{item.label}</span>
                    <span className="block text-[9px] font-bold opacity-30 uppercase tracking-widest">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {prefActiveTab === 'workspaces' && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
               <section className="p-8 rounded-[2.5rem] border bg-black/10 border-white/5 space-y-6">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Commit New Session</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="WORKSPACE NAME..." value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} className="flex-1 px-6 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none font-black text-[10px] tracking-widest" />
                  <button onClick={saveNamedPreset} disabled={!newPresetName.trim()} className="px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl" style={{ backgroundColor: chromeAccent, color: globalDarkMode ? '#000' : '#fff' }}>Archive</button>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-3">
                {userPresets.map(preset => (
                  <div key={preset.id} className="group flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Briefcase size={20} className="opacity-40" /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">{preset.name}</span>
                        <span className="text-[8px] font-bold opacity-20 uppercase tracking-widest">{preset.state.apps.length} Active Nodes // Updated {new Date(preset.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => applyState(preset.state)} className="px-4 py-2 rounded-xl bg-green-500/10 text-green-500 font-black uppercase text-[8px] tracking-widest hover:bg-green-500 hover:text-white transition-all">Load</button>
                      <button onClick={() => updateWorkspace(preset.id)} className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 font-black uppercase text-[8px] tracking-widest hover:bg-blue-500 hover:text-white transition-all">Sync</button>
                      <button onClick={(e) => deletePreset(preset.id, e)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prefActiveTab === 'interface' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <section className="p-8 rounded-[2.5rem] border bg-black/10 border-white/5 space-y-6">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Interface Metrics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Density Profile</label>
                    <div className="flex p-1.5 rounded-2xl border bg-black/20 border-white/5">
                      {(['comfortable', 'compact'] as const).map(d => (
                        <button key={d} onClick={() => setUiDensity(d)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${uiDensity === d ? 'bg-white text-black shadow-xl' : 'opacity-40 hover:opacity-100'}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Dock Orientation</label>
                    <div className="flex p-1.5 rounded-2xl border bg-black/20 border-white/5">
                      {(['left', 'right'] as const).map(p => (
                        <button key={p} onClick={() => setSidebarPosition(p)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sidebarPosition === p ? 'bg-white text-black shadow-xl' : 'opacity-40 hover:opacity-100'}`}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-8 rounded-[2.5rem] border bg-black/10 border-white/5 space-y-6">
                <div className="flex justify-between items-center"><label className="text-[9px] font-black uppercase tracking-widest opacity-30">Global Instance Zoom</label><span className="font-mono text-xs">{zoomLevel}%</span></div>
                <input type="range" min="50" max="200" step="5" value={zoomLevel} onChange={(e) => setZoomLevel(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10" style={{ accentColor: chromeAccent }} />
              </section>
            </div>
          )}

          {prefActiveTab === 'theme' && (
            <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
              <section className="p-8 rounded-[2.5rem] border space-y-8 bg-black/10 border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Luminance Profile</p>
                  <button onClick={() => { setChromeBgColor(null); setChromeAccentColor(null); }} className="text-[8px] font-black uppercase opacity-40 hover:opacity-100 flex items-center space-x-2"><RotateCcw size={10} /><span>Reset</span></button>
                </div>
                <div className="flex p-2 rounded-3xl border bg-black/20 border-white/5">
                  <button onClick={() => setGlobalDarkMode(false)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 ${!globalDarkMode ? 'bg-blue-500 text-white shadow-xl' : 'opacity-40'}`}><Sun size={14} /><span>Daylight</span></button>
                  <button onClick={() => setGlobalDarkMode(true)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 ${globalDarkMode ? 'bg-white text-black shadow-xl' : 'opacity-40'}`}><Moon size={14} /><span>Nocturnal</span></button>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase opacity-30 tracking-widest">Preset Clusters</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CHROME_PRESET_COLORS.map(c => (
                      <button key={c.name} onClick={() => { setChromeBgColor(c.bg); setChromeAccentColor(c.accent); }} className={`p-4 rounded-2xl border transition-all flex items-center space-x-3 ${chromeBg === c.bg ? 'border-white/40 bg-white/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                        <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: c.accent }} />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block">Main Base</label>
                    <input type="color" value={chromeBg} onChange={(e) => setChromeBgColor(e.target.value)} className="w-12 h-12 rounded-2xl bg-transparent border-none cursor-pointer overflow-hidden shadow-2xl" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block">Main Accent</label>
                    <input type="color" value={chromeAccent} onChange={(e) => setChromeAccentColor(e.target.value)} className="w-12 h-12 rounded-2xl bg-transparent border-none cursor-pointer overflow-hidden shadow-2xl" />
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Backdrop Synthesis</p>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Backdrop Color</label>
                    <div className="flex items-center space-x-4">
                      <input type="color" value={wallpaperColor} onChange={(e) => setWallpaperColor(e.target.value)} className="w-12 h-12 rounded-2xl bg-transparent border-none cursor-pointer overflow-hidden shadow-2xl" />
                      <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{wallpaperColor}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {prefActiveTab === 'landing' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500 pb-20">
              <section className="p-8 rounded-[2.5rem] border space-y-6 bg-black/10 border-white/5">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Copy Synthesis</p>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Main Title String</label>
                  <textarea value={landingTitle} onChange={(e) => setLandingTitle(e.target.value)} className="w-full px-6 py-5 rounded-3xl border outline-none font-black text-sm uppercase resize-none h-24 bg-black/20 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Button Call-to-Action</label>
                    <input type="text" value={landingButtonText} onChange={(e) => setLandingButtonText(e.target.value)} className="w-full px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Secondary Subtitle</label>
                    <input type="text" value={landingSubtitle} onChange={(e) => setLandingSubtitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest bg-black/20 border-white/10" />
                  </div>
                </div>
              </section>

              <section className="p-8 rounded-[2.5rem] border space-y-8 bg-black/10 border-white/5">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Typography & Layout</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <p className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Font Profile</p>
                    <div className="flex flex-wrap gap-3">
                      {(['sans', 'serif', 'mono'] as const).map(f => (
                        <button key={f} onClick={() => setLandingFontFamily(f)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${landingFontFamily === f ? 'bg-white text-black scale-105 shadow-xl' : 'bg-white/5 opacity-40'}`}>{f}</button>
                      ))}
                      <button onClick={() => setLandingIsItalic(!landingIsItalic)} className={`p-4 rounded-2xl transition-all ${landingIsItalic ? 'bg-blue-500 text-white shadow-xl' : 'bg-white/5 opacity-40'}`}><Italic size={18} /></button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Button Variant</label>
                    <div className="flex p-1.5 rounded-2xl border bg-black/20 border-white/10">
                      {(['heavy', 'flat', 'glass'] as const).map(v => (
                        <button key={v} onClick={() => setLandingButtonVariant(v)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${landingButtonVariant === v ? 'bg-white text-black shadow-xl' : 'opacity-40'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center"><label className="text-[9px] font-black uppercase tracking-widest opacity-30">Matrix Scale</label><span className="font-mono text-xs">{landingScale}%</span></div>
                  <input type="range" min="50" max="150" value={landingScale} onChange={(e) => setLandingScale(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10" style={{ accentColor: chromeAccent }} />
                </div>
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-[9px] font-black uppercase opacity-30 tracking-widest block ml-2">Hub Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
                      <button key={pos} onClick={() => setLandingPosition(pos)} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${landingPosition === pos ? 'bg-white text-black border-white' : 'border-white/10 opacity-40 hover:opacity-100'}`}>{pos.replace('-', ' ')}</button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="p-8 rounded-[2.5rem] border space-y-6 bg-black/10 border-white/5">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Styles Archive</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="STYLE NAME..." value={newLandingPresetName} onChange={(e) => setNewLandingPresetName(e.target.value)} className="flex-1 px-6 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none font-black text-[10px] tracking-widest" />
                  <button onClick={saveLandingPreset} disabled={!newLandingPresetName.trim()} className="px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl" style={{ backgroundColor: chromeAccent }}>Save</button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {allLandingPresets.map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest">{preset.name} {preset.id.startsWith('system') && <span className="opacity-30 italic">(System)</span>}</span>
                      <div className="flex gap-2">
                        <button onClick={() => applyLandingPreset(preset)} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Apply</button>
                        {!preset.id.startsWith('system') && <button onClick={(e) => deleteLandingPreset(preset.id, e)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {prefActiveTab === 'atmosphere' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <section className="space-y-4">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Backgrounds</p>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_WALLPAPERS.map(wp => (
                    <button key={wp.id} onClick={() => setWallpaperUrl(wp.url)} className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all ${wallpaperUrl === wp.url ? 'scale-110 z-10 shadow-xl border-white' : 'opacity-30 border-transparent hover:opacity-100'}`}><img src={wp.url} className="w-full h-full object-cover" alt="" /></button>
                  ))}
                </div>
              </section>
              <section className="p-8 rounded-[2.5rem] border space-y-6 bg-black/10 border-white/5 shadow-inner">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Manual Link Synthesis</p>
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setWallpaperUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} id="wallpaper-upload" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center p-6 rounded-3xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all space-x-4"><Upload size={24} className="opacity-40" /><span className="text-[10px] font-black uppercase tracking-widest">Local Matrix Import</span></button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="HTTPS://IMAGE.URL" value={customWallpaperInput} onChange={(e) => setCustomWallpaperInput(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-6 py-4 outline-none font-mono text-[10px] tracking-widest uppercase" />
                    <button onClick={() => customWallpaperInput && setWallpaperUrl(customWallpaperInput)} className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"><ChevronRight size={18} /></button>
                  </div>
                </div>
              </section>
              <section className="p-8 rounded-[2.5rem] border space-y-8 bg-black/10 border-white/5">
                <p className="text-[10px] font-black uppercase opacity-30 tracking-widest">Atmospheric Filters</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[9px] font-black uppercase tracking-widest opacity-30">Matrix Blur</label><span className="font-mono text-xs">{wallpaperBlur}PX</span></div>
                    <input type="range" min="0" max="40" value={wallpaperBlur} onChange={(e) => setWallpaperBlur(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10" style={{ accentColor: chromeAccent }} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><label className="text-[9px] font-black uppercase tracking-widest opacity-30">Environmental Alpha</label><span className="font-mono text-xs">{wallpaperOpacity}%</span></div>
                    <input type="range" min="0" max="100" value={wallpaperOpacity} onChange={(e) => setWallpaperOpacity(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10" style={{ accentColor: chromeAccent }} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {prefActiveTab === 'archive' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <section className="space-y-4">
                <div className="flex items-center space-x-3 opacity-30 mb-2"><Database size={16} /><span className="text-[10px] font-black uppercase tracking-widest">System Snapshot</span></div>
                <button onClick={saveSnapshot} className="w-full flex items-center justify-between p-8 rounded-[2.5rem] border bg-blue-500/10 border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all group">
                  <div className="flex items-center space-x-6"><Save size={28} className="group-hover:scale-110 transition-transform" /><div><span className="block font-black uppercase tracking-widest text-sm">Commit New State</span><span className="block text-[9px] font-bold opacity-40 uppercase mt-1">Archival quick-save of current dataset</span></div></div>
                </button>
                {hasSnapshot && (
                  <div className="flex gap-4">
                    <button onClick={loadSnapshot} className="flex-1 flex items-center justify-center space-x-4 p-8 rounded-[2.5rem] border border-green-500/20 bg-green-500/10 hover:bg-green-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"><RotateCcw size={18} /><span>Re-Initialize State</span></button>
                    <button onClick={deleteSnapshot} className="px-8 rounded-[2.5rem] border border-red-500/20 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all text-red-500 hover:text-white"><Trash2 size={24} /></button>
                  </div>
                )}
              </section>
              <section className="pt-8 border-t border-white/5 space-y-6">
                 <div className="flex items-center space-x-3 opacity-30 mb-2"><History size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Maintenance</span></div>
                 <button onClick={factoryReset} className="w-full p-8 rounded-[2.5rem] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-4 font-black uppercase text-[10px] tracking-widest"><Trash2 size={20} /><span>Wipe Kernel & Reset</span></button>
              </section>
            </div>
          )}

          {prefActiveTab === 'about' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500 text-center pb-20">
              <section className="py-10 flex flex-col items-center">
                <div className="w-32 h-32 rounded-[3rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl mb-8"><Cpu size={64} className="opacity-20" /></div>
                <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">PocketWeb</h1>
                <p className="text-[12px] font-bold opacity-30 uppercase tracking-[0.8em] mt-4">Professional Workspace Engine</p>
                <div className="flex space-x-4 mt-8">
                   <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Kernel v3.1.2</span></div>
                   <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2"><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Stable Build</span></div>
                </div>
              </section>
              <section className="p-10 rounded-[2.5rem] border bg-black/10 border-white/5">
                <p className="text-sm font-medium leading-relaxed opacity-60">PocketWeb is a state-of-the-art workspace orchestrator built for high-throughput professional workflows. Featuring atmospheric rendering and persistent data snapshots.</p>
                <div className="flex justify-center space-x-8 mt-8 pt-8 border-t border-white/5">
                  <a href="#" className="flex items-center space-x-3 group"><Github size={20} className="opacity-30 group-hover:opacity-100 transition-opacity" /><span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100">Manifest</span></a>
                  <a href="#" className="flex items-center space-x-3 group"><Globe size={20} className="opacity-30 group-hover:opacity-100 transition-opacity" /><span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100">Portal</span></a>
                </div>
              </section>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Assemble Tool" chromeBg={chromeBg} chromeText={chromeText} chromeBorder={chromeBorder}>
        <div className="p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <form onSubmit={(e) => { e.preventDefault(); if (newAppName && newAppUrl) addApp({ id: generateId(), name: newAppName, url: formatUrl(newAppUrl) }); }} className="w-full max-w-md mx-auto space-y-6 mb-12">
            <input type="text" placeholder="TAG NAME" className="w-full px-8 py-6 rounded-[2rem] bg-black/40 border border-white/10 outline-none text-sm font-black uppercase tracking-widest" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} required />
            <input type="text" placeholder="HTTPS://..." className="w-full px-8 py-6 rounded-[2rem] bg-black/40 border border-white/10 outline-none text-sm font-black uppercase tracking-widest" value={newAppUrl} onChange={(e) => setNewAppUrl(e.target.value)} required />
            <button type="submit" className="w-full py-7 rounded-[2.5rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-[0.2em]" style={{ backgroundColor: chromeAccent, color: globalDarkMode ? '#000' : '#fff' }}>Deploy Instance</button>
          </form>
          
          <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-center text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-8">Quick Inject Protocols</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {PRESET_APPS.map(app => (
                <button key={app.id} onClick={() => addApp({...app, id: generateId()})} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:scale-105 transition-all group">
                  <img src={getFaviconUrl(app.url)} className="w-10 h-10 mb-4 rounded-xl shadow-lg group-hover:shadow-2xl transition-all" alt={app.name} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-xl md:hidden transition-opacity duration-500 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileSidebarOpen(false)}>
        <div className="p-10 h-full flex flex-col justify-center space-y-6">
           <div className="text-5xl font-black italic tracking-tighter uppercase text-center mb-10 text-white">Registry</div>
           {apps.map(app => (
             <button key={app.id} onClick={() => { setActiveAppId(app.id); setIsMobileSidebarOpen(false); }} className="flex items-center p-8 rounded-[2.5rem] bg-white/10 border border-white/5 space-x-6 text-white"><img src={getFaviconUrl(app.url)} className="w-14 h-14 rounded-2xl" alt="" /><span className="font-black uppercase tracking-widest text-lg">{app.name}</span></button>
           ))}
        </div>
      </div>
    </div>
  );
}