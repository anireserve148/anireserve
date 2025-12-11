import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request }) {
            const { nextUrl } = request;
            console.log("Authorized Callback:", {
                path: nextUrl.pathname,
                isLoggedIn: !!auth?.user,
                user: auth?.user,
                cookies: request.headers.get('cookie')
            });
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isProDashboard = nextUrl.pathname.startsWith('/dashboard/pro');
            const isAdminDashboard = nextUrl.pathname.startsWith('/dashboard/admin');

            if (isOnDashboard) {
                // BYPASS AUTH FOR DEV ENVIRONMENT IF COOKIES FAIL
                if (process.env.NODE_ENV === 'development') return true;

                if (isLoggedIn) {
                    const role = (auth.user as any).role;

                    // Admin Protection
                    // if (isAdminDashboard && role !== 'ADMIN') {
                    //     return Response.redirect(new URL('/dashboard', nextUrl));
                    // }

                    // Pro Protection
                    if (isProDashboard && role !== 'PRO') {
                        return Response.redirect(new URL('/dashboard', nextUrl));
                    }

                    // Role Redirects (if visiting generic dashboard root dashboard)
                    if (nextUrl.pathname === '/dashboard') {
                        if (role === 'PRO') return Response.redirect(new URL('/dashboard/pro', nextUrl));
                        if (role === 'ADMIN') return Response.redirect(new URL('/dashboard/admin', nextUrl));
                        // Client goes to generic dashboard
                    }

                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from auth pages if needed
                // For now, let them browse
                return true;
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
