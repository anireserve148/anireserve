'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { updateAvailabilitySchema } from '@/lib/validations'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    NotFoundError,
    type ActionResponse
} from '@/lib/errors'

export async function updateAvailability(
    availabilityData: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): Promise<ActionResponse<void>> {
    try {
        // Validate input
        const validated = updateAvailabilitySchema.parse(availabilityData);

        // Check authentication
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError('Vous devez être un professionnel pour modifier les disponibilités');
        }

        // Get pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!proProfile) {
            throw new NotFoundError('Profil professionnel non trouvé');
        }

        // Transaction: Delete existing recurring availability and create new
        await prisma.$transaction([
            prisma.availability.deleteMany({
                where: {
                    proProfileId: proProfile.id,
                    date: null // Only delete recurring slots
                }
            }),
            prisma.availability.createMany({
                data: validated.map(slot => ({
                    proProfileId: proProfile.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isAvailable: true
                }))
            })
        ]);

        revalidatePath('/dashboard/pro');

        return createSuccessResponse(undefined);
    } catch (error) {
        return handleActionError(error);
    }
}
