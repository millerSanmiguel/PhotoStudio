import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Info,
  Clock
} from 'lucide-react';
import { KioskImage, KioskSettings } from '../types';

interface KioskPlayerProps {
  images: KioskImage[];
  settings: KioskSettings;
  onExit: () => void;
}

export default function KioskPlayer({ images, settings, onExit }: KioskPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(settings.autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // High-fidelity UI feedback states for hotkey signals
  const [feedback, setFeedback] = useState<{ icon: 'play' | 'pause' | 'next' | 'prev' | null; timestamp: number }>({
    icon: null,
    timestamp: 0,
  });

  const playerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Image Instance
  const activeImage = images[currentIndex] || null;

  // Handle image index transitions safely
  const nextImage = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    setProgressWidth(0);
    showFeedback('next');
  };

  const prevImage = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setProgressWidth(0);
    showFeedback('prev');
  };

  const showFeedback = (type: 'play' | 'pause' | 'next' | 'prev') => {
    setFeedback({ icon: type, timestamp: Date.now() });
  };

  // Reset progress and handle loop intervals
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!isPlaying || images.length === 0) {
      setProgressWidth(0);
      return;
    }

    const durationMs = settings.duration * 1000;
    const intervalMs = 50; // Update progress bar every 50ms for smooth fluid movement
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += intervalMs;
      const progress = Math.min((elapsed / durationMs) * 100, 100);
      setProgressWidth(progress);
    }, intervalMs);

    timerRef.current = setInterval(() => {
      nextImage();
    }, durationMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, settings.duration, images.length]);

  // Listen to Keybindings (Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying(prev => {
            const nextState = !prev;
            showFeedback(nextState ? 'play' : 'pause');
            return nextState;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, currentIndex]);

  // Auto-hide mouse cursor on idling inside kiosk player
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const cursorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setIsCursorVisible(true);
    if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    cursorTimerRef.current = setTimeout(() => {
      setIsCursorVisible(false);
    }, 2500); // Hide cursor after 2.5s of stillness
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    };
  }, []);

  // Web Fullscreen API handlers
  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // Clear visual feedback key icons after a brief period
  useEffect(() => {
    if (feedback.icon) {
      const t = setTimeout(() => {
        setFeedback({ icon: null, timestamp: 0 });
      }, 800);
      return () => clearTimeout(t);
    }
  }, [feedback.timestamp]);

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-lg text-gray-400">No hay imágenes en la secuencia del kiosko.</p>
          <button onClick={onExit} className="mt-4 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm">
            Volver de todos modos
          </button>
        </div>
      </div>
    );
  }

  // Get transition animations based on configuration setting
  const getVariants = () => {
    const tDur = settings.transitionDuration;
    
    switch (settings.transitionType) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: tDur, ease: [0.22, 1, 0.36, 1] } },
          exit: { opacity: 0, transition: { duration: tDur, ease: [0.22, 1, 0.36, 1] } }
        };
      case 'slideLeft':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1, transition: { duration: tDur, type: "spring", stiffness: 100, damping: 20 } },
          exit: { x: '-100%', opacity: 0, transition: { duration: tDur, ease: 'easeInOut' } }
        };
      case 'slideRight':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: 0, opacity: 1, transition: { duration: tDur, type: "spring", stiffness: 100, damping: 20 } },
          exit: { x: '100%', opacity: 0, transition: { duration: tDur, ease: 'easeInOut' } }
        };
      case 'zoom':
        return {
          initial: { scale: 1.15, opacity: 0 },
          animate: { 
            scale: 1.0, 
            opacity: 1, 
            transition: { 
              opacity: { duration: tDur }, 
              scale: { duration: settings.duration + 1, ease: 'linear' } // Smooth continuous scroll/scale effect (Ken Burns)
            } 
          },
          exit: { scale: 0.92, opacity: 0, transition: { duration: tDur, ease: 'easeInOut' } }
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 }
        };
    }
  };

  const motionVariants = getVariants();

  return (
    <div
      ref={playerRef}
      onDoubleClick={toggleFullscreen}
      className={`fixed inset-0 bg-black overflow-hidden flex items-center justify-center select-none ${
        isCursorVisible ? 'cursor-default' : 'cursor-none'
      }`}
      style={{ zIndex: 9999 }}
      id="kiosk-fullscreen-player"
    >
      {/* Background canvas for transitions */}
      <div className="absolute inset-0 z-0 flex items-center justify-center select-none pointer-events-none">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            variants={motionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={activeImage?.url}
              alt={activeImage?.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full ${
                settings.fitMode === 'cover' ? 'object-cover' : 'object-contain'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920&auto=format&fit=crop";
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating control buttons bar (Auto hides on inactive mouse) */}
      <div
        className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-6 flex items-center justify-between z-50 transition-all duration-300 ${
          isCursorVisible ? 'opacity-100 translateY-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="bg-white/12 hover:bg-red-600 border border-white/10 text-white p-2.5 rounded-lg transition-all hover:scale-[1.05] cursor-pointer"
            title="Detener bucle y volver a la configuración (Esc)"
            id="btn-kiosk-exit"
          >
            <X className="w-5 h-5" />
          </button>

          {activeImage && settings.showInfoOverlay && (
            <div className="text-white drop-shadow-md">
              <span className="bg-indigo-600/90 text-[10px] font-mono tracking-widest font-bold px-2 py-0.5 rounded-sm uppercase inline-block mb-1">
                A REPRODUCIR ({currentIndex + 1} / {images.length})
              </span>
              <h3 className="text-sm font-semibold truncate max-w-[280px] sm:max-w-md font-display">
                {activeImage.name}
              </h3>
            </div>
          )}
        </div>

        {/* Media Control Deck */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevImage}
            className="bg-black/40 hover:bg-black/60 border border-white/10 text-white p-2.5 rounded-lg transition-all cursor-pointer"
            title="Imagen anterior (Flecha Izquierda)"
            id="btn-kiosk-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              showFeedback(!isPlaying ? 'play' : 'pause');
            }}
            className="bg-indigo-650/80 hover:bg-indigo-600 border border-white/10 text-white p-3 rounded-lg transition-all scale-[1.08] cursor-pointer inline-flex items-center justify-center text-center"
            title={isPlaying ? "Pausar bucle (Espacio)" : "Reanudar bucle (Espacio)"}
            id="btn-kiosk-toggle-play"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
          </button>

          <button
            onClick={nextImage}
            className="bg-black/40 hover:bg-black/60 border border-white/10 text-white p-2.5 rounded-lg transition-all cursor-pointer"
            title="Siguiente imagen (Flecha Derecha)"
            id="btn-kiosk-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-1"></div>

          <button
            onClick={toggleFullscreen}
            className="bg-black/40 hover:bg-black/60 border border-white/10 text-white p-2.5 rounded-lg transition-all cursor-pointer"
            title="Alternar Pantalla Completa Web (Doble Click)"
            id="btn-kiosk-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Modern Kiosk Status Card - Bottom Left */}
      {settings.showInfoOverlay && activeImage && (
        <div
          className={`absolute bottom-6 left-6 bg-black/75 backdrop-blur-md border border-white/10 p-4.5 rounded-xl text-white max-w-sm z-30 transition-all duration-300 ${
            isCursorVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0e9f6e] uppercase">
              KIOSKO ACTIVO
            </span>
            <span className="text-[10px] text-white/50 font-mono ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {settings.duration}s
            </span>
          </div>

          <h2 className="text-base font-display font-medium text-white line-clamp-1">{activeImage.name}</h2>
          <p className="text-xs text-white/60 font-mono mt-1 break-all line-clamp-1">
            {activeImage.size ? `Fichero: ${activeImage.size}` : `Origen: Enlace Externo`}
          </p>

          <div className="mt-3.5 space-y-1.5">
            {/* Visual Instruction Keys Help */}
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>Espacio: Pausar</span>
              <span>↔ Flechas: Navegar</span>
              <span>Esc: Salir</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP FLUID PROGRESS LOOP TIMER BAR */}
      {isPlaying && images.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 z-55 bg-white/10 pointer-events-none">
          <div
            className="h-full bg-indigo-500 transition-all ease-linear shadow-[0_0_10px_#6366f1]"
            style={{ 
              width: `${progressWidth}%`,
              transitionDuration: progressWidth === 0 ? '0ms' : '50ms'
            }}
          />
        </div>
      )}

      {/* GIANT CENTER SCREEN POPUP NOTIFICATIONS (Hotkey Visual Signals) */}
      <AnimatePresence>
        {feedback.icon && (
          <motion.div
            key={feedback.timestamp}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-60 pointer-events-none bg-black/80 backdrop-blur-xs border border-white/10 text-white w-20 h-20 rounded-full flex items-center justify-center"
          >
            {feedback.icon === 'play' && <Play className="w-8 h-8 fill-white ml-1 text-white" />}
            {feedback.icon === 'pause' && <Pause className="w-8 h-8 fill-white text-white" />}
            {feedback.icon === 'next' && <ChevronRight className="w-8 h-8 text-white" />}
            {feedback.icon === 'prev' && <ChevronLeft className="w-8 h-8 text-white" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
