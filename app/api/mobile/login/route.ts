import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sign } from 'jsonwebtoken';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// CORS headers for mobile app
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Email ou mot de passe invalide' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { email, password } = result.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
                image: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401, headers: corsHeaders }
            );
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

        // Return user data (without password) and token
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            token,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Mobile login error:', error);
        return NextResponse.json(
            { error: 'Erreur de connexion' },
            { status: 500, headers: corsHeaders }
        );
    }
}
