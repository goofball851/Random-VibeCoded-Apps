
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GoogleGenAI, 
  Type, 
} from '@google/genai';
import { 
  Palette, 
  Image as ImageIcon, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Layout, 
  Paintbrush, 
  Plus, 
  Minus, 
  Wand2, 
  Heart, 
  Trash2, 
  Maximize2, 
  Move, 
  ExternalLink, 
  ShieldCheck,
  CircleDashed,
  Sun,
  Moon,
  Pencil,
  Download,
  Upload,
  Zap,
  Shuffle
} from 'lucide-react';

// --- Types & Constants ---

type PaletteRole = 'primary' | 'secondary' | 'outline' | 'background' | 'accent';

interface ColorInfo {
  hex: string;
  name: string;
  role: string;
  description: string;
}

interface PatternConfig {
  type: keyof typeof PATTERNS;
  scale: number;
  elementSize: number;
  name: string;
  description: string;
}

interface PaletteData {
  id: string;
  title: string;
  concept: string;
  primary: ColorInfo;
  secondary: ColorInfo;
  outline: ColorInfo;
  background: ColorInfo;
  accent: ColorInfo;
  timestamp: number;
  patternConfig?: PatternConfig;
  appIconConfig?: { bg: PaletteRole; icon: PaletteRole };
  profileConfig?: { bg: PaletteRole; s1: PaletteRole; s2: PaletteRole; avatar: PaletteRole; accent: PaletteRole };
}

// --- Utils ---

const getContrastYIQ = (hexcolor: string) => {
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? 'black' : 'white';
};

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (c1: string, c2: string) => {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// --- SVG Patterns ---

const PATTERNS = {
  dots: (p: string, s: string, a: string, o: string, b: string, scale: number, elSize: number) => {
    const size = 60 * scale;
    const baseR = 4 * elSize;
    return (
      <pattern id="pattern-dots" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <circle cx={size * 0.25} cy={size * 0.25} r={baseR * 1.5} fill={p} opacity="0.8" />
        <circle cx={size * 0.75} cy={size * 0.25} r={baseR} fill={s} opacity="0.6" />
        <circle cx={size * 0.25} cy={size * 0.75} r={baseR * 0.8} fill={a} opacity="0.5" />
        <circle cx={size * 0.75} cy={size * 0.75} r={baseR * 1.2} fill={o} opacity="0.3" />
      </pattern>
    );
  },
  grid: (p: string, s: string, a: string, o: string, b: string, scale: number, elSize: number) => {
    const size = 80 * scale;
    const stroke = 1 * elSize;
    return (
      <pattern id="pattern-grid" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke={o} strokeWidth={stroke} opacity="0.4" />
        <rect x={size * 0.1} y={size * 0.1} width={10 * elSize} height={10 * elSize} fill={p} opacity="0.5" rx={2 * elSize} />
        <rect x={size * 0.6} y={size * 0.6} width={8 * elSize} height={8 * elSize} fill={s} opacity="0.4" rx={4 * elSize} />
        <circle cx={size * 0.8} cy={size * 0.2} r={3 * elSize} fill={a} />
      </pattern>
    );
  },
  waves: (p: string, s: string, a: string, o: string, b: string, scale: number, elSize: number) => {
    const w = 100 * scale;
    const h = 50 * scale;
    const sw = 1.5 * elSize;
    return (
      <pattern id="pattern-waves" x="0" y="0" width={w} height={h} patternUnits="userSpaceOnUse">
        <path d={`M0 ${h * 0.2} Q ${w * 0.25} 0 ${w * 0.5} ${h * 0.2} T ${w} ${h * 0.2}`} fill="none" stroke={p} strokeWidth={sw * 2} opacity="0.4" />
        <path d={`M0 ${h * 0.5} Q ${w * 0.25} ${h * 0.3} ${w * 0.5} ${h * 0.5} T ${w} ${h * 0.5}`} fill="none" stroke={s} strokeWidth={sw * 1.5} opacity="0.3" />
        <path d={`M0 ${h * 0.8} Q ${w * 0.25} ${h * 0.6} ${w * 0.5} ${h * 0.8} T ${w} ${h * 0.8}`} fill="none" stroke={a} strokeWidth={sw} opacity="0.2" />
      </pattern>
    );
  },
  circuit: (p: string, s: string, a: string, o: string, b: string, scale: number, elSize: number) => {
    const size = 120 * scale;
    const f = size / 100;
    const stroke = 1 * elSize;
    return (
      <pattern id="pattern-circuit" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <path d={`M0 ${50 * f} L${20 * f} ${50 * f} L${30 * f} ${40 * f} L${50 * f} ${40 * f} L${60 * f} ${50 * f} L${100 * f} ${50 * f}`} fill="none" stroke={o} strokeWidth={stroke} opacity="0.4" />
        <circle cx={20 * f} cy={50 * f} r={4 * elSize} fill={p} />
        <circle cx={60 * f} cy={50 * f} r={3 * elSize} fill={s} />
      </pattern>
    );
  }
};

// --- Shared Components ---

const EditableText = ({ 
  value, 
  onSave, 
  className = "", 
  placeholder = "",
  type = "input"
}: { 
  value: string; 
  onSave: (val: string) => void; 
  className?: string; 
  placeholder?: string;
  type?: "input" | "textarea"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      if (type === 'input') (inputRef.current as HTMLInputElement).select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onSave(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'input') handleBlur();
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: tempValue,
      onChange: (e: any) => setTempValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `bg-zinc-100 dark:bg-zinc-800 border-b-2 border-indigo-500 outline-none w-full p-1 rounded transition-all ${className}`,
      placeholder: placeholder,
    };
    return type === "textarea" ? <textarea {...commonProps} rows={3} /> : <input {...commonProps} />;
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`group cursor-text relative transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded p-1 -m-1 ${className}`}
    >
      {value || <span className="opacity-40 italic">{placeholder}</span>}
      <Pencil size={12} className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity" />
    </div>
  );
};

