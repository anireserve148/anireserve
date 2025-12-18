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

const createBlockedPeriodSchema = z.object({
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    reason: z.string().max(100).optional(),
})

// Get all blocked periods for the current pro
export async function getBlockedPeriods(): Promise<ActionResponse<{ id: string; startDate: Date; endDate: Date; reason: string | null }[]>> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            throw new AuthenticationError()
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                blockedPeriods: {
                    orderBy: { startDate: 'asc' }
                }
            }
        })

        if (!proProfile) {
            throw new NotFoundError('Profil professionnel non trouvé')
        }

        return createSuccessResponse(proProfile.blockedPeriods)
    } catch (error) {
        return handleActionError(error)
    }
}

// Create a new blocked period
export async function createBlockedPeriod(
    data: { startDate: string | Date; endDate: string | Date; reason?: string }
): Promise<ActionResponse<void>> {
    try {
        const validated = createBlockedPeriodSchema.parse(data)

        const session = await auth()
        if (!session?.user?.id) {
            throw new AuthenticationError()
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!proProfile) {
            throw new NotFoundError('Profil professionnel non trouvé')
        }

        const startDate = new Date(validated.startDate)
        const endDate = new Date(validated.endDate)

        // Validate dates
        if (endDate < startDate) {
            throw new Error('La date de fin doit être après la date de début')
        }

        // Check for overlapping blocked periods
        const overlapping = await prisma.blockedPeriod.findFirst({
            where: {
                proProfileId: proProfile.id,
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate }
                    }
                ]
            }
        })

        if (overlapping) {
            throw new Error('Cette période chevauche une période déjà bloquée')
        }

        // Check for existing reservations in this period
        const existingReservations = await prisma.reservation.findFirst({
            where: {
                proId: proProfile.id,
                status: { in: ['PENDING', 'CONFIRMED'] },
                startDate: { lte: endDate },
                endDate: { gte: startDate }
            }
        })

        if (existingReservations) {
            throw new Error('Vous avez des réservations confirmées pendant cette période. Veuillez les annuler d\'abord.')
        }

        await prisma.blockedPeriod.create({
            data: {
                proProfileId: proProfile.id,
                startDate,
                endDate,
                reason: validated.reason || null
            }
        })

        revalidatePath('/dashboard/pro')
        revalidatePath('/dashboard/pro/availability')

        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

// Delete a blocked period
export async function deleteBlockedPeriod(
    blockedPeriodId: string
): Promise<ActionResponse<void>> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            throw new AuthenticationError()
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!proProfile) {
            throw new NotFoundError('Profil professionnel non trouvé')
        }

        // Verify ownership
        const blockedPeriod = await prisma.blockedPeriod.findUnique({
            where: { id: blockedPeriodId }
        })

        if (!blockedPeriod || blockedPeriod.proProfileId !== proProfile.id) {
            throw new AuthorizationError('Vous ne pouvez pas supprimer cette période')
        }

        await prisma.blockedPeriod.delete({
            where: { id: blockedPeriodId }
        })

        revalidatePath('/dashboard/pro')
        revalidatePath('/dashboard/pro/availability')

        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

// Check if a date range is blocked (for booking widget)
export async function isDateRangeBlocked(
    proProfileId: string,
    startDate: Date,
    endDate: Date
): Promise<boolean> {
    const blocked = await prisma.blockedPeriod.findFirst({
        where: {
            proProfileId,
            startDate: { lte: endDate },
            endDate: { gte: startDate }
        }
    })

    return !!blocked
}
