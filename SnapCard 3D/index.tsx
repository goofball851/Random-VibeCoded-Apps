import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types & Constants ---

type TitlePattern = 'none' | 'dots' | 'stripes';
type CardShape = 'card' | 'lens';

interface CardData {
  title: string;
  subtitle: string;
  image: string | null;
  frameColor: string;
  gradientColor: string;
  shape: CardShape; // New property
  // Title Styles
  titleColor: string;
  titleOutlineColor: string;
  titlePattern: TitlePattern;
  titleFontSize: number;
  // Image Transforms
  zoom: number;
  offsetX: number;
  offsetY: number;
  // 3D Rotation
  rotateX: number;
  rotateY: number;
}

const DEFAULT_CARD: CardData = {
  title: "SNAP CARD",
  subtitle: "Drag sliders to rotate. Upload art to customize.",
  image: null,
  frameColor: '#ec4899', // Pink accent
  gradientColor: '#000000',
  shape: 'card',
  titleColor: '#ffffff',
  titleOutlineColor: '#000000',
  titlePattern: 'none',
  titleFontSize: 48,
  zoom: 100,
  offsetX: 0,
  offsetY: 0,
  rotateX: -10,
  rotateY: 15,
};

// --- Components ---

function App() {
  const [card, setCard] = useState<CardData>(DEFAULT_CARD);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCard(prev => ({ ...prev, image: event.target?.result as string, zoom: 100, offsetX: 0, offsetY: 0 }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
            <span style={styles.logoIcon}>❖</span>
            <h1 style={styles.title}>SnapCard 3D</h1>
        </div>
        <button style={styles.ghostButton} onClick={() => window.print()}>
            Export / Print
        </button>
      </header>

      <div style={styles.workspace}>
        {/* LEFT SIDEBAR: GLASS CONTROLS */}
        <div style={styles.sidebar}>
            
            {/* SECTION: TEXT */}
            <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Content & Text</h3>
                
                <div style={styles.controlGroup}>
                    <label style={styles.label}>Title</label>
                    <input 
                        style={styles.textInput} 
                        value={card.title} 
                        onChange={e => setCard({...card, title: e.target.value})}
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.controlGroup}>
                        <label style={styles.label}>Size ({card.titleFontSize}px)</label>
                        <input 
                            type="range" min="20" max="80" 
                            value={card.titleFontSize} 
                            onChange={e => setCard({...card, titleFontSize: Number(e.target.value)})} 
                        />
                    </div>
                </div>

                <div style={styles.row}>
                     <div style={styles.controlGroup}>
                        <label style={styles.label}>Fill</label>
                        <div style={styles.colorWrapper}>
                            <input 
                                type="color" 
                                style={styles.colorInput}
                                value={card.titleColor} 
                                onChange={e => setCard({...card, titleColor: e.target.value})}
                            />
                        </div>
                    </div>
                    <div style={styles.controlGroup}>
                        <label style={styles.label}>Outline</label>
                        <div style={styles.colorWrapper}>
                            <input 
                                type="color" 
                                style={styles.colorInput}
                                value={card.titleOutlineColor} 
                                onChange={e => setCard({...card, titleOutlineColor: e.target.value})}
                            />
                        </div>
                    </div>
                    <div style={styles.controlGroup}>
                        <label style={styles.label}>Style</label>
                        <select 
                            style={styles.selectInput}
                            value={card.titlePattern}
                            onChange={e => setCard({...card, titlePattern: e.target.value as TitlePattern})}
                        >
                            <option value="none">Solid</option>
                            <option value="dots">Dots</option>
                            <option value="stripes">Stripes</option>
                        </select>
                    </div>
                </div>

                <div style={styles.controlGroup}>
                    <label style={styles.label}>Subtitle</label>
                    <textarea 
                        style={styles.textArea} 
                        rows={2}
                        value={card.subtitle} 
                        onChange={e => setCard({...card, subtitle: e.target.value})}
                    />
                </div>
            </div>

            {/* SECTION: VISUALS */}
            <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Visuals</h3>
                
                <div style={styles.controlGroup}>
                    <label style={styles.label}>Shape</label>
                    <div style={styles.toggleRow}>
                        <button 
                            style={card.shape === 'card' ? styles.toggleBtnActive : styles.toggleBtn}
                            onClick={() => setCard({...card, shape: 'card'})}
                        >
                            Card
                        </button>
                        <button 
                            style={card.shape === 'lens' ? styles.toggleBtnActive : styles.toggleBtn}
                            onClick={() => setCard({...card, shape: 'lens'})}
                        >
                            Lens
                        </button>
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.controlGroup}>
                        <label style={styles.label}>Frame Color</label>
                        <div style={styles.colorWrapper}>
                            <input 
                                type="color" 
                                style={styles.colorInput} 
                                value={card.frameColor} 
                                onChange={e => setCard({...card, frameColor: e.target.value})}
                            />
                        </div>
                    </div>
                    <div style={styles.controlGroup}>
                        <label style={styles.label}>Overlay Fade</label>
                        <div style={styles.colorWrapper}>
                            <input 
                                type="color" 
                                style={styles.colorInput} 
                                value={card.gradientColor} 
                                onChange={e => setCard({...card, gradientColor: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.controlGroup}>
                    <label style={styles.label}>Card Art</label>
                    <button onClick={() => fileInputRef.current?.click()} style={styles.uploadBtn}>
                        {card.image ? 'Replace Image' : 'Upload Image / GIF'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                </div>

                {card.image && (
                    <div style={styles.subPanel}>
                         <div style={styles.controlGroup}>
                            <label style={styles.label}>Zoom</label>
                            <input 
                                type="range" min="50" max="300" 
                                value={card.zoom} 
                                onChange={e => setCard({...card, zoom: Number(e.target.value)})} 
                            />
                        </div>
                        <div style={styles.row}>
                            <div style={styles.controlGroup}>
                                <label style={styles.label}>Pan X</label>
                                <input 
                                    type="range" min="-200" max="200" 
                                    value={card.offsetX} 
                                    onChange={e => setCard({...card, offsetX: Number(e.target.value)})} 
                                />
                            </div>
                            <div style={styles.controlGroup}>
                                <label style={styles.label}>Pan Y</label>
                                <input 
                                    type="range" min="-200" max="200" 
                                    value={card.offsetY} 
                                    onChange={e => setCard({...card, offsetY: Number(e.target.value)})} 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECTION: 3D TRANSFORM */}
            <div style={styles.section}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12}}>
                    <h3 style={{...styles.sectionHeader, margin: 0}}>3D View</h3>
                    <button 
                        onClick={() => setCard({...card, rotateX: 0, rotateY: 0})}
                        style={styles.smallGhostBtn}
                    >
                        Reset
                    </button>
                </div>
                
                <div style={styles.controlGroup}>
                    <label style={styles.label}>Tilt (X-Axis)</label>
                    <input 
                        type="range" min="-20" max="20" 
                        value={card.rotateX} 
                        onChange={e => setCard({...card, rotateX: Number(e.target.value)})} 
                    />
                </div>
                <div style={styles.controlGroup}>
                    <label style={styles.label}>Rotate (Y-Axis)</label>
                    <input 
                        type="range" min="-20" max="20" 
                        value={card.rotateY} 
                        onChange={e => setCard({...card, rotateY: Number(e.target.value)})} 
                    />
                </div>
            </div>

        </div>

        {/* RIGHT AREA: 3D STAGE */}
        <div style={styles.stage}>
            <CardView data={card} />
            <div style={styles.stageHint}>
                Drag sliders to adjust 3D angle
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Card Renderer Component ---

const CardView = ({ data }: { data: CardData }) => {
    
    // Shape Logic
    const isLens = data.shape === 'lens';

    // 1. Dynamic Glare Calculation
    // As the card rotates Y positive (right moves back), glare should slide left?
    // Let's create a realistic foil effect using background position.
    // Range is -20 to 20. Map to percentage 0% to 100%.
    const glareX = 50 + (data.rotateY * 2.5); // 50% is center
    const glareY = 50 + (data.rotateX * 2.5);
    
    // Border Style with Glow
    const borderStyle: React.CSSProperties = {
        borderColor: data.frameColor,
        borderWidth: 8,
        borderStyle: 'solid',
        boxShadow: `0 0 20px -5px ${data.frameColor}`,
        borderRadius: isLens ? '50%' : '16px', // Circle vs Rounded Rect
    };

    // Gradient Overlay Helper
    const getGradientStyle = () => {
        const hex = data.gradientColor;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `linear-gradient(to top, rgba(${r},${g},${b},1) 0%, rgba(${r},${g},${b},0.9) 30%, rgba(${r},${g},${b},0.6) 60%, transparent 100%)`;
    };

    // Title Pattern Generator
    let backgroundImage = 'none';
    if (data.titlePattern === 'dots') {
        backgroundImage = `radial-gradient(circle, rgba(0,0,0,0.5) 1.5px, transparent 1.5px), linear-gradient(${data.titleColor}, ${data.titleColor})`;
    } else if (data.titlePattern === 'stripes') {
        backgroundImage = `repeating-linear-gradient(45deg, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 6px), linear-gradient(${data.titleColor}, ${data.titleColor})`;
    } else {
        backgroundImage = `linear-gradient(${data.titleColor}, ${data.titleColor})`;
    }

    const titleStyle: React.CSSProperties = {
        fontFamily: "'Titan One', cursive",
        fontSize: `${data.titleFontSize}px`,
        lineHeight: '0.9',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        WebkitTextStroke: `3px ${data.titleOutlineColor}`,
        color: 'transparent',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        backgroundImage: backgroundImage,
        backgroundSize: data.titlePattern === 'dots' ? '6px 6px, 100% 100%' : 'auto',
        filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.6))', // Deeper shadow for pop
        marginBottom: '6px'
    };

    // 3D Container Transform
    const containerStyle: React.CSSProperties = {
        width: isLens ? '380px' : '320px',
        height: isLens ? '380px' : '460px',
        position: 'relative',
        transform: `perspective(1200px) rotateX(${data.rotateX}deg) rotateY(${data.rotateY}deg)`,
        transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.4, 1), width 0.3s, height 0.3s', // Added dimensions transition
        transformStyle: 'preserve-3d',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', // Ground shadow
    };

    // Glare Overlay Style
    const glareStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: isLens ? '50%' : '16px', // Match border radius
        zIndex: 30,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`,
        mixBlendMode: 'overlay',
        pointerEvents: 'none'
    };

    // Panel Style
    const infoPanelStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '50%',
        background: getGradientStyle(),
        zIndex: 10,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        textAlign: 'center',
    };

    return (
        <div style={containerStyle}>
            {/* Main Card Chassis */}
            <div style={{...styles.cardFrame, ...borderStyle}}>
                
                {/* Image */}
                <div style={styles.imageLayer}>
                    {data.image ? (
                        <img 
                            src={data.image} 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `scale(${data.zoom / 100}) translate(${data.offsetX}px, ${data.offsetY}px)`,
                            }}
                            alt="Card Art"
                        />
                    ) : (
                        <div style={styles.placeholderArt}>
                            <span style={{opacity: 0.5}}>UPLOAD ART</span>
                        </div>
                    )}
                </div>

                {/* Info Layer */}
                <div style={infoPanelStyle}>
                    <div style={titleStyle}>{data.title}</div>
                    <p style={styles.abilityText}>{data.subtitle}</p>
                </div>
                
                {/* Dynamic Glare */}
                <div style={glareStyle}></div>
                
                {/* Constant Sheen (Texture) */}
                <div style={styles.noiseTexture}></div>
            </div>
        </div>
    );
};


// --- Styles ---

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: '#fff',
  },
  header: {
    height: '60px',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(15, 15, 20, 0.4)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    zIndex: 50
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '24px',
    color: '#ec4899'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    background: 'linear-gradient(to right, #fff, #a5b4fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  ghostButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.8)',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  // Workspace Layout
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '380px',
    background: 'rgba(20, 20, 25, 0.65)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  stage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    perspective: '1500px', // Global perspective for stage
  },
  stageHint: {
    position: 'absolute',
    bottom: '30px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },

  // Sidebar Controls
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    margin: 0,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600'
  },
  row: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  toggleRow: {
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '2px',
    gap: '2px'
  },
  toggleBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '8px',
    fontSize: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  toggleBtnActive: {
    flex: 1,
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    padding: '8px',
    fontSize: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  subPanel: {
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  controlGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.5px'
  },
  textInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    padding: '8px 0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  textArea: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'white',
    padding: '10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical'
  },
  selectInput: {
    background: '#1a1a20',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    padding: '6px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  colorWrapper: {
    width: '100%',
    height: '32px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    position: 'relative'
  },
  colorInput: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    border: 'none'
  },
  uploadBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px dashed rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.2s',
  },
  smallGhostBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ec4899',
    fontSize: '11px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    padding: '4px'
  },

  // Card Internal Styling
  cardFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: '16px',
    background: '#050505',
    overflow: 'hidden',
    boxSizing: 'border-box',
    transformStyle: 'preserve-3d', // Important for children
  },
  imageLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    backgroundColor: '#1a1a1a',
  },
  placeholderArt: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '2px',
    background: 'conic-gradient(from 180deg at 50% 50%, #1a1a1a 0deg, #2a2a2a 180deg, #1a1a1a 360deg)'
  },
  abilityText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: '13px',
    lineHeight: '1.4',
    fontWeight: '500',
    margin: 0,
    padding: '0 10px',
    maxWidth: '100%'
  },
  noiseTexture: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    opacity: 0.07,
    pointerEvents: 'none',
    zIndex: 25,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
  }
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
