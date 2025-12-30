
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
