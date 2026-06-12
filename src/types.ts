export type TransitionType = 'fade' | 'slideLeft' | 'slideRight' | 'zoom' | 'none';

export interface KioskImage {
  id: string;
  name: string;
  url: string;
  size?: string;
  addedAt: number;
}

export interface KioskSettings {
  duration: number; // in seconds
  transitionType: TransitionType;
  transitionDuration: number; // in seconds
  autoPlay: boolean;
  showInfoOverlay: boolean;
  fitMode: 'cover' | 'contain';
}
