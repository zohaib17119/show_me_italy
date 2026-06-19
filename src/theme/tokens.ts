export const tokens = {
  colorPrimary: '#27AE60',
  colorPrimaryHover: '#1E8449',
  colorPrimaryActive: '#166534',
  sidebarBg: '#0d2318',
  sidebarBgAlt: '#1C3A24',
  contentBg: '#EEF4EF',
  cardBg: '#FFFFFF',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: 12,
  textPrimary: '#1C2520',
  textSecondary: '#4A5E51',
  textMuted: '#6B8C75',
  borderColor: '#DFF0E4',
  red: '#E74C3C',
  orange: '#F59E0B',
  blue: '#2E75B6',
  purple: '#8E44AD',
} as const;

export const languageColors: Record<string, string> = {
  EN: '#2E75B6',
  IT: '#E74C3C',
  FR: '#27AE60',
  ES: '#F39C12',
  DE: '#8E44AD',
  PT: '#1ABC9C',
  JA: '#E91E90',
  ZH: '#E67E22',
};

export type LangCode = keyof typeof languageColors;
