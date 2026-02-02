import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
import { verify } from 'jsonwebtoken';
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

// Get list of clients who have made reservations with this pro
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

        // Get the pro profile for this user
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: decoded.userId },
        });

        if (!proProfile) {
            return NextResponse.json(
                { error: 'Profil pro non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Get all reservations for this pro, grouped by client
        const reservations = await prisma.reservation.findMany({
            where: { proId: proProfile.id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by client and calculate stats
        const clientsMap = new Map<string, {
            id: string;
            name: string;
            email: string;
            image: string | null;
            phoneNumber: string | null;
            totalBookings: number;
            totalSpent: number;
            lastVisit: Date;
        }>();

        for (const res of reservations) {
            if (!res.client) continue;

            const existing = clientsMap.get(res.client.id);
            if (existing) {
                existing.totalBookings += 1;
                existing.totalSpent += res.totalPrice;
                if (res.createdAt > existing.lastVisit) {
                    existing.lastVisit = res.createdAt;
                }
            } else {
                clientsMap.set(res.client.id, {
                    id: res.client.id,
                    name: res.client.name || 'Client',
                    email: res.client.email,
                    image: res.client.image,
                    phoneNumber: res.client.phoneNumber,
                    totalBookings: 1,
                    totalSpent: res.totalPrice,
                    lastVisit: res.createdAt,
                });
            }
        }

        const clients = Array.from(clientsMap.values())
            .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());

        return NextResponse.json(clients, { headers: corsHeaders });
    } catch (error) {
        console.error('Get clients error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des clients' },
            { status: 500, headers: corsHeaders }
        );
    }
}
