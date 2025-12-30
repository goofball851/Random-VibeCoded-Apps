
import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselItemData } from '../types';
import * as RiveModule from '@rive-app/react-canvas';
import { ErrorPlaceholder } from './CarouselItem';

// Robustly resolve Rive module exports
const RiveRuntime = (RiveModule as any).useRive ? RiveModule : (RiveModule as any).default || RiveModule;
const { useRive, Layout, Fit, Alignment } = RiveRuntime;

interface MediaModalProps {
  item: CarouselItemData | null;
  onClose: () => void;
  isMobile: boolean;
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
        onLoadError: (err: any) => {
          console.warn(`[FluxCore] Modal Rive Error for ${url}:`, err);
        },
        layout: Layout ? new Layout({
          fit: Fit?.Contain || 'contain',
          alignment: Alignment?.Center || 'center',
        }) : undefined,
      };
    } catch (e) {
      return null;
    }
  }, [url, activeStateMachine]);

  if (!riveParams) {
    return <ErrorPlaceholder message="Runtime Missing" />;
  }

  const { RiveComponent } = useRive(riveParams);

  return RiveComponent ? (
    <div className="w-full h-full relative">
       <RiveComponent className="w-full h-full" />
    </div>
  ) : <ErrorPlaceholder message="Initialization Failed" />;
};

const MediaModal: React.FC<MediaModalProps> = ({ item, onClose, isMobile }) => {
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [item]);

  if (!item) return null;

  const renderModalMedia = () => {
    if (item.type === 'rive') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950">
          <div className="w-full h-full max-w-4xl max-h-[70vh] scale-110">
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

  const modalContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-[40px]"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30 pointer-events-none" />
        
        <motion.div
          key="modal-content"
          initial={isMobile ? { x: '100%' } : { scale: 0.9, opacity: 0, y: 40 }}
          animate={isMobile ? { x: 0 } : { scale: 1, opacity: 1, y: 0 }}
          exit={isMobile ? { x: '100%' } : { scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className={`relative flex flex-col bg-slate-900 shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/5 overflow-hidden ${
            isMobile ? 'w-full h-full' : 'w-[92vw] h-[88vh] rounded-[3.5rem] max-w-7xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            className={`absolute z-[2100] flex items-center gap-3 text-white bg-slate-900/40 hover:bg-slate-800/60 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-2xl transition-all ${
              isMobile ? 'top-8 left-8' : 'top-8 right-8'
            }`}
            onClick={onClose}
          >
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">{isMobile ? 'Back' : 'Close Project'}</span>
          </motion.button>

          <div className="w-full h-full flex flex-col md:flex-row">
            <div className={`relative bg-black flex items-center justify-center overflow-hidden ${isMobile ? 'h-[55vh]' : 'flex-[1.6]'}`}>
              {renderModalMedia()}
            </div>

            <div className={`bg-slate-900/80 backdrop-blur-md p-10 md:p-16 flex flex-col justify-center border-l border-white/5 ${isMobile ? 'flex-1 overflow-y-auto' : 'flex-1'}`}>
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] border border-indigo-500/30">
                    {item.type}
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">REF-0{item.id}</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter italic leading-[0.9] mb-8">{item.title.toUpperCase()}</h2>
                <p className="text-slate-400 text-base md:text-xl leading-relaxed font-medium mb-12">High-fidelity cinematic artifact processed via standard resolution buffers. Asset integrity verification complete.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default MediaModal;
