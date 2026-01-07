
import { DrawingData, Point, Stroke, PathNode } from '../types';

declare const opentype: any;

const mapToFontSpace = (point: Point, canvasWidth: number, canvasHeight: number) => {
  const unitsPerEm = 1000;
  const scale = unitsPerEm / Math.max(canvasWidth, canvasHeight);
  const baseline = canvasHeight * 0.8;
  
  return {
    x: point.x * scale,
    y: (baseline - point.y) * scale
  };
};

export const generateFontFile = (drawings: Record<string, DrawingData>, canvasWidth: number, canvasHeight: number) => {
  if (typeof opentype === 'undefined') {
    throw new Error('opentype.js is not loaded');
  }

  const unitsPerEm = 1000;
  const ascender = 800;
  const descender = -200;

  const glyphs = [
    new opentype.Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: 650,
      path: new opentype.Path()
    })
  ];

  Object.entries(drawings).forEach(([char, data]) => {
    const path = new opentype.Path();
    
    data.strokes.forEach((stroke) => {
      if (stroke.type === 'eraser') return;

      if (stroke.type === 'pen' && stroke.nodes && stroke.nodes.length > 0) {
        const nodes = stroke.nodes;
        const start = mapToFontSpace(nodes[0], canvasWidth, canvasHeight);
        path.moveTo(start.x, start.y);

        for (let i = 0; i < nodes.length - 1; i++) {
          const curr = nodes[i];
          const next = nodes[i + 1];
          const cp1 = mapToFontSpace(curr.cpOut || curr, canvasWidth, canvasHeight);
          const cp2 = mapToFontSpace(next.cpIn || next, canvasWidth, canvasHeight);
          const end = mapToFontSpace(next, canvasWidth, canvasHeight);
          path.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        }

        if (stroke.closed) {
          const curr = nodes[nodes.length - 1];
          const next = nodes[0];
          const cp1 = mapToFontSpace(curr.cpOut || curr, canvasWidth, canvasHeight);
          const cp2 = mapToFontSpace(next.cpIn || next, canvasWidth, canvasHeight);
          const end = mapToFontSpace(next, canvasWidth, canvasHeight);
          path.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
          path.close();
        }
      } else if (stroke.points.length > 0) {
        const pts = stroke.points.map(p => mapToFontSpace(p, canvasWidth, canvasHeight));
        path.moveTo(pts[0].x, pts[0].y);
        if (pts.length > 2) {
          for (let i = 1; i < pts.length - 2; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            path.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          const n = pts.length;
          path.quadraticCurveTo(pts[n-2].x, pts[n-2].y, pts[n-1].x, pts[n-1].y);
        } else if (pts.length === 2) {
          path.lineTo(pts[1].x, pts[1].y);
        }
      }
    });

    const glyph = new opentype.Glyph({
      name: char,
      unicode: char.charCodeAt(0),
      advanceWidth: 750,
      path: path
    });

    glyphs.push(glyph);
  });

  const font = new opentype.Font({
    familyName: 'HandyFontPro',
    styleName: 'Regular',
    unitsPerEm: unitsPerEm,
    ascender: ascender,
    descender: descender,
    glyphs: glyphs
  });

  return font.toArrayBuffer();
};
