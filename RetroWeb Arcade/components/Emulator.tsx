import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../types';
import { getGameBlob, updateGameMetadata } from '../services/db';
import { Settings, X, Maximize2, Minimize2, Keyboard, RotateCcw, Save, Download, Gamepad2, Timer, AlertTriangle, Loader2 } from 'lucide-react';
import { KEYBOARD_CONTROLS, GAMEPAD_CONTROLS } from '../constants';

interface EmulatorProps {
  game: Game;
  onExit: () => void;
  autoExitMinutes: number; // 0 = disabled
}

export const Emulator: React.FC<EmulatorProps> = ({ game, onExit, autoExitMinutes }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [activeTab, setActiveTab] = useState<'keyboard' | 'gamepad'>('keyboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [controllerConnected, setControllerConnected] = useState(false);

  // Inactivity State
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsUntilExit, setSecondsUntilExit] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<number | null>(null);
  const warningDuration = 20; // Show warning 20 seconds before exit

  // Focus helper to ensure gamepad events are captured by the iframe
  const focusEmulator = () => {
      setTimeout(() => {
          if (iframeRef.current) {
              iframeRef.current.focus();
              iframeRef.current.contentWindow?.focus();
          }
      }, 100);
  };

  // Activity Reset Logic
  const resetActivity = () => {
      lastActivityRef.current = Date.now();
      if (showInactivityWarning) {
          setShowInactivityWarning(false);
      }
  };

  // Setup Inactivity Monitoring
  useEffect(() => {
      if (autoExitMinutes <= 0) return;

      const exitDelayMs = autoExitMinutes * 60 * 1000;
      const warningStartMs = exitDelayMs - (warningDuration * 1000);

      const checkInactivity = () => {
          const now = Date.now();
          const inactiveTime = now - lastActivityRef.current;

          if (inactiveTime > exitDelayMs) {
              // Exit
              onExit();
          } else if (inactiveTime > warningStartMs) {
              // Show Warning
              setShowInactivityWarning(true);
              setSecondsUntilExit(Math.ceil((exitDelayMs - inactiveTime) / 1000));
          } else {
              // Reset Warning if hidden
              if (showInactivityWarning) setShowInactivityWarning(false);
          }
      };

      // Check every second
      const interval = setInterval(checkInactivity, 1000);
      inactivityTimerRef.current = interval;

      // Event Listeners for Activity
      const handleUserActivity = () => resetActivity();
      
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('click', handleUserActivity);

      return () => {
          clearInterval(interval);
          window.removeEventListener('mousemove', handleUserActivity);
          window.removeEventListener('keydown', handleUserActivity);
          window.removeEventListener('click', handleUserActivity);
      };
  }, [autoExitMinutes, showInactivityWarning, onExit]);


  // Initialize Emulator inside Iframe
  useEffect(() => {
    let objectUrl: string | null = null;
    setIsLoading(true);

    const loadGame = async () => {
      try {
        const blob = await getGameBlob(game.id);
        if (!blob) throw new Error("ROM Blob not found");

        objectUrl = URL.createObjectURL(blob);
        const iframe = iframeRef.current;
        
        if (iframe) {
            const doc = iframe.contentWindow?.document;
            if (doc) {
                // Construct the HTML for the isolated emulator environment
                // Note: Background color is #111 instead of #000 to avoid pure black per requirements
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #111; overflow: hidden; }
                            /* Accurate Pixel Rendering */
                            #game { width: 100%; height: 100%; image-rendering: pixelated; image-rendering: -moz-crisp-edges; }
                            canvas { image-rendering: pixelated; touch-action: none; }
                        </style>
                    </head>
                    <body>
                        <div id="game"></div>
                        <script>
                            // 1. Audio Latency Patch
                            const originalAudioContext = window.AudioContext || window.webkitAudioContext;
                            if (originalAudioContext) {
                                window.AudioContext = function(options) {
                                    const opt = options || {};
                                    opt.latencyHint = 'interactive'; 
                                    opt.sampleRate = 44100;
                                    return new originalAudioContext(opt);
                                };
                                window.AudioContext.prototype = originalAudioContext.prototype;
                            }

                            // 2. Wake Lock Shim
                            if (navigator.wakeLock) {
                                const originalRequest = navigator.wakeLock.request.bind(navigator.wakeLock);
                                navigator.wakeLock.request = async (type) => {
                                    try {
                                        return await originalRequest(type);
                                    } catch (err) {
                                        return { released: false, release: async () => {}, type: 'screen', addEventListener: ()=>{}, removeEventListener: ()=>{} };
                                    }
                                };
                            }

                            // 3. Canvas Latency Optimization (Desynchronized)
                            const observer = new MutationObserver((mutations) => {
                                mutations.forEach((mutation) => {
                                    mutation.addedNodes.forEach((node) => {
                                        if (node.tagName === 'CANVAS') {
                                            node.setAttribute('desynchronized', 'true');
                                        }
                                    });
                                });
                            });
                            observer.observe(document.getElementById('game'), { childList: true, subtree: true });

                            // 4. Input Focus Assurance
                            window.addEventListener('click', () => { window.focus(); });
                            
                            // 5. Gamepad Polling Kickstart
                            setInterval(() => {
                                if(navigator.getGamepads) navigator.getGamepads();
                            }, 1000);

                            // Emulator Config
                            window.EJS_player = '#game';
                            window.EJS_core = '${game.system}';
                            window.EJS_gameUrl = '${objectUrl}';
                            window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
                            window.EJS_startOnLoaded = true;
                            
                            if (window.crossOriginIsolated) {
                                window.EJS_threads = true; 
                            }
                            
                            window.EJS_onGameStart = function() {
                                console.log('Game Started');
                                window.focus();
                                // We can't easily signal back to parent from same-origin null iframe, 
                                // but the loading state is mostly for the blob fetch anyway.
                            };
                        </script>
                        <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
                    </body>
                    </html>
                `;
                
                doc.open();
                doc.write(htmlContent);
                doc.close();
                
                // Initial focus
                focusEmulator();
                setIsLoading(false);
            }
        }

      } catch (err) {
        console.error("Failed to load game:", err);
        alert("Error loading ROM from database.");
        onExit();
      }
    };

    loadGame();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [game, onExit]);

  // Controller Detection & Active Polling for Inactivity Reset
  useEffect(() => {
    const handleGamepadConnect = (e: GamepadEvent) => {
        showToast(`Controller Connected: ${e.gamepad.id.substring(0, 20)}...`);
        setControllerConnected(true);
        setActiveTab('gamepad');
        focusEmulator(); 
    };

    const handleGamepadDisconnect = () => {
        showToast("Controller Disconnected");
        setControllerConnected(false);
    };

    const checkGamepads = () => {
        const gps = navigator.getGamepads();
        if (Array.from(gps).some(gp => gp !== null)) {
            setControllerConnected(true);
            setActiveTab('gamepad');
        } else {
            setControllerConnected(false);
        }
    };

    // Gamepad Activity Poller for Inactivity Timer
    let prevTimestamp = 0;
    const activityPollInterval = setInterval(() => {
        const gps = navigator.getGamepads();
        for (const gp of gps) {
            if (gp) {
                // If the timestamp changed, buttons were likely pressed
                if (gp.timestamp > prevTimestamp) {
                    resetActivity();
                    prevTimestamp = gp.timestamp;
                }
            }
        }
    }, 500);

    window.addEventListener("gamepadconnected", handleGamepadConnect);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnect);
    checkGamepads();

    return () => {
        window.removeEventListener("gamepadconnected", handleGamepadConnect);
        window.removeEventListener("gamepaddisconnected", handleGamepadDisconnect);
        clearInterval(activityPollInterval);
    };
  }, []);

  // Hotkeys (Save/Load State) - Listen on main window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        resetActivity(); // also reset on keydown
        if (e.shiftKey && e.key === 'F2') {
            triggerSaveState();
        }
        if (e.shiftKey && e.key === 'F4') {
            triggerLoadState();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.id]);

  const recordSaveState = () => {
      updateGameMetadata(game.id, { hasSaveState: true }).catch(console.error);
      showToast("State Saved");
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to access the internal emulator instance inside the iframe
  const getEmulatorInstance = () => {
      return (iframeRef.current?.contentWindow as any)?.EJS_emulator;
  };

  const triggerSaveState = () => {
      const emu = getEmulatorInstance();
      if (emu && typeof emu.saveState === 'function') {
          emu.saveState();
          recordSaveState();
      } else {
          showToast("Emulator not ready or save unsupported.");
      }
      setIsMenuOpen(false);
      focusEmulator();
  };

  const triggerLoadState = () => {
      const emu = getEmulatorInstance();
      if (emu && typeof emu.loadState === 'function') {
          emu.loadState();
          showToast("State Loaded");
      } else {
           showToast("Emulator not ready.");
      }
      setIsMenuOpen(false);
      focusEmulator();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(err => console.error(err));
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
    focusEmulator();
  };

  const handleReset = () => {
      if(window.confirm("Reset game? Unsaved progress will be lost.")) {
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
              iframe.contentWindow.location.reload();
          }
      }
      focusEmulator();
  };

  return (
    <div 
        ref={containerRef} 
        className="fixed inset-0 z-50 bg-[#0c0c0e] flex flex-col items-center justify-center group" // Use dark grey instead of pure black
        onClick={focusEmulator} // Ensure clicking background refocuses game
    >
      
      {/* Loading Indicator */}
      {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[55] bg-[#0c0c0e]">
              <Loader2 className="animate-spin text-arcade-accent mb-4" size={48} />
              <p className="text-zinc-400 font-medium tracking-wide animate-pulse">Initializing System...</p>
          </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
          <div className={`absolute top-10 z-[60] text-white px-6 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 font-medium flex items-center gap-2 pointer-events-none ${toastMessage.includes("Disconnected") ? "bg-red-600" : "bg-arcade-accent"}`}>
              <Gamepad2 size={18} />
              {toastMessage}
          </div>
      )}

      {/* Inactivity Warning Overlay */}
      {showInactivityWarning && (
           <div className="absolute inset-0 z-[70] flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-arcade-surface border border-red-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center max-w-md">
                   <AlertTriangle className="mx-auto text-red-500 mb-4 h-16 w-16 animate-pulse" />
                   <h2 className="text-3xl font-black text-white mb-2">Are you still there?</h2>
                   <p className="text-arcade-muted mb-6">Exiting to library due to inactivity.</p>
                   
                   <div className="text-6xl font-black text-red-500 tabular-nums mb-8 font-mono">
                       {secondsUntilExit}
                   </div>
                   
                   <button 
                       onClick={() => resetActivity()}
                       className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-arcade-accent hover:text-white transition-all transform hover:scale-105 shadow-glow"
                   >
                       Keep Playing
                   </button>
                   <p className="text-xs text-arcade-muted mt-4">Move mouse or press any key to cancel</p>
               </div>
           </div>
      )}

      {/* Floating Menu Trigger */}
      <div className={`absolute top-6 right-6 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
         <button 
           onClick={(e) => {
               e.stopPropagation();
               setIsMenuOpen(!isMenuOpen);
           }}
           className="bg-zinc-900/80 backdrop-blur-md text-zinc-100 p-3 rounded-full border border-zinc-700 hover:bg-arcade-accent hover:border-arcade-accent transition-all shadow-lg"
         >
           {isMenuOpen ? <X size={24} /> : <Settings size={24} />}
         </button>
      </div>

      {/* Settings Popup Menu */}
      {isMenuOpen && (
         <div 
            className="absolute top-20 right-6 z-50 w-72 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="mb-4 pb-4 border-b border-zinc-700">
                <h3 className="text-white font-bold text-lg truncate">{game.metadata.title}</h3>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                            {game.system}
                        </span>
                        <span className="text-zinc-500 text-xs">{game.metadata.releaseYear}</span>
                    </div>
                    {/* Controller Status Icon */}
                    <div className={controllerConnected ? "text-green-500" : "text-red-500"} title={controllerConnected ? "Controller Connected" : "Controller Disconnected"}>
                        <Gamepad2 size={20} />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={triggerSaveState}
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-800/50 hover:bg-arcade-accent/20 hover:text-arcade-accent text-zinc-100 border border-transparent hover:border-arcade-accent/50 transition-all gap-1"
                    >
                        <Save size={20} />
                        <span className="text-xs font-medium">Save State</span>
                    </button>
                    <button 
                        onClick={triggerLoadState}
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-zinc-800/50 hover:bg-arcade-accent/20 hover:text-arcade-accent text-zinc-100 border border-transparent hover:border-arcade-accent/50 transition-all gap-1"
                    >
                        <Download size={20} />
                        <span className="text-xs font-medium">Load State</span>
                    </button>
                </div>

                <div className="h-px bg-zinc-700 my-2" />

                <button 
                   onClick={() => { setShowControls(true); setIsMenuOpen(false); }}
                   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-white transition-colors text-left group/btn"
                >
                    {controllerConnected ? (
                        <Gamepad2 size={18} className="text-green-500 group-hover/btn:text-green-400 transition-colors" />
                    ) : (
                        <Keyboard size={18} className="text-zinc-500 group-hover/btn:text-arcade-accent transition-colors" />
                    )}
                    <span>Controls</span>
                </button>
                
                <button 
                   onClick={toggleFullscreen}
                   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-white transition-colors text-left group/btn"
                >
                    {isFullscreen ? 
                        <Minimize2 size={18} className="text-zinc-500 group-hover/btn:text-arcade-accent transition-colors" /> : 
                        <Maximize2 size={18} className="text-zinc-500 group-hover/btn:text-arcade-accent transition-colors" />
                    }
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                </button>

                 <button 
                   onClick={handleReset}
                   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-white transition-colors text-left group/btn"
                >
                    <RotateCcw size={18} className="text-zinc-500 group-hover/btn:text-yellow-400 transition-colors" />
                    <span>Reset Console</span>
                </button>

                <div className="h-px bg-zinc-700 my-2" />

                <button 
                   onClick={onExit}
                   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/10 hover:bg-red-900/30 text-red-400 border border-transparent hover:border-red-900/30 transition-all text-left group/btn"
                >
                    <X size={18} className="text-red-400 group-hover/btn:text-red-300" />
                    <span>Exit Game</span>
                </button>
            </div>
         </div>
      )}

      {/* In-Game Controls Modal */}
      {showControls && (
         <div 
            className="absolute inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
            onClick={() => { setShowControls(false); focusEmulator(); }}
         >
            <div 
                className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-lg w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={() => { setShowControls(false); focusEmulator(); }} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                
                <div className="flex justify-between items-center mb-6 pr-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        {activeTab === 'keyboard' ? <Keyboard className="text-arcade-accent" /> : <Gamepad2 className="text-arcade-accent" />}
                        Controls
                    </h3>
                    
                    <div className="flex p-1 bg-zinc-800 rounded-lg">
                        <button 
                           className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'keyboard' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                           onClick={() => setActiveTab('keyboard')}
                        >
                           Keyboard
                        </button>
                        <button 
                           className={`px-4 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'gamepad' ? 'bg-arcade-accent text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                           onClick={() => setActiveTab('gamepad')}
                        >
                           Gamepad
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm min-h-[200px]">
                    {activeTab === 'keyboard' ? (
                        KEYBOARD_CONTROLS.map((ctrl, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0 group/item">
                                <span className="text-zinc-400 group-hover/item:text-zinc-300 transition-colors">{ctrl.action}</span>
                                <span className="font-mono font-bold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded border border-zinc-700 text-xs">
                                    {ctrl.keys.join(' + ')}
                                </span>
                            </div>
                        ))
                    ) : (
                        GAMEPAD_CONTROLS.map((ctrl, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0 group/item">
                                <span className="text-zinc-400 group-hover/item:text-zinc-300 transition-colors">{ctrl.action}</span>
                                <span className="font-mono font-bold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded border border-zinc-700 text-xs">
                                    {ctrl.keys.join(' / ')}
                                </span>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="mt-8 text-center">
                    <button 
                        onClick={() => { setShowControls(false); focusEmulator(); }} 
                        className="px-8 py-2.5 bg-arcade-accent hover:bg-violet-600 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all transform hover:scale-105"
                    >
                        Back to Game
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Game Container (Iframe) */}
      <div className="w-full h-full flex items-center justify-center bg-[#111]">
         <iframe 
            ref={iframeRef}
            title="game-emulator"
            className="w-full h-full border-0 block focus:outline-none"
            allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write"
         />
      </div>
    </div>
  );
};