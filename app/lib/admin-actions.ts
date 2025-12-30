'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createSuccessResponse, handleActionError, AuthenticationError, AuthorizationError } from '@/lib/errors'

// Ensure user is admin
async function ensureAdmin() {
    const session = await auth()
    if (!session?.user?.id) throw new AuthenticationError()
    if (session.user.role !== 'ADMIN') throw new AuthorizationError()
    return session
}

export async function verifyPro(proId: string) {
    try {
        await ensureAdmin()
        await prisma.proProfile.update({
            where: { id: proId },
            data: { verificationStatus: 'VERIFIED' }
        })
        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function rejectPro(proId: string) {
    try {
        await ensureAdmin()
        await prisma.proProfile.update({
            where: { id: proId },
            data: { verificationStatus: 'REJECTED' }
        })
        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function deleteUser(userId: string) {
    try {
        await ensureAdmin()
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function cancelReservationAdmin(reservationId: string) {
    try {
        await ensureAdmin()
        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: 'CANCELLED' }
        })
        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
export async function updateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    try {
        await ensureAdmin()
        await prisma.review.update({
            where: { id: reviewId },
            data: { status }
        })
        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
export async function updateProLocation(proId: string, latitude: number, longitude: number) {
    try {
        await ensureAdmin()
        await prisma.proProfile.update({
            where: { id: proId },
            data: { latitude, longitude }
        })
        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
export async function toggleWorkCity(proId: string, cityId: string) {
    try {
        await ensureAdmin()
        const pro = await prisma.proProfile.findUnique({
            where: { id: proId },
            include: { workCities: true }
        })
        if (!pro) throw new Error("Pro not found")

        const isWorkingThere = pro.workCities.some(c => c.id === cityId)

        await prisma.proProfile.update({
            where: { id: proId },
            data: {
                workCities: isWorkingThere
                    ? { disconnect: { id: cityId } }
                    : { connect: { id: cityId } }
            }
        })

        revalidatePath('/dashboard/admin')
        return createSuccessResponse(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
