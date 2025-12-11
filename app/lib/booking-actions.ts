'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createReservation(proProfileId: string, start: Date, end: Date, total: number) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.reservation.create({
        data: {
            clientId: session.user.id,
            proId: proProfileId,
            startDate: start,
            endDate: end,
            totalPrice: total,
            status: "PENDING"
        }
    })

    redirect('/dashboard')
}
