import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    webpack: (config, { isServer }) => {
        // Exclude mobile-app from webpack compilation
        config.watchOptions = {
            ...config.watchOptions,
            ignored: ['**/node_modules', '**/mobile-app/**'],
        };
        return config;
    },
    // Empty turbopack config to silence Next.js 16 warning
    turbopack: {},
};

export default nextConfig;



