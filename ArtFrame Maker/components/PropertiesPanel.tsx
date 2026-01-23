import React from 'react';
import { 
  AlignLeft, 
  AlignCenterHorizontal, 
  AlignRight, 
  ArrowUpToLine, 
  AlignCenterVertical, 
  ArrowDownToLine,
  Trash2,
  Upload,
  Copy,
  Palette,
  Image as ImageIcon,
  Move,
  Maximize,
  Scan
} from 'lucide-react';
import { BlockData, CanvasConfig, BorderStyle } from '../types';
import { COLORS } from '../constants';

interface PropertiesPanelProps {
  selectedBlock: BlockData | null;
  canvasConfig: CanvasConfig;
  onBgColorChange: (color: string) => void;
  onBgImageUpload: (file: File) => void;
  onBorderRadiusChange: (radius: number) => void;
  onAlign: (id: string, type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
  onBorderChange: (id: string, updates: { color?: string; style?: BorderStyle }) => void;
  onImageUpdate: (id: string, updates: { imageX?: number; imageY?: number; imageScale?: number }) => void;
  onImageUpload: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  onDuplicate: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedBlock,
  canvasConfig,
  onBgColorChange,
  onBgImageUpload,
  onBorderRadiusChange,
  onAlign,
  onBorderChange,
  onImageUpdate,
  onImageUpload,
  onDelete,
  onDuplicate
}) => {
  const bgImageInputRef = React.useRef<HTMLInputElement>(null);
  const blockImageInputRef = React.useRef<HTMLInputElement>(null);
  const borderColorInputRef = React.useRef<HTMLInputElement>(null);

  const btnClass = "p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors flex items-center justify-center border border-zinc-700/50";
  const labelClass = "text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-4";

  return (
    <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full overflow-y-auto shrink-0 shadow-xl z-20">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
        <h2 className="font-bold text-zinc-100 flex items-center gap-2">
            Settings
        </h2>
      </div>

      <div className="p-4 flex-1 pb-20">
        {/* --- Global Canvas Settings --- */}
        <div className="mb-6">
          <div className={labelClass} style={{ marginTop: 0 }}>Canvas Appearance</div>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => onBgColorChange(c)}
                className={`aspect-square rounded-md border border-zinc-700 shadow-sm transition-all hover:scale-110 ${
                  canvasConfig.backgroundColor === c ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
             <button 
                onClick={() => bgImageInputRef.current?.click()}
                className="aspect-square bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
                title="Set Background Image"
             >
                 <ImageIcon size={18} />
             </button>
          </div>
          
          <input 
              type="file" 
              ref={bgImageInputRef}
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                  if(e.target.files?.[0]) onBgImageUpload(e.target.files[0]);
              }}
           />

           <div className="mt-4 bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
             <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span className="flex items-center gap-1"><Scan size={12}/> Corner Radius</span>
                <span className="font-mono text-zinc-300">{canvasConfig.borderRadius}px</span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="540" 
                step="1"
                value={canvasConfig.borderRadius}
                onChange={(e) => onBorderRadiusChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
           </div>
        </div>

        <div className="w-full h-px bg-zinc-800 my-4"></div>

        {/* --- Selected Block Settings --- */}
        {selectedBlock ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between">
                <div className={labelClass} style={{ marginTop: 0 }}>Block Settings</div>
                <div className="text-xs text-zinc-600 font-mono">ID: {selectedBlock.id.slice(0, 4)}</div>
             </div>

             {/* Actions Grid */}
             <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  onClick={() => blockImageInputRef.current?.click()}
                  className={`${btnClass} gap-2 col-span-2 bg-blue-900/20 text-blue-200 border-blue-900/30 hover:bg-blue-900/40`}
                >
                  <Upload size={16} />
                  <span className="text-sm">Upload Image</span>
                </button>
                <input
                  type="file"
                  ref={blockImageInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onImageUpload(selectedBlock.id, e.target.files[0]);
                  }}
                />

                <button onClick={onDuplicate} className={btnClass} title="Duplicate">
                  <Copy size={16} className="mr-2" /> Duplicate
                </button>
                <button onClick={() => onDelete(selectedBlock.id)} className={`${btnClass} hover:bg-red-900/30 hover:text-red-400 border-red-900/20`} title="Delete">
                  <Trash2 size={16} className="mr-2" /> Delete
                </button>
             </div>

             {/* Image Controls (Only if image exists) */}
             {selectedBlock.imageUrl && (
                <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50 mb-4 animate-in zoom-in-95 duration-200">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Image Transform</div>
                  <div className="space-y-4">
                      
                      {/* Scale */}
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-zinc-400">
                              <span className="flex items-center gap-1"><Maximize size={12}/> Scale</span>
                              <span className="font-mono text-zinc-300">{(selectedBlock.imageScale ?? 1).toFixed(1)}x</span>
                          </div>
                          <input 
                              type="range" 
                              min="0.1" 
                              max="3" 
                              step="0.1"
                              value={selectedBlock.imageScale ?? 1}
                              onChange={(e) => onImageUpdate(selectedBlock.id, { imageScale: parseFloat(e.target.value) })}
                              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      {/* Position X */}
                      <div className="space-y-1">
                          <div className="flex justify-between text-xs text-zinc-400">
                              <span className="flex items-center gap-1"><Move size={12}/> Pan X</span>
                              <span className="font-mono text-zinc-300">{selectedBlock.imageX ?? 0}</span>
                          </div>
                          <input 
                              type="range" 
                              min="-500" 
                              max="500" 
                              step="10"
                              value={selectedBlock.imageX ?? 0}
                              onChange={(e) => onImageUpdate(selectedBlock.id, { imageX: parseInt(e.target.value) })}
                              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                       {/* Position Y */}
                       <div className="space-y-1">
                          <div className="flex justify-between text-xs text-zinc-400">
                              <span className="flex items-center gap-1"><Move size={12}/> Pan Y</span>
                              <span className="font-mono text-zinc-300">{selectedBlock.imageY ?? 0}</span>
                          </div>
                          <input 
                              type="range" 
                              min="-500" 
                              max="500" 
                              step="10"
                              value={selectedBlock.imageY ?? 0}
                              onChange={(e) => onImageUpdate(selectedBlock.id, { imageY: parseInt(e.target.value) })}
                              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>
                  </div>
                </div>
             )}

             {/* Alignment Grid */}
             <div className={labelClass}>Alignment</div>
             <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => onAlign(selectedBlock.id, 'left')} className={btnClass} title="Align Left">
                    <AlignLeft size={18} />
                </button>
                <button onClick={() => onAlign(selectedBlock.id, 'center-h')} className={btnClass} title="Center Horizontal">
                    <AlignCenterHorizontal size={18} />
                </button>
                <button onClick={() => onAlign(selectedBlock.id, 'right')} className={btnClass} title="Align Right">
                    <AlignRight size={18} />
                </button>
                <button onClick={() => onAlign(selectedBlock.id, 'top')} className={btnClass} title="Align Top">
                    <ArrowUpToLine size={18} />
                </button>
                <button onClick={() => onAlign(selectedBlock.id, 'center-v')} className={btnClass} title="Center Vertical">
                    <AlignCenterVertical size={18} />
                </button>
                <button onClick={() => onAlign(selectedBlock.id, 'bottom')} className={btnClass} title="Align Bottom">
                    <ArrowDownToLine size={18} />
                </button>
             </div>

             {/* Appearance */}
             <div className={labelClass}>Appearance</div>
             <div className="grid grid-cols-1 gap-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                   <span className="text-sm text-zinc-400">Border Style</span>
                   <select
                      value={selectedBlock.borderStyle || 'none'}
                      onChange={(e) => onBorderChange(selectedBlock.id, { style: e.target.value as BorderStyle })}
                      className="bg-zinc-900 text-zinc-200 text-sm rounded border border-zinc-700 h-8 px-2 outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px]"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                </div>
                
                <div className="flex items-center justify-between">
                   <span className="text-sm text-zinc-400">Border Color</span>
                   <div className="flex items-center gap-2">
                       <button 
                          onClick={() => borderColorInputRef.current?.click()}
                          className="w-8 h-8 rounded border border-zinc-600 flex items-center justify-center hover:scale-105 transition-transform"
                          style={{ backgroundColor: selectedBlock.borderColor || '#ffffff' }}
                       >
                         <Palette size={14} className="mix-blend-difference text-white" />
                       </button>
                       <input 
                          ref={borderColorInputRef}
                          type="color"
                          value={selectedBlock.borderColor || '#ffffff'}
                          onChange={(e) => onBorderChange(selectedBlock.id, { color: e.target.value })}
                          className="absolute opacity-0 w-0 h-0"
                       />
                   </div>
                </div>
             </div>

             {/* Dimensions Readout */}
             <div className={labelClass}>Dimensions</div>
             <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400 font-mono">
                <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-800 flex justify-between">
                   <span>X:</span> <span className="text-zinc-200">{selectedBlock.x}</span>
                </div>
                <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-800 flex justify-between">
                   <span>Y:</span> <span className="text-zinc-200">{selectedBlock.y}</span>
                </div>
                <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-800 flex justify-between">
                   <span>W:</span> <span className="text-zinc-200">{selectedBlock.width}</span>
                </div>
                <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-800 flex justify-between">
                   <span>H:</span> <span className="text-zinc-200">{selectedBlock.height}</span>
                </div>
             </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
             <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
               <span className="text-2xl">?</span>
             </div>
             <p className="text-sm font-medium">No block selected</p>
             <p className="text-xs mt-1">Click a block to edit</p>
          </div>
        )}
      </div>
    </div>
  );
};