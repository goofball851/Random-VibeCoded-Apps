
import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselItemData } from '../types';
import { FunboxSession } from '../funbox';
import * as RiveModule from '@rive-app/react-canvas';
import { ErrorPlaceholder } from './CarouselItem';

const RiveRuntime = (RiveModule as any).useRive ? RiveModule : (RiveModule as any).default || RiveModule;
const { useRive, Layout, Fit, Alignment } = RiveRuntime;

interface MediaModalProps {
  item: CarouselItemData | null;
  onClose: () => void;
  isMobile: boolean;
  onLaunchFunbox: (session: FunboxSession) => void;
}

const RiveModalInternal: React.FC<{ url: string }> = ({ url }) => {
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
        layout: Layout ? new Layout({
          fit: Fit?.Contain || 'contain',
          alignment: Alignment?.Center || 'center',
        }) : undefined,
      };
    } catch (e) { return null; }
  }, [url, activeStateMachine]);

  if (!riveParams) return <ErrorPlaceholder message="Runtime Missing" />;
  const { RiveComponent } = useRive(riveParams);
  return RiveComponent ? <RiveComponent className="w-full h-full" /> : <ErrorPlaceholder message="Init Failed" />;
};

const MediaModal: React.FC<MediaModalProps> = ({ item, onClose, isMobile, onLaunchFunbox }) => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => setViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
    window.addEventListener('resize', handleResize);
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'unset';
    };
  }, [item]);

  if (!item) return null;

  const isLandscape = viewport.width > viewport.height;
  const isTablet = viewport.width >= 768 && viewport.width < 1280;
  const forceVerticalStack = isTablet || isMobile;

  const handleFunboxClick = () => {
    if (item.type === 'rive') {
      onLaunchFunbox({
        itemId: item.id,
        url: item.url,
        type: 'rive'
      });
      onClose();
    }
  };

  const renderModalMedia = () => {
    if (item.poster) {
      return (
        <img
          src={item.poster}
          alt={`${item.title} Preview`}
          className="w-full h-full object-contain"
        />
      );
    }

    if (item.type === 'rive') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/20 relative">
          <div className={`w-full h-full max-w-4xl transition-transform ${isMobile && isLandscape ? 'scale-75' : 'scale-110'}`}>
             <RiveModalInternal url={item.url} />
          </div>
        </div>
      );
    }
    if (item.type === 'video') {
      return (
        <video
          src={item.url}
          className="w-full h-full object-contain"
          autoPlay loop muted={false} controls
        />
      );
    }
    return (
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-contain"
      />
    );
  };

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/98 backdrop-blur-[40px]"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={isMobile ? { y: '100%' } : { scale: 0.98, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.98, opacity: 0 }}
          transition={{ type: "spring", damping: 35, stiffness: 400 }}
          className={`relative flex flex-col bg-slate-900 shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 overflow-hidden ${
            isMobile 
              ? 'w-full h-full' 
              : forceVerticalStack 
                ? 'w-[92vw] h-[92vh] rounded-[2.5rem] max-w-4xl' 
                : 'w-[94vw] h-[90vh] rounded-[3rem] max-w-7xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            className={`absolute z-[2100] flex items-center gap-2 text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-3xl transition-all shadow-xl ${
              isMobile ? 'top-4 right-4' : 'top-8 right-8'
            }`}
            onClick={onClose}
          >
            <span className="font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px]">
              {isMobile ? 'Close' : 'Exit View'}
            </span>
          </motion.button>

          <div className={`w-full h-full flex ${forceVerticalStack ? 'flex-col' : 'flex-row'}`}>
            {/* Media Section */}
            <div className={`relative bg-black/40 flex items-center justify-center overflow-hidden transition-all duration-700 ${
              forceVerticalStack 
                ? isMobile && isLandscape ? 'h-[40vh]' : 'h-[50vh] md:h-[55vh]' 
                : 'flex-[1.6] border-r border-white/5'
            }`}>
              {renderModalMedia()}
            </div>

            {/* Info Section */}
            <div className={`bg-slate-900/40 flex flex-col justify-center overflow-y-auto custom-scrollbar transition-all ${
              forceVerticalStack 
                ? 'flex-1 p-6 md:p-10 lg:p-12' 
                : 'flex-1 p-8 md:p-14 lg:p-20'
            }`}>
              <div className={`max-w-2xl mx-auto w-full transition-all ${
                isMobile && isLandscape ? 'space-y-3' : 'space-y-6 md:space-y-10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] border border-indigo-500/20">
                      {item.type}
                    </span>
                    <span className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest font-mono">ID-0{item.id}</span>
                  </div>
                  {item.type === 'rive' && (
                     <span className="text-indigo-400 text-[7px] font-black uppercase tracking-[0.4em] px-2 py-0.5 border border-indigo-500/30 rounded animate-pulse">Funbox Compatible</span>
                  )}
                </div>
                
                <h2 className={`font-black text-white tracking-tighter italic leading-[0.85] uppercase ${
                  isMobile && isLandscape ? 'text-xl' : 'text-3xl md:text-5xl lg:text-7xl'
                }`}>
                  {item.title}
                </h2>
                
                <div className="w-10 h-0.5 bg-indigo-500" />
                
                <p className={`text-slate-400 leading-relaxed font-medium ${
                  isMobile && isLandscape ? 'text-[10px]' : 'text-sm md:text-base lg:text-lg'
                }`}>
                  High-fidelity cinematic projection optimized for the ribbon engine. This asset has been processed through the Flux core for maximum color accuracy.
                </p>

                {/* Funbox Action for Interactive Items */}
                {item.type === 'rive' && (
                  <div className="pt-2">
                    <button 
                      onClick={handleFunboxClick}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                      <span>Launch Interactive Runtime</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </button>
                  </div>
                )}

                <div className={`grid grid-cols-2 gap-4 md:gap-8 border-t border-white/5 ${
                  isMobile && isLandscape ? 'pt-3' : 'pt-8 md:pt-10'
                }`}>
                  <div>
                    <span className="block text-[7px] md:text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Status</span>
                    <span className="text-green-400 text-[9px] md:text-xs font-black uppercase tracking-widest">Active</span>
                  </div>
                  <div>
                    <span className="block text-[7px] md:text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Grid</span>
                    <span className="text-white text-[9px] md:text-xs font-black uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default MediaModal;
