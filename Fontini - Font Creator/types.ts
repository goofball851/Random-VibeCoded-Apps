
export interface Point {
  x: number;
  y: number;
}

export interface PathNode extends Point {
  cpIn?: Point;  // Control Point In (incoming tangent)
  cpOut?: Point; // Control Point Out (outgoing tangent)
  smooth?: boolean; // Whether handles are linked symmetrically
}

export type ToolType = 'brush' | 'pen' | 'eraser' | 'select' | 'move' | 'fill';

export type FillPattern = 'solid' | 'hatch' | 'dots' | 'grid';

export interface Stroke {
  points: Point[];      // Used by brush and eraser
  nodes?: PathNode[];   // Used by pen tool for true vector paths
  type: ToolType;
  weight: number;       // The thickness of the stroke
  closed?: boolean;     // Whether the path is a closed loop
  filled?: boolean;     // Whether the path should be rendered as a solid shape
  fillColor?: string;   // Hex color for the fill
  fillPattern?: FillPattern; // Pattern type for the fill
}

export interface DrawingData {
  char: string;
  strokes: Stroke[];
  dataUrl: string; // for thumbnail preview
  referenceImage?: string; // base64 reference image
}

export type CharacterSet = string[];

export const ALPHABET_NUMBERS: CharacterSet = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];
