import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Get user favorites
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

        const favorites = await prisma.favorite.findMany({
            where: { userId: decoded.userId },
            include: {
                pro: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        city: true,
                        serviceCategories: true,
                        reviews: true,
                    },
                },
            },
        });

        const pros = favorites.map(f => f.pro);
        return NextResponse.json(pros, { headers: corsHeaders });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des favoris' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Add to favorites
export async function POST(request: NextRequest) {
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
        const { proId } = body;

        if (!proId) {
            return NextResponse.json(
                { error: 'proId requis' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_proId: {
                    userId: decoded.userId,
                    proId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Déjà dans les favoris' },
                { status: 400, headers: corsHeaders }
            );
        }

        await prisma.favorite.create({
            data: {
                userId: decoded.userId,
                proId,
            },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('Add favorite error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'ajout aux favoris' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Remove from favorites
export async function DELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const proId = searchParams.get('proId');

        if (!proId) {
            return NextResponse.json(
                { error: 'proId requis' },
                { status: 400, headers: corsHeaders }
            );
        }

        await prisma.favorite.deleteMany({
            where: {
                userId: decoded.userId,
                proId,
            },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('Remove favorite error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du favori' },
            { status: 500, headers: corsHeaders }
        );
    }
}
