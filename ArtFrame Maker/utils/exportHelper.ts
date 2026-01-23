import { ProjectState, BlockData } from '../types';

// @ts-ignore
import * as _gifuct from 'gifuct-js';
// @ts-ignore
import * as _mp4muxer from 'mp4-muxer';

/**
 * Library Extractor
 */
const getLib = (mod: any, name: string) => {
  if (mod && mod[name]) return mod[name];
  if (mod && mod.default && mod.default[name]) return mod.default[name];
  if (mod && mod.default) return mod.default;
  return undefined;
};

// Initialize Libraries
const parseGIF = getLib(_gifuct, 'parseGIF');
const decompressFrames = getLib(_gifuct, 'decompressFrames');
const Muxer = getLib(_mp4muxer, 'Muxer');

if (!parseGIF) console.warn('parseGIF not found in import', _gifuct);
if (!Muxer) console.warn('mp4-muxer not found');

// --- Helpers ---

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

const drawImageWithTransform = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetX: number = 0,
  offsetY: number = 0,
  userScale: number = 1
) => {
  ctx.save();
  // Clip to block area
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // 1. Calculate natural "Cover" dimensions (centered)
  const imgRatio = img.width / img.height;
  const blockRatio = w / h;
  
  // Calculate scale needed to cover the block
  // If block is wider than image (higher aspect ratio), scale based on width
  // If block is taller than image (lower aspect ratio), scale based on height
  // Scale = Target / Source
  
  // Actually simpler:
  // We want to scale the image such that it covers the box.
  // scale = Math.max(w / img.width, h / img.height)
  const coverScale = Math.max(w / img.width, h / img.height);
  
  const coverW = img.width * coverScale;
  const coverH = img.height * coverScale;
  
  // Natural center position (before user transform)
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  
  // 2. Apply User Transforms
  // We draw the image centered at centerX + offsetX, centerY + offsetY
  // With size coverW * userScale, coverH * userScale
  
  const finalW = coverW * userScale;
  const finalH = coverH * userScale;
  const finalX = (centerX + offsetX) - (finalW / 2);
  const finalY = (centerY + offsetY) - (finalH / 2);

  ctx.drawImage(img, finalX, finalY, finalW, finalH);
  
  ctx.restore();
};

const drawBlock = async (ctx: CanvasRenderingContext2D, block: BlockData, customImg?: HTMLImageElement | HTMLCanvasElement) => {
  ctx.save();
  
  const imgX = block.imageX ?? 0;
  const imgY = block.imageY ?? 0;
  const imgScale = block.imageScale ?? 1;

  if (customImg) {
    drawImageWithTransform(ctx, customImg, block.x, block.y, block.width, block.height, imgX, imgY, imgScale);
  } else if (block.imageUrl) {
    try {
      const img = await loadImage(block.imageUrl);
      drawImageWithTransform(ctx, img, block.x, block.y, block.width, block.height, imgX, imgY, imgScale);
    } catch (e) {
      ctx.fillStyle = '#333';
      ctx.fillRect(block.x, block.y, block.width, block.height);
    }
  } else {
    ctx.fillStyle = '#27272a';
    ctx.fillRect(block.x, block.y, block.width, block.height);
  }

  const borderStyle = block.borderStyle || 'none';
  if (borderStyle !== 'none') {
      const borderWidth = 4;
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = block.borderColor || '#ffffff';
      
      switch (borderStyle) {
          case 'dashed': ctx.setLineDash([15, 10]); break;
          case 'dotted': ctx.setLineDash([4, 6]); break;
          case 'solid': default: ctx.setLineDash([]); break;
      }
      // Stroke inside? Stroke is usually centered on path.
      // If we want it strictly inside, we might offset rect.
      // Standard strokeRect is centered.
      ctx.strokeRect(
          block.x + borderWidth / 2, 
          block.y + borderWidth / 2, 
          block.width - borderWidth, 
          block.height - borderWidth
      );
  } else if (!block.imageUrl && !customImg) {
       ctx.strokeStyle = '#3f3f46';
       ctx.lineWidth = 2;
       ctx.setLineDash([]);
       ctx.strokeRect(block.x, block.y, block.width, block.height);
  }

  ctx.restore();
}

/**
 * GIF Decoder Engine
 * Decodes and maintains state of a GIF for rendering onto the video canvas.
 */
class GifDecoder {
  frames: any[] = [];
  width: number = 0;
  height: number = 0;
  totalDuration: number = 0;
  
  // State tracking for linear playback
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastRenderedIndex: number = -1;
  private patchCanvases: HTMLCanvasElement[] = [];
  private backupState: ImageData | null = null; // For disposal 3 (Restore to Previous)

