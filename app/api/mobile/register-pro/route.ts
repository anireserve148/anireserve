import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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

const registerProSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string().min(9),
    cityId: z.string(),
    categoryId: z.string(),
    bio: z.string().optional(),
    hourlyRate: z.number().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerProSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validation.error.errors },
                { status: 400, headers: corsHeaders }
            );
        }

        const { name, email, password, phoneNumber, cityId, categoryId, bio, hourlyRate } = validation.data;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Cet email est déjà utilisé' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if city exists
        const city = await prisma.city.findUnique({
            where: { id: cityId },
        });

        if (!city) {
            return NextResponse.json(
                { error: 'Ville non trouvée' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if category exists
        const category = await prisma.serviceCategory.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Catégorie non trouvée' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with PRO role (pending approval)
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                phoneNumber,
                role: 'PRO',
            },
        });

        // Create pro profile (status: PENDING)
        await prisma.proProfile.create({
            data: {
                userId: user.id,
                cityId,
                bio: bio || '',
                hourlyRate: hourlyRate || 100,
                status: 'PENDING',
                serviceCategories: {
                    connect: [{ id: categoryId }],
                },
            },
        });

        return NextResponse.json(
            {
                message: 'Inscription enregistrée ! Un administrateur validera votre compte sous 24-48h.',
                success: true,
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error('Register pro error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500, headers: corsHeaders }
        );
    }
}
