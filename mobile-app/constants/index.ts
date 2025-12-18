export const API_URL = __DEV__
    ? 'http://localhost:3000'  // Dev local
    : 'https://anireserve.com'; // Production

export const Colors = {
    primary: '#2eb190',      // Turquoise
    secondary: '#18223b',    // Navy
    accent: '#FFBD59',       // Gold
    white: '#FFFFFF',
    black: '#000000',
    gray: {
        light: '#F5F5F5',
        medium: '#9CA3AF',
        dark: '#4B5563',
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
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
};
