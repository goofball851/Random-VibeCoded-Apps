
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ALPHABET_NUMBERS, DrawingData, Stroke, ToolType, FillPattern } from './types';
import DrawingCanvas, { DrawingCanvasRef } from './components/DrawingCanvas';
import CharacterGrid from './components/CharacterGrid';
import { generateFontFile } from './services/fontGenerator';

const FILL_COLORS = ['#000000', '#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
const FILL_PATTERNS: FillPattern[] = ['solid', 'hatch', 'dots', 'grid'] as FillPattern[];

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawings, setDrawings] = useState<Record<string, DrawingData>>({});
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  
  // Tool Settings
  const [weight, setWeight] = useState(10);
  const [smartCurve, setSmartCurve] = useState(true);
  const [fillColor, setFillColor] = useState('#000000');
  const [fillPattern, setFillPattern] = useState<FillPattern>('solid');
  const [blueprintMode, setBlueprintMode] = useState(true);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [guides, setGuides] = useState({
    ascent: true,
    caps: true,
    xHeight: true,
    baseline: true,
    center: false,
  });

  const currentChar = ALPHABET_NUMBERS[currentIndex];
  const currentDrawing = drawings[currentChar];

  const handleSaveDrawing = useCallback((strokes: Stroke[], dataUrl: string) => {
    setDrawings(prev => ({
      ...prev,
      [currentChar]: {
        ...(prev[currentChar] || { char: currentChar, strokes: [], dataUrl: '' }),
        strokes,
        dataUrl
      }
    }));
  }, [currentChar]);

  const handleImportReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setDrawings(prev => ({
          ...prev,
          [currentChar]: {
            ...(prev[currentChar] || { char: currentChar, strokes: [], dataUrl: '' }),
            referenceImage: base64
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const goToNext = useCallback(() => {
    if (currentIndex < ALPHABET_NUMBERS.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const completedChars = useMemo(() => Object.keys(drawings).filter(k => drawings[k].strokes.length > 0), [drawings]);

  const handleDownload = async () => {
    if (completedChars.length === 0) return;
    setDownloading(true);
    try {
      const buffer = generateFontFile(drawings, 600, 600);
      const blob = new Blob([buffer], { type: 'font/opentype' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HandyFontPro.otf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate font:", err);
      alert("Error generating font file.");
    } finally {
      setDownloading(false);
    }
  };

  const ToolButton = ({ tool, icon, label }: { tool: ToolType, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => setCurrentTool(tool)} 
      className={`flex flex-col items-center justify-center flex-1 h-12 md:h-14 gap-0.5 rounded-xl transition-all border border-transparent ${currentTool === tool ? 'bg-indigo-600 text-white shadow-lg border-white/20' : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
      {icon}
      <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Universal Header */}
      <header className="flex items-center justify-between p-3 px-4 md:px-6 shrink-0 border-b border-white/5 bg-[#020617] z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black italic text-lg">H</span>
          </div>
          <h1 className="text-xs font-black tracking-tighter uppercase italic leading-none text-white md:block hidden">HandyFont <span className="text-indigo-400">Foundry</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsHelpOpen(true)} className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 text-slate-400 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all">Manual</button>
          <button onClick={() => setIsPreviewOpen(true)} className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800 text-slate-400 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all">Gallery</button>
          <button 
            disabled={completedChars.length === 0 || downloading}
            onClick={handleDownload}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
          >
            {downloading ? "Wait..." : "Export"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 items-stretch md:items-center justify-center w-full max-w-6xl h-full">
          
          {/* Side Column (Specimen + Navigation) */}
          <div className="md:w-56 lg:w-64 flex flex-row md:flex-col gap-3 shrink-0">
             
             {/* Specimen Preview Card */}
             <div className="flex-grow md:flex-initial bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-xl">
               <div className="relative w-full aspect-square bg-white rounded-xl flex items-center justify-center shadow-inner p-1 overflow-hidden">
                  {currentDrawing?.dataUrl ? (
                    <img src={currentDrawing.dataUrl} alt={currentChar} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="text-6xl font-black text-slate-200 leading-none">{currentChar}</div>
                  )}
               </div>
               <div className="flex flex-col items-center leading-none mt-1">
                 <span className="text-2xl font-black text-white italic">{currentChar}</span>
                 <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Specimen</span>
               </div>
             </div>

             {/* Actions Stack */}
             <div className="flex md:flex-col gap-2 shrink-0">
               <div className="flex gap-2 w-full">
                 <button onClick={goToPrev} disabled={currentIndex === 0} className="flex-1 p-3 bg-white/5 hover:bg-white/10 text-indigo-400 rounded-xl border border-white/5 disabled:opacity-5 transition-all flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <button onClick={goToNext} disabled={currentIndex === ALPHABET_NUMBERS.length - 1} className="flex-1 p-3 bg-white/5 hover:bg-white/10 text-indigo-400 rounded-xl border border-white/5 disabled:opacity-5 transition-all flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                 </button>
               </div>
               <button onClick={() => setIsMapOpen(true)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all">Matrix</button>
               
               <input type="file" ref={fileInputRef} onChange={handleImportReference} accept="image/*" className="hidden" />
               <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">Import Ref</button>
               
               {currentDrawing?.referenceImage && (
                  <button 
                    onClick={() => setBlueprintMode(!blueprintMode)}
                    className={`w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border ${blueprintMode ? 'bg-indigo-600 text-white border-white/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}
                  >
                    Blueprint: {blueprintMode ? 'On' : 'Off'}
                  </button>
               )}
             </div>
          </div>

          {/* Center Column (Canvas + Toggles) */}
          <div className="flex-grow flex flex-col items-center justify-center min-h-0 w-full">
            
            {/* Guidelines Toggles Row */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {(Object.keys(guides) as Array<keyof typeof guides>).map((key) => (
                <button 
                  key={key}
                  onClick={() => setGuides(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${guides[key] ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/5 text-slate-600'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${guides[key] ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                  {key}
                </button>
              ))}
            </div>

            {/* Canvas Container */}
            <div className="flex-grow w-full flex items-center justify-center min-h-0">
              <DrawingCanvas 
                ref={canvasRef}
                key={currentChar}
                width={600}
                height={600}
                currentChar={currentChar}
                onSave={handleSaveDrawing}
                isSaved={!!currentDrawing?.strokes?.length}
                initialStrokes={currentDrawing?.strokes || []}
                currentTool={currentTool}
                guides={guides}
                weight={weight}
                smartCurve={smartCurve}
                fillColor={fillColor}
                fillPattern={fillPattern}
                referenceImage={currentDrawing?.referenceImage}
                blueprintMode={blueprintMode}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Structured Footer System */}
      <footer className="w-full p-4 shrink-0 bg-slate-900/90 backdrop-blur-3xl border-t border-white/10 z-50">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          
          {/* 1. Contextual Ribbon (Tool Settings) */}
          <div className="flex justify-center items-center h-10">
            {currentTool === 'fill' ? (
              <div className="flex items-center gap-6 animate-in fade-in zoom-in duration-300">
                <div className="flex gap-2">
                  {FILL_COLORS.map(c => (
                    <button key={c} onClick={() => setFillColor(c)} className={`w-5 h-5 rounded-full border border-white/20 transition-all ${fillColor === c ? 'scale-125 border-white ring-2 ring-indigo-500' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex gap-1.5">
                  {FILL_PATTERNS.map(p => (
                    <button key={p} onClick={() => setFillPattern(p)} className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${fillPattern === p ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>{p}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-4 w-48 md:w-64">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">Weight</span>
                  <input type="range" min="1" max="50" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))} className="flex-grow accent-indigo-500 h-1 rounded-full cursor-pointer" />
                  <span className="text-[9px] font-mono text-indigo-400 font-black min-w-[3ch] text-right">{weight}</span>
                </div>
                {currentTool === 'pen' && (
                  <button onClick={() => setSmartCurve(!smartCurve)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${smartCurve ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>Smart Path</button>
                )}
              </div>
            )}
          </div>

          {/* 2. Tool Palette Grid */}
          <div className="flex gap-2 h-14">
            <ToolButton tool="move" label="Move" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18m-8-8l4 4m0 0l4-4m-4 4H3" /></svg>} />
            <ToolButton tool="select" label="Node" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>} />
            <ToolButton tool="pen" label="Pen" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
            <ToolButton tool="brush" label="Brush" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>} />
            <ToolButton tool="fill" label="Fill" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-8-8-9 9 9 9 4.5-4.5" /></svg>} />
            <ToolButton tool="eraser" label="Eraser" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} />
          </div>

          {/* 3. Global Persistent Actions */}
          <div className="flex gap-2">
            <button onClick={() => canvasRef.current?.undo()} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all active:scale-[0.98]">Undo</button>
            <button onClick={() => canvasRef.current?.redo()} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all active:scale-[0.98]">Redo</button>
            <button onClick={() => canvasRef.current?.clear()} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-500/10 transition-all active:scale-[0.98]">Clear Canvas</button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-black italic uppercase">Glyph Matrix</h3>
                <button onClick={() => setIsMapOpen(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">✕</button>
             </div>
             <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
               <CharacterGrid 
                completedChars={completedChars}
                currentIndex={currentIndex}
                onSelect={(idx) => { setCurrentIndex(idx); setIsMapOpen(false); }}
               />
             </div>
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
          <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase">Foundry Manual</h3>
              <button onClick={() => setIsHelpOpen(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest">Tools</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed"><strong>Pen:</strong> Click for nodes. Drag for curves. Resume by clicking endpoints.<br/><strong>Brush:</strong> Freehand drawing.<br/><strong>Fill:</strong> Click a closed pen path to color it.</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest">Blueprints</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">Import a scan via <strong>Import Ref</strong> and toggle <strong>Blueprint</strong> to trace over your physical drawings.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-6xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-2xl font-black italic uppercase">Gallery</h3>
                <button onClick={() => setIsPreviewOpen(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">✕</button>
             </div>
             <div className="p-6 overflow-y-auto flex-grow custom-scrollbar grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 bg-black/20">
                {ALPHABET_NUMBERS.map((char) => {
                  const data = drawings[char];
                  return (
                    <div key={char} className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-center relative transition-all group ${data?.strokes?.length > 0 ? 'bg-white shadow-lg' : 'bg-white/5 border border-dashed border-white/10 opacity-20'}`}>
                      {data?.dataUrl ? (
                        <img src={data.dataUrl} alt={char} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <span className="text-xl font-black text-slate-700">{char}</span>
                      )}
                      <span className="absolute bottom-1 right-2 text-[8px] font-black text-slate-900/30 uppercase">{char}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
