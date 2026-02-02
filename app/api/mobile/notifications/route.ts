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

// Get notification count for the current user
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
            include: { proProfile: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404, headers: corsHeaders }
            );
        }

        let unreadMessages = 0;
        let pendingBookings = 0;

        if (user.role === 'PRO' && user.proProfile) {
            // For Pro users: count unread messages in conversations where they are the pro
            unreadMessages = await prisma.message.count({
                where: {
                    conversation: {
                        proId: user.proProfile.id,
                    },
                    senderId: { not: user.id },
                    isRead: false,
                },
            });

            // Count pending bookings
            pendingBookings = await prisma.reservation.count({
                where: {
                    proId: user.proProfile.id,
                    status: 'PENDING',
                },
            });
        } else {
            // For Client users: count unread messages in conversations where they are the client
            unreadMessages = await prisma.message.count({
                where: {
                    conversation: {
                        clientId: user.id,
                    },
                    senderId: { not: user.id },
                    isRead: false,
                },
            });

            // Count pending reservations
            pendingBookings = await prisma.reservation.count({
                where: {
                    clientId: user.id,
                    status: 'PENDING',
                },
            });
        }

        const total = unreadMessages + pendingBookings;

        return NextResponse.json({
            total,
            unreadMessages,
            pendingBookings,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des notifications' },
            { status: 500, headers: corsHeaders }
        );
    }
}
