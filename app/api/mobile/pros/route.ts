import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const category = searchParams.get('category');
        const q = searchParams.get('q');

        // Build filter conditions
        const where: any = {
            user: {
                role: 'PRO',
            },
        };

        if (city) {
            where.cityId = city;
        }

        if (category) {
            where.serviceCategories = {
                some: {
                    id: category,
                },
            };
        }

        if (q) {
            where.OR = [
                { user: { name: { contains: q, mode: 'insensitive' } } },
                { bio: { contains: q, mode: 'insensitive' } },
            ];
        }

        // Fetch pros
        const pros = await prisma.proProfile.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                city: true,
                serviceCategories: true,
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        client: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(pros, { headers: corsHeaders });
    } catch (error) {
        console.error('Mobile pros API error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des professionnels' },
            { status: 500, headers: corsHeaders }
        );
    }
}
