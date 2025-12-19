import { NextResponse } from 'next/server';
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

export async function GET() {
    try {
        const cities = await prisma.city.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(cities, { headers: corsHeaders });
    } catch (error) {
        console.error('Get cities error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des villes' },
            { status: 500, headers: corsHeaders }
        );
    }
}