const ColorCard: React.FC<{ 
  roleKey: PaletteRole;
  color: ColorInfo; 
  onDragStart: (role: PaletteRole) => void;
  onDrop: (role: PaletteRole) => void;
}> = ({ roleKey, color, onDragStart, onDrop }) => {
  const [copied, setCopied] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(color.hex));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ratio = getContrastRatio(color.hex, '#ffffff');
  const contrastLevel = ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'G' : 'FAIL';

  return (
    <div 
      draggable
      onDragStart={() => onDragStart(roleKey)}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { onDrop(roleKey); setIsOver(false); }}
      className={`group relative bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${isOver ? 'border-indigo-500 scale-105 ring-4 ring-indigo-500/10' : 'border-zinc-100 dark:border-zinc-700'} cursor-grab active:cursor-grabbing`}
    >
      <div 
        className="h-24 w-full transition-transform duration-500 group-hover:scale-105 flex items-center justify-center relative shadow-inner" 
        style={{ backgroundColor: color.hex || '#18181B' }}
      >
        <Move size={20} className="text-white opacity-0 group-hover:opacity-40 transition-opacity drop-shadow-md" />
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/20 backdrop-blur-sm text-[8px] font-bold text-white uppercase tracking-tighter">
          {contrastLevel}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{color.role}</span>
          <button 
            onClick={copyToClipboard}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-indigo-500"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
        </div>
        <h4 className="font-bold text-zinc-800 dark:text-zinc-100 truncate text-xs">{color.name}</h4>
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">{color.hex}</p>
      </div>
    </div>
  );
};

const RoleSelector = ({ value, onChange, label }: { value: PaletteRole, onChange: (v: PaletteRole) => void, label: string }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tight">{label}</span>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as PaletteRole)}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] p-1 outline-none appearance-none cursor-pointer hover:border-indigo-500 transition-colors"
    >
      <option value="primary">Primary</option>
      <option value="secondary">Secondary</option>
      <option value="accent">Accent</option>
      <option value="background">Background</option>
      <option value="outline">Outline</option>
    </select>
  </div>
);

