import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
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

const appleLoginSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    appleId: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = appleLoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { email, name } = validation.data;

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (user) {
            // Update name if not set
            if (!user.name && name) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { name },
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    password: '', // Empty password for Apple users
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
            getJWTSecret(),
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
        console.error('Apple login error:', error);
        return NextResponse.json(
            { error: 'Erreur de connexion Apple' },
            { status: 500, headers: corsHeaders }
        );
    }
}
