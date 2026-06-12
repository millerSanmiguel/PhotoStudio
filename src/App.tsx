import { useState, useEffect } from 'react';
import { Monitor, HardDrive, FileJson, LayoutTemplate, HelpCircle } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import KioskPlayer from './components/KioskPlayer';
import { KioskImage, KioskSettings } from './types';
import { DEFAULT_IMAGES, DEFAULT_SETTINGS } from './data';

const IMAGES_STORAGE_KEY = 'kiosk_images_v2';
const SETTINGS_STORAGE_KEY = 'kiosk_settings_v2';

export default function App() {
  const [images, setImages] = useState<KioskImage[]>(() => {
    try {
      const saved = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading images from localStorage:', e);
    }
    return DEFAULT_IMAGES;
  });

  const [settings, setSettings] = useState<KioskSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isKioskActive, setIsKioskActive] = useState(false);

  // Sync state changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
    } catch (e) {
      console.warn('Error writing images to localStorage:', e);
    }
  }, [images]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error writing settings to localStorage:', e);
    }
  }, [settings]);

  const handleResetToDefaults = () => {
    if (window.confirm('¿Estás seguro de que deseas restablecer la lista de imágenes y los ajustes a los valores iniciales?')) {
      // Revoke any blob URLs
      images.forEach(img => {
        if (img.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(img.url);
          } catch {}
        }
      });
      setImages(DEFAULT_IMAGES);
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleStartKiosk = () => {
    setIsKioskActive(true);
  };

  const handleExitKiosk = () => {
    setIsKioskActive(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white" id="main-app-container">
      {/* Kiosk Immersive Mode */}
      {isKioskActive ? (
        <KioskPlayer
          images={images}
          settings={settings}
          onExit={handleExitKiosk}
        />
      ) : (
        <>
          {/* Top Decorative Simulator Ribbon */}
          <div className="bg-indigo-900 text-white text-xs px-4 py-2 flex items-center justify-between font-mono border-b border-indigo-950">
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>[SIMULADOR DE ENTORNO WINDOWS KIOSK ACTIVE]</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-indigo-200">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-300" />
                Doble Click para Pantalla Completa Real (F11)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileJson className="w-3 h-3 text-indigo-300" />
                Auto-guardado en LocalStorage
              </span>
            </div>
          </div>

          {/* Main App Config UI */}
          <main className="flex-1 py-8 px-4 sm:px-6">
            <AdminPanel
              images={images}
              setImages={setImages}
              settings={settings}
              setSettings={setSettings}
              onStartKiosk={handleStartKiosk}
              onResetToDefaults={handleResetToDefaults}
            />
          </main>

          {/* Footer with informational blueprint design concept */}
          <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-xs text-gray-500">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-800 font-semibold uppercase tracking-wider text-[10px]">
                  <LayoutTemplate className="w-3.5 h-3.5 text-indigo-550" />
                  Arquitectura Kiosko MVP
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Desarrollado modularmente en base a un sistema de transiciones con aceleramiento gráfico nativo. Admite arrastre directo de ficheros en memoria activa.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-800 font-semibold uppercase tracking-wider text-[10px]">
                  <Monitor className="w-3.5 h-3.5 text-indigo-550" />
                  Soporte de Entrada Local
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Escucha de eventos de teclado de bajo nivel simulados a través de controladores <code className="bg-gray-100 px-1 py-0.2 rounded font-mono text-[10px]">keydown</code> globales para controlar el flujo cómodamente.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-800 font-semibold uppercase tracking-wider text-[10px]">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-550" />
                  Cómo testear la experiencia
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Haz clic en <strong className="text-indigo-650">F11 Iniciar Kiosko</strong> para entablar el bucle. Usa <kbd className="bg-gray-100 border border-gray-200 px-1 rounded">Espacio</kbd> para pausar o las flechas de dirección para avanzar.
                </p>
              </div>

            </div>
          </footer>
        </>
      )}
    </div>
  );
}
