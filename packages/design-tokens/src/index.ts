/**
 * FETRAG design tokens - source unique de vérité pour la charte graphique.
 * Les couleurs sont échantillonnées directement sur le logo officiel :
 *  - Bleu FETRAG   #0259C7 (anneau extérieur, lettrage, silhouettes)
 *  - Vert FETRAG   #9CC102 (arc intérieur ouvert vers l'étoile)
 *  - Or FETRAG     #F9C804 (étoile, mot « Solidarité »)
 *  - Marine        #042768 (ombres profondes du logo)
 */
export const brand = {
  blue: {
    50: '#EEF4FD',
    100: '#D9E6FA',
    200: '#B3CDF5',
    300: '#7FABEE',
    400: '#3F82E1',
    500: '#0259C7',
    600: '#024CB5',
    700: '#033B97',
    800: '#022A77',
    900: '#042768',
    950: '#02163F',
  },
  green: {
    50: '#F6FAE6',
    100: '#EBF4C7',
    200: '#D8EA93',
    300: '#C1DC57',
    400: '#ACCD1E',
    500: '#9CC102',
    600: '#7FA000',
    700: '#627C03',
    800: '#4B5E08',
    900: '#3B4A0C',
  },
  gold: {
    50: '#FFFBE6',
    100: '#FFF3B8',
    200: '#FFE87A',
    300: '#FDDA3C',
    400: '#FBD406',
    500: '#F9C804',
    600: '#DBA702',
    700: '#B07F05',
    800: '#8B620C',
    900: '#6E4E10',
  },
  navy: {
    DEFAULT: '#042768',
    deep: '#02163F',
    ink: '#0B1B3F',
  },
  neutral: {
    0: '#FFFFFF',
    25: '#FCFCFD',
    50: '#F7F8FC',
    100: '#EEF0F6',
    200: '#DFE3EC',
    300: '#C5CBD9',
    400: '#9AA3B8',
    500: '#6B7591',
    600: '#4E5872',
    700: '#38405A',
    800: '#242B42',
    900: '#141A2E',
    950: '#0B0F1E',
  },
} as const

/** Rôles sémantiques : ce que les composants doivent utiliser. */
export const semantic = {
  primary: brand.blue[500],
  primaryStrong: brand.blue[700],
  primarySoft: brand.blue[50],
  accent: brand.green[500],
  accentStrong: brand.green[700],
  accentSoft: brand.green[50],
  highlight: brand.gold[500],
  highlightStrong: brand.gold[700],
  highlightSoft: brand.gold[50],
  ink: brand.navy.ink,
  surface: brand.neutral[0],
  surfaceMuted: brand.neutral[50],
  border: brand.neutral[200],
  success: brand.green[600],
  warning: brand.gold[600],
  danger: '#C62828',
  info: brand.blue[400],
} as const

/** Le triptyque fondateur du programme : couleur associée à chaque pilier. */
export const triptych = [
  { key: 'protection', label: "Protection de l'outil de production", color: brand.blue[500] },
  { key: 'prevention', label: 'Prévention des conflits sociaux', color: brand.green[500] },
  { key: 'defense', label: 'Défense des intérêts matériels et moraux', color: brand.gold[500] },
] as const

export const typography = {
  /** Titres institutionnels : serif à axe optique, écho du lettrage serif du logo. */
  display: "'Fraunces', 'Georgia', 'Times New Roman', serif",
  /** Interface et corps de texte. */
  sans: "'Manrope', 'Segoe UI', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
} as const

export const radius = {
  xs: '0.375rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  pill: '999px',
} as const

export const shadow = {
  soft: '0 1px 2px rgba(4, 39, 104, 0.06), 0 8px 24px -12px rgba(4, 39, 104, 0.18)',
  lift: '0 12px 32px -12px rgba(2, 89, 199, 0.28), 0 2px 6px rgba(4, 39, 104, 0.08)',
  glowBlue: '0 0 0 4px rgba(2, 89, 199, 0.16)',
  glowGreen: '0 0 0 4px rgba(156, 193, 2, 0.24)',
  glowGold: '0 0 0 4px rgba(249, 200, 4, 0.28)',
} as const

export const motion = {
  duration: { fast: 0.18, base: 0.32, slow: 0.6, reveal: 0.8 },
  ease: {
    out: [0.16, 1, 0.3, 1] as [number, number, number, number],
    inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
    spring: { type: 'spring', stiffness: 260, damping: 26 } as const,
  },
  stagger: 0.07,
} as const

export const breakpoints = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const tokens = { brand, semantic, triptych, typography, radius, shadow, motion, breakpoints }
export type Tokens = typeof tokens
export default tokens
