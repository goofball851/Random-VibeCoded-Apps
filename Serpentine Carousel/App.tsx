
import React from 'react';
import SerpentineCarousel from './components/SerpentineCarousel';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center p-6 md:p-12 md:justify-center select-none">
      {/* Immersive background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <header className="relative z-20 mt-12 mb-12 md:mt-0 md:mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-slate-300 uppercase">
            Adaptive Media Grid
          </span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 italic">
          FLUX<span className="text-purple-600 not-italic">.</span>CORE
        </h1>
        <p className="text-slate-400 font-medium tracking-tight max-w-md mx-auto px-4">
          Desktop features a serpentine media engine. On mobile, items flow naturally with your page scroll.
        </p>
      </header>

      <main className="relative z-10 w-full flex items-center justify-center">
        <SerpentineCarousel />
      </main>

      <footer className="relative z-20 mt-12 mb-24 md:mt-20 md:mb-0 flex flex-wrap justify-center gap-8 md:gap-12 text-slate-600">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Desktop</span>
          <span className="text-xs font-mono text-slate-400">Serpentine 75s</span>
        </div>
        <div className="w-px h-10 bg-white/10 hidden sm:block" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Mobile</span>
          <span className="text-xs font-mono text-slate-400">Native Page Scroll</span>
        </div>
        <div className="w-px h-10 bg-white/10 hidden sm:block" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Interaction</span>
          <span className="text-xs font-mono text-slate-400">Parallax Hover</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
