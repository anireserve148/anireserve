'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateReservationStatus(reservationId: string, status: 'CONFIRMED' | 'REJECTED') {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        throw new Error("Unauthorized")
    }

    // Verify the reservation belongs to this pro
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { pro: true }
    })

    if (!reservation || reservation.pro.userId !== session.user.id) {
        throw new Error("Reservation not found or unauthorized")
    }

    await prisma.reservation.update({
        where: { id: reservationId },
        data: { status }
    })

    revalidatePath('/dashboard/pro')
}
