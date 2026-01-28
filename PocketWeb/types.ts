
export interface WebApp {
  id: string;
  name: string;
  url: string;
  icon?: string;
  category?: string;
  isPreset?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  accent: string;
  text: string;
  textSecondary: string;
  isDark: boolean;
}

export interface UserPreset {
  id: string;
  name: string;
  state: AppState;
  updatedAt: number;
}

export interface LandingPreset {
  id: string;
  name: string;
  config: {
    landingTitle: string;
    landingSubtitle: string;
    landingButtonText: string;
    landingPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showLandingSubtitle: boolean;
    landingFontFamily: 'sans' | 'serif' | 'mono';
    landingIsItalic: boolean;
    landingFontWeight: 'light' | 'normal' | 'bold' | 'black';
    landingTextColor: string | null;
    landingAccentColor: string | null;
    landingButtonVariant: 'heavy' | 'flat' | 'glass';
    landingScale: number;
  };
}

export interface AppState {
  apps: WebApp[];
  activeAppId: string | null;
  theme: ThemeConfig;
  globalDarkMode: boolean;
  chromeBgColor: string | null;
  chromeAccentColor: string | null;
  sidebarExpanded: boolean;
  zoomLevel: number;
  wallpaperUrl: string;
  wallpaperOpacity: number;
  wallpaperColor: string;
  wallpaperBlur: number;
  uiDensity: 'comfortable' | 'compact';
  sidebarPosition: 'left' | 'right';
  wallpaperFit: 'cover' | 'contain' | 'fill';
  // Landing Customization
  landingTitle: string;
  landingSubtitle: string;
  landingButtonText: string;
  landingPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showLandingSubtitle: boolean;
  // New Styling Options
  landingFontFamily: 'sans' | 'serif' | 'mono';
  landingIsItalic: boolean;
  landingFontWeight: 'light' | 'normal' | 'bold' | 'black';
  landingTextColor: string | null; // null means use theme default
  landingAccentColor: string | null; // null means use theme accent
  landingButtonVariant: 'heavy' | 'flat' | 'glass';
  landingScale: number;
  landingViewMode?: 'hero' | 'gallery';
}
