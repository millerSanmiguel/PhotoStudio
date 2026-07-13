export type TransitionType = 'fade' | 'slideLeft' | 'slideRight' | 'zoom' | 'none';

export interface KioskImage {
  id: string;
  name: string;
  url: string;
  size?: string;
  addedAt: number;
}

export type TextPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center' | 'hidden';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'display';

export interface KioskSettings {
  duration: number; // in seconds
  transitionType: TransitionType;
  transitionDuration: number; // in seconds
  autoPlay: boolean;
  showInfoOverlay: boolean;
  fitMode: 'cover' | 'contain';
  orientation?: 'horizontal' | 'vertical';
  groupTitle?: string;
  titlePosition?: TextPosition;
  namePosition?: TextPosition;
  logoPosition?: TextPosition;
  fontSize?: FontSize;
  fontFamily?: FontFamily;
}
