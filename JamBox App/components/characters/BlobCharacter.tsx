
import React, { useRef, useEffect } from 'react';
import { MascotMood } from '../../types';

interface CharacterProps {
  mood: MascotMood;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  mousePos: { x: number; y: number };
}

const BlobCharacter: React.FC<CharacterProps> = ({ mood, isPlaying, analyser, mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const blobPhase = useRef(0);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, volume: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const isSleeping = mood === MascotMood.SLEEPING;
    
    const sleepFactor = isSleeping ? Math.sin(Date.now() / 1000) * 10 : 0;
    const baseRadius = 200 + (isPlaying ? volume * 140 : sleepFactor);
    
    blobPhase.current += isPlaying ? 0.05 + (volume * 0.25) : isSleeping ? 0.01 : 0.025;

    ctx.beginPath();
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const waveFreq = isPlaying ? 4 : isSleeping ? 2 : 3;
      const waveAmp = isPlaying ? (25 + volume * 60) : isSleeping ? 10 : 20;
      
      const xOffset = Math.cos(angle * waveFreq + blobPhase.current) * waveAmp;
      const yOffset = Math.sin(angle * (waveFreq - 1) + blobPhase.current * 0.8) * waveAmp;
      const r = baseRadius + xOffset + yOffset;
      
      const px = centerX + r * Math.cos(angle);
      const py = centerY + r * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    
    const gradient = ctx.createRadialGradient(centerX - 60, centerY - 60, 40, centerX, centerY, baseRadius * 1.6);
    if (isSleeping) {
        gradient.addColorStop(0, '#A18CD1'); 
        gradient.addColorStop(1, '#6A11CB');
    } else {
        gradient.addColorStop(0, '#6ECBFF'); 
        gradient.addColorStop(0.5, '#4D96FF'); 
        gradient.addColorStop(1, '#0055FF');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    const eyeSpacing = 70;
    const eyeY = centerY - 30 + (Math.sin(blobPhase.current) * 10);
    const blink = !isSleeping && Math.sin(Date.now() / 400) > 0.98;
    
    [centerX - eyeSpacing, centerX + eyeSpacing].forEach((ex, i) => {
      ctx.beginPath();
      if (isSleeping) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#000';
        ctx.lineCap = 'round';
        ctx.moveTo(ex - 25, eyeY);
        ctx.quadraticCurveTo(ex, eyeY + 15, ex + 25, eyeY);
        ctx.stroke();
        if (i === 0 && Math.sin(Date.now() / 500) > 0) {
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText('Z', ex - 100, eyeY - 80 - (Date.now() % 1000) / 10);
        }
      } else if (blink) {
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#000';
        ctx.moveTo(ex - 25, eyeY);
        ctx.lineTo(ex + 25, eyeY);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 7;
        const ew = 28 + (volume * 20);
        const eh = 38 + (volume * 10);
        ctx.ellipse(ex, eyeY, ew, eh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        const dx = (mousePos.x - 0.5) * 20;
        const dy = (mousePos.y - 0.5) * 20;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        const pupilX = ex + dx + (volume * 5);
        const pupilY = eyeY + dy + (volume * 5);
        ctx.arc(pupilX, pupilY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(pupilX - 4, pupilY - 4, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000';
    ctx.lineCap = 'round';
    if (isSleeping) {
      const snoreSize = 10 + Math.sin(Date.now() / 1000) * 10;
      ctx.arc(centerX, centerY + 90, snoreSize, 0, Math.PI * 2);
      ctx.stroke();
    } else if (isPlaying || volume > 0.1) {
      const mouthWidth = 60 + volume * 120;
      const mouthHeight = 25 + volume * 90;
      ctx.fillStyle = '#FF6B6B'; 
      ctx.ellipse(centerX, centerY + 85, mouthWidth / 2, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.fillRect(centerX - 25, centerY + 65, 50, 12);
    } else {
       ctx.moveTo(centerX - 35, centerY + 95);
       ctx.quadraticCurveTo(centerX, centerY + 120, centerX + 35, centerY + 95);
       ctx.stroke();
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let volume = 0;
    if (analyser && isPlaying) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      volume = average / 255;
    }

    draw(ctx, canvas.width, canvas.height, volume);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, mood, analyser, mousePos]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1000} 
      height={1000} 
      className="max-w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)] select-none pointer-events-none"
    />
  );
};

export default BlobCharacter;
