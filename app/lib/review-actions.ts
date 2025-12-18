'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    type ActionResponse
} from '@/lib/errors'

const createReviewSchema = z.object({
    reservationId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
})

export async function createReview(
    data: { reservationId: string; rating: number; comment?: string }
): Promise<ActionResponse<void>> {
    try {
        const validated = createReviewSchema.parse(data);

        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError();
        }

        // 1. Verify reservation exists, belongs to user, and is COMPLETED
        const reservation = await prisma.reservation.findUnique({
            where: { id: validated.reservationId },
            include: { review: true }
        });

        if (!reservation) {
            throw new NotFoundError('Réservation non trouvée');
        }

        if (reservation.clientId !== session.user.id) {
            throw new AuthorizationError('Vous ne pouvez noter que vos propres réservations');
        }

        // Only allow reviews for COMPLETED reservations (verified purchase)
        if (reservation.status !== 'COMPLETED') {
            throw new Error('Vous ne pouvez laisser un avis que pour une réservation terminée');
        }

        // Check if already reviewed
        if (reservation.review) {
            throw new Error('Vous avez déjà donné votre avis sur cette réservation');
        }

        // 2. Create Review
        await prisma.review.create({
            data: {
                rating: validated.rating,
                comment: validated.comment,
                reservationId: validated.reservationId,
                clientId: session.user.id,
                proId: reservation.proId
            }
        });

        revalidatePath(`/pros/${reservation.proId}`);
        revalidatePath('/dashboard');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}

const addReviewResponseSchema = z.object({
    reviewId: z.string(),
    proResponse: z.string().min(1).max(500),
})

export async function addReviewResponse(
    data: { reviewId: string; proResponse: string }
): Promise<ActionResponse<void>> {
    try {
        const validated = addReviewResponseSchema.parse(data);

        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError();
        }

        // 1. Verify review exists and belongs to this pro
        const review = await prisma.review.findUnique({
            where: { id: validated.reviewId },
            include: { pro: { include: { user: true } } }
        });

        if (!review) {
            throw new NotFoundError('Avis non trouvé');
        }

        // Verify this is the pro's own review
        if (review.pro.userId !== session.user.id) {
            throw new AuthorizationError('Vous ne pouvez répondre qu\'aux avis sur votre profil');
        }

        // Check if already responded
        if (review.proResponse) {
            throw new Error('Vous avez déjà répondu à cet avis');
        }

        // 2. Add response to review
        await prisma.review.update({
            where: { id: validated.reviewId },
            data: {
                proResponse: validated.proResponse,
                respondedAt: new Date()
            }
        });

        revalidatePath(`/pros/${review.proId}`);
        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
