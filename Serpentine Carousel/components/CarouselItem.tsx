
import React, { useState, useRef, useMemo } from 'react';
import { CarouselItemData } from '../types';
import { ITEM_WIDTH, ITEM_HEIGHT, GAP } from '../constants';
import { motion, useSpring, useMotionValue, useTransform, MotionValue, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import * as RiveModule from '@rive-app/react-canvas';

// Safely resolve Rive exports to prevent "Fit is undefined" type errors
const RiveRuntime = (RiveModule as any).useRive ? RiveModule : (RiveModule as any).default || RiveModule;
const { useRive, Layout, Fit, Alignment } = RiveRuntime;

interface CarouselItemProps {
  data: CarouselItemData;
  onSelect: (item: CarouselItemData) => void;
  progressValue: MotionValue<number>;
  index: number;
  totalSpots: number;
  isStatic?: boolean;
}

export const ErrorPlaceholder: React.FC<{ message?: string }> = ({ message = "Asset Error" }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-red-500/20 px-6 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/50 mb-2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{message}</span>
  </div>
);

const RiveInternal: React.FC<{ url: string; onError: () => void }> = ({ url, onError }) => {
  const [activeStateMachine, setActiveStateMachine] = useState<string | undefined>(undefined);

  const riveParams = useMemo(() => {
    // Check if the runtime is valid before attempting to instantiate Layout or Enums
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
        onLoadError: (err: any) => {
          console.warn(`[FluxCore] Rive load error for ${url}`);
          onError();
        },
        layout: Layout ? new Layout({
          fit: Fit?.Cover || 'cover',
          alignment: Alignment?.Center || 'center',
        }) : undefined,
      };
    } catch (e) {
      console.error("[FluxCore] Rive setup error", e);
      return null;
    }
  }, [url, activeStateMachine, onError]);

  if (!riveParams) {
    return <ErrorPlaceholder message="Runtime Error" />;
  }

  const { RiveComponent } = useRive(riveParams);

  return RiveComponent ? (
    <div className="w-full h-full relative">
       <RiveComponent className="w-full h-full" />
    </div>
  ) : <ErrorPlaceholder message="Init Failed" />;
};

const CarouselItem: React.FC<CarouselItemProps> = ({ 
  data, 
  isStatic = false,
  onSelect,
  progressValue,
  index,
  totalSpots
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCurrentlyVisible, setIsCurrentlyVisible] = useState(isStatic);

  const ix = useMotionValue(0);
  const iy = useMotionValue(0);
  const mouseXSpring = useSpring(ix, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(iy, { stiffness: 100, damping: 20 });

  const spacing = totalSpots / 15;
  const offset = index * spacing;
  const itemLocalProgress = useTransform(progressValue, (v) => (v + offset) % totalSpots);
  
  useMotionValueEvent(itemLocalProgress, "change", (p) => {
    if (isStatic) return;
    const isVisibleInTrack = (p > 0.4 && p < 6.6) || (p > 7.4 && p < 13.6) || (p > 14.4 && p < 20.6);
    if (isVisibleInTrack !== isCurrentlyVisible) {
      setIsCurrentlyVisible(isVisibleInTrack);
    }
  });

  const colWidth = ITEM_WIDTH + GAP;
  const rowHeight = ITEM_HEIGHT + GAP;

  const x = useTransform(itemLocalProgress, (p) => {
    if (p < 7) return (-1 + p) * colWidth;
    if (p < 14) return (6 - (p - 7)) * colWidth;
    return (-1 + (p - 14)) * colWidth;
  });

  const y = useTransform(itemLocalProgress, (p) => {
    if (p < 7) return 0;
    if (p < 14) return rowHeight;
    return rowHeight * 2;
  });

  const opacity = useTransform(itemLocalProgress, 
    [0, 0.5, totalSpots - 0.5, totalSpots], 
    [0, 1, 1, 0]
  );

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["-100%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    ix.set((e.clientX - rect.left) / rect.width - 0.5);
    iy.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const renderMedia = () => {
    if (hasError) return <ErrorPlaceholder message="Asset Corrupt" />;
    
    if (data.type === 'rive') {
      return (
        <div className="w-full h-full bg-slate-950 overflow-hidden relative">
          {isCurrentlyVisible && (
            <RiveInternal key={data.url} url={data.url} onError={() => setHasError(true)} />
          )}
        </div>
      );
    }
    
    if (data.type === 'video') {
      return (
        <video
          src={data.url}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay loop muted playsInline
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      );
    }
    
    return (
      <img
        src={data.url}
        alt={data.title}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    );
  };

  if (isStatic) {
    return (
      <div 
        className="relative cursor-pointer group rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl"
        style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
        onClick={() => onSelect(data)}
      >
         {renderMedia()}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />
         <div className="absolute bottom-6 left-6 pointer-events-none">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400 mb-1 block">Ref. 0{data.id}</span>
            <h3 className="text-xl font-black text-white italic tracking-tighter">{data.title.toUpperCase()}</h3>
         </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      style={{
        x, y, opacity,
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: isHovered ? 50 : 10,
        perspective: 1200
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); ix.set(0); iy.set(0); }}
      onClick={() => onSelect(data)}
      className="cursor-pointer"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl transition-all duration-500 group-hover:border-white/20"
      >
        {renderMedia()}

        <motion.div 
          style={{ x: shineX, opacity: isHovered ? 0.3 : 0 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-10"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent z-20 pointer-events-none" />
        
        <div className="absolute bottom-8 left-8 right-8 z-30 pointer-events-none">
          <motion.div animate={{ y: isHovered ? 0 : 4, opacity: isHovered ? 1 : 0.7 }}>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-500 mb-1 block">
              ASSET 0{data.id}
            </span>
            <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none">
              {data.title.toUpperCase()}
            </h3>
          </motion.div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-[2.5rem] border-2 border-indigo-500/40 pointer-events-none z-40"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CarouselItem;
