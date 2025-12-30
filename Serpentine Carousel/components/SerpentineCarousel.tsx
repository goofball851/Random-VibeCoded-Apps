
import React, { useState, useEffect, useMemo } from 'react';
import { useAnimationFrame, useMotionValue } from 'framer-motion';
import { 
  ITEM_WIDTH, 
  ITEM_HEIGHT, 
  GAP, 
  FULL_LOOP_DURATION, 
  DESKTOP_TOTAL_LOGICAL_SPOTS, 
  MOBILE_BREAKPOINT, 
  SAMPLE_DATA 
} from '../constants';
import { CarouselItemData } from '../types';
import CarouselItem from './CarouselItem';
import MediaModal from './MediaModal';

const SerpentineCarousel: React.FC = () => {
  const progressValue = useMotionValue(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CarouselItemData | null>(null);

  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useAnimationFrame((_, delta) => {
    if (isMobile || selectedItem) return;
    
    const speedMultiplier = isHovered ? 0.2 : 1.0;
    const current = progressValue.get();
    const next = (current + (delta / 1000) * (DESKTOP_TOTAL_LOGICAL_SPOTS / FULL_LOOP_DURATION) * speedMultiplier) % DESKTOP_TOTAL_LOGICAL_SPOTS;
    progressValue.set(next);
  });

  const desktopLayout = useMemo(() => ({
    width: 6 * (ITEM_WIDTH + GAP) - GAP, // 5 visible + partial edges
    height: 3 * ITEM_HEIGHT + 2 * GAP
  }), []);

  const handleSelect = (item: CarouselItemData) => setSelectedItem(item);
  const handleClose = () => setSelectedItem(null);

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center gap-12 w-full py-4 relative z-10">
          {SAMPLE_DATA.map((item, index) => (
            <CarouselItem 
              key={item.id}
              data={item}
              index={index}
              totalSpots={1}
              progressValue={progressValue}
              isStatic={true}
              onSelect={handleSelect}
            />
          ))}
        </div>
        <MediaModal item={selectedItem} onClose={handleClose} isMobile={true} />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div 
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-950/20 backdrop-blur-xl transition-all duration-700 ease-in-out group/container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          width: desktopLayout.width, 
          height: desktopLayout.height,
          boxShadow: '0 0 100px rgba(0,0,0,0.4), inset 0 0 40px rgba(0,0,0,0.8)'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-auto">
          {SAMPLE_DATA.map((item, index) => (
            <CarouselItem 
              key={item.id}
              data={item}
              index={index}
              totalSpots={DESKTOP_TOTAL_LOGICAL_SPOTS}
              progressValue={progressValue}
              isStatic={false}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent z-[200] pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 via-slate-950/20 to-transparent z-[200] pointer-events-none" />
      </div>
      
      <MediaModal item={selectedItem} onClose={handleClose} isMobile={false} />
    </div>
  );
};

export default SerpentineCarousel;
