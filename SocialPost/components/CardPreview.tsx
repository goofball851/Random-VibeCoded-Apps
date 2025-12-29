
import React from 'react';
import { CardData } from '../types';

interface CardPreviewProps {
  data: CardData;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, containerRef }) => {
  const { 
    title, 
    description, 
    url, 
    imageUrl, 
    siteName, 
    template, 
    accentColor,
    secondaryColor,
    backgroundColor,
    fontFamily,
    textAlign,
    fontSize,
    imageOpacity,
    borderRadius
  } = data;

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center'
  };

  const titleSizes = {
    sm: 'text-lg',
    base: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const sharedStyles = `${fontClasses[fontFamily]} ${alignClasses[textAlign].split(' ')[0]}`;
  
  // Base style for the card itself (not the stage)
  const cardStyle = { 
    borderRadius: `${borderRadius}px`,
    backgroundColor: backgroundColor,
    width: '100%',
    height: '100%'
  };

  const placeholderImg = 'https://picsum.photos/1000/1000';

  const renderContent = () => {
    switch (template) {
      case 'corporate':
        return (
          <div className={`flex flex-col overflow-hidden shadow-xl ${sharedStyles}`} style={{ ...cardStyle, borderTop: `8px solid ${accentColor}` }}>
            <div className={`p-8 flex-1 flex flex-col justify-center ${alignClasses[textAlign].split(' ')[1]}`}>
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">{siteName || 'Official Update'}</span>
              <h2 className={`${titleSizes[fontSize]} font-bold text-slate-900 mb-4 leading-tight border-l-4 px-4`} style={{ borderLeftColor: accentColor }}>
                {title || 'Advancing Industry Standards'}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {description || 'Insightful analysis for the modern enterprise.'}
              </p>
            </div>
            <div className="h-[40%] overflow-hidden relative">
              <img src={imageUrl || placeholderImg} crossOrigin="anonymous" className="w-full h-full object-cover" style={{ opacity: imageOpacity / 100 }} alt="cover" />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-mono text-slate-500 shadow-sm border border-slate-100">
                {url || 'enterprise.com'}
              </div>
            </div>
          </div>
        );

      case 'casual':
        return (
          <div className={`p-6 shadow-lg flex flex-col gap-4 border-4 border-white ${sharedStyles}`} style={cardStyle}>
            <div className="aspect-[4/3] overflow-hidden shadow-inner relative bg-white" style={{ borderRadius: `${borderRadius * 0.75}px` }}>
              <img src={imageUrl || placeholderImg} crossOrigin="anonymous" className="w-full h-full object-cover" style={{ opacity: imageOpacity / 100 }} alt="cover" />
              <div className="absolute top-3 left-3 bg-white/80 rounded-full px-3 py-1 text-[10px] font-medium text-amber-900 backdrop-blur-sm">
                ✨ {siteName || 'Daily Vibes'}
              </div>
            </div>
            <div className={`flex-1 flex flex-col px-2 ${alignClasses[textAlign].split(' ')[1]}`}>
              <h2 className={`${titleSizes[fontSize]} font-bold text-slate-800 mb-2 leading-tight lowercase`}>
                {title || 'weekend adventures'}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">
                {description || 'just some thoughts about life.'}
              </p>
              <div className="mt-auto flex items-center justify-between w-full opacity-50 pt-2">
                <span className="text-[10px] font-bold tracking-widest uppercase">{url || 'myblog.co'}</span>
                <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />)}
                </div>
              </div>
            </div>
          </div>
        );

      case 'cartoony':
        return (
          <div className={`border-[6px] border-black overflow-hidden shadow-[12px_12px_0px_0px_#000] flex flex-col relative ${sharedStyles}`} style={cardStyle}>
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: `radial-gradient(${accentColor} 2px, transparent 2px)`, backgroundSize: '15px 15px' }} />
            <div className={`p-8 relative z-10 flex-1 flex flex-col ${alignClasses[textAlign].split(' ')[1]}`}>
              <div className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 rotate-[-2deg] w-fit">
                {siteName || 'BOOM!'}
              </div>
              <h2 className={`${titleSizes[fontSize].replace('text-', 'text-3')} font-black text-black mb-4 leading-[0.85] uppercase tracking-tighter`}>
                {title || 'WOW! UNBELIEVABLE'}
              </h2>
              <div className="flex-1 w-full bg-yellow-300 border-[4px] border-black rounded-2xl overflow-hidden mb-4 shadow-[6px_6px_0px_0px_#000] rotate-[1deg]">
                <img src={imageUrl || placeholderImg} crossOrigin="anonymous" className="w-full h-full object-cover grayscale-[0.5] contrast-125" style={{ opacity: imageOpacity / 100 }} alt="cover" />
              </div>
              <p className="text-black font-black text-xs leading-none mb-4 p-2 border-2 border-black shadow-[3px_3px_0px_0px_#000]" style={{ backgroundColor: secondaryColor }}>
                {description || 'SEE IT TO BELIEVE IT!'}
              </p>
              <div className="mt-auto">
                 <span className="text-[10px] font-black underline decoration-4" style={{ textDecorationColor: accentColor }}>{url || 'POW.SITE'}</span>
              </div>
            </div>
          </div>
        );

      case 'trendy':
        return (
          <div className={`overflow-hidden shadow-2xl relative flex flex-col p-2 ${sharedStyles}`} style={cardStyle}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50 pointer-events-none">
              <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[100px]" style={{ backgroundColor: accentColor, opacity: 0.6 }} />
              <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[80px]" style={{ backgroundColor: secondaryColor, opacity: 0.6 }} />
            </div>
            <div className={`relative z-10 flex-1 flex flex-col p-8 ${alignClasses[textAlign].split(' ')[1]}`} style={{ color: textAlign === 'center' ? 'white' : 'inherit' }}>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">{siteName || 'Tech.Lab'}</span>
              </div>
              <div className={`flex-1 flex flex-col justify-end ${alignClasses[textAlign].split(' ')[1]}`}>
                <h2 className={`${titleSizes[fontSize].replace('text-', 'text-4')} font-black tracking-tighter mb-6 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400 drop-shadow-sm`}>
                  {title || 'Future Design'}
                </h2>
                <p className="text-slate-300 text-sm font-mono mb-8 max-w-[90%] leading-relaxed border-l-2 pl-4 border-white/10">
                  {description || 'Exploring generative AI.'}
                </p>
                <div className="flex items-center justify-between w-full border-t border-white/5 pt-6">
                   <img src={imageUrl || placeholderImg} crossOrigin="anonymous" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10" style={{ opacity: imageOpacity / 100 }} alt="thumbnail" />
                   <span className="text-[10px] font-mono opacity-40">{url || '0x.dev'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className={`flex flex-col border border-slate-200 overflow-hidden shadow-lg ${sharedStyles}`} style={cardStyle}>
            <div className="h-[60%] overflow-hidden relative">
              <img src={imageUrl || placeholderImg} crossOrigin="anonymous" className="w-full h-full object-cover" style={{ opacity: imageOpacity / 100 }} alt="cover" />
              <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/90 shadow-sm text-slate-900 border border-slate-100 uppercase">{siteName || 'Article'}</span>
              </div>
            </div>
            <div className={`flex-1 p-6 flex flex-col justify-between ${alignClasses[textAlign].split(' ')[1]}`} style={{ backgroundColor: backgroundColor }}>
              <div>
                <h2 className={`${titleSizes[fontSize]} font-bold text-slate-900 mb-2 leading-tight`}>{title || 'Your Title'}</h2>
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{description || 'Description goes here.'}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 w-full">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{url || 'yoursite.com'}</span>
              </div>
            </div>
          </div>
        );

      case 'brutalist':
        return (
          <div className={`bg-yellow-400 border-[6px] border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col ${sharedStyles}`} style={cardStyle}>
            <div className="h-[50%] bg-black relative border-b-[6px] border-black">
               <img src={imageUrl || placeholderImg} crossOrigin="anonymous" className="w-full h-full object-cover grayscale contrast-125" style={{ opacity: imageOpacity / 100 }} alt="cover" />
            </div>
            <div className={`flex-1 p-6 flex flex-col ${alignClasses[textAlign].split(' ')[1]}`} style={{ backgroundColor: backgroundColor }}>
               <p className="font-black text-black text-xs mb-1 uppercase tracking-tighter" style={{ color: accentColor }}>{siteName || 'INFO'}</p>
               <h2 className={`${titleSizes[fontSize]} font-black text-black mb-3 leading-[0.9] uppercase`}>{title || 'YOUR TITLE'}</h2>
               <p className="text-black font-bold text-xs leading-tight line-clamp-4">{description || 'Brutalist approach.'}</p>
               <div className="mt-auto pt-4 flex items-center justify-between w-full">
                  <span className="font-black text-[10px] truncate max-w-[150px]">{url?.toUpperCase() || 'SITE.IO'}</span>
                  <div className="px-2 py-0.5 bg-black text-white text-[10px] font-black" style={{ backgroundColor: secondaryColor }}>777</div>
               </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // We wrap the template in a "Stage" that handles the aspect ratio and provides a safe area for shadows (bleed)
  return (
    <div 
      ref={containerRef}
      className="w-full aspect-square relative overflow-visible flex items-center justify-center bg-transparent p-4"
    >
      <div className="w-full h-full relative overflow-visible">
        {renderContent()}
      </div>
    </div>
  );
};

export default CardPreview;
