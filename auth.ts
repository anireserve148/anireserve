import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Credentials({
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        return user;
                    }
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id; // Explicitly save ID to token
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                } else if (token.id) {
                    session.user.id = token.id as string;
                }

                if (token.role) {
                    session.user.role = token.role as string;
                }
            }
            return session;
        },
    },
});
