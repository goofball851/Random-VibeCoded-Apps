
import React, { useRef, useEffect, useState } from 'react';
import * as rive from '@rive-app/canvas';
import { MascotMood } from '../../types';

interface CharacterProps {
  mood: MascotMood;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  mousePos: { x: number; y: number };
  riveFileUrl: string | null;
}

const RiveCharacter: React.FC<CharacterProps> = ({ mood, isPlaying, riveFileUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const riveInstanceRef = useRef<rive.Rive | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!riveFileUrl || !canvasRef.current) return;

    try {
      if (riveInstanceRef.current) {
        riveInstanceRef.current.cleanup();
      }

      const r = new rive.Rive({
        src: riveFileUrl,
        canvas: canvasRef.current,
        autoplay: true,
        onLoad: () => {
          r.resizeDrawingSurfaceToCanvas();
          setError(null);
        },
        onLoadError: () => {
          setError("Failed to load Rive file.");
        }
      });

      riveInstanceRef.current = r;

      return () => {
        if (riveInstanceRef.current) {
          riveInstanceRef.current.cleanup();
          riveInstanceRef.current = null;
        }
      };
    } catch (e) {
      console.error(e);
      setError("Error initializing Rive runtime.");
    }
  }, [riveFileUrl]);

  // Handle Play/Pause
  useEffect(() => {
    if (riveInstanceRef.current) {
      if (isPlaying) riveInstanceRef.current.play();
      else riveInstanceRef.current.pause();
    }
  }, [isPlaying]);

  if (!riveFileUrl) {
    return (
      <div className="flex flex-col items-center justify-center bg-black/20 p-12 rounded-[3rem] border-4 border-dashed border-white/20 w-[400px] h-[400px]">
        <div className="text-8xl mb-6">🤖</div>
        <h3 className="text-2xl font-black uppercase text-white/50 text-center">
          Rive Mode Active
        </h3>
        <p className="text-sm text-white/30 text-center mt-4 max-w-xs">
          Drag and drop a <strong>.riv</strong> file here to load your custom mascot!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-[600px] h-[600px] flex items-center justify-center">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 text-red-200 p-4 rounded-3xl font-black uppercase text-center border-4 border-red-500">
          {error}
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={1200} 
        className="w-full h-full object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
};

export default RiveCharacter;
