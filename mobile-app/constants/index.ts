export const API_URL = __DEV__
    ? 'https://anireserve.com'
    : 'https://anireserve.com';

// 🎨 Style AniReserve - Frais et accueillant
export const Colors = {
    // Couleurs principales AniReserve
    primary: '#2EB190',       // Vert AniReserve
    primaryLight: '#4CC9A8',  // Vert clair
    primaryDark: '#238B70',   // Vert foncé

    secondary: '#1E3A5F',     // Bleu marine élégant
    secondaryLight: '#2E5A8F',

    accent: '#2EB190',        // Vert AniReserve (accent = primary)
    accentLight: '#7DD9C0',   // Vert très clair

    // Neutres doux
    white: '#FFFFFF',
    black: '#1A1A1A',
    background: '#F8FAF9',    // Fond légèrement teinté vert
    card: '#FFFFFF',

    gray: {
        lightest: '#F4F7F6',  // Gris teinté vert
        light: '#E0E8E5',
        medium: '#8A9B95',
        dark: '#4A5C55',
        darker: '#2A3A35',
    },

    // États
    success: '#2EB190',       // Vert AniReserve
    error: '#E74C3C',         // Rouge doux
    warning: '#F39C12',       // Orange chaleureux
    info: '#3498DB',          // Bleu info

    // Overlays
    overlay: 'rgba(0,0,0,0.4)',
    cardShadow: 'rgba(46,177,144,0.1)',
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

// Border radius - Subtil et moderne
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};
