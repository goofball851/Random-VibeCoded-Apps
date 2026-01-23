import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ProjectState, 
  BlockData, 
  DragHandleType, 
  DragState, 
  CanvasConfig,
  BorderStyle
} from './types';
import { 
  CANVAS_SIZE, 
  DEFAULT_CANVAS_CONFIG, 
  INITIAL_BLOCK_SIZE, 
  MAX_BLOCKS, 
  MIN_BLOCK_SIZE,
  SNAP_GRID,
  SNAP_THRESHOLD
} from './constants';
import { BlockComponent } from './components/BlockComponent';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { exportCanvasToPng } from './utils/exportHelper';

// --- Snapping Helpers ---

const getSnapLines = (
  currentBlockId: string, 
  blocks: BlockData[], 
  canvasSize: number
) => {
  const xLines = [0, canvasSize];
  const yLines = [0, canvasSize];

  blocks.forEach(b => {
    if (b.id === currentBlockId) return;
    xLines.push(b.x, b.x + b.width);
    yLines.push(b.y, b.y + b.height);
  });

  return { xLines, yLines };
};

const snap = (
  value: number,
  lines: number[],
  threshold: number,
  grid: number,
  size: number = 0,
  checkSecondEdge: boolean = false
) => {
  let best = value;
  let minDiff = threshold;
  let snapped = false;

  // 1. Grid Snap (Base priority)
  const gridVal = Math.round(value / grid) * grid;
  if (Math.abs(value - gridVal) < threshold) {
    best = gridVal;
    minDiff = Math.abs(value - gridVal);
    snapped = true;
  }
  
  // 2. Line Snaps (Higher priority if closer)
  // Check first edge (Left/Top)
  for (const line of lines) {
    const diff = Math.abs(value - line);
    if (diff < minDiff) {
      minDiff = diff;
      best = line;
      snapped = true;
    }
  }

  // Check second edge (Right/Bottom) - used primarily for dragging whole blocks
  if (checkSecondEdge) {
    const rightEdge = value + size;
    for (const line of lines) {
      const diff = Math.abs(rightEdge - line);
      if (diff < minDiff) {
        minDiff = diff;
        best = line - size;
        snapped = true;
      }
    }
  }

  return snapped ? best : value;
};

