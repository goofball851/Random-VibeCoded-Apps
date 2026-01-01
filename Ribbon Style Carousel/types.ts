
import { FunboxSession } from './funbox/types';

export type MediaType = 'image' | 'video' | 'rive';

export interface CarouselItemData {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  poster?: string;
}

export interface Position {
  x: number;
  y: number;
}

// Re-export for convenience in the main app
export type { FunboxSession };
