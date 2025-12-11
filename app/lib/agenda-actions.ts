'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateAvailability(availabilityData: any[]) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        throw new Error("Unauthorized")
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) throw new Error("Profile not found")

    // Transaction: Delete existing recurring availability and create new
    // In a real app we might diff, but this is simpler for MVP
    await prisma.$transaction([
        prisma.availability.deleteMany({
            where: {
                proProfileId: proProfile.id,
                date: null // Only delete recurring slots
            }
        }),
        prisma.availability.createMany({
            data: availabilityData.map(slot => ({
                proProfileId: proProfile.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: true
            }))
        })
    ])

    revalidatePath('/dashboard/pro')
}
