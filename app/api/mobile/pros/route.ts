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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

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

        // Optimized query - only fetch what's needed for the list
        const pros = await prisma.proProfile.findMany({
            where,
            take: limit,
            skip,
            select: {
                id: true,
                bio: true,
                hourlyRate: true,
                instantBooking: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                city: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                serviceCategories: {
                    select: {
                        id: true,
                        name: true,
                    },
                    take: 3, // Only first 3 categories for preview
                },
                services: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                    take: 3, // Only first 3 services for preview
                },
                gallery: {
                    select: {
                        id: true,
                        url: true,
                    },
                    orderBy: { order: 'asc' },
                    take: 1, // Only first image for card preview
                },
                _count: {
                    select: {
                        reviews: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate average ratings in a separate optimized query
        const prosWithRatings = await Promise.all(
            pros.map(async (pro) => {
                const avgRating = await prisma.review.aggregate({
                    where: { proProfileId: pro.id },
                    _avg: { rating: true },
                });
                return {
                    ...pro,
                    rating: avgRating._avg.rating || 0,
                    reviewCount: pro._count.reviews,
                };
            })
        );

        return NextResponse.json(prosWithRatings, { headers: corsHeaders });
    } catch (error) {
        console.error('Mobile pros API error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des professionnels' },
            { status: 500, headers: corsHeaders }
        );
    }
}
