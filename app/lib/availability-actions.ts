'use server'

import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function getProBusySlots(proId: string, date: Date) {
    const start = startOfDay(date)
    const end = endOfDay(date)

    const reservations = await prisma.reservation.findMany({
        where: {
            proId: proId,
            startDate: {
                gte: start,
                lte: end
            },
            status: {
                in: ['PENDING', 'CONFIRMED'] // Block both pending and confirmed
            }
        },
        select: {
            startDate: true,
            endDate: true
        }
    })

    // Return simpler objects
    return reservations.map(r => ({
        start: r.startDate,
        end: r.endDate
    }))
}