  constructor(frames: any[]) {
    this.frames = frames;
    // Normalize delays
    this.frames.forEach(f => {
        if (!f.delay || f.delay < 10) f.delay = 100;
    });
    this.totalDuration = frames.reduce((acc: number, f: any) => acc + f.delay, 0);
    
    if (frames.length > 0) {
      this.width = frames[0].dims.width;
      this.height = frames[0].dims.height;
    }

    // Setup internal canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    // Pre-generate patches
    this.frames.forEach(frame => {
       const c = document.createElement('canvas');
       c.width = frame.dims.width;
       c.height = frame.dims.height;
       const ctx = c.getContext('2d')!;
       const imageData = new ImageData(
         new Uint8ClampedArray(frame.dims.width * frame.dims.height * 4), 
         frame.dims.width, 
         frame.dims.height
       );
       const data = imageData.data;
       const pixels = frame.pixels;
       const colorTable = frame.colorTable || [];
       const transparentIndex = frame.transparentIndex;
       
       for (let i = 0; i < pixels.length; i++) {
         const colorIndex = pixels[i];
         if (colorIndex !== transparentIndex && colorTable[colorIndex]) {
            const color = colorTable[colorIndex];
            data[i * 4 + 0] = color[0];
            data[i * 4 + 1] = color[1];
            data[i * 4 + 2] = color[2];
            data[i * 4 + 3] = 255;
         } else {
            data[i * 4 + 3] = 0;
         }
       }
       ctx.putImageData(imageData, 0, 0);
       this.patchCanvases.push(c);
    });
  }

  static async fromUrl(url: string): Promise<GifDecoder> {
    if (!parseGIF || !decompressFrames) throw new Error("GIF libs missing");
    const resp = await fetch(url);
    const buff = await resp.arrayBuffer();
    const gif = parseGIF(buff);
    const frames = decompressFrames(gif, true);
    return new GifDecoder(frames);
  }

  /**
   * Advances the internal state to time `t` and returns the canvas.
   * Optimized for forward-only playback.
   */
  getFrameAtTime(t: number): HTMLCanvasElement {
    const localTime = this.totalDuration > 0 ? t % this.totalDuration : 0;
    
    // Find which frame we should be on
    let elapsed = 0;
    let targetIndex = 0;
    for (let i = 0; i < this.frames.length; i++) {
      elapsed += this.frames[i].delay;
      if (elapsed > localTime) {
        targetIndex = i;
        break;
      }
    }

    // If we looped or reset, start from scratch
    if (targetIndex < this.lastRenderedIndex) {
      this.lastRenderedIndex = -1;
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.backupState = null;
    }

    // Advance from last rendered frame to target frame
    for (let i = this.lastRenderedIndex + 1; i <= targetIndex; i++) {
        const frame = this.frames[i];
        
        // 1. Handle Disposal of Previous Frame (N-1)
        if (i > 0) {
            const prevFrame = this.frames[i-1];
            const prevDisp = prevFrame.disposalType; // 2=BG, 3=Prev
            
            if (prevDisp === 2) {
                this.ctx.clearRect(prevFrame.dims.left, prevFrame.dims.top, prevFrame.dims.width, prevFrame.dims.height);
            } else if (prevDisp === 3 && this.backupState) {
                this.ctx.putImageData(this.backupState, 0, 0);
            }
        }

        // 2. Save state if CURRENT frame (N) has disposal 3 (Restore Previous)
        // We need to restore THIS state after this frame is done displaying.
        if (frame.disposalType === 3) {
            this.backupState = this.ctx.getImageData(0, 0, this.width, this.height);
        }

        // 3. Draw Current Frame
        this.ctx.drawImage(this.patchCanvases[i], frame.dims.left, frame.dims.top);
    }

    this.lastRenderedIndex = targetIndex;
    return this.canvas;
  }
}

// --- Main Export Functions ---

