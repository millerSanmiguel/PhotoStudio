import React, { useState, useRef } from 'react';
import {
  Trash2,
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  FileImage,
  Sliders,
  Monitor,
  Link,
  Info
} from 'lucide-react';
import { KioskImage, KioskSettings } from '../types';

interface AdminPanelProps {
  images: KioskImage[];
  setImages: React.Dispatch<React.SetStateAction<KioskImage[]>>;
  settings: KioskSettings;
  setSettings: React.Dispatch<React.SetStateAction<KioskSettings>>;
  onStartKiosk: () => void;
  onResetToDefaults: () => void;
}

export default function AdminPanel({
  images,
  setImages,
  settings,
  setSettings,
  onStartKiosk,
  onResetToDefaults
}: AdminPanelProps) {
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [imageInputName, setImageInputName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle URL addition
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageInputUrl) {
      setErrorMsg('Por favor, introduce una URL de imagen válida.');
      return;
    }

    const newImg: KioskImage = {
      id: `img-url-${Date.now()}`,
      name: imageInputName.trim() || `Imagen Enlazada #${images.length + 1}`,
      url: imageInputUrl,
      size: 'Enlace Web',
      addedAt: Date.now(),
    };

    setImages(prev => [...prev, newImg]);
    setImageInputUrl('');
    setImageInputName('');
    setErrorMsg('');
  };

  // Process selected file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('El archivo seleccionado debe ser una imagen.');
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    // Create an object URL representing the file. This allows local playback.
    const fileUrl = URL.createObjectURL(file);

    const newImg: KioskImage = {
      id: `img-local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: fileUrl,
      size: `${sizeInMB} MB`,
      addedAt: Date.now(),
    };

    setImages(prev => [...prev, newImg]);
    setErrorMsg('');
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      (Array.from(files) as File[]).forEach(file => processFile(file));
    }
  };

  // Drag and Drop Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      (Array.from(files) as File[]).forEach(file => processFile(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Image manipulation actions
  const handleDelete = (id: string) => {
    // Revoke object URL to free up memory if it was a local file
    const target = images.find(img => img.id === id);
    if (target && target.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url);
    }
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 font-sans bg-gray-50 text-gray-800 rounded-2xl shadow-sm min-h-screen">
      {/* App Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
            ADMINISTRACIÓN DE KIOSKO
          </span>
          <h1 className="text-3xl font-display font-medium text-gray-900 mt-2">
            Panel de Configuración de Presentación
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Simulador Web del Visualizador de Imágenes en Bucle a Pantalla Completa para Windows.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Logo - Ampliado y a un lado visible */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex items-center justify-center p-2 shrink-0">
            <img src="/LogoPhos.jpeg" alt="Logo PhotoStudio" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onResetToDefaults}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer"
              title="Restablecer todos los ajustes e imágenes iniciales"
              id="btn-reset-defaults"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer
            </button>
            
            <button
              onClick={onStartKiosk}
              disabled={images.length === 0}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                images.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
              title="Reproducir visualizador a pantalla completa"
              id="btn-launch-kiosk"
            >
              <Play className="w-4 h-4 fill-white" />
              F11 Iniciar Kiosko
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SETTINGS */}
        <div className="space-y-6 lg:col-span-1">
          {/* Panel Ajustes */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Settings className="w-5 h-5 text-indigo-500" />
              <h2 className="font-display font-medium text-gray-900">Ajustes del Reproductor</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Tiempo en Pantalla (Sg)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={settings.duration}
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    id="input-duration-range"
                  />
                  <span className="text-sm font-mono font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded min-w-[50px] text-center">
                    {settings.duration}s
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Efecto de Transición
                </label>
                <select
                  value={settings.transitionType}
                  onChange={(e) => setSettings(prev => ({ ...prev, transitionType: e.target.value as any }))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  id="select-transition-type"
                >
                  <option value="fade">Desvanecimiento (Fade in/out)</option>
                  <option value="slideLeft">Desplazamiento a Izquierda</option>
                  <option value="slideRight">Desplazamiento a Derecha</option>
                  <option value="zoom">Zoom Suave (Ken Burns effect)</option>
                  <option value="none">Sin Transición (Instantáneo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Duración de la Transición (Sg)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={settings.transitionDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, transitionDuration: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    id="input-trans-duration-range"
                  />
                  <span className="text-sm font-mono font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded min-w-[50px] text-center">
                    {settings.transitionDuration}s
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Ajuste de Imagen (Fit)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, fitMode: 'cover' }))}
                    className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer border ${
                      settings.fitMode === 'cover'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Rellenar Pantalla (Cover)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, fitMode: 'contain' }))}
                    className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer border ${
                      settings.fitMode === 'contain'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Mostrar Completa (Contain)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Orientación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, orientation: 'horizontal' }))}
                    className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer border ${
                      (!settings.orientation || settings.orientation === 'horizontal')
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, orientation: 'vertical' }))}
                    className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer border ${
                      settings.orientation === 'vertical'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Vertical
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                    className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-600 font-medium">Reproducción automática al iniciar</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showInfoOverlay}
                    onChange={(e) => setSettings(prev => ({ ...prev, showInfoOverlay: e.target.checked }))}
                    className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-xs text-gray-600 font-medium">Mostrar detalles/nombre de imagen</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs font-mono space-y-3 text-xs border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-wider uppercase mb-1">
              <Sliders className="w-4 h-4" />
              Atajos del Teclado
            </div>
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Espacio</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">PAUSA / REPRODUCIR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">→ Flecha Der</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">SIGUIENTE IMAGEN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">← Flecha Izq</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">IMAGEN ANTERIOR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Esc</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">SALIR PANTALLA COMPLETA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">F11 / Doble Click</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">MODO KIOSKO REAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FILE MANAGER */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Text Configuration Block */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-display font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">
              Configuración de Textos en Pantalla
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Título de la Presentación
                </label>
                <input
                  type="text"
                  value={settings.groupTitle || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, groupTitle: e.target.value }))}
                  placeholder="Ej: Cumpleaños 2026, Evento Principal..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Posición del Título
                  </label>
                  <select
                    value={settings.titlePosition || 'top-right'}
                    onChange={(e) => setSettings(prev => ({ ...prev, titlePosition: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="top-left">Arriba a la Izquierda</option>
                    <option value="top-right">Arriba a la Derecha</option>
                    <option value="bottom-left">Abajo a la Izquierda</option>
                    <option value="bottom-right">Abajo a la Derecha</option>
                    <option value="top-center">Centro Arriba</option>
                    <option value="bottom-center">Centro Abajo</option>
                    <option value="hidden">Oculto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Posición del Nombre de Foto
                  </label>
                  <select
                    value={settings.namePosition || 'bottom-left'}
                    onChange={(e) => setSettings(prev => ({ ...prev, namePosition: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="top-left">Arriba a la Izquierda</option>
                    <option value="top-right">Arriba a la Derecha</option>
                    <option value="bottom-left">Abajo a la Izquierda</option>
                    <option value="bottom-right">Abajo a la Derecha</option>
                    <option value="top-center">Centro Arriba</option>
                    <option value="bottom-center">Centro Abajo</option>
                    <option value="hidden">Oculto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Posición del Logo (Marca de Agua)
                  </label>
                  <select
                    value={settings.logoPosition || 'bottom-right'}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoPosition: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="top-left">Arriba a la Izquierda</option>
                    <option value="top-right">Arriba a la Derecha</option>
                    <option value="bottom-left">Abajo a la Izquierda</option>
                    <option value="bottom-right">Abajo a la Derecha</option>
                    <option value="top-center">Centro Arriba</option>
                    <option value="bottom-center">Centro Abajo</option>
                    <option value="hidden">Oculto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Tamaño de Fuente
                  </label>
                  <select
                    value={settings.fontSize || 'medium'}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                    <option value="xlarge">Extra Grande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Estilo de Fuente
                  </label>
                  <select
                    value={settings.fontFamily || 'display'}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value as any }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="sans">Elegante (Sans)</option>
                    <option value="serif">Clásica (Serif)</option>
                    <option value="mono">Técnica (Monoespaciada)</option>
                    <option value="display">Impactante (Display/Bold)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload / Source Selection */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-505" />
                <h2 className="font-display font-medium text-gray-900">Añadir Archivos e Imágenes</h2>
              </div>
              <span className="text-xs text-gray-400">Total: {images.length} imágenes</span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-xs font-semibold mb-4 border border-rose-100">
                {errorMsg}
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Arrastra aquí tus fotos o <span className="text-indigo-600 hover:underline">busca archivos</span>
                </p>
                <p className="text-xs text-gray-400 mt-1 font-sans">
                  Soporta JPG, PNG, WEBP, SVG.
                </p>
              </div>
            </div>

            {/* URL Source Form */}
            <form onSubmit={handleAddUrl} className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-gray-400" />
                O introduce un enlace de internet (La forma más persistente)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="URL de la imagen (ej: https://...)"
                  value={imageInputUrl}
                  onChange={(e) => setImageInputUrl(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Título descriptivo (opcional)"
                    value={imageInputName}
                    onChange={(e) => setImageInputName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all inline-flex items-center justify-center min-w-[90px]"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of images */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-xs">
            <h2 className="font-display font-medium text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-indigo-501" />
              Secuencia de Reproducción
            </h2>

            {images.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic text-sm flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-10 h-10 text-gray-300" />
                No hay imágenes añadidas en el kiosko. Añade imágenes arriba.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between p-2.5 border border-gray-100 hover:border-indigo-150 rounded-xl hover:bg-slate-50/50 transition-all gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail Preview */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-150 border border-gray-200/60 relative shrink-0">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // If an image fails to load, draw a fallback
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=200&auto=format&fit=crop";
                          }}
                        />
                        <div className="absolute top-0 left-0 bg-black/60 text-white font-mono text-[9px] font-bold px-1 py-0.5 rounded-br">
                          {index + 1}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate" title={image.name}>
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                          <span>{image.size || 'Desconocido'}</span>
                          {image.url.startsWith('blob:') && (
                            <span className="text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded text-[9px] font-semibold border border-sky-100">
                              Local en memoria
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions and Rearrange Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className={`p-1.5 rounded-lg border transition-all ${
                          index === 0
                            ? 'text-gray-200 border-gray-100 bg-gray-50 cursor-not-allowed'
                            : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-white hover:text-indigo-600 cursor-pointer'
                        }`}
                        title="Subir orden"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === images.length - 1}
                        className={`p-1.5 rounded-lg border transition-all ${
                          index === images.length - 1
                            ? 'text-gray-200 border-gray-100 bg-gray-50 cursor-not-allowed'
                            : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-white hover:text-indigo-600 cursor-pointer'
                        }`}
                        title="Bajar orden"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-1.5 rounded-lg border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 text-red-650 cursor-pointer transition-all"
                        title="Eliminar de la secuencia"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Persistent Warning simulated note for full windows package */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-sm text-indigo-8o0 leading-relaxed">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-900 block mb-0.5">Nota de Persistencia para Windows</span>
              <p className="text-indigo-700 text-xs">
                En una aplicación nativa empaquetada (con Electron o Tauri), la lista de imágenes se guardaría de forma permanente en un archivo JSON local (ej: <code className="bg-indigo-105/60 px-1 py-0.2 rounded font-mono text-[10px] text-indigo-900">config.json</code>) o base de datos ligera SQLite y las imágenes locales cargadas se copiarían en un directorio del sistema (ej: <code className="bg-indigo-105/60 px-1 py-0.2 rounded font-mono text-[10px] text-indigo-900">AppData/Images</code>) para garantizar que permanezcan accesibles entre reinicios del PC.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
