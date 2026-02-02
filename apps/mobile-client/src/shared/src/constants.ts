// API Base URL
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://anireserve.com/api';

// Colors - Design System (Uber-inspired)
export const Colors = {
    // Primary
    primary: '#000000',
    primaryLight: '#333333',

    // Accent
    accent: '#00D9A3', // Vert moderne
    accentLight: '#E6F9F4',

    // Pro Colors (pour l'app Pro)
    proPrimary: '#5B21B6', // Violet professionnel
    proAccent: '#F59E0B', // Orange

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // Semantic
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',

    // Text
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
};

// Spacing (8px base unit)
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border Radius
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

// Typography
export const Typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    small: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
};

// Shadows
export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
};
