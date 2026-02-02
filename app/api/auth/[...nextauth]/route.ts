import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const handler = NextAuth({
    ...authConfig,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Apple({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
        }),
        Credentials({
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if ((account?.provider === "google" || account?.provider === "apple") && user.email) {
                const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "Utilisateur",
                            password: "",
                            role: "CLIENT",
                            image: user.image || null,
                        },
                    });
                } else if (!existingUser.image && user.image) {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { image: user.image },
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                if ((account?.provider === "google" || account?.provider === "apple") && user.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { proProfile: true },
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser.id;
                        token.hasProProfile = !!dbUser.proProfile;
                    }
                } else {
                    token.role = user.role;
                    token.id = user.id;
                    if (user.id) {
                        const proProfile = await prisma.proProfile.findUnique({ where: { userId: user.id } });
                        token.hasProProfile = !!proProfile;
                    }
                }
            } else if (!token.id && token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    include: { proProfile: true },
                });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.hasProProfile = !!dbUser.proProfile;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                if (token.id) {
                    session.user.id = token.id as string;
                } else if (token.sub) {
                    session.user.id = token.sub;
                }
                if (token.role) session.user.role = token.role as string;
                if (typeof token.hasProProfile === "boolean") {
                    session.user.hasProProfile = token.hasProProfile;
                }
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