const ProfilePreview = ({ palette, config }: { palette: PaletteData, config: NonNullable<PaletteData['profileConfig']> }) => {
  const p = palette[config.avatar].hex;
  const s = palette[config.s1].hex;
  const a = palette[config.accent].hex;
  const o = palette[config.s2].hex;
  const b = palette[config.bg].hex;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center group">
      <div className="absolute inset-0 rounded-[2.5rem] transform rotate-6 scale-95 opacity-20 blur-sm" style={{ backgroundColor: a }} />
      <div className="absolute inset-0 rounded-[2.5rem] transform -rotate-3 scale-100" style={{ backgroundColor: o }} />
      <div className="absolute inset-1 rounded-[2.2rem] shadow-xl overflow-hidden" style={{ backgroundColor: b }}>
        <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full opacity-30 blur-2xl animate-pulse" style={{ backgroundColor: s }} />
        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: p }} />
        <div className="relative w-full h-full flex flex-col items-center justify-end p-2 transition-transform duration-500 group-hover:scale-110">
          <div className="w-12 h-12 rounded-full mb-1 border-2 shadow-lg" style={{ backgroundColor: p, borderColor: s }} />
          <div className="w-20 h-10 rounded-t-[2.5rem] shadow-md" style={{ backgroundColor: s }} />
          <div className="absolute top-4 right-4 w-4 h-4 rounded-full" style={{ backgroundColor: a, opacity: 0.6 }} />
        </div>
      </div>
      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg bg-white dark:bg-zinc-900" style={{ borderColor: o }}>
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: a }}>
          <ShieldCheck size={14} className="text-white" />
        </div>
      </div>
    </div>
  );
};

