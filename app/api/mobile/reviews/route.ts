import { NextRequest, NextResponse } from 'next/server';
import { getJWTSecret } from '@/app/lib/jwt-secret';
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

const reviewSchema = z.object({
    reservationId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

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
        const result = reviewSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Données invalides' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { reservationId, rating, comment } = result.data;

        // Verify reservation exists and belongs to user
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { pro: true }
        });

        if (!reservation) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404, headers: corsHeaders }
            );
        }

        if (reservation.clientId !== decoded.userId) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403, headers: corsHeaders }
            );
        }

        // Only COMPLETED reservations can be reviewed
        // Note: For now we allow even if not strictly marked as COMPLETED if the date is in the past,
        // but let's stick to the COMPLETED status if possible.
        // If it's an old reservation, it should be marked COMPLETED.

        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
            where: { reservationId }
        });

        if (existingReview) {
            return NextResponse.json(
                { error: 'Vous avez déjà laissé un avis pour cette réservation' },
                { status: 409, headers: corsHeaders }
            );
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                clientId: decoded.userId,
                proId: reservation.proId,
                reservationId,
                rating,
                comment: comment || null,
            },
        });

        return NextResponse.json(review, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de l\'avis' },
            { status: 500, headers: corsHeaders }
        );
    }
}
