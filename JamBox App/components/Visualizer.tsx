
import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (analyser && isPlaying) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Fewer bars for a more cartoony/chunkier look
      const chunks = 40;
      const step = Math.floor(bufferLength / chunks);
      const barWidth = (width / chunks);
      
      for (let i = 0; i < chunks; i++) {
        const averageValue = dataArray.slice(i * step, (i + 1) * step).reduce((a, b) => a + b, 0) / step;
        const barHeight = (averageValue / 255) * height * 0.7;
        
        const x = i * barWidth;
        const y = height - barHeight;

        // Pill shape
        ctx.beginPath();
        ctx.fillStyle = `hsl(${(i * 360) / chunks}, 100%, 70%)`;
        ctx.roundRect(x + 5, y, barWidth - 10, barHeight, 20);
        ctx.fill();
        
        // Add a small shine to each bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 10, (barWidth - 10) / 3, Math.min(barHeight - 20, 40), 10);
        ctx.fill();
      }
    }
    
    requestRef.current = requestAnimationFrame(draw);
  };

  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
      canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || window.innerHeight;
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full opacity-30 pointer-events-none"
    />
  );
};

export default Visualizer;
