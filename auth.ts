import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
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
        // Google OAuth Provider
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        // Apple OAuth Provider
        Apple({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
        }),
        // Email/Password Provider
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
        async signIn({ user, account, profile }) {
            // For Google or Apple sign-in, create or update user in database
            if ((account?.provider === 'google' || account?.provider === 'apple') && user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (!existingUser) {
                    // Create new user with OAuth account
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || 'Utilisateur',
                            password: '', // No password for OAuth users
                            role: 'CLIENT',
                            image: user.image || null,
                        }
                    });
                } else {
                    // Update existing user's image if they didn't have one
                    if (!existingUser.image && user.image) {
                        await prisma.user.update({
                            where: { email: user.email },
                            data: { image: user.image }
                        });
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                // For OAuth, fetch the user from DB to get role
                if ((account?.provider === 'google' || account?.provider === 'apple') && user.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser.id;
                    }
                } else {
                    token.role = user.role;
                    token.id = user.id;
                }
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
