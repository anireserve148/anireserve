export const API_URL = __DEV__
    ? 'https://anireserve.com'
    : 'https://anireserve.com';

// 🎨 Style TESLA / APPLE - Élégant mais plus doux
export const Colors = {
    // Couleurs principales - Gris élégant (moins agressif)
    primary: '#1C1C1E',       // Gris foncé Apple (pas noir pur)
    primaryLight: '#2C2C2E',  // Gris moyen

    secondary: '#3A3A3C',     // Gris secondaire
    secondaryLight: '#636366', // Gris clair

    accent: '#007AFF',        // Bleu Apple
    accentLight: '#5AC8FA',   // Bleu clair

    // Neutres élégants
    white: '#FFFFFF',
    black: '#000000',
    background: '#FAFAFA',    // Gris très clair
    card: '#FFFFFF',

    gray: {
        lightest: '#F5F5F7',  // Apple gray
        light: '#E8E8ED',
        medium: '#86868B',
        dark: '#515154',
        darker: '#1D1D1F',
    },

    // États
    success: '#34C759',       // Apple green
    error: '#FF3B30',         // Apple red
    warning: '#FF9500',       // Apple orange
    info: '#0071E3',          // Apple blue

    // Overlays
    overlay: 'rgba(0,0,0,0.5)',
    cardShadow: 'rgba(0,0,0,0.08)',
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
