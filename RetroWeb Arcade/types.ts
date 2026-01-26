export enum ConsoleSystem {
  NES = 'nes',
  SNES = 'snes',
  GENESIS = 'segaMD', // EmulatorJS core name for Mega Drive/Genesis
  GAMEGEAR = 'gamegear',
  GAMEBOY = 'gb',
  GBC = 'gbc',
  GBA = 'gba',
  NDS = 'nds',
}

export interface GameMetadata {
  title: string;
  description: string;
  genre: string;
  releaseYear: string;
  coverQuery: string; // Used to seed the placeholder image
  coverUrl?: string; // Direct URL to box art found via search
}

export interface Game {
  id: string;
  filename: string;
  system: ConsoleSystem;
  addedAt: number;
  metadata: GameMetadata;
  hasSaveState?: boolean;
  // Blob is stored in IndexedDB, not always kept in memory in the list view
}

export interface StoredGame extends Game {
  blob: Blob;
}

// Window augmentation for EmulatorJS
declare global {
  interface Window {
    EJS_player: string;
    EJS_core: string;
    EJS_gameUrl: string;
    EJS_pathtodata: string;
    EJS_startOnLoaded: boolean;
    EJS_DEBUG_XX: boolean;
    EJS_biosUrl?: string;
    EJS_onGameStart?: () => void;
    // Attempt to type the internal emulator object if available
    EJS_emulator?: {
        saveState: () => void;
        loadState: () => void;
        restart: () => void;
    };
  }
}