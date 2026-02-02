// TEMPORAIREMENT DÉSACTIVÉ - next-auth incompatible avec Edge Runtime dans Next.js 15
// TODO: Migrer vers next-auth v5 (Auth.js) ou utiliser une solution alternative

// import NextAuth from 'next-auth';
// import { authConfig } from './auth.config';

// export default NextAuth(authConfig).auth;

export default function middleware() {
    // Middleware désactivé temporairement
    return;
}

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
