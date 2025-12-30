
import { CarouselItemData } from './types';

export const ITEM_WIDTH = 480;
export const ITEM_HEIGHT = 400;
export const GAP = 32;
export const FULL_LOOP_DURATION = 60; 
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1200;

// 3 tracks of 6 logical spots (1 hidden at start, 4-5 visible, 1 hidden at end)
export const LOGICAL_SPOTS_PER_TRACK = 6;
export const DESKTOP_TOTAL_LOGICAL_SPOTS = 3 * LOGICAL_SPOTS_PER_TRACK; // 18

export const SAMPLE_DATA: CarouselItemData[] = [
  { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=640&q=80', title: 'Neon Tokyo' },
  { id: '2', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', title: 'Rabbit Run' },
  { id: '3', type: 'rive', url: 'https://cdn.rive.app/animations/vehicles.riv', title: 'Cyber Chassis' },
  { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=640&q=80', title: 'Retro Tech' },
  { id: '5', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', title: 'Surreal Vision' },
  { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&q=80', title: 'Deep Space' },
  { id: '7', type: 'rive', url: 'https://cdn.rive.app/animations/marty.riv', title: 'Hero Entity' },
  { id: '8', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', title: 'Blazing Trails' },
  { id: '9', type: 'image', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&q=80', title: 'Processor Core' },
  { id: '10', type: 'image', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=640&q=80', title: 'Digital Gradient' },
  { id: '11', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', title: 'Wild Escape' },
  { id: '12', type: 'image', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=640&q=80', title: 'Neural Network' },
  { id: '13', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80', title: 'Abstract Flow' },
  { id: '14', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', title: 'Joyride' },
  { id: '15', type: 'image', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=640&q=80', title: 'Cyber Prism' }
];