// --- App Core ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'extract' | 'saved'>('discover');
  const [prompt, setPrompt] = useState('');
  const [baseColor, setBaseColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState<PaletteData | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<PaletteData[]>([]);
  const [draggedRole, setDraggedRole] = useState<PaletteRole | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [extractImage, setExtractImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [patternConfig, setPatternConfig] = useState<PatternConfig>({
    type: 'dots',
    scale: 1,
    elementSize: 1,
    name: 'Concept Pattern',
    description: 'Main visual motif'
  });

  const [appIconConfig, setAppIconConfig] = useState<NonNullable<PaletteData['appIconConfig']>>({ bg: 'primary', icon: 'background' });
  const [profileConfig, setProfileConfig] = useState<NonNullable<PaletteData['profileConfig']>>({ bg: 'background', s1: 'secondary', s2: 'outline', avatar: 'primary', accent: 'accent' });

  useEffect(() => {
    const saved = localStorage.getItem('chromaflow_saved');
    if (saved) setSavedPalettes(JSON.parse(saved));
    const savedTheme = localStorage.getItem('chromaflow_theme');
    const initialTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    setTheme(initialTheme as 'light' | 'dark');
    applyTheme(initialTheme as 'light' | 'dark');
  }, []);

  const applyTheme = (t: 'light' | 'dark') => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#868386'; 
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = ''; 
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('chromaflow_theme', newTheme);
    applyTheme(newTheme);
  };

  const shufflePalette = () => {
    if (!palette) return;
    const roles: PaletteRole[] = ['primary', 'secondary', 'accent', 'outline', 'background'];
    const colors = roles.map(r => palette[r]);
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    const newPalette = { ...palette };
    roles.forEach((role, i) => {
      newPalette[role] = { ...shuffledColors[i], role: role.charAt(0).toUpperCase() + role.slice(1) };
    });
    setPalette(newPalette);
  };

  const generatePalette = async (withPrompt: boolean = false) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are a professional UI/UX designer. Generate a cohesive 5-color palette based on a base anchor color and design logic. 
      CRITICAL: Never use pure black (#000000) or pure white (#FFFFFF). 
      Roles: Primary, Secondary, Outline, Background, Accent.
      Current environment: ${theme} mode. Use sophisticated foundations. Avoid blue-tinted greys unless asked.
      Return JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Anchor Color: ${baseColor}. Logic: ${withPrompt ? prompt : 'Modern and professional'}. Theme: ${theme}. Seed: ${Math.random()}` }] },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              concept: { type: Type.STRING },
              primary: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              secondary: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              outline: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              background: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              accent: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] }
            },
            required: ['title', 'concept', 'primary', 'secondary', 'outline', 'background', 'accent']
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setPalette({ ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() });
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractPaletteFromImage = async () => {
    if (!extractImage) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = extractImage.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: "Analyze this image's DNA and map a professional 5-role design palette. Use the image's most defining hues for primary/accent and a functional neutral for the background. Return JSON schema." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              concept: { type: Type.STRING },
              primary: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              secondary: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              outline: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              background: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] },
              accent: { type: Type.OBJECT, properties: { hex: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['hex', 'name', 'role', 'description'] }
            },
            required: ['title', 'concept', 'primary', 'secondary', 'outline', 'background', 'accent']
          }
        }
      });
      if (response.text) {
        const data = JSON.parse(response.text);
        setPalette({ ...data, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() });
        setActiveTab('discover');
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setExtractImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (role: PaletteRole) => setDraggedRole(role);
  const handleDrop = (targetRole: PaletteRole) => {
    if (!palette || !draggedRole || draggedRole === targetRole) return;
    const newPalette = { ...palette };
    const temp = newPalette[draggedRole];
    newPalette[draggedRole] = { ...newPalette[targetRole], role: draggedRole.charAt(0).toUpperCase() + draggedRole.slice(1) };
    newPalette[targetRole] = { ...temp, role: targetRole.charAt(0).toUpperCase() + targetRole.slice(1) };
    setPalette(newPalette);
    setDraggedRole(null);
  };

  const savePalette = () => {
    if (!palette) return;
    const updated = [palette, ...savedPalettes.filter(p => p.id !== palette.id)].slice(0, 12);
    setSavedPalettes(updated);
    localStorage.setItem('chromaflow_saved', JSON.stringify(updated));
  };

  const deletePalette = (id: string) => {
    const updated = savedPalettes.filter(p => p.id !== id);
    setSavedPalettes(updated);
    localStorage.setItem('chromaflow_saved', JSON.stringify(updated));
  };

  const exportAsImage = () => {
    if (!palette) return;
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = theme === 'dark' ? '#868386' : '#fafafa';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#18181b';
    ctx.font = 'bold 48px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(palette.title, 60, 80);
    ctx.font = '500 16px Plus Jakarta Sans, sans-serif';
    ctx.globalAlpha = 0.5;
    ctx.fillText("BRAND IDENTITY SYSTEM • CHROMAFLOW AI", 60, 115);
    ctx.globalAlpha = 1;

    // App Icon
    const iconX = 60; const iconY = 150; const iconSize = 140;
    ctx.fillStyle = palette[appIconConfig.bg].hex;
    ctx.beginPath(); ctx.roundRect(iconX, iconY, iconSize, iconSize, 40); ctx.fill();
    ctx.fillStyle = palette[appIconConfig.icon].hex;
    ctx.beginPath(); ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/3.5, 0, Math.PI * 2); ctx.fill();

    // Profile Mockup
    const profW = 340; const profH = 140; const profX = size - profW - 60; const profY = 150;
    ctx.fillStyle = palette[profileConfig.bg].hex;
    ctx.beginPath(); ctx.roundRect(profX, profY, profW, profH, 48); ctx.fill();
    ctx.fillStyle = palette[profileConfig.avatar].hex;
    ctx.beginPath(); ctx.arc(profX + 60, profY + 70, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette[profileConfig.s1].hex;
    ctx.fillRect(profX + 120, profY + 45, 160, 14);
    ctx.fillStyle = palette[profileConfig.s2].hex;
    ctx.fillRect(profX + 120, profY + 75, 110, 10);
    ctx.fillStyle = palette[profileConfig.accent].hex;
    ctx.beginPath(); ctx.arc(profX + profW - 40, profY + 40, 12, 0, Math.PI * 2); ctx.fill();

    // Swatches
    const roles: PaletteRole[] = ['primary', 'secondary', 'accent', 'outline', 'background'];
    const swatchWidth = size / roles.length;
    const swatchY = 350; const swatchH = 150;
    roles.forEach((role, i) => {
      ctx.fillStyle = palette[role].hex; ctx.fillRect(i * swatchWidth, swatchY, swatchWidth, swatchH);
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.6; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText(palette[role].hex.toUpperCase(), i * swatchWidth + swatchWidth / 2, swatchY + swatchH - 25); ctx.globalAlpha = 1;
    });

    // Pattern - Full fidelity implementation
    const patternY = 500; const patternHeight = size - 500;
    ctx.fillStyle = palette.background.hex; ctx.fillRect(0, patternY, size, patternHeight);
    const p = palette.primary.hex, s = palette.secondary.hex, a = palette.accent.hex, o = palette.outline.hex;
    const scale = patternConfig.scale * (size / 400), elSize = patternConfig.elementSize * (size / 400);

    ctx.save(); ctx.beginPath(); ctx.rect(0, patternY, size, patternHeight); ctx.clip();
    if (patternConfig.type === 'dots') {
      const step = 60 * scale;
      for (let x = -step; x < size + step; x += step) {
        for (let y = patternY - step; y < patternY + patternHeight + step; y += step) {
          ctx.globalAlpha = 0.8; ctx.fillStyle = p; ctx.beginPath(); ctx.arc(x + step*0.25, y + step*0.25, 4*elSize*1.5, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 0.6; ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x + step*0.75, y + step*0.25, 4*elSize, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 0.5; ctx.fillStyle = a; ctx.beginPath(); ctx.arc(x + step*0.25, y + step*0.75, 4*elSize*0.8, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 0.3; ctx.fillStyle = o; ctx.beginPath(); ctx.arc(x + step*0.75, y + step*0.75, 4*elSize*1.2, 0, Math.PI*2); ctx.fill();
        }
      }
    } else if (patternConfig.type === 'grid') {
      const step = 80 * scale;
      for (let x = -step; x < size + step; x += step) {
        for (let y = patternY - step; y < patternY + patternHeight + step; y += step) {
          ctx.globalAlpha = 0.4; ctx.strokeStyle = o; ctx.lineWidth = elSize; ctx.strokeRect(x, y, step, step);
          ctx.globalAlpha = 0.5; ctx.fillStyle = p; ctx.fillRect(x+step*0.1, y+step*0.1, 10*elSize, 10*elSize);
          ctx.globalAlpha = 0.4; ctx.fillStyle = s; ctx.fillRect(x+step*0.6, y+step*0.6, 8*elSize, 8*elSize);
        }
      }
    } else if (patternConfig.type === 'waves') {
      const w = 100 * scale, h = 50 * scale, sw = 1.5 * elSize;
      for (let x = -w; x < size + w; x += w) {
        for (let y = patternY - h; y < patternY + patternHeight + h; y += h) {
          ctx.globalAlpha = 0.4; ctx.strokeStyle = p; ctx.lineWidth = sw*2; ctx.beginPath(); ctx.moveTo(x, y+h*0.2); ctx.quadraticCurveTo(x+w*0.25, y, x+w*0.5, y+h*0.2); ctx.stroke();
          ctx.globalAlpha = 0.3; ctx.strokeStyle = s; ctx.lineWidth = sw*1.5; ctx.beginPath(); ctx.moveTo(x, y+h*0.5); ctx.quadraticCurveTo(x+w*0.25, y+h*0.3, x+w*0.5, y+h*0.5); ctx.stroke();
        }
      }
    } else if (patternConfig.type === 'circuit') {
       const step = 120 * scale;
       for (let x = -step; x < size + step; x += step) {
         for (let y = patternY - step; y < patternY + patternHeight + step; y += step) {
            ctx.globalAlpha = 0.4; ctx.strokeStyle = o; ctx.lineWidth = elSize; ctx.beginPath(); ctx.moveTo(x, y+step*0.5); ctx.lineTo(x+step*0.2, y+step*0.5); ctx.lineTo(x+step*0.3, y+step*0.4); ctx.stroke();
            ctx.globalAlpha = 0.8; ctx.fillStyle = p; ctx.beginPath(); ctx.arc(x+step*0.2, y+step*0.5, 4*elSize, 0, Math.PI*2); ctx.fill();
         }
       }
    }
    ctx.restore();
    const link = document.createElement('a'); link.download = `ChromaFlow-${palette.title}.png`; link.href = canvas.toDataURL('image/png'); link.click();
  };

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
              <Palette className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">ChromaFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-xl shadow-sm">
              {[{ id: 'discover', icon: Paintbrush, label: 'Studio' }, { id: 'extract', icon: ImageIcon, label: 'Extract' }, { id: 'saved', icon: Heart, label: 'Saved' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-zinc-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500'}`}>
                  <tab.icon size={14} /><span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <button onClick={toggleTheme} className="p-3 bg-white dark:bg-zinc-700 rounded-xl text-zinc-500 hover:text-indigo-500 transition-all border border-zinc-200 dark:border-zinc-600 shadow-sm">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-zinc-800 dark:text-zinc-50 leading-[1.1] tracking-tight">{activeTab === 'discover' ? "Design with logic." : activeTab === 'extract' ? "DNA extraction." : "The vault."}</h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-200 font-medium leading-relaxed">{activeTab === 'discover' ? "Generate cohesive UI systems based on color theory." : activeTab === 'extract' ? "Upload any asset to pull its primary mapping." : "Your collection of high-tier systems."}</p>
            </div>

            {activeTab === 'discover' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-8 bg-white dark:bg-zinc-800 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-xl">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-300">Anchor Color</label>
                      <div className="flex items-center space-x-6">
                        <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-inner border-2 border-zinc-100 dark:border-zinc-700 ring-4 ring-zinc-50 dark:ring-zinc-900/50">
                          <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-3xl font-black font-mono uppercase tracking-tighter dark:text-white">{baseColor}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => generatePalette(false)} disabled={loading} className="group w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-3 transition-all shadow-xl shadow-indigo-500/20">
                      {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Paintbrush size={18} /><span>Generate System</span></>}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <button onClick={() => setShowAI(!showAI)} className="flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-700/50 hover:bg-zinc-200 transition-colors">
                    <div className="flex items-center space-x-3 text-zinc-600 dark:text-zinc-100"><Sparkles size={18} className="text-indigo-500" /><span className="font-black text-[10px] uppercase tracking-widest">Apply Design Prompt</span></div>
                    {showAI ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                  {showAI && (
                    <div className="p-8 bg-white dark:bg-zinc-800 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-xl animate-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. 'Oceanic and calm'..." className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm font-medium focus:border-indigo-500 outline-none min-h-[100px] dark:text-white" />
                        <button onClick={() => generatePalette(true)} disabled={loading} className="w-full bg-zinc-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3">
                          {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Wand2 size={16} /><span>Apply Logic</span></>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'extract' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-8 bg-white dark:bg-zinc-800 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-xl">
                  <div className="space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className="group relative cursor-pointer border-4 border-dashed border-zinc-100 dark:border-zinc-700 rounded-[2rem] p-10 hover:border-indigo-500 transition-all flex flex-col items-center justify-center space-y-4">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      {extractImage ? <img src={extractImage} className="w-full aspect-square rounded-2xl object-cover shadow-2xl ring-4 ring-indigo-500/20" alt="Preview" /> : <><div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400"><Upload size={32} /></div><p className="font-black text-xs uppercase tracking-widest dark:text-white">Upload Asset</p></>}
                    </div>
                    <button onClick={extractPaletteFromImage} disabled={loading || !extractImage} className="group w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-3 transition-all shadow-xl shadow-indigo-500/20">
                      {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Zap size={18} /><span>Confirm Selection</span></>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {activeTab === 'saved' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                {savedPalettes.map(p => (
                  <div key={p.id} className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-lg dark:text-white">{p.title}</h3>
                      <div className="flex space-x-1">
                        <button onClick={() => { setPalette(p); setActiveTab('discover'); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg"><ExternalLink size={18} /></button>
                        <button onClick={() => deletePalette(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <div className="flex h-12 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-700">
                      {[p.primary, p.secondary, p.accent, p.background, p.outline].map((c, i) => (<div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />))}
                    </div>
                  </div>
                ))}
              </div>
            ) : palette ? (
              <div className="space-y-10 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <EditableText value={palette.title} onSave={(val) => setPalette({ ...palette, title: val })} className="text-4xl font-black text-zinc-800 dark:text-white tracking-tight" />
                    <EditableText value={palette.concept} onSave={(val) => setPalette({ ...palette, concept: val })} className="text-zinc-500 dark:text-zinc-300 font-medium max-w-2xl leading-relaxed italic" type="textarea" />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={shufflePalette} className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-indigo-500 shadow-sm transition-all" title="Shuffle Roles"><Shuffle size={24} /></button>
                    <button onClick={savePalette} className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 shadow-sm transition-all"><Heart size={24} fill={savedPalettes.find(s => s.id === palette.id) ? "currentColor" : "none"} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {(['primary', 'secondary', 'accent', 'outline', 'background'] as PaletteRole[]).map((role) => (
                    <ColorCard key={role} roleKey={role} color={palette[role]} onDragStart={handleDragStart} onDrop={handleDrop} />
                  ))}
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.2em]"><Layout size={16} /><span>Pattern Studio</span></div>
                     <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-700 px-3 py-1.5 rounded-xl"><Maximize2 size={12} className="text-zinc-400" /><input type="range" min="0.2" max="2" step="0.1" value={patternConfig.scale} onChange={(e) => setPatternConfig({ ...patternConfig, scale: parseFloat(e.target.value) })} className="w-16 accent-indigo-500" /></div>
                        <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-700 px-3 py-1.5 rounded-xl"><CircleDashed size={12} className="text-zinc-400" /><input type="range" min="0.2" max="3" step="0.1" value={patternConfig.elementSize} onChange={(e) => setPatternConfig({ ...patternConfig, elementSize: parseFloat(e.target.value) })} className="w-16 accent-indigo-500" /></div>
                     </div>
                   </div>
                   <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-700 h-[300px] shadow-lg" style={{ backgroundColor: palette.background.hex }}>
                    <svg className="absolute inset-0 w-full h-full"><defs>{PATTERNS[patternConfig.type](palette.primary.hex, palette.secondary.hex, palette.accent.hex, palette.outline.hex, palette.background.hex, patternConfig.scale, patternConfig.elementSize)}</defs><rect width="100%" height="100%" fill={`url(#pattern-${patternConfig.type})`} /></svg>
                    <div className="absolute top-6 left-6 flex bg-white/10 backdrop-blur-md p-1 rounded-xl">
                      {Object.keys(PATTERNS).map((type) => (<button key={type} onClick={() => setPatternConfig({ ...patternConfig, type: type as any })} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${patternConfig.type === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'}`}>{type}</button>))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[1.5rem] shadow-xl relative overflow-hidden flex items-center justify-center mb-6" style={{ backgroundColor: palette[appIconConfig.bg].hex }}><Palette size={40} className="relative z-10" style={{ color: palette[appIconConfig.icon].hex }} /></div>
                    <div className="grid grid-cols-2 gap-4 w-full"><RoleSelector label="BG" value={appIconConfig.bg} onChange={(v) => setAppIconConfig({ ...appIconConfig, bg: v })} /><RoleSelector label="Icon" value={appIconConfig.icon} onChange={(v) => setAppIconConfig({ ...appIconConfig, icon: v })} /></div>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 shadow-sm flex flex-col items-center">
                    <ProfilePreview palette={palette} config={profileConfig} />
                    <div className="grid grid-cols-2 gap-3 w-full mt-6"><RoleSelector label="BG" value={profileConfig.bg} onChange={(v) => setProfileConfig({ ...profileConfig, bg: v })} /><RoleSelector label="Avatar" value={profileConfig.avatar} onChange={(v) => setProfileConfig({ ...profileConfig, avatar: v })} /><RoleSelector label="S1" value={profileConfig.s1} onChange={(v) => setProfileConfig({ ...profileConfig, s1: v })} /><RoleSelector label="S2" value={profileConfig.s2} onChange={(v) => setProfileConfig({ ...profileConfig, s2: v })} /></div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-10 border-t border-zinc-200 dark:border-zinc-700">
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(palette, null, 2))} className="px-6 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 dark:text-white">Copy JSON</button>
                  <button onClick={exportAsImage} className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10"><span>Export Brand Tile</span><Download size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center space-y-6 text-zinc-300 dark:text-zinc-600 bg-white/50 dark:bg-zinc-800/30 border-4 border-dashed border-zinc-100 dark:border-zinc-700 rounded-[3rem]"><Palette size={80} /><p className="font-bold text-xl tracking-tight">Select an anchor color or upload an asset.</p></div>
            )}
          </div>
        </div>
      </main>
      <footer className="py-20 text-center space-y-4"><div className="h-px w-20 bg-indigo-100 dark:bg-zinc-700 mx-auto opacity-30" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">© 2025 ChromaFlow • Advanced Color Systems</p></footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
