
import React, { useState, useRef, useMemo } from 'react';
import { CarouselItemData } from '../types';
import { ITEM_WIDTH, ITEM_HEIGHT, GAP, LOGICAL_SPOTS_PER_TRACK } from '../constants';
import { motion, useSpring, useMotionValue, useTransform, MotionValue, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import * as RiveModule from '@rive-app/react-canvas';

const RiveRuntime = (RiveModule as any).useRive ? RiveModule : (RiveModule as any).default || RiveModule;
const { useRive, Layout, Fit, Alignment } = RiveRuntime;

interface CarouselItemProps {
  data: CarouselItemData;
  onSelect: (item: CarouselItemData) => void;
  onHover?: () => void;
  progressValue: MotionValue<number>;
  index: number;
  totalSpots: number;
  orientation: 'horizontal' | 'vertical';
  isCarouselPaused?: boolean;
  isStatic?: boolean;
}

export const ErrorPlaceholder: React.FC<{ message?: string }> = ({ message = "Asset Error" }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-red-500/20 px-6 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/40 mb-2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{message}</span>
  </div>
);

const RiveInternal: React.FC<{ url: string; onError: () => void }> = ({ url, onError }) => {
  const [activeStateMachine, setActiveStateMachine] = useState<string | undefined>(undefined);
  const riveParams = useMemo(() => {
    if (typeof useRive !== 'function') return null;
    try {
      return {
        src: url,
        autoplay: true,
        stateMachines: activeStateMachine,
        onLoad: (rive: any) => {
          const names = rive.stateMachineNames;
          if (names.length > 0 && !activeStateMachine) {
            const found = names.find((n: string) => n.toLowerCase().includes('state machine')) || names[0];
            setActiveStateMachine(found);
          }
        },
        onLoadError: () => onError(),
        layout: Layout ? new Layout({
          fit: Fit?.Cover || 'cover',
          alignment: Alignment?.Center || 'center',
        }) : undefined,
      };
    } catch (e) { return null; }
  }, [url, activeStateMachine, onError]);
  if (!riveParams) return <ErrorPlaceholder message="Runtime Error" />;
  const { RiveComponent } = useRive(riveParams);
  return RiveComponent ? <RiveComponent className="w-full h-full" /> : <ErrorPlaceholder message="Init Failed" />;
};

const CarouselItem: React.FC<CarouselItemProps> = ({ 
  data, onSelect, onHover, progressValue, index, totalSpots, orientation, isCarouselPaused = false, isStatic = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCurrentlyVisible, setIsCurrentlyVisible] = useState(true);

  const ix = useMotionValue(0);
  const iy = useMotionValue(0);
  const mouseXSpring = useSpring(ix, { stiffness: 150, damping: 30 });
  const mouseYSpring = useSpring(iy, { stiffness: 150, damping: 30 });

  const L = LOGICAL_SPOTS_PER_TRACK; // 6
  const spacing = totalSpots / 15;
  const offset = index * spacing;
  const itemLocalProgress = useTransform(progressValue, (v) => (v + offset) % totalSpots);
  
  useMotionValueEvent(itemLocalProgress, "change", (p) => {
    if (isStatic) return;
    const isVisibleInTrack = (p > 0.05 && p < L - 0.05) || (p > L + 0.05 && p < 2 * L - 0.05) || (p > 2 * L + 0.05 && p < 3 * L - 0.05);
    if (isVisibleInTrack !== isCurrentlyVisible) setIsCurrentlyVisible(isVisibleInTrack);
  });

  const colWidth = ITEM_WIDTH + GAP;
  const rowHeight = ITEM_HEIGHT + GAP;

  /**
   * REFINED SERPENTINE TRACKING
   * We center the 5 visible spots within the 6 logical spots of a track.
   * Row 1: Left -> Right
   * Row 2: Right -> Left
   * Row 3: Left -> Right
   */
  const x = useTransform(itemLocalProgress, (p) => {
    if (isStatic) return 0;
    if (orientation === 'horizontal') {
      if (p < L) return (p - 1.0) * colWidth; // Row 1
      if (p < 2 * L) return (4 - (p - L)) * colWidth; // Row 2 (Starts at x=4 and moves to x=0)
      return (p - 2 * L - 1.0) * colWidth; // Row 3
    } else {
      return 0; // Static mobile view handles this via layout
    }
  });

  const y = useTransform(itemLocalProgress, (p) => {
    if (isStatic) return 0;
    if (orientation === 'horizontal') {
      if (p < L) return 0;
      if (p < 2 * L) return rowHeight;
      return rowHeight * 2;
    } else {
      return 0; // Static mobile view handles this via layout
    }
  });

  // Opacity ramps that create a smooth fade at the track start/ends (the edges)
  const opacity = useTransform(itemLocalProgress, 
    [0, 1.0, L - 1.0, L, L + 1.0, 2 * L - 1.0, 2 * L, 2 * L + 1.0, totalSpots - 1.0, totalSpots], 
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0]
  );

  const scale = useTransform(itemLocalProgress, (p) => {
    if (p > L - 0.05 && p < L + 0.05) return 0.96;
    if (p > 2 * L - 0.05 && p < 2 * L + 0.05) return 0.96;
    return 1;
  });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    ix.set((e.clientX - rect.left) / rect.width - 0.5);
    iy.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const renderMedia = () => {
    if (hasError) return <ErrorPlaceholder message="Asset Corrupt" />;
    if (!isCurrentlyVisible || (isCarouselPaused && !isStatic)) return null;
    if (data.type === 'rive') return <RiveInternal key={data.url} url={data.url} onError={() => setHasError(true)} />;
    if (data.type === 'video') return (
      <video src={data.url} className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        autoPlay loop muted playsInline onLoadedData={() => setIsLoaded(true)} onError={() => setHasError(true)} />
    );
    return <img src={data.url} alt={data.title} className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setIsLoaded(true)} onError={() => setHasError(true)} />;
  };

  if (isStatic) {
    return (
      <div onClick={() => onSelect(data)} className="relative group cursor-pointer active:scale-95 transition-transform duration-300 w-full aspect-[5/4] max-w-lg">
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl">
          {renderMedia()}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-10 left-10 right-10 z-30 pointer-events-none text-left">
            <span className="text-[11px] uppercase tracking-[0.6em] font-black text-indigo-400 mb-2 block">FLUX ENGINE</span>
            <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none uppercase">{data.title}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div ref={containerRef} style={{ x, y, opacity, scale, width: ITEM_WIDTH, height: ITEM_HEIGHT, position: 'absolute', top: 0, left: 0, zIndex: isHovered ? 500 : 10, perspective: 1800 }}
      onMouseMove={handleMouseMove} onMouseEnter={() => { setIsHovered(true); onHover?.(); }} onMouseLeave={() => { setIsHovered(false); ix.set(0); iy.set(0); }} onClick={() => onSelect(data)} className="cursor-pointer">
      <motion.div animate={{ scale: isHovered ? 1.08 : 1, boxShadow: isHovered ? '0 80px 160px -20px rgba(0,0,0,1), 0 0 60px rgba(99,102,241,0.25)' : '0 40px 80px -15px rgba(0,0,0,0.85)' }}
        style={{ rotateX, rotateY }} className={`relative w-full h-full rounded-[3.5rem] overflow-hidden border bg-slate-900 transition-all duration-500 ${isHovered ? 'border-indigo-400/50' : 'border-white/5'}`}>
        {renderMedia()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-12 left-12 right-12 z-30 pointer-events-none">
          <motion.div animate={{ y: isHovered ? -12 : 0, opacity: isHovered ? 1 : 0.85 }}>
            <span className="text-[12px] uppercase tracking-[0.7em] font-black text-indigo-400 mb-3 block">CORE.V2</span>
            <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none uppercase drop-shadow-2xl">{data.title}</h3>
          </motion.div>
        </div>
        <AnimatePresence>
          {isHovered && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 rounded-[3.5rem] border-2 border-indigo-500/40 pointer-events-none z-40" />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CarouselItem;
