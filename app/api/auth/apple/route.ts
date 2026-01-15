import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const { identityToken, user: appleUserId, email, fullName } = await req.json();

        // For production, you should verify the identity token with Apple
        // For now, we'll trust it (simplified version)

        // Create a unique email if not provided (private relay)
        const userEmail = email || `${appleUserId}@appleid.private`;

        // Check if user already exists
        let dbUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!dbUser) {
            // Create new user
            const userName = fullName
                ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
                : 'Utilisateur Apple';

            dbUser = await prisma.user.create({
                data: {
                    email: userEmail,
                    name: userName || 'Utilisateur',
                    password: crypto.randomBytes(32).toString('hex'), // Random password (not used)
                    role: 'CLIENT'
                }
            });
        }

        // Generate JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
        const token = await new SignJWT({ userId: dbUser.id, email: dbUser.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        return NextResponse.json({
            token,
            user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role
            }
        });
    } catch (error) {
        console.error('Apple auth error:', error);
        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
