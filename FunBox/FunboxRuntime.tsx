
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as RiveModule from '@rive-app/react-canvas';
import { FunboxRuntimeProps } from './types';

// Plugin-safe dynamic import for Rive
const RiveRuntime = (RiveModule as any).useRive ? RiveModule : (RiveModule as any).default || RiveModule;
const { useRive, Layout, Fit, Alignment } = RiveRuntime;

/**
 * FunboxRuntime Component
 * A high-performance, isolated interaction layer.
 */
export const FunboxRuntime: React.FC<FunboxRuntimeProps> = ({ 
  session, 
  onClose, 
  version = "1.0.2" 
}) => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (session) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setIsInitializing(false), 800);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [session]);

  const riveParams = useMemo(() => {
    if (!session || session.type !== 'rive') return null;
    return {
      src: session.url,
      autoplay: true,
      layout: Layout ? new Layout({
        fit: Fit?.Contain || 'contain',
        alignment: Alignment?.Center || 'center',
      }) : undefined,
    };
  }, [session]);

  if (!session) return null;

  const RiveInstance = () => {
    const { RiveComponent } = useRive(riveParams!);
    return RiveComponent ? <RiveComponent className="w-full h-full" /> : null;
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Plugin HUD */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">Funbox Runtime v{version}</span>
            </div>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Active Process: {session.itemId}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="pointer-events-auto flex items-center gap-3 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 px-6 py-3 rounded-full backdrop-blur-xl transition-colors group"
          >
            <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase group-hover:text-red-400 transition-colors">Kill Process</span>
            <div className="w-4 h-4 flex items-center justify-center">
               <div className="absolute w-4 h-0.5 bg-current rotate-45" />
               <div className="absolute w-4 h-0.5 bg-current -rotate-45" />
            </div>
          </motion.button>
        </div>

        {/* Loading Transition */}
        <AnimatePresence>
          {isInitializing && (
            <motion.div
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-black tracking-[0.8em] text-white uppercase animate-pulse">Initializing Runtime</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Engine Render Target */}
        <div className="w-full h-full max-w-[90vw] max-h-[85vh]">
          {session.type === 'rive' && <RiveInstance />}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
