import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;

        // Find the pro profile for this user
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: decoded.userId }
        });

        if (!proProfile) {
            return NextResponse.json({ error: 'Profil professionnel non trouvé' }, { status: 404, headers: corsHeaders });
        }

        const reservations = await prisma.reservation.findMany({
            where: { proId: proProfile.id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                        phoneNumber: true
                    },
                },
                service: true
            },
            orderBy: { startDate: 'desc' },
        });

        return NextResponse.json(reservations, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;

        const { reservationId, status } = await request.json();

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { pro: true }
        });

        if (!reservation || reservation.pro.userId !== decoded.userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403, headers: corsHeaders });
        }

        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status }
        });

        return NextResponse.json(updated, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders });
    }
}
