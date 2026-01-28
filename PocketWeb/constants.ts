
import { WebApp, ThemeConfig } from './types';

export const PRESET_APPS: WebApp[] = [
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', category: 'Communication', isPreset: true },
  { id: 'notion', name: 'Notion', url: 'https://www.notion.so', category: 'Productivity', isPreset: true },
  { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com', category: 'Media', isPreset: true },
  { id: 'github', name: 'GitHub', url: 'https://github.com', category: 'Development', isPreset: true },
  { id: 'google-cal', name: 'Calendar', url: 'https://calendar.google.com', category: 'Productivity', isPreset: true },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', category: 'Media', isPreset: true },
  { id: 'twitter', name: 'X / Twitter', url: 'https://x.com', category: 'Social', isPreset: true },
  { id: 'figma', name: 'Figma', url: 'https://www.figma.com', category: 'Design', isPreset: true },
  { id: 'slack', name: 'Slack', url: 'https://app.slack.com', category: 'Communication', isPreset: true },
  { id: 'claude', name: 'Claude AI', url: 'https://claude.ai', category: 'AI', isPreset: true },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', category: 'AI', isPreset: true },
];

export const CHROME_PRESET_COLORS = [
  { name: 'Onyx', bg: '#0f172a', accent: '#38bdf8', backdrop: '#020617' },
  { name: 'Carbon', bg: '#171717', accent: '#f43f5e', backdrop: '#0a0a0a' },
  { name: 'Amethyst', bg: '#2e1065', accent: '#c084fc', backdrop: '#1e1b4b' },
  { name: 'Emerald', bg: '#064e3b', accent: '#34d399', backdrop: '#022c22' },
  { name: 'Slate', bg: '#334155', accent: '#94a3b8', backdrop: '#0f172a' },
  { name: 'Pure', bg: '#ffffff', accent: '#2563eb', backdrop: '#f8fafc' },
];

export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: 'deep-space',
    name: 'Deep Space',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    accent: '#38bdf8',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    isDark: true
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    bgPrimary: '#2e3440',
    bgSecondary: '#3b4252',
    bgTertiary: '#4c566a',
    accent: '#88c0d0',
    text: '#eceff4',
    textSecondary: '#d8dee9',
    isDark: true
  },
  {
    id: 'minimalist',
    name: 'Pristine White',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    bgTertiary: '#f1f5f9',
    accent: '#2563eb',
    text: '#0f172a',
    textSecondary: '#64748b',
    isDark: false
  },
  {
    id: 'crimson',
    name: 'Royal Crimson',
    bgPrimary: '#450a0a',
    bgSecondary: '#7f1d1d',
    bgTertiary: '#991b1b',
    accent: '#fca5a5',
    text: '#fef2f2',
    textSecondary: '#fca5a5',
    isDark: true
  }
];

export const PRESET_WALLPAPERS = [
  { id: 'pocketweb-official', name: 'PocketWeb Official', url: 'PocketWeb.png' },
  { id: 'glass-peaks', name: 'Glass Peaks', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540' },
  { id: 'cyber-city', name: 'Neon Protocol', url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=3540' },
  { id: 'minimal-zen', name: 'Zen Slate', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=3540' },
  { id: 'abstract-flow', name: 'Deep Pulse', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=3540' },
  { id: 'nebula-core', name: 'Nebula Protocol', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=3540' }
];
