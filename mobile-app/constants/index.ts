export const API_URL = __DEV__
    ? 'https://anireserve.com'
    : 'https://anireserve.com';

// 🎨 PALETTE ANIRESERVE - Une seule palette cohérente
// Basée sur le logo: Vert émeraude, Navy, Jaune accent
export const Colors = {
    // === MARQUE PRINCIPALE ===
    primary: '#2EB190',        // Vert AniReserve (principal)
    primaryLight: '#5FCFAF',
    primaryDark: '#238B70',

    // Navy (textes et éléments forts)
    secondary: '#1E3A5F',      // Navy AniReserve
    secondaryLight: '#2C4A6B',
    secondaryDark: '#162C47',

    // Accent (touches de couleur)
    accent: '#F4D03F',         // Jaune du logo (ampoule)
    accentLight: '#F7DC6F',
    accentDark: '#D4AC0D',

    // === NEUTRES ===
    white: '#FFFFFF',
    black: '#1A1A1A',
    background: '#F5F7FA',     // Gris très clair pour le fond
    card: '#FFFFFF',           // Cartes blanches

    gray: {
        lightest: '#F8FAFC',   // Fond clair
        light: '#E2E8F0',      // Bordures
        medium: '#94A3B8',     // Texte secondaire
        dark: '#475569',       // Texte principal
        darker: '#1E293B',     // Texte fort
    },

    // === ÉTATS ===
    success: '#10B981',        // Vert succès
    error: '#EF4444',          // Rouge erreur
    warning: '#F59E0B',        // Orange warning
    info: '#3B82F6',           // Bleu info

    // === OVERLAYS ===
    overlay: 'rgba(0,0,0,0.5)',
    cardShadow: 'rgba(0,0,0,0.08)',

    // === TRANSPARENCES ===
    primaryAlpha: (opacity: number) => `rgba(46, 177, 144, ${opacity})`,
    secondaryAlpha: (opacity: number) => `rgba(30, 58, 95, ${opacity})`,
};

// 🌙 PALETTE PRO (Dark Theme) - Utilisée UNIQUEMENT pour le dashboard Pro
export const ProColors = {
    // Backgrounds
    background: '#0F0F23',
    backgroundLight: '#16162D',
    card: '#1A1A2E',
    cardHover: '#252545',

    // Textes
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#6C6C8A',

    // Couleurs de marque (mêmes que Colors)
    primary: '#2EB190',
    primaryLight: '#5FCFAF',
    secondary: '#1E3A5F',
    accent: '#F4D03F',

    // Accent violet pour le pro
    purple: '#7B68EE',
    purpleLight: '#9D8FFF',

    // États (mêmes que Colors)
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Médailles
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',

    // Borders
    border: '#2A2A4A',
    borderLight: '#3A3A5A',
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
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const Shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
};

export const ProShadows = {
    glow: {
        shadowColor: Colors.primary,
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

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};
