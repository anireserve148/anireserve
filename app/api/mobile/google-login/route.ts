import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

const googleLoginSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    image: z.string().optional(),
    googleId: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = googleLoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { email, name, image, googleId } = validation.data;

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (user) {
            // Update existing user with Google ID if not set
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId,
                        image: image || user.image,
                    },
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    image,
                    googleId,
                    role: 'CLIENT',
                },
            });
        }

        // Generate JWT token
        const token = sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.NEXTAUTH_SECRET || 'fallback-secret',
            { expiresIn: '30d' }
        );

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                },
                token,
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error('Google login error:', error);
        return NextResponse.json(
            { error: 'Erreur de connexion Google' },
            { status: 500, headers: corsHeaders }
        );
    }
}
