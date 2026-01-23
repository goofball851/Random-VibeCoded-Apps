import React from 'react';
import { BlockData, DragHandleType } from '../types';
import { Image as ImageIcon } from 'lucide-react';

interface BlockComponentProps {
  block: BlockData;
  isSelected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onDragStart: (e: React.PointerEvent, blockId: string, handle: DragHandleType) => void;
}

export const BlockComponent: React.FC<BlockComponentProps> = ({
  block,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(block.id);
    // Left click only
    if (e.button === 0) {
      onDragStart(e, block.id, DragHandleType.NONE);
    }
  };

  const handleResizeStart = (e: React.PointerEvent, handle: DragHandleType) => {
    e.stopPropagation();
    onSelect(block.id);
    if (e.button === 0) {
      onDragStart(e, block.id, handle);
    }
  };

  // Tailwind classes for handles
  const handleBaseClass = "absolute w-4 h-4 bg-white border border-zinc-400 rounded-full z-50 hover:scale-125 transition-transform shadow-md";

  // Border styles for the main div
  const borderStyle = block.borderStyle || 'none';
  const hasBorder = borderStyle !== 'none';
  const borderColor = block.borderColor || '#ffffff';
  
  // Image Transforms
  const imgScale = block.imageScale ?? 1;
  const imgX = block.imageX ?? 0;
  const imgY = block.imageY ?? 0;

  return (
    <div
      className={`absolute group touch-none select-none box-border ${
        isSelected ? 'ring-2 ring-blue-500 z-10' : 'z-0 hover:ring-2 hover:ring-zinc-600'
      }`}
      style={{
        left: `${block.x}px`,
        top: `${block.y}px`,
        width: `${block.width}px`,
        height: `${block.height}px`,
        borderWidth: hasBorder ? '4px' : '0',
        borderStyle: hasBorder ? borderStyle : 'none',
        borderColor: borderColor,
        // If image exists, background is transparent so PNG export works nicely
        backgroundColor: block.imageUrl ? 'transparent' : '#27272a',
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Inner Container for Content Clipping */}
      <div className="w-full h-full overflow-hidden relative pointer-events-none">
        {block.imageUrl ? (
          <img
            src={block.imageUrl}
            alt="Block Content"
            className="w-full h-full object-cover"
            style={{
              transform: `translate(${imgX}px, ${imgY}px) scale(${imgScale})`,
              transformOrigin: 'center center',
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            <ImageIcon className="w-12 h-12 opacity-50" />
          </div>
        )}
      </div>

      {/* Resize Handles (Outside clipping container so they don't get cut off) */}
      {isSelected && (
        <>
          <div
            className={`${handleBaseClass} cursor-nw-resize -top-2 -left-2`}
            onPointerDown={(e) => handleResizeStart(e, DragHandleType.TOP_LEFT)}
          />
          <div
            className={`${handleBaseClass} cursor-ne-resize -top-2 -right-2`}
            onPointerDown={(e) => handleResizeStart(e, DragHandleType.TOP_RIGHT)}
          />
          <div
            className={`${handleBaseClass} cursor-sw-resize -bottom-2 -left-2`}
            onPointerDown={(e) => handleResizeStart(e, DragHandleType.BOTTOM_LEFT)}
          />
          <div
            className={`${handleBaseClass} cursor-se-resize -bottom-2 -right-2`}
            onPointerDown={(e) => handleResizeStart(e, DragHandleType.BOTTOM_RIGHT)}
          />
        </>
      )}
    </div>
  );
};