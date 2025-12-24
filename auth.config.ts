import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request }) {
            const { nextUrl } = request;
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            // Simple auth check: if on dashboard, must be logged in
            if (isOnDashboard) {
                if (!isLoggedIn) {
                    return false; // Redirect to login
                }
                // Role-based redirects are handled in page components, not here
                // This avoids redirect loops since middleware can't reliably access role
                return true;
            }

            return true;
        },
    },
} satisfies NextAuthConfig;
