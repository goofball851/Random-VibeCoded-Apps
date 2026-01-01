
export type FunboxEngineType = 'rive' | 'lottie';

export interface FunboxSession {
  itemId: string;
  url: string;
  type: FunboxEngineType;
}

export interface FunboxRuntimeProps {
  session: FunboxSession | null;
  onClose: () => void;
  version?: string;
}
