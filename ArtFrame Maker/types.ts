export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';

export interface BlockData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  imageUrl?: string;
  borderColor?: string;
  borderStyle?: BorderStyle;
  // Image Manipulation
  imageX?: number;
  imageY?: number;
  imageScale?: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  borderRadius: number;
}

export interface ProjectState {
  blocks: BlockData[];
  canvasConfig: CanvasConfig;
}

export enum DragHandleType {
  TOP_LEFT = 'tl',
  TOP_RIGHT = 'tr',
  BOTTOM_LEFT = 'bl',
  BOTTOM_RIGHT = 'br',
  NONE = 'none'
}

export interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  handleType: DragHandleType;
  startX: number;
  startY: number;
  initialBlock: BlockData | null;
}