export const API_URL = __DEV__
    ? 'https://anireserve.com'
    : 'https://anireserve.com';

// 🎨 Modern Minimal - Blanc dominant, vert en accent (CLIENT INTERFACE)
export const Colors = {
    // Textes et éléments principaux
    primary: '#2C3E50',       // Bleu-gris élégant (textes)
    primaryLight: '#34495E',
    primaryDark: '#1A252F',

    // Accent = Vert AniReserve (UNIQUEMENT boutons/CTAs)
    accent: '#2EB190',        // Vert AniReserve
    accentLight: '#5FCFAF',
    accentDark: '#238B70',

    // Secondaire
    secondary: '#3498DB',     // Bleu doux
    secondaryLight: '#5DADE2',

    // Fond blanc dominant
    white: '#FFFFFF',
    black: '#1A1A1A',
    background: '#FFFFFF',    // Blanc pur
    card: '#F8F9FA',          // Gris très léger pour cartes

    gray: {
        lightest: '#F8F9FA',  // Presque blanc
        light: '#E9ECEF',     // Gris clair
        medium: '#6C757D',    // Gris moyen
        dark: '#495057',      // Gris foncé
        darker: '#343A40',    // Gris très foncé
    },

    // États
    success: '#27AE60',       // Vert succès (différent de accent)
    error: '#E74C3C',         // Rouge
    warning: '#F39C12',       // Orange
    info: '#3498DB',          // Bleu

    // Overlays
    overlay: 'rgba(0,0,0,0.4)',
    cardShadow: 'rgba(0,0,0,0.08)',
};

// 🌙 PRO DARK THEME - Interface Pro moderne style FundPip
export const ProColors = {
    // Backgrounds
    background: '#0F0F23',     // Très sombre
    backgroundLight: '#16162D', // Légèrement plus clair
    card: '#1A1A2E',           // Cartes
    cardHover: '#252545',      // Cartes hover

    // Textes
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#6C6C8A',

    // Accent principal (vert AniReserve)
    accent: '#2EB190',
    accentLight: '#5FCFAF',
    accentGlow: 'rgba(46, 177, 144, 0.3)',

    // Accent secondaire (violet/purple)
    purple: '#7B68EE',
    purpleLight: '#9D8FFF',
    purpleGlow: 'rgba(123, 104, 238, 0.3)',

    // États
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB',

    // Médailles podium
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',

    // Borders
    border: '#2A2A4A',
    borderLight: '#3A3A5A',

    // Gradients
    gradientStart: '#1A1A2E',
    gradientEnd: '#0F0F23',
    purpleGradientStart: '#2A1A4A',
    purpleGradientEnd: '#1A1A2E',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 17,   // Apple standard
    xl: 22,
    xxl: 28,
    xxxl: 34,
};

// Ombres subtiles style Apple
export const Shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
};

// Ombres pour le dark theme Pro
export const ProShadows = {
    glow: {
        shadowColor: '#2EB190',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
};

// Border radius - Subtil et moderne
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};
