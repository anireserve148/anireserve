import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET Pro Profile
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, getJWTSecret()) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                proProfile: {
                    include: {
                        city: true,
                        serviceCategories: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            image: user.image,
            proProfile: user.proProfile ? {
                id: user.proProfile.id,
                bio: user.proProfile.bio,
                hourlyRate: user.proProfile.hourlyRate,
                city: user.proProfile.city,
                serviceCategories: user.proProfile.serviceCategories,
            } : null
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Get pro profile error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du profil' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// UPDATE Pro Profile
export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, getJWTSecret()) as any;

        const body = await request.json();
        const { name, phoneNumber, bio, hourlyRate } = body;

        // Update user info
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                name: name || undefined,
                phoneNumber: phoneNumber || undefined,
            }
        });

        // Update pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: decoded.userId }
        });

        if (proProfile) {
            await prisma.proProfile.update({
                where: { id: proProfile.id },
                data: {
                    bio: bio !== undefined ? bio : undefined,
                    hourlyRate: hourlyRate !== undefined ? hourlyRate : undefined,
                }
            });
        }

        // Return updated profile
        const updatedUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                proProfile: {
                    include: {
                        city: true,
                        serviceCategories: true,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser?.id,
                name: updatedUser?.name,
                email: updatedUser?.email,
                phoneNumber: updatedUser?.phoneNumber,
                proProfile: updatedUser?.proProfile
            }
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Update pro profile error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du profil' },
            { status: 500, headers: corsHeaders }
        );
    }
}
