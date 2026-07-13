import { KioskImage, KioskSettings } from './types';

export const DEFAULT_SETTINGS: KioskSettings = {
  duration: 5,
  transitionType: 'fade',
  transitionDuration: 1.0,
  autoPlay: true,
  showInfoOverlay: true,
  fitMode: 'cover',
  orientation: 'horizontal',
  groupTitle: 'Mi Presentación',
  titlePosition: 'top-right',
  namePosition: 'bottom-left',
  logoPosition: 'bottom-right',
  fontSize: 'medium',
  fontFamily: 'display',
};

export const DEFAULT_IMAGES: KioskImage[] = [
  {
    id: 'img-1',
    name: 'Valle de Yosemite, EE.UU.',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
    size: '1.2 MB',
    addedAt: 1718000000000,
  },
  {
    id: 'img-2',
    name: 'Bosque de Niebla Matutina',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop',
    size: '980 KB',
    addedAt: 1718000100000,
  },
  {
    id: 'img-3',
    name: 'Sendero de Madera en el Bosque',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1920&auto=format&fit=crop',
    size: '1.4 MB',
    addedAt: 1718000200000,
  },
  {
    id: 'img-4',
    name: 'Atardecer en la Costa Rocosa',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920&auto=format&fit=crop',
    size: '1.1 MB',
    addedAt: 1718000300000,
  }
];
