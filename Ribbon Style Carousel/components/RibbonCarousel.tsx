
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAnimationFrame, useMotionValue, motion, AnimatePresence } from 'framer-motion';
import { 
  ITEM_WIDTH, 
  ITEM_HEIGHT, 
  GAP, 
  FULL_LOOP_DURATION, 
  DESKTOP_TOTAL_LOGICAL_SPOTS, 
  SAMPLE_DATA,
  MOBILE_BREAKPOINT 
} from '../constants';
import { CarouselItemData } from '../types';
import CarouselItem from './CarouselItem';
import MediaModal from './MediaModal';

const RibbonCarousel: React.FC = () => {
  const progressValue = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<CarouselItemData | null>(null);
  const [selectedItem, setSelectedItem] = useState<CarouselItemData | null>(null);

  const isMobile = windowSize.width < MOBILE_BREAKPOINT;
  const isPortrait = windowSize.height > windowSize.width;

  /**
   * GRID DIMENSIONS (Fixed 5x3 for Tablet/Desktop)
   * 5 columns visible width-wise.
   * 3 rows high.
   */
  const designWidth = 5 * ITEM_WIDTH + 4 * GAP;
  const designHeight = 3 * ITEM_HEIGHT + 2 * GAP;

  const currentScale = useMemo(() => {
    if (isMobile) return 1;

    // We subtract less from the height to allow the carousel to "bite" into the header/footer area slightly
    // but still respect the core readable content areas.
    const availableWidth = windowSize.width * 0.98;
    const availableHeight = windowSize.height - 180; // Tighter vertical padding for a fuller look

    const scaleW = availableWidth / designWidth;
    const scaleH = availableHeight / designHeight;

    /**
     * ADAPTIVE FILL STRATEGY (Desktop & Tablet)
     * We want the carousel to feel massive. 
     * In most landscape scenarios, we want to maximize the 3 rows.
     * We take a "Soft Fill" approach: we use the height-based scale as a baseline
     * to ensure thumbnails are always large, allowing horizontal tracks to 
     * overflow slightly if the screen is narrow.
     */
    if (isPortrait) {
      // Tablet Portrait: Aggressive zoom to fill height
      return Math.max(scaleH * 0.95, scaleW * 1.1);
    }

    // Desktop Landscape: Fit comfortably but lean towards a "Fuller" scale
    // If the screen is ultra-wide, we don't want it to hit the ceiling, so we use min but with a boost.
    // If the screen is narrow, we allow it to bleed off the sides.
    const baseScale = Math.min(scaleW * 1.1, scaleH);
    return baseScale;
  }, [windowSize.width, windowSize.height, isMobile, isPortrait, designWidth, designHeight]);

  useEffect(() => {
    const handleResize = () => setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useAnimationFrame((_, delta) => {
    if (selectedItem || isMobile) return;
    const speedMultiplier = isHovered ? 0.08 : 0.55;
    const current = progressValue.get();
    const next = (current + (delta / 1000) * (DESKTOP_TOTAL_LOGICAL_SPOTS / FULL_LOOP_DURATION) * speedMultiplier) % DESKTOP_TOTAL_LOGICAL_SPOTS;
    progressValue.set(next);
  });

  const handleSelect = (item: CarouselItemData) => setSelectedItem(item);
  const handleClose = () => setSelectedItem(null);

  if (isMobile) {
    return (
      <div className="w-full h-full overflow-y-auto no-scrollbar pt-20 pb-40 px-6">
        <div className="flex flex-col items-center gap-14 w-full relative z-10 max-w-md mx-auto">
          {SAMPLE_DATA.map((item, index) => (
            <CarouselItem 
              key={item.id} 
              data={item} 
              index={index} 
              totalSpots={1} 
              progressValue={progressValue}
              onSelect={handleSelect} 
              orientation="vertical" 
              isStatic={true} 
            />
          ))}
        </div>
        <MediaModal item={selectedItem} onClose={handleClose} isMobile={true} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence>
          {hoveredItem && (
            <motion.div 
              key={hoveredItem.id} 
              initial={{ opacity: 0, scale: 1.1 }} 
              animate={{ opacity: 0.35, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.5 }} 
              className="absolute inset-0"
            >
              {hoveredItem.type === 'image' ? (
                <img src={hoveredItem.url} className="w-full h-full object-cover blur-[180px] brightness-50 contrast-125" />
              ) : (
                <div className="w-full h-full bg-indigo-600/20 blur-[180px]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617] opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617] opacity-95" />
      </div>

      <motion.div 
        ref={containerRef} 
        initial={false}
        animate={{ scale: currentScale }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-visible z-10 flex items-center justify-center will-change-transform"
        style={{ 
          width: designWidth, 
          height: designHeight 
        }}
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => { setIsHovered(false); setHoveredItem(null); }}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
          {SAMPLE_DATA.map((item, index) => (
            <CarouselItem 
              key={item.id} 
              data={item} 
              index={index} 
              totalSpots={DESKTOP_TOTAL_LOGICAL_SPOTS} 
              progressValue={progressValue}
              onSelect={handleSelect} 
              onHover={() => setHoveredItem(item)} 
              orientation="horizontal" 
              isCarouselPaused={!!selectedItem} 
            />
          ))}
        </div>
      </motion.div>

      {/* Cinematic Edge Fading - Dynamically adjusted for orientation and scaling bleed */}
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#020617] via-[#020617]/85 to-transparent z-[200] pointer-events-none transition-all duration-1000"
        style={{ width: isPortrait ? '35vw' : '25vw' }}
      />
      <div 
        className="absolute inset-y-0 right-0 bg-gradient-to-l from-[#020617] via-[#020617]/85 to-transparent z-[200] pointer-events-none transition-all duration-1000"
        style={{ width: isPortrait ? '35vw' : '25vw' }}
      />

      <MediaModal item={selectedItem} onClose={handleClose} isMobile={false} />
    </div>
  );
};

export default RibbonCarousel;
