
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  RefreshCw, 
  Download, 
  Sparkles, 
  Palette, 
  Type as TypeIcon,
  Check,
  ChevronRight,
  Briefcase,
  Smile,
  Zap,
  Globe,
  Monitor,
  Layout,
  Info,
  Settings2,
  AlignCenter,
  AlignLeft,
  Square,
  Loader2,
  RotateCcw,
  Share2,
  X,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  ExternalLink,
  Moon,
  Sun
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { CardData, CardTemplate } from './types';
import CardPreview from './components/CardPreview';
import { unfurlUrl, polishContent, generateImage } from './services/geminiService';

const INITIAL_DATA: CardData = {
  title: '',
  description: '',
  url: '',
  imageUrl: '',
  siteName: '',
  template: 'trendy',
  accentColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  fontFamily: 'sans',
  textAlign: 'left',
  fontSize: 'base',
  imageOpacity: 100,
  borderRadius: 24,
};

const App: React.FC = () => {
  const [data, setData] = useState<CardData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'template' | 'design'>('template');
  const [lastUnfurledUrl, setLastUnfurledUrl] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const defaultBgs: Record<CardTemplate, string> = {
      trendy: '#020617',
      corporate: '#f9fafb',
      casual: '#fff9f2',
      cartoony: '#ffffff',
      minimal: '#ffffff',
      brutalist: '#ffffff'
    };
    const currentIsDefault = !data.backgroundColor || 
                           data.backgroundColor === '#ffffff' || 
                           Object.values(defaultBgs).includes(data.backgroundColor);
    if (currentIsDefault) {
      setData(prev => ({ ...prev, backgroundColor: defaultBgs[prev.template] || '#ffffff' }));
    }
  }, [data.template]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleValueChange = (name: string, value: any) => {
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnfurl = async () => {
    if (!data.url || data.url === lastUnfurledUrl) return;
    setIsLoading(true);
    try {
      const result = await unfurlUrl(data.url);
      setData(prev => ({
        ...prev,
        title: result.title,
        description: result.description,
        siteName: result.siteName,
      }));
      setLastUnfurledUrl(data.url);
    } catch (error) {
      alert("Could not fetch info automatically.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiPolish = async (tone: string) => {
    if (!data.title && !data.description) return;
    setIsAiWorking(true);
    try {
      const polished = await polishContent(data.title, data.description, tone);
      setData(prev => ({ ...prev, ...polished }));
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleAiImage = async () => {
    setIsAiWorking(true);
    try {
      const img = await generateImage(data.title || "Abstract concept");
      setData(prev => ({ ...prev, imageUrl: img }));
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleGlobalReset = () => {
    if (confirm('Are you sure you want to reset all content and design settings?')) {
      setData(INITIAL_DATA);
      setLastUnfurledUrl('');
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const captureOptions = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: 'transparent',
        width: 1080,
        height: 1080,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      };
      let dataUrl: string;
      try {
        dataUrl = await toPng(cardRef.current, captureOptions);
      } catch (innerErr) {
        dataUrl = await toPng(cardRef.current, { ...captureOptions, skipFonts: true });
      }
      const link = document.createElement('a');
      link.download = `social-post-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to generate image.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSocialShare = (platform: 'x' | 'linkedin' | 'facebook') => {
    const shareUrl = encodeURIComponent(data.url || window.location.href);
    const shareText = encodeURIComponent(`${data.title}\n\n${data.description}`);
    
    let url = '';
    switch (platform) {
      case 'x':
        url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url || window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Native sharing is not supported on this browser.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.url || window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">SocialPost <span className="text-blue-600 font-medium">Ai</span></h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={handleGlobalReset}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-white transition-all shadow-xl shadow-slate-900/10 dark:shadow-slate-100/5 disabled:opacity-70 group"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />}
            {isExporting ? '...' : 'Download'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-68px)]">
        <aside className="w-full lg:w-[450px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col shadow-inner transition-colors duration-300">
          <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 transition-colors duration-300">
            {[
              { id: 'template', label: 'Layout', icon: Palette },
              { id: 'edit', label: 'Content', icon: TypeIcon },
              { id: 'design', label: 'Design', icon: Settings2 }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-xs font-bold flex items-center justify-center gap-2 transition-colors border-b-2 uppercase tracking-tighter ${activeTab === tab.id ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-8 flex-1">
            {activeTab === 'template' && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                {[{ id: 'trendy', name: 'Trendy Lab', icon: Zap }, { id: 'corporate', name: 'Professional', icon: Briefcase }, { id: 'casual', name: 'Casual Daily', icon: Smile }, { id: 'cartoony', name: 'Pop Cartoony', icon: Sparkles }, { id: 'minimal', name: 'Classic Minimal', icon: Monitor }, { id: 'brutalist', name: 'Neo-Brutalist', icon: Layout }].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleValueChange('template', t.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${data.template === t.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-1 ${data.template === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        <t.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <span className={`font-bold text-sm ${data.template === t.id ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>{t.name}</span>
                        {data.template === t.id && <Check size={16} className="text-blue-600 dark:text-blue-400 float-right" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><LinkIcon size={14} /> Source Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      name="url" 
                      placeholder="Paste link to auto-fill" 
                      value={data.url} 
                      onChange={handleInputChange} 
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 transition-colors" 
                    />
                    <button onClick={handleUnfurl} disabled={isLoading || !data.url} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50">
                      {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Title</label>
                      <button onClick={() => handleAiPolish('viral')} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline" disabled={isAiWorking}><Sparkles size={10} /> Viral Polish</button>
                    </div>
                    <input type="text" name="title" value={data.title} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Body Text</label>
                    <textarea name="description" rows={3} value={data.description} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none text-slate-900 dark:text-slate-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tagline</label><input type="text" name="siteName" value={data.siteName} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Accent</label><input type="color" name="accentColor" value={data.accentColor} onChange={handleInputChange} className="w-full h-9 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer" /></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between mb-4"><div className="flex items-center gap-2"><ImageIcon size={14} /> Visual Media</div><button onClick={handleAiImage} className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline" disabled={isAiWorking}><Sparkles size={10} /> AI Generate</button></label>
                  <div className="relative aspect-square max-w-[150px] mx-auto rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                    {data.imageUrl ? <img src={data.imageUrl} className="w-full h-full object-cover" alt="upload" /> : <Plus size={24} className="text-slate-300 dark:text-slate-600" />}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Color Palette</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Canvas BG</span><input type="color" name="backgroundColor" value={data.backgroundColor} onChange={handleInputChange} className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer" /></div>
                    <div className="space-y-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Secondary Accent</span><input type="color" name="secondaryColor" value={data.secondaryColor} onChange={handleInputChange} className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer" /></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Typography</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['sans', 'serif', 'mono'].map(f => (
                      <button key={f} onClick={() => handleValueChange('fontFamily', f)} className={`py-2 text-xs font-bold rounded-lg border uppercase transition-all ${data.fontFamily === f ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Dimensions</label>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Radius</span><span>{data.borderRadius}px</span></div>
                    <input type="range" name="borderRadius" min="0" max="64" value={data.borderRadius} onChange={handleSliderChange} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
          </div>
          <div className="w-full max-w-[600px] flex flex-col items-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-center w-full"><div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"><Square className="w-3 h-3 text-blue-500" /><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">1:1 Square Preview</span></div></div>
            <div className="w-full aspect-square bg-white dark:bg-slate-900 shadow-2xl relative transition-colors"><CardPreview data={data} containerRef={cardRef} /></div>
          </div>
        </section>
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Share & Post</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Instantly post your new card to major social platforms or copy the link to share manually.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSocialShare('x')}
                  className="flex items-center justify-center gap-2 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  <Twitter size={18} fill="currentColor" /> Share on X
                </button>
                <button 
                  onClick={() => handleSocialShare('linkedin')}
                  className="flex items-center justify-center gap-2 py-3 bg-[#0077b5] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  <Linkedin size={18} fill="white" /> LinkedIn
                </button>
                <button 
                  onClick={() => handleSocialShare('facebook')}
                  className="flex items-center justify-center gap-2 py-3 bg-[#1877f2] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  <Facebook size={18} fill="white" /> Facebook
                </button>
                <button 
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <Share2 size={18} /> More...
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl group transition-colors">
                  <Globe size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="flex-1 text-xs text-slate-600 dark:text-slate-400 truncate">{data.url || 'Your source link...'}</span>
                  <button onClick={handleCopyLink} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-blue-600 dark:text-blue-400" title="Copy Link">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button onClick={() => setIsShareModalOpen(false)} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Done</button>
            </div>
          </div>
        </div>
      )}

      {isAiWorking && (
        <div className="fixed bottom-8 right-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-8">
          <div className="w-6 h-6 border-2 border-white/20 dark:border-slate-900/20 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-sm font-bold">Gemini is styling...</span>
        </div>
      )}
      {isExporting && (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] transition-colors">
          <div className="flex flex-col items-center gap-4 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
            <p className="font-bold">Generating 1:1 Card...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
