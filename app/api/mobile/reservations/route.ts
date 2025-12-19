import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

const reservationSchema = z.object({
    proId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    totalPrice: z.number().default(0),
});

// Get user reservations
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
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;

        const reservations = await prisma.reservation.findMany({
            where: {
                clientId: decoded.userId,
            },
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
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(reservations, { headers: corsHeaders });
    } catch (error) {
        console.error('Get reservations error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des réservations' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Create reservation
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
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;

        const body = await request.json();
        const result = reservationSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { proId, startDate, endDate, totalPrice } = result.data;

        // Verify pro exists
        const pro = await prisma.proProfile.findUnique({
            where: { id: proId },
        });

        if (!pro) {
            return NextResponse.json(
                { error: 'Professionnel non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Create reservation
        const reservation = await prisma.reservation.create({
            data: {
                clientId: decoded.userId,
                proId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                totalPrice,
                status: 'PENDING',
            },
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
                    },
                },
            },
        });

        return NextResponse.json(reservation, { headers: corsHeaders });
    } catch (error) {
        console.error('Create reservation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la réservation' },
            { status: 500, headers: corsHeaders }
        );
    }
}
