'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { updateReservationStatusSchema } from '@/lib/validations'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    type ActionResponse
} from '@/lib/errors'

export async function updateReservationStatus(
    reservationId: string,
    status: 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
): Promise<ActionResponse<void>> {
    try {
        // Validate input
        const validated = updateReservationStatusSchema.parse({ reservationId, status });

        // Check authentication
        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError('Vous devez être connecté pour effectuer cette action');
        }

        // Verify the reservation exists and get pro info
        const reservation = await prisma.reservation.findUnique({
            where: { id: validated.reservationId },
            include: {
                pro: true,
                client: true
            }
        });

        if (!reservation) {
            throw new NotFoundError('Réservation non trouvée');
        }

        // Authorization check: Only the pro can confirm/reject, only client can cancel
        if (status === 'CANCELLED') {
            if (reservation.clientId !== session.user.id) {
                throw new AuthorizationError('Seul le client peut annuler cette réservation');
            }
        } else {
            // For CONFIRMED or REJECTED
            if (session.user.role !== 'PRO' || reservation.pro.userId !== session.user.id) {
                throw new AuthorizationError('Seul le professionnel concerné peut modifier le statut de cette réservation');
            }
        }

        // Update reservation status
        await prisma.reservation.update({
            where: { id: validated.reservationId },
            data: { status: validated.status }
        });

        // Revalidate relevant paths
        revalidatePath('/dashboard/pro');
        revalidatePath('/dashboard');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
