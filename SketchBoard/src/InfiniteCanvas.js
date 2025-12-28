import React, { useState, useRef, useEffect } from 'react';
import { Upload, Palette, Eraser, Trash2, Move, ZoomIn, ZoomOut, Undo, Redo, Download, XCircle, Hand } from 'lucide-react';

export default function InfiniteCanvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [isPanning, setIsPanning] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [images, setImages] = useState([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const [paths, setPaths] = useState([]);
  const [history, setHistory] = useState([{ paths: [], images: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Force initial redraw
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    redraw();
  }, [paths, images, offset, zoom]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected image - check this FIRST
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedImageIndex !== null) {
          e.preventDefault();
          deleteSelectedImage();
          return;
        }
      }
      
      // Brush size adjustments
      if (e.key === '[') {
        e.preventDefault();
        setBrushSize(prev => Math.max(1, prev - 2));
      } else if (e.key === ']') {
        e.preventDefault();
        setBrushSize(prev => Math.min(50, prev + 2));
      }
      
      // Tool shortcuts
      else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setTool('brush');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setTool('eraser');
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setTool('move');
      }
      
      // Undo/Redo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo
          setHistoryIndex(prev => {
            if (prev < history.length - 1) {
              const newIndex = prev + 1;
              setPaths(history[newIndex].paths);
              setImages(history[newIndex].images);
              setSelectedImageIndex(null);
              return newIndex;
            }
            return prev;
          });
        } else {
          // Undo
          setHistoryIndex(prev => {
            if (prev > 0) {
              const newIndex = prev - 1;
              setPaths(history[newIndex].paths);
              setImages(history[newIndex].images);
              setSelectedImageIndex(null);
              return newIndex;
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, selectedImageIndex, images, paths, historyIndex]);

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw images
    images.forEach((img, index) => {
      if (img.loaded) {
        ctx.drawImage(img.element, img.x, img.y, img.width, img.height);
        
        // Draw border around selected image
        if (index === selectedImageIndex) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3 / zoom;
          ctx.strokeRect(img.x, img.y, img.width, img.height);
        }
      }
    });

    // Draw paths
    paths.forEach(path => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';
      
      ctx.beginPath();
      path.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });

    ctx.restore();
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / zoom,
      y: (e.clientY - rect.top - offset.y) / zoom
    };
  };

  const handleMouseDown = (e) => {
    const point = getCanvasPoint(e);
    
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 0 && tool === 'move') {
      // Check if clicking on an image
      for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        if (point.x >= img.x && point.x <= img.x + img.width &&
            point.y >= img.y && point.y <= img.y + img.height) {
          setSelectedImageIndex(i);
          setIsDraggingImage(true);
          lastPos.current = point;
          return;
        }
      }
    } else if (e.button === 0 && tool === 'pan') {
      setIsPanning(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 0) {
      setIsDrawing(true);
      setPaths([...paths, {
        points: [point],
        color: color,
        size: brushSize,
        tool: tool
      }]);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      lastPos.current = { x: e.clientX, y: e.clientY };
    } else if (isDraggingImage && selectedImageIndex !== null) {
      const point = getCanvasPoint(e);
      const dx = point.x - lastPos.current.x;
      const dy = point.y - lastPos.current.y;
      
      setImages(prev => {
        const newImages = [...prev];
        newImages[selectedImageIndex] = {
          ...newImages[selectedImageIndex],
          x: newImages[selectedImageIndex].x + dx,
          y: newImages[selectedImageIndex].y + dy
        };
        return newImages;
      });
      
      lastPos.current = point;
    } else if (isDrawing) {
      const point = getCanvasPoint(e);
      setPaths(prev => {
        const newPaths = [...prev];
        const currentPath = newPaths[newPaths.length - 1];
        currentPath.points.push(point);
        return newPaths;
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      saveToHistory();
    }
    if (isDraggingImage) {
      saveToHistory();
      setIsDraggingImage(false);
      // Keep selectedImageIndex - don't clear it!
    }
    setIsDrawing(false);
    setIsPanning(false);
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ paths: [...paths], images: [...images] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPaths(history[newIndex].paths);
      setImages(history[newIndex].images);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPaths(history[newIndex].paths);
      setImages(history[newIndex].images);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(0.1, zoom * delta), 5);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const wx = (mouseX - offset.x) / zoom;
    const wy = (mouseY - offset.y) / zoom;
    
    setOffset({
      x: mouseX - wx * newZoom,
      y: mouseY - wy * newZoom
    });
    setZoom(newZoom);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newImage = {
            element: img,
            x: -offset.x / zoom,
            y: -offset.y / zoom,
            width: img.width,
            height: img.height,
            loaded: true
          };
          setImages([...images, newImage]);
          setTimeout(saveToHistory, 0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveImage = () => {
    if (paths.length === 0 && images.length === 0) {
      alert('Nothing to save!');
      return;
    }

    // Clear any previous preview
    setPreviewImage(null);

    // Calculate bounds of all content
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    paths.forEach(path => {
      path.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    images.forEach(img => {
      minX = Math.min(minX, img.x);
      minY = Math.min(minY, img.y);
      maxX = Math.max(maxX, img.x + img.width);
      maxY = Math.max(maxY, img.y + img.height);
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Translate to account for bounds
    ctx.translate(-minX, -minY);

    // Draw images
    images.forEach(img => {
      if (img.loaded) {
        ctx.drawImage(img.element, img.x, img.y, img.width, img.height);
      }
    });

    // Draw paths
    paths.forEach(path => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';
      
      ctx.beginPath();
      path.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });

    // Reset transform and composite operation for watermark
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    
    // Add watermark in lower right corner of cropped canvas
    ctx.font = '16px "Comic Sans MS", "Comic Sans", cursive';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('SketchBoard', width - 15, height - 15);

    // Generate preview with timestamp to prevent caching
    const dataUrl = exportCanvas.toDataURL('image/png');
    setPreviewImage(dataUrl);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    if (!previewImage) return;
    
    // Create a temporary link and click it to download
    const a = document.createElement('a');
    a.href = previewImage;
    a.download = `drawing-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setShowSaveModal(false);
    setPreviewImage(null);
  };

  const cancelSave = () => {
    setShowSaveModal(false);
    setPreviewImage(null);
  };

  const clearEverything = () => {
    if (paths.length === 0 && images.length === 0) {
      alert('Canvas is already empty!');
      return;
    }
    setShowClearModal(true);
  };

  const confirmClear = () => {
    setPaths([]);
    setImages([]);
    setHistory([{ paths: [], images: [] }]);
    setHistoryIndex(0);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setShowClearModal(false);
  };

  const cancelClear = () => {
    setShowClearModal(false);
  };

  const deleteSelectedImage = () => {
    if (selectedImageIndex === null) return;
    
    const newImages = images.filter((_, index) => index !== selectedImageIndex);
    setImages(newImages);
    setSelectedImageIndex(null);
    
    // Save to history
    setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ paths: [...paths], images: [...newImages] });
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }, 0);
  };

  const handleZoom = (zoomIn) => {
    const newZoom = zoomIn ? Math.min(zoom * 1.2, 5) : Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  const clearCanvas = () => {
    if (paths.length > 0 || images.length > 0) {
      if (!confirm('Are you sure you want to reset the canvas? This cannot be undone.')) {
        return;
      }
    }
    setPaths([]);
    setImages([]);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setHistory([{ paths: [], images: [] }]);
    setHistoryIndex(0);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-100">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-3">
        <div className="flex flex-col gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded flex items-center justify-center gap-1 ${historyIndex <= 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Undo"
          >
            <Undo size={18} />
            <span className="text-xs">Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded flex items-center justify-center gap-1 ${historyIndex >= history.length - 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Redo"
          >
            <Redo size={18} />
            <span className="text-xs">Redo</span>
          </button>
        </div>

        <div className="border-t pt-3 flex flex-col gap-2">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded flex items-center justify-center gap-1 ${tool === 'brush' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            title="Brush"
          >
            <Palette size={18} />
            <span className="text-xs">Brush</span>
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded flex items-center justify-center gap-1 ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            title="Eraser"
          >
            <Eraser size={18} />
            <span className="text-xs">Eraser</span>
          </button>
          <button
            onClick={() => setTool('move')}
            className={`p-2 rounded flex items-center justify-center gap-1 ${tool === 'move' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            title="Move Images"
          >
            <Hand size={18} />
            <span className="text-xs">Move</span>
          </button>
          <button
            onClick={() => setTool('pan')}
            className={`p-2 rounded flex items-center justify-center gap-1 ${tool === 'pan' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            title="Pan"
          >
            <Move size={18} />
            <span className="text-xs">Pan</span>
          </button>
          <label className="p-2 rounded bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center gap-1" title="Upload Image">
            <Upload size={18} />
            <span className="text-xs">Upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="border-t pt-3 space-y-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
            title="Color"
          />
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
            title="Tool Size ([ ] keys)"
          />
          <div className="text-xs text-gray-500 text-center">Size: {brushSize}</div>
        </div>

        <div className="border-t pt-3 flex flex-col gap-2">
          <button
            onClick={() => handleZoom(true)}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1"
            title="Zoom In"
          >
            <ZoomIn size={18} />
            <span className="text-xs">Zoom In</span>
          </button>
          <button
            onClick={() => handleZoom(false)}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
            <span className="text-xs">Zoom Out</span>
          </button>
          <div className="text-xs text-gray-500 text-center">{Math.round(zoom * 100)}%</div>
        </div>

        <div className="border-t pt-3 flex flex-col gap-2">
          <button
            onClick={saveImage}
            className="w-full p-2 rounded bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center gap-1"
            title="Save Image"
          >
            <Download size={18} />
            <span className="text-xs">Save</span>
          </button>
          <button
            onClick={clearEverything}
            className="w-full p-2 rounded bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-1"
            title="Clear Canvas"
          >
            <XCircle size={18} />
            <span className="text-xs">Clear All</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h3 className="font-semibold mb-2">Controls:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Draw with mouse/trackpad</li>
          <li>• Middle click or Alt+drag to pan</li>
          <li>• Scroll to zoom</li>
          <li>• B = Brush, E = Eraser, M = Move</li>
          <li>• [ ] keys to adjust tool size</li>
          <li>• Click image in Move mode to select</li>
          <li>• Delete/Backspace to remove selected image</li>
          <li>• Cmd/Ctrl+Z = Undo</li>
          <li>• Shift+Cmd/Ctrl+Z = Redo</li>
          <li>• Save exports cropped image</li>
        </ul>
      </div>

      {/* Delete Image Button */}
      {selectedImageIndex !== null && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-xl p-3">
          <button
            onClick={deleteSelectedImage}
            className="px-6 py-2 rounded bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Selected Image
          </button>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="cursor-crosshair"
        style={{ cursor: tool === 'pan' || isPanning ? 'grab' : tool === 'move' ? 'move' : 'crosshair' }}
      />

      {/* Save Preview Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Save Drawing Preview</h2>
            <p className="text-gray-600 mb-4">This is how your drawing will be saved (cropped to content):</p>
            
            {previewImage && (
              <div className="mb-6 border border-gray-300 rounded overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-w-full max-h-[60vh] object-contain mx-auto"
                />
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelSave}
                className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-6 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
              >
                Save Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Canvas Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Clear Everything?</h2>
            <p className="text-gray-700 mb-6">
              This will permanently delete all your drawings and images from the canvas. This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClear}
                className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="px-6 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
