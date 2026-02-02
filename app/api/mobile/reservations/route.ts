import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';
import { sendPushNotification } from '@/lib/push-notifications';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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
        const decoded = verify(token, getJWTSecret()) as any;

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
                review: true,
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
        const decoded = verify(token, getJWTSecret()) as any;

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

        // Check for overlapping reservations (same logic as web)
        const overlapping = await prisma.reservation.findFirst({
            where: {
                proId,
                status: { in: ['CONFIRMED', 'PENDING'] },
                startDate: { lt: new Date(endDate) },
                endDate: { gt: new Date(startDate) },
            },
        });

        if (overlapping) {
            return NextResponse.json(
                { error: 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.' },
                { status: 409, headers: corsHeaders }
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

        // 🔔 Send push notification to PRO
        try {
            const client = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { name: true },
            });

            const formattedDate = new Date(startDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            });

            await sendPushNotification(
                pro.userId,
                '🎉 Nouvelle réservation !',
                `${client?.name || 'Un client'} a réservé pour le ${formattedDate}`
            );
        } catch (notifError) {
            console.error('Failed to send push notification:', notifError);
            // Don't fail the reservation if notification fails
        }

        return NextResponse.json(reservation, { headers: corsHeaders });
    } catch (error) {
        console.error('Create reservation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la réservation' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Cancel a reservation
export async function PATCH(request: NextRequest) {
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
        const { reservationId, status } = body;

        if (!reservationId) {
            return NextResponse.json(
                { error: 'ID de réservation requis' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Find reservation
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
        });

        if (!reservation) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Check ownership
        if (reservation.clientId !== decoded.userId) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403, headers: corsHeaders }
            );
        }

        // Only PENDING reservations can be cancelled
        if (status === 'CANCELLED' && reservation.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Seules les réservations en attente peuvent être annulées' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Update reservation
        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status },
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

        return NextResponse.json(updated, { headers: corsHeaders });
    } catch (error) {
        console.error('Update reservation error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500, headers: corsHeaders }
        );
    }
}
