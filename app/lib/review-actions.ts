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
