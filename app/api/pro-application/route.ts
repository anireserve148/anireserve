import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            cityIds,
            categoryIds,
            idPhotoUrl,
        } = body;

        // Validation
        if (!firstName || !lastName || !email || !password || !cityIds?.length || !categoryIds?.length) {
            return NextResponse.json(
                { error: 'Tous les champs obligatoires doivent être remplis' },
                { status: 400 }
            );
        }

        // Check if email already exists in users
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Un compte avec cet email existe déjà' },
                { status: 400 }
            );
        }

        // Check if pending application exists
        const existingApplication = await prisma.proApplication.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: 'Une demande avec cet email est déjà en cours de traitement' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create pro application record (matches Prisma schema)
        await prisma.proApplication.create({
            data: {
                firstName,
                lastName,
                email: email.toLowerCase(),
                phone,
                password: hashedPassword, // Stored in application, not user
                cityIds: JSON.stringify(cityIds), // Store as JSON string
                categoryIds: JSON.stringify(categoryIds), // Store as JSON string
                idPhotoUrl: idPhotoUrl || '',
                status: 'PENDING',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Candidature enregistrée avec succès',
        });
    } catch (error) {
        console.error('Pro application error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la soumission de la candidature' },
            { status: 500 }
        );
    }
}
