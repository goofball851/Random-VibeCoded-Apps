
import React, { useRef, useEffect, useState, useCallback, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { Point, Stroke, ToolType, PathNode, FillPattern } from '../types';

interface DrawingCanvasProps {
  onSave: (strokes: Stroke[], dataUrl: string) => void;
  width: number;
  height: number;
  currentChar: string;
  isSaved: boolean;
  initialStrokes?: Stroke[];
  currentTool: ToolType;
  guides: {
    ascent: boolean;
    caps: boolean;
    xHeight: boolean;
    baseline: boolean;
    center: boolean;
  };
  weight: number;
  smartCurve: boolean;
  fillColor: string;
  fillPattern: FillPattern;
  referenceImage?: string;
  blueprintMode: boolean;
}

export interface DrawingCanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ 
  onSave, 
  width, 
  height, 
  currentChar,
  initialStrokes = [],
  currentTool,
  guides,
  weight,
  smartCurve,
  fillColor,
  fillPattern,
  referenceImage,
  blueprintMode
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  
  const [canvasDisplaySize, setCanvasDisplaySize] = useState(300);
  
  const [penNodes, setPenNodes] = useState<PathNode[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);
  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null);

  const [selectedStrokeIdx, setSelectedStrokeIdx] = useState<number | null>(null);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null);
  const [activeHandle, setActiveHandle] = useState<'anchor' | 'cpIn' | 'cpOut' | null>(null);

  const [history, setHistory] = useState<Stroke[][]>([initialStrokes]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [liveStrokes, setLiveStrokes] = useState<Stroke[]>(initialStrokes);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const margin = 16;
      const size = Math.min(rect.width - margin, rect.height - margin);
      setCanvasDisplaySize(Math.max(size, 150)); 
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    const timer = setTimeout(updateSize, 100);
    return () => { window.removeEventListener('resize', updateSize); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const initial = initialStrokes || [];
    setHistory([initial]); setHistoryIndex(0); setLiveStrokes(initial);
    setPenNodes([]); setSelectedStrokeIdx(null); setSelectedNodeIdx(null);
  }, [currentChar]);

  useEffect(() => {
    if (!isDragging) setLiveStrokes(history[historyIndex]);
  }, [historyIndex, history, isDragging]);

  const updateHistory = useCallback((newStrokes: Stroke[]) => {
    const next = history.slice(0, historyIndex + 1);
    next.push(newStrokes);
    setHistory(next);
    setHistoryIndex(next.length - 1);
    setLiveStrokes(newStrokes);
  }, [history, historyIndex]);

  const undo = useCallback(() => { if (historyIndex > 0) setHistoryIndex(prev => prev - 1); }, [historyIndex]);
  const redo = useCallback(() => { if (historyIndex < history.length - 1) setHistoryIndex(prev => prev + 1); }, [historyIndex, history.length]);
  const clear = useCallback(() => { updateHistory([]); setPenNodes([]); }, [updateHistory]);

  useImperativeHandle(ref, () => ({ undo, redo, clear }), [undo, redo, clear]);

  const drawBezierPath = (ctx: CanvasRenderingContext2D, nodes: PathNode[], closed: boolean = false) => {
    if (nodes.length === 0) return;
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      ctx.bezierCurveTo(curr.cpOut?.x ?? curr.x, curr.cpOut?.y ?? curr.y, next.cpIn?.x ?? next.x, next.cpIn?.y ?? next.y, next.x, next.y);
    }
    if (closed) {
      const curr = nodes[nodes.length - 1];
      const next = nodes[0];
      ctx.bezierCurveTo(curr.cpOut?.x ?? curr.x, curr.cpOut?.y ?? curr.y, next.cpIn?.x ?? next.x, next.cpIn?.y ?? next.y, next.x, next.y);
      ctx.closePath();
    }
  };

  const renderHandles = (ctx: CanvasRenderingContext2D, nodes: PathNode[], isSelected: boolean) => {
    nodes.forEach((node, idx) => {
      const isSelectedNode = isSelected && selectedNodeIdx === idx;
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSelectedNode ? '#f43f5e' : '#6366f1';
      ctx.fillStyle = isSelectedNode ? '#ffffff' : '#4f46e5';
      ctx.beginPath();
      if (node.smooth) ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
      else ctx.rect(node.x - 4, node.y - 4, 8, 8);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      if (isSelectedNode) {
        const drawCP = (cp: Point) => {
          ctx.save(); ctx.setLineDash([2, 2]); ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(cp.x, cp.y); ctx.stroke();
          ctx.setLineDash([]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#f59e0b'; ctx.fillStyle = '#fef3c7';
          ctx.beginPath(); ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.restore();
        };
        if (node.cpIn) drawCP(node.cpIn);
        if (node.cpOut) drawCP(node.cpOut);
      }
    });
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Reference Image (Blueprint)
    if (referenceImage && blueprintMode) {
      const img = new Image();
      img.src = referenceImage;
      if (img.complete) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else {
        img.onload = () => drawCanvas();
      }
    }
    
    // Draw Guides
    ctx.save(); ctx.lineWidth = 1; ctx.setLineDash([6, 4]); ctx.font = 'bold 10px Inter'; ctx.textBaseline = 'bottom';
    if (guides.ascent) { ctx.strokeStyle = '#f1f5f9'; ctx.beginPath(); ctx.moveTo(0, height * 0.15); ctx.lineTo(width, height * 0.15); ctx.stroke(); ctx.fillStyle = '#94a3b8'; ctx.fillText('ASCENT', 10, height * 0.15 - 5); }
    if (guides.caps) { ctx.strokeStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(0, height * 0.25); ctx.lineTo(width, height * 0.25); ctx.stroke(); ctx.fillStyle = '#64748b'; ctx.fillText('CAPS', 10, height * 0.25 - 5); }
    if (guides.xHeight) { ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(0, height * 0.52); ctx.lineTo(width, height * 0.52); ctx.stroke(); ctx.fillStyle = '#475569'; ctx.fillText('X-HEIGHT', 10, height * 0.52 - 5); }
    if (guides.baseline) { ctx.setLineDash([]); ctx.lineWidth = 2; ctx.strokeStyle = '#4f46e5'; ctx.beginPath(); ctx.moveTo(0, height * 0.80); ctx.lineTo(width, height * 0.80); ctx.stroke(); ctx.fillStyle = '#4f46e5'; ctx.fillText('BASELINE', 10, height * 0.80 - 5); }
    if (guides.center) { ctx.strokeStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); ctx.stroke(); }
    ctx.restore();

    // Draw saved strokes
    liveStrokes.forEach((stroke, sIdx) => {
      ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = stroke.weight;
      if (stroke.type === 'pen' && stroke.nodes) {
        ctx.strokeStyle = (selectedStrokeIdx === sIdx) ? '#4f46e5' : '#000000';
        drawBezierPath(ctx, stroke.nodes, stroke.closed);
        if (stroke.filled && stroke.closed) {
          const p = document.createElement('canvas'); const pc = p.getContext('2d')!;
          p.width = 10; p.height = 10; pc.strokeStyle = stroke.fillColor || '#000000';
          if (stroke.fillPattern === 'hatch') { pc.moveTo(0,10); pc.lineTo(10,0); pc.stroke(); }
          else if (stroke.fillPattern === 'dots') { pc.fillStyle = stroke.fillColor || '#000000'; pc.beginPath(); pc.arc(5,5,1.5,0,Math.PI*2); pc.fill(); }
          else if (stroke.fillPattern === 'grid') { pc.rect(0,0,10,10); pc.stroke(); }
          ctx.fillStyle = stroke.fillPattern === 'solid' ? (stroke.fillColor || '#000000') : (ctx.createPattern(p, 'repeat') || '#000000');
          ctx.fill();
        }
        ctx.stroke();
        if (currentTool === 'select' || currentTool === 'move' || currentTool === 'pen') renderHandles(ctx, stroke.nodes, selectedStrokeIdx === sIdx);
      } else {
        ctx.strokeStyle = stroke.type === 'eraser' ? '#ffffff' : '#000000';
        if (stroke.points.length >= 2) {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length - 2; i++) {
            const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
            const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
          }
          const n = stroke.points.length; ctx.quadraticCurveTo(stroke.points[n-2].x, stroke.points[n-2].y, stroke.points[n-1].x, stroke.points[n-1].y);
          ctx.stroke();
        }
      }
    });

    // Draw active pen stroke
    if (penNodes.length > 0) {
      ctx.save(); ctx.beginPath(); ctx.strokeStyle = '#6366f1'; ctx.lineWidth = weight;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      drawBezierPath(ctx, penNodes);
      if (hoverPos && penNodes.length >= 1) {
        const last = penNodes[penNodes.length - 1];
        ctx.bezierCurveTo(last.cpOut?.x ?? last.x, last.cpOut?.y ?? last.y, hoverPos.x, hoverPos.y, hoverPos.x, hoverPos.y);
      }
      ctx.stroke(); renderHandles(ctx, penNodes, true); ctx.restore();
    }

    // Draw active brush/eraser stroke
    if (isDrawing && (currentTool === 'brush' || currentTool === 'eraser') && currentStrokePoints.length > 0) {
      ctx.save(); ctx.beginPath(); ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : '#000000'; ctx.lineWidth = weight;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      if (currentStrokePoints.length >= 2) {
        for (let i = 1; i < currentStrokePoints.length - 2; i++) {
          const xc = (currentStrokePoints[i].x + currentStrokePoints[i + 1].x) / 2;
          const yc = (currentStrokePoints[i].y + currentStrokePoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(currentStrokePoints[i].x, currentStrokePoints[i].y, xc, yc);
        }
        const n = currentStrokePoints.length; ctx.quadraticCurveTo(currentStrokePoints[n-2].x, currentStrokePoints[n-2].y, currentStrokePoints[n-1].x, currentStrokePoints[n-1].y);
      }
      ctx.stroke(); ctx.restore();
    }

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => onSave(liveStrokes, canvas.toDataURL()), 200);
  }, [liveStrokes, penNodes, hoverPos, currentTool, width, height, onSave, guides, weight, selectedStrokeIdx, selectedNodeIdx, isDrawing, currentStrokePoints, referenceImage, blueprintMode, fillColor, fillPattern]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent): Point => {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && (e as any).touches.length > 0 ? (e as any).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && (e as any).touches.length > 0 ? (e as any).touches[0].clientY : (e as MouseEvent).clientY;
    return { x: (clientX - rect.left) * (width / rect.width), y: (clientY - rect.top) * (height / rect.height) };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault();
    const coords = getCoordinates(e);

    if (currentTool === 'pen') {
      if (penNodes.length > 2 && Math.sqrt(Math.pow(coords.x - penNodes[0].x, 2) + Math.pow(coords.y - penNodes[0].y, 2)) < 20) {
        updateHistory([...liveStrokes, { points: [], nodes: [...penNodes], type: 'pen', weight, closed: true }]); setPenNodes([]); return;
      }
      if (penNodes.length === 0) {
        const resumeIdx = liveStrokes.findIndex(s => s.type === 'pen' && !s.closed && s.nodes && (
          Math.sqrt(Math.pow(coords.x - s.nodes[0].x, 2) + Math.pow(coords.y - s.nodes[0].y, 2)) < 20 ||
          Math.sqrt(Math.pow(coords.x - s.nodes[s.nodes.length-1].x, 2) + Math.pow(coords.y - s.nodes[s.nodes.length-1].y, 2)) < 20
        ));
        if (resumeIdx !== -1) {
          const s = liveStrokes[resumeIdx];
          const nodes = [...(s.nodes || [])];
          if (Math.sqrt(Math.pow(coords.x - nodes[0].x, 2) + Math.pow(coords.y - nodes[0].y, 2)) < 20) nodes.reverse();
          setPenNodes(nodes);
          const nextStrokes = [...liveStrokes]; nextStrokes.splice(resumeIdx, 1);
          setLiveStrokes(nextStrokes); return;
        }
      }
      const newNode: PathNode = { ...coords, smooth: true, cpIn: { ...coords }, cpOut: { ...coords } };
      if (smartCurve && penNodes.length > 0) {
        const last = penNodes[penNodes.length - 1];
        if (last.cpOut) {
          const dx = coords.x - last.x; const dy = coords.y - last.y;
          newNode.cpIn = { x: coords.x - dx * 0.3, y: coords.y - dy * 0.3 };
        }
      }
      setPenNodes(prev => [...prev, newNode]);
      setSelectedNodeIdx(penNodes.length); setActiveHandle('cpOut'); setIsDragging(true); setDragStartPos(coords);
    } else if (currentTool === 'select' || currentTool === 'move') {
      let found = false;
      liveStrokes.forEach((stroke, sIdx) => {
        if (!stroke.nodes) return;
        stroke.nodes.forEach((node, nIdx) => {
          if (Math.sqrt(Math.pow(coords.x - node.x, 2) + Math.pow(coords.y - node.y, 2)) < 15) {
            setSelectedStrokeIdx(sIdx); setSelectedNodeIdx(nIdx); setActiveHandle('anchor'); found = true;
          } else if (selectedStrokeIdx === sIdx && selectedNodeIdx === nIdx) {
            if (node.cpIn && Math.sqrt(Math.pow(coords.x - node.cpIn.x, 2) + Math.pow(coords.y - node.cpIn.y, 2)) < 15) { setActiveHandle('cpIn'); found = true; }
            if (node.cpOut && Math.sqrt(Math.pow(coords.x - node.cpOut.x, 2) + Math.pow(coords.y - node.cpOut.y, 2)) < 15) { setActiveHandle('cpOut'); found = true; }
          }
        });
      });
      if (!found) { setSelectedStrokeIdx(null); setSelectedNodeIdx(null); }
      setIsDragging(found); setDragStartPos(coords);
    } else if (currentTool === 'fill') {
      liveStrokes.forEach((stroke, idx) => {
        if (!stroke.nodes) return;
        stroke.nodes.forEach(node => {
          if (Math.sqrt(Math.pow(coords.x - node.x, 2) + Math.pow(coords.y - node.y, 2)) < 40) {
            const next = [...liveStrokes];
            const isOff = next[idx].filled && next[idx].fillColor === fillColor && next[idx].fillPattern === fillPattern;
            next[idx] = { ...next[idx], filled: !isOff, closed: true, fillColor: fillColor, fillPattern: fillPattern };
            updateHistory(next);
          }
        });
      });
    } else if (currentTool === 'brush' || currentTool === 'eraser') {
      setIsDrawing(true); setCurrentStrokePoints([coords]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      const coords = getCoordinates(e); setHoverPos(coords);
      if (isDragging && (currentTool === 'select' || currentTool === 'move') && selectedStrokeIdx !== null && selectedNodeIdx !== null) {
        const dx = coords.x - (dragStartPos?.x ?? coords.x); const dy = coords.y - (dragStartPos?.y ?? coords.y);
        setDragStartPos(coords); const next = [...liveStrokes]; const stroke = { ...next[selectedStrokeIdx] };
        if (stroke.nodes) {
          const nodes = [...stroke.nodes]; const node = { ...nodes[selectedNodeIdx] };
          if (activeHandle === 'anchor') { node.x += dx; node.y += dy; if (node.cpIn) { node.cpIn.x += dx; node.cpIn.y += dy; } if (node.cpOut) { node.cpOut.x += dx; node.cpOut.y += dy; } }
          else {
            const h = activeHandle!; const o = h === 'cpIn' ? 'cpOut' : 'cpIn'; node[h] = { ...coords };
            if (node.smooth) { const vx = coords.x - node.x; const vy = coords.y - node.y; node[o] = { x: node.x - vx, y: node.y - vy }; }
          }
          nodes[selectedNodeIdx] = node; stroke.nodes = nodes; next[selectedStrokeIdx] = stroke; setLiveStrokes(next);
        }
      } else if (isDragging && currentTool === 'pen' && penNodes.length > 0) {
         const next = [...penNodes]; const node = { ...next[next.length - 1] };
         const vx = coords.x - node.x; const vy = coords.y - node.y;
         node.cpOut = { x: node.x + vx, y: node.y + vy }; node.cpIn = { x: node.x - vx, y: node.y - vy };
         next[next.length - 1] = node; setPenNodes(next);
      } else if (isDrawing && (currentTool === 'brush' || currentTool === 'eraser')) {
        setCurrentStrokePoints(prev => [...prev, coords]);
      }
      rafRef.current = null;
    });
  };

  const handleEnd = () => {
    if (isDragging) { if (currentTool === 'select' || currentTool === 'move') updateHistory([...liveStrokes]); setIsDragging(false); }
    if (isDrawing && (currentTool === 'brush' || currentTool === 'eraser') && currentStrokePoints.length > 1) {
      updateHistory([...liveStrokes, { points: currentStrokePoints, type: currentTool, weight }]);
    }
    setIsDrawing(false); setCurrentStrokePoints([]);
  };

  return (
    <div className="flex flex-col gap-3 items-center w-full h-full overflow-hidden">
      <div ref={containerRef} className="relative flex-grow w-full flex items-center justify-center overflow-hidden min-h-0">
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_35px_80px_rgba(0,0,0,0.6)] bg-white border-[8px] border-slate-900 shrink-0" style={{ width: canvasDisplaySize, height: canvasDisplaySize }}>
          <canvas ref={canvasRef} width={width} height={height} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} className={`absolute inset-0 w-full h-full z-10 touch-none ${currentTool === 'eraser' ? 'cursor-none' : 'cursor-crosshair'}`} />
        </div>
      </div>
    </div>
  );
});

export default DrawingCanvas;