export const exportVideo = async (state: ProjectState, onProgress?: (percent: number) => void) => {
  // Ensure dimensions are even (required by H.264 encoders)
  let { width, height, backgroundColor, backgroundImage, borderRadius } = state.canvasConfig;
  if (width % 2 !== 0) width--;
  if (height % 2 !== 0) height--;

  if (typeof VideoEncoder === 'undefined') {
      alert("Your browser does not support Video Encoding (WebCodecs). Please use Chrome, Edge, or Safari 15+.");
      return;
  }

  // 1. Initialize Decoders
  const decoders: Record<string, GifDecoder> = {};
  let maxDuration = 0;
  
  for (const block of state.blocks) {
    if (block.imageUrl && block.imageUrl.startsWith('data:image/gif')) {
       try {
         const decoder = await GifDecoder.fromUrl(block.imageUrl);
         decoders[block.id] = decoder;
         if (decoder.totalDuration > maxDuration) maxDuration = decoder.totalDuration;
       } catch (e) {
         console.warn("Failed to load GIF decoder", e);
       }
    }
  }
  
  // Defaults
  if (maxDuration === 0) maxDuration = 3000; // 3 seconds static video
  if (maxDuration > 10000) maxDuration = 10000; // Cap at 10s

  // 2. Setup Video Encoder & Muxer
  const muxer = new Muxer({
      target: new _mp4muxer.ArrayBufferTarget(),
      video: {
          codec: 'avc', // H.264
          width,
          height
      },
      fastStart: 'in-memory'
  });

  const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => console.error("Video Encoding Error:", e)
  });

  videoEncoder.configure({
      codec: 'avc1.42001f', // H.264 Baseline Profile Level 3.1
      width,
      height,
      bitrate: 6_000_000, // 6 Mbps
      framerate: 30
  });

  // 3. Prepare Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false })!;

  // Load static assets
  let bgImg: HTMLImageElement | null = null;
  if (backgroundImage) {
      try { bgImg = await loadImage(backgroundImage); } catch (e) {}
  }
  const staticImages: Record<string, HTMLImageElement> = {};
  for (const block of state.blocks) {
      if (block.imageUrl && !decoders[block.id]) {
          try { staticImages[block.id] = await loadImage(block.imageUrl); } catch(e) {}
      }
  }

  // 4. Render & Encode Loop
  const fps = 30;
  const frameInterval = 1000 / fps; // 33.33ms
  const totalFrames = Math.ceil(maxDuration / frameInterval);
  const sortedBlocks = [...state.blocks].sort((a, b) => a.zIndex - b.zIndex);

  for (let i = 0; i < totalFrames; i++) {
      const time = i * frameInterval;
      
      if (onProgress) onProgress(Math.min(i / totalFrames, 0.99));

      ctx.save();
      // Apply Border Radius Clipping
      if (borderRadius > 0) {
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(0, 0, width, height, borderRadius);
        } else {
             // Fallback
             ctx.rect(0, 0, width, height);
        }
        ctx.clip();
      }

      // A. Draw Background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      if (bgImg) {
          // Background always covers full canvas (offset 0,0, scale 1)
          drawImageWithTransform(ctx, bgImg, 0, 0, width, height, 0, 0, 1);
      }

      // B. Draw Blocks
      for (const block of sortedBlocks) {
          let content: HTMLImageElement | HTMLCanvasElement | undefined = staticImages[block.id];
          
          if (decoders[block.id]) {
              content = decoders[block.id].getFrameAtTime(time);
          }
          
          await drawBlock(ctx, block, content);
      }
      
      ctx.restore();

      // C. Encode Frame
      // Create VideoFrame from canvas
      const videoFrame = new VideoFrame(canvas, {
          timestamp: i * (1000000 / fps), // microseconds
          duration: 1000000 / fps
      });

      videoEncoder.encode(videoFrame, { keyFrame: i % 60 === 0 });
      videoFrame.close();

      // Yield for UI responsiveness
      await new Promise(r => setTimeout(r, 0));
  }

  if (onProgress) onProgress(1);

  // 5. Finish
  await videoEncoder.flush();
  muxer.finalize();

  const buffer = muxer.target.buffer;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  const link = document.createElement('a');
  link.download = 'artframe-video.mp4';
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCanvasToPng = async (state: ProjectState, onProgress?: (percent: number) => void) => {
   const hasGif = state.blocks.some(b => b.imageUrl?.startsWith('data:image/gif'));
   if (hasGif) {
     await exportVideo(state, onProgress);
   } else {
     await exportPng(state);
   }
};

const exportPng = async (state: ProjectState) => {
  const { width, height, backgroundColor, backgroundImage, borderRadius } = state.canvasConfig;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.save();
  // Apply Border Radius Clipping
  if (borderRadius > 0) {
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(0, 0, width, height, borderRadius);
    } else {
        // Fallback for older browsers
        ctx.rect(0, 0, width, height);
    }
    ctx.clip();
  }

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  if (backgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      drawImageWithTransform(ctx, bgImg, 0, 0, width, height, 0, 0, 1);
    } catch (e) {}
  }

  const sortedBlocks = [...state.blocks].sort((a, b) => a.zIndex - b.zIndex);
  for (const block of sortedBlocks) {
    await drawBlock(ctx, block);
  }
  
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = 'artframe-layout.png';
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};