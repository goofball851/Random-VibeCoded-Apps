
import React from 'react';
import RibbonCarousel from './components/RibbonCarousel';

const App: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col items-center select-none overflow-hidden">
      {/* Immersive background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[180px] rounded-full" />
      </div>

      <header className="relative z-20 pt-8 pb-4 md:pt-10 md:pb-6 text-center flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 md:mb-4 border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.3em] text-slate-300 uppercase">
            Ribbon Engine v2.5
          </span>
        </div>
        <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter italic leading-none">
          FLUX<span className="text-indigo-500 not-italic">.</span>RIBBON
        </h1>
      </header>

      <main className="relative z-10 w-full flex-1 flex items-center justify-center overflow-visible min-h-0 px-4">
        <RibbonCarousel />
      </main>

      <footer className="relative z-20 py-6 md:py-8 flex flex-wrap justify-center gap-6 md:gap-12 text-slate-600 flex-shrink-0">
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Architecture</span>
          <span className="text-[10px] font-mono text-slate-400">Ribbon Serpentine</span>
        </div>
        <div className="w-px h-6 bg-white/10 hidden sm:block" />
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Optimization</span>
          <span className="text-[10px] font-mono text-slate-400">Maximized Fill</span>
        </div>
        <div className="w-px h-6 bg-white/10 hidden sm:block" />
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Status</span>
          <span className="text-[10px] font-mono text-slate-400 italic">Core Operational</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
