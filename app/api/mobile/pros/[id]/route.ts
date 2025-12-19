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

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        const pro = await prisma.proProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        phoneNumber: true,
                    },
                },
                city: true,
                serviceCategories: true,
                services: true,
                reviews: {
                    include: {
                        client: {
                            select: {
                                name: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                availability: true,
            },
        });

        if (!pro) {
            return NextResponse.json(
                { error: 'Professionnel non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(pro, { headers: corsHeaders });
    } catch (error) {
        console.error('Mobile pro detail API error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du professionnel' },
            { status: 500, headers: corsHeaders }
        );
    }
}