const App: React.FC = () => {
  // --- State ---
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(DEFAULT_CANVAS_CONFIG);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // History State
  const [history, setHistory] = useState<ProjectState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drag State (Refs for performance during fast pointer moves)
  const dragState = useRef<DragState>({
    isDragging: false,
    isResizing: false,
    handleType: DragHandleType.NONE,
    startX: 0,
    startY: 0,
    initialBlock: null,
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  const hasGif = React.useMemo(() => 
    blocks.some(b => b.imageUrl?.startsWith('data:image/gif')),
  [blocks]);

  const selectedBlock = React.useMemo(() => 
    blocks.find(b => b.id === selectedBlockId) || null, 
  [blocks, selectedBlockId]);

  // --- History Management ---
  
  // Save state to history
  const pushToHistory = useCallback((newBlocks: BlockData[], newConfig: CanvasConfig) => {
    const newState: ProjectState = { blocks: newBlocks, canvasConfig: newConfig };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Initial History
  useEffect(() => {
    if (history.length === 0) {
      pushToHistory([], DEFAULT_CANVAS_CONFIG);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setBlocks(state.blocks);
      setCanvasConfig(state.canvasConfig);
      setHistoryIndex(newIndex);
      setSelectedBlockId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setBlocks(state.blocks);
      setCanvasConfig(state.canvasConfig);
      setHistoryIndex(newIndex);
      setSelectedBlockId(null);
    }
  };

  // --- Auto-Scaling ---

  useEffect(() => {
    const handleResize = () => {
      if (workspaceRef.current) {
        const parent = workspaceRef.current.parentElement;
        if (parent) {
          const availableWidth = parent.clientWidth - 80; // Padding
          const availableHeight = parent.clientHeight - 80;
          const newScale = Math.min(
            availableWidth / CANVAS_SIZE,
            availableHeight / CANVAS_SIZE,
            1 // Max scale 1
          );
          setScale(newScale > 0 ? newScale : 0.1);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Actions ---

  const addBlock = () => {
    if (blocks.length >= MAX_BLOCKS) return;

    // Smart placement (cascade)
    const offset = blocks.length * 50;
    const newBlock: BlockData = {
      id: crypto.randomUUID(),
      x: 100 + offset,
      y: 100 + offset,
      width: INITIAL_BLOCK_SIZE,
      height: INITIAL_BLOCK_SIZE,
      zIndex: blocks.length + 1,
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    pushToHistory(newBlocks, canvasConfig);
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    setSelectedBlockId(null);
    pushToHistory(newBlocks, canvasConfig);
  };

  const duplicateBlock = () => {
    if (!selectedBlockId || blocks.length >= MAX_BLOCKS) return;
    const blockToCopy = blocks.find(b => b.id === selectedBlockId);
    if (!blockToCopy) return;

    const newBlock: BlockData = {
      ...blockToCopy,
      id: crypto.randomUUID(),
      x: blockToCopy.x + 20,
      y: blockToCopy.y + 20,
      zIndex: blocks.length + 1,
    };
    
    // Ensure duplicate stays within bounds
    if (newBlock.x + newBlock.width > CANVAS_SIZE) newBlock.x = CANVAS_SIZE - newBlock.width;
    if (newBlock.y + newBlock.height > CANVAS_SIZE) newBlock.y = CANVAS_SIZE - newBlock.height;

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    pushToHistory(newBlocks, canvasConfig);
    setSelectedBlockId(newBlock.id);
  };

  const handleAlign = (id: string, type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    let newX = block.x;
    let newY = block.y;

    switch (type) {
      case 'left': newX = 0; break;
      case 'center-h': newX = (CANVAS_SIZE - block.width) / 2; break;
      case 'right': newX = CANVAS_SIZE - block.width; break;
      case 'top': newY = 0; break;
      case 'center-v': newY = (CANVAS_SIZE - block.height) / 2; break;
      case 'bottom': newY = CANVAS_SIZE - block.height; break;
    }

    const newBlocks = blocks.map(b => b.id === id ? { ...b, x: Math.round(newX), y: Math.round(newY) } : b);
    setBlocks(newBlocks);
    pushToHistory(newBlocks, canvasConfig);
  };

  const handleBorderChange = (id: string, updates: { color?: string; style?: BorderStyle }) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, borderColor: updates.color ?? b.borderColor, borderStyle: updates.style ?? b.borderStyle } : b);
    setBlocks(newBlocks);
    pushToHistory(newBlocks, canvasConfig);
  };

  const handleImageUpdate = (id: string, updates: { imageX?: number; imageY?: number; imageScale?: number }) => {
    setBlocks(prev => prev.map(b => {
        if (b.id !== id) return b;
        return {
            ...b,
            imageX: updates.imageX !== undefined ? updates.imageX : b.imageX,
            imageY: updates.imageY !== undefined ? updates.imageY : b.imageY,
            imageScale: updates.imageScale !== undefined ? updates.imageScale : b.imageScale,
        };
    }));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newBlocks = blocks.map(b => b.id === id ? { 
          ...b, 
          imageUrl: result,
          imageX: 0,
          imageY: 0,
          imageScale: 1
      } : b);
      setBlocks(newBlocks);
      pushToHistory(newBlocks, canvasConfig);
    };
    reader.readAsDataURL(file);
  };

  const handleBgColorChange = (color: string) => {
    const newConfig = { ...canvasConfig, backgroundColor: color, backgroundImage: undefined };
    setCanvasConfig(newConfig);
    pushToHistory(blocks, newConfig);
  };

  const handleBgImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newConfig = { ...canvasConfig, backgroundImage: result };
      setCanvasConfig(newConfig);
      pushToHistory(blocks, newConfig);
    };
    reader.readAsDataURL(file);
  };

  const handleBorderRadiusChange = (radius: number) => {
    const newConfig = { ...canvasConfig, borderRadius: radius };
    setCanvasConfig(newConfig);
    pushToHistory(blocks, newConfig);
  };

  // --- File I/O ---

  const handleSave = () => {
    const data = JSON.stringify({ blocks, canvasConfig }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artframe-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        if (parsed.blocks && parsed.canvasConfig) {
          setBlocks(parsed.blocks);
          // Backwards compatibility for files without borderRadius
          setCanvasConfig({ ...DEFAULT_CANVAS_CONFIG, ...parsed.canvasConfig });
          setHistory([]);
          setHistoryIndex(-1);
          setTimeout(() => {
            pushToHistory(parsed.blocks, { ...DEFAULT_CANVAS_CONFIG, ...parsed.canvasConfig });
          }, 0);
        }
      } catch (err) {
        alert('Invalid project file');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    setSelectedBlockId(null); 
    setIsExporting(true);
    setExportProgress(0);
    setTimeout(async () => {
        try {
            await exportCanvasToPng({ blocks, canvasConfig }, (p) => {
              setExportProgress(p);
            });
        } catch(err) {
            console.error(err);
            alert('Failed to export. See console for details.');
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    }, 100);
  };

  // --- Interaction Logic (Pointer Events) ---

  const handleDragStart = (e: React.PointerEvent, blockId: string, handle: DragHandleType) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragState.current = {
      isDragging: handle === DragHandleType.NONE,
      isResizing: handle !== DragHandleType.NONE,
      handleType: handle,
      startX: e.clientX,
      startY: e.clientY,
      initialBlock: { ...block },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { isDragging, isResizing, startX, startY, initialBlock, handleType } = dragState.current;
    
    if ((!isDragging && !isResizing) || !initialBlock) return;

    const rawDeltaX = e.clientX - startX;
    const rawDeltaY = e.clientY - startY;
    const deltaX = rawDeltaX / scale;
    const deltaY = rawDeltaY / scale;

    const { xLines, yLines } = getSnapLines(initialBlock.id, blocks, CANVAS_SIZE);

    if (isDragging) {
      const rawX = initialBlock.x + deltaX;
      const rawY = initialBlock.y + deltaY;
      
      const newX = snap(rawX, xLines, SNAP_THRESHOLD, SNAP_GRID, initialBlock.width, true);
      const newY = snap(rawY, yLines, SNAP_THRESHOLD, SNAP_GRID, initialBlock.height, true);

      // STRICT CLAMP: Ensure block is fully inside canvas
      const minX = 0;
      const maxX = CANVAS_SIZE - initialBlock.width;
      const minY = 0;
      const maxY = CANVAS_SIZE - initialBlock.height;

      const clampedX = Math.max(minX, Math.min(newX, maxX));
      const clampedY = Math.max(minY, Math.min(newY, maxY));

      setBlocks(prev => prev.map(b => 
        b.id === initialBlock.id 
          ? { ...b, x: Math.round(clampedX), y: Math.round(clampedY) } 
          : b
      ));
    } else if (isResizing) {
      let newX = initialBlock.x;
      let newY = initialBlock.y;
      let newW = initialBlock.width;
      let newH = initialBlock.height;

      const snapEdge = (val: number, lines: number[]) => 
        snap(val, lines, SNAP_THRESHOLD, SNAP_GRID, 0, false);

      switch (handleType) {
        case DragHandleType.BOTTOM_RIGHT: {
          const rawR = initialBlock.x + initialBlock.width + deltaX;
          const snappedR = snapEdge(rawR, xLines);
          newW = Math.max(MIN_BLOCK_SIZE, snappedR - initialBlock.x);
          
          // Clamp Right Edge
          if (initialBlock.x + newW > CANVAS_SIZE) {
            newW = CANVAS_SIZE - initialBlock.x;
          }

          const rawB = initialBlock.y + initialBlock.height + deltaY;
          const snappedB = snapEdge(rawB, yLines);
          newH = Math.max(MIN_BLOCK_SIZE, snappedB - initialBlock.y);
          
          // Clamp Bottom Edge
          if (initialBlock.y + newH > CANVAS_SIZE) {
            newH = CANVAS_SIZE - initialBlock.y;
          }
          break;
        }

        case DragHandleType.BOTTOM_LEFT: {
          const rawL = initialBlock.x + deltaX;
          const snappedL = snapEdge(rawL, xLines);
          const maxLeft = initialBlock.x + initialBlock.width - MIN_BLOCK_SIZE;
          newX = Math.min(maxLeft, snappedL);
          
          // Clamp Left
          newX = Math.max(0, newX);
          
          // Calculate new width based on new left position
          newW = initialBlock.width + (initialBlock.x - newX);
          
          const rawB_BL = initialBlock.y + initialBlock.height + deltaY;
          const snappedB_BL = snapEdge(rawB_BL, yLines);
          newH = Math.max(MIN_BLOCK_SIZE, snappedB_BL - initialBlock.y);
          
          // Clamp Bottom
          if (initialBlock.y + newH > CANVAS_SIZE) {
            newH = CANVAS_SIZE - initialBlock.y;
          }
          break;
        }

        case DragHandleType.TOP_RIGHT: {
          const rawR_TR = initialBlock.x + initialBlock.width + deltaX;
          const snappedR_TR = snapEdge(rawR_TR, xLines);
          newW = Math.max(MIN_BLOCK_SIZE, snappedR_TR - initialBlock.x);
          
          // Clamp Right
          if (initialBlock.x + newW > CANVAS_SIZE) {
            newW = CANVAS_SIZE - initialBlock.x;
          }

          const rawT = initialBlock.y + deltaY;
          const snappedT = snapEdge(rawT, yLines);
          const maxTop = initialBlock.y + initialBlock.height - MIN_BLOCK_SIZE;
          newY = Math.min(maxTop, snappedT);
          
          // Clamp Top
          newY = Math.max(0, newY);
          
          newH = initialBlock.height + (initialBlock.y - newY);
          break;
        }

        case DragHandleType.TOP_LEFT: {
          const rawL_TL = initialBlock.x + deltaX;
          const snappedL_TL = snapEdge(rawL_TL, xLines);
          const maxLeft_TL = initialBlock.x + initialBlock.width - MIN_BLOCK_SIZE;
          newX = Math.min(maxLeft_TL, snappedL_TL);
          
          // Clamp Left
          newX = Math.max(0, newX);
          
          newW = initialBlock.width + (initialBlock.x - newX);

          const rawT_TL = initialBlock.y + deltaY;
          const snappedT_TL = snapEdge(rawT_TL, yLines);
          const maxTop_TL = initialBlock.y + initialBlock.height - MIN_BLOCK_SIZE;
          newY = Math.min(maxTop_TL, snappedT_TL);
          
          // Clamp Top
          newY = Math.max(0, newY);
          
          newH = initialBlock.height + (initialBlock.y - newY);
          break;
        }
      }

      setBlocks(prev => prev.map(b => 
        b.id === initialBlock.id
          ? { ...b, x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) }
          : b
      ));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const { isDragging, isResizing } = dragState.current;
    
    if (isDragging || isResizing) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      
      dragState.current = {
        isDragging: false,
        isResizing: false,
        handleType: DragHandleType.NONE,
        startX: 0,
        startY: 0,
        initialBlock: null,
      };

      pushToHistory(blocks, canvasConfig);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedBlockId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <Toolbar 
        canAdd={blocks.length < MAX_BLOCKS}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasSelection={!!selectedBlockId}
        isExporting={isExporting}
        exportProgress={exportProgress}
        hasGif={hasGif}
        onAddBlock={addBlock}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onDuplicate={duplicateBlock}
      />

      {/* Main Content: Workspace + Properties Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Workspace */}
        <div 
          className="flex-1 overflow-hidden relative dot-pattern flex items-center justify-center p-10"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div 
            ref={workspaceRef}
            className="shadow-2xl shadow-black relative origin-center bg-zinc-900"
            style={{
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              minWidth: CANVAS_SIZE, // Strict sizing
              minHeight: CANVAS_SIZE,
              transform: `scale(${scale})`,
              backgroundColor: canvasConfig.backgroundColor,
              backgroundImage: canvasConfig.backgroundImage ? `url(${canvasConfig.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid #333', // Visual boundary
              borderRadius: `${canvasConfig.borderRadius}px`,
            }}
            onPointerDown={handleBackgroundClick}
          >
            {blocks.map(block => (
              <BlockComponent
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                scale={scale}
                onSelect={setSelectedBlockId}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
          
          {/* Scale Indicator */}
          <div className="absolute bottom-4 left-4 bg-zinc-900/80 px-3 py-1 rounded-full text-xs font-mono text-zinc-400 border border-zinc-800 pointer-events-none">
            {(scale * 100).toFixed(0)}%
          </div>
        </div>

        {/* Sidebar */}
        <PropertiesPanel 
           selectedBlock={selectedBlock}
           canvasConfig={canvasConfig}
           onBgColorChange={handleBgColorChange}
           onBgImageUpload={handleBgImageUpload}
           onBorderRadiusChange={handleBorderRadiusChange}
           onAlign={handleAlign}
           onBorderChange={handleBorderChange}
           onImageUpdate={handleImageUpdate}
           onImageUpload={handleImageUpload}
           onDelete={deleteBlock}
           onDuplicate={duplicateBlock}
        />
      </div>
    </div>
  );
};

export default App;