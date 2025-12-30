
export interface Track {
  id: string;
  name: string;
  artist: string;
  file: File;
  duration?: number;
  blobUrl: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrackIndex: number;
  playlist: Track[];
  volume: number;
  currentTime: number;
  duration: number;
}

export enum MascotMood {
  IDLE = 'IDLE',
  HAPPY = 'HAPPY',
  DANCING = 'DANCING',
  BOUNCY = 'BOUNCY',
  SLEEPING = 'SLEEPING'
}
