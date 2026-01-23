import React from 'react';
import { 
  Plus, 
  Upload, 
  Save, 
  Undo2, 
  Redo2, 
  Copy,
  FileType,
  Loader2,
  FileVideo
} from 'lucide-react';

interface ToolbarProps {
  canAdd: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  isExporting?: boolean;
  exportProgress?: number;
  hasGif?: boolean;
  onAddBlock: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onExport: () => void;
  onDuplicate: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  canAdd,
  canUndo,
  canRedo,
  hasSelection,
  isExporting = false,
  exportProgress = 0,
  hasGif = false,
  onAddBlock,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onExport,
  onDuplicate,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md flex items-center px-4 justify-between select-none z-50 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border-r border-zinc-800 pr-3 mr-1">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent mr-2">
                ArtFrame
            </span>
        </div>

        {/* History Controls */}
        <div className="flex items-center bg-zinc-800/50 rounded-lg p-1 border border-zinc-700/50">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${!canUndo ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded hover:bg-zinc-700 transition-colors ${!canRedo ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-800 mx-1"></div>

        {/* Block Actions */}
        <button
          onClick={onAddBlock}
          disabled={!canAdd}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-all ${
            canAdd 
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <Plus size={16} />
          <span>Add Block</span>
        </button>

        <button
          onClick={onDuplicate}
          disabled={!hasSelection || !canAdd}
          className={`p-2 rounded hover:bg-zinc-800 text-zinc-300 transition-colors ${(!hasSelection || !canAdd) ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Duplicate Selected"
        >
          <Copy size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* File Actions */}
        <div className="flex items-center gap-1">
            <button
                onClick={onSave}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 transition-colors text-sm"
            >
                <Save size={16} />
                <span>Save</span>
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-800 text-zinc-300 transition-colors text-sm"
            >
                <Upload size={16} />
                <span>Load</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={(e) => {
                    if (e.target.files?.[0]) onLoad(e.target.files[0]);
                }}
            />
            
            <button
                onClick={onExport}
                disabled={isExporting}
                className="relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-900 font-medium transition-colors text-sm ml-2 disabled:opacity-90 disabled:cursor-wait min-w-[140px] justify-center"
            >
                {/* Progress Bar Background */}
                {isExporting && exportProgress > 0 && (
                  <div 
                    className="absolute inset-0 bg-blue-200/50 transition-all duration-300 ease-out z-0 origin-left" 
                    style={{ width: `${exportProgress * 100}%` }} 
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-2">
                  {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : hasGif ? (
                    <FileVideo size={16} />
                  ) : (
                    <FileType size={16} />
                  )}
                  <span>
                    {isExporting 
                      ? (exportProgress > 0 ? `${Math.round(exportProgress * 100)}%` : 'Processing...') 
                      : (hasGif ? 'Export Video' : 'Export PNG')}
                  </span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};