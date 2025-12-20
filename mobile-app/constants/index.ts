export const API_URL = __DEV__
    ? 'https://anireserve.com'  // Use production (localhost won't work on phone)
    : 'https://anireserve.com'; // Production

// 🎨 Nouvelle palette CHALEUREUSE et MODERNE
export const Colors = {
    // Couleurs principales - Tons chauds
    primary: '#FF6B6B',       // Corail chaud
    primaryDark: '#E55555',   // Corail foncé
    primaryLight: '#FF8E8E',  // Corail clair

    secondary: '#2D3436',     // Gris charbon élégant
    secondaryLight: '#636E72', // Gris moyen

    accent: '#FFC93C',        // Or/Jaune soleil
    accentLight: '#FFE066',   // Jaune clair

    // Dégradés
    gradient: {
        start: '#FF6B6B',     // Corail
        middle: '#FF8E53',    // Orange
        end: '#FFC93C',       // Or
    },

    // Neutres
    white: '#FFFFFF',
    black: '#1A1A2E',
    background: '#FFF9F5',    // Crème chaud
    card: '#FFFFFF',

    gray: {
        lightest: '#FAFAFA',
        light: '#F5F0EB',     // Beige clair
        medium: '#B2B2B2',
        dark: '#6B7280',
        darker: '#374151',
    },

    // États
    success: '#00C853',       // Vert vif
    error: '#FF5252',         // Rouge vif
    warning: '#FFB300',       // Ambre
    info: '#00B4D8',          // Bleu clair

    // Overlays
    overlay: 'rgba(0,0,0,0.5)',
    cardShadow: 'rgba(255,107,107,0.15)',
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
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

// Ombres pour effet premium
export const Shadows = {
    small: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

// Border radius constants
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};
