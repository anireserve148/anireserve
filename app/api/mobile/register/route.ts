import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sign } from 'jsonwebtoken';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { name, email, password } = result.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Cet email est déjà utilisé' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CLIENT',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                phoneNumber: true,
            },
        });

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

        return NextResponse.json({ user, token }, { headers: corsHeaders });
    } catch (error) {
        console.error('Mobile register error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500, headers: corsHeaders }
        );
    }
}
