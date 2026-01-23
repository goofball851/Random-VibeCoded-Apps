import { CanvasConfig } from './types';

export const CANVAS_SIZE = 1080;

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  backgroundColor: '#18181b', // zinc-900
  backgroundImage: undefined,
  borderRadius: 0,
};

export const MAX_BLOCKS = 4;
export const MIN_BLOCK_SIZE = 50;

export const INITIAL_BLOCK_SIZE = 300;

export const SNAP_THRESHOLD = 15;
export const SNAP_GRID = 20;

export const COLORS = [
  '#18181b', // zinc-900
  '#ffffff', // white
  '#000000', // black
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
];