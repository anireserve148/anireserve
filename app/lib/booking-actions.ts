'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createReservationSchema } from '@/lib/validations'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    type ActionResponse
} from '@/lib/errors'

export async function createReservation(data: {
    proId: string,
    startDate: Date,
    endDate: Date,
    totalPrice: number
}): Promise<ActionResponse<void>> {
    try {
        // Validate input
        const validated = createReservationSchema.parse({
            proId: data.proId,
            startDate: data.startDate,
            endDate: data.endDate
        });

        // Check authentication
        // Check authentication
        const session = await auth();
        if (!session?.user?.id) {
            throw new AuthenticationError('Vous devez être connecté pour réserver');
        }

        // Verify user exists in DB (handle stale sessions)
        const client = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!client) {
            throw new AuthenticationError('Session invalide. Veuillez vous reconnecter.');
        }

        // Create reservation
        await prisma.reservation.create({
            data: {
                clientId: session.user.id,
                proId: validated.proId,
                startDate: validated.startDate,
                endDate: validated.endDate,
                totalPrice: data.totalPrice,
                status: 'PENDING',
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
