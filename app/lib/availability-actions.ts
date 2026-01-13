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

interface Break {
    start: string
    end: string
}

interface AvailabilitySlot {
    id?: string
    dayOfWeek: number
    isAvailable: boolean
    startTime: string
    endTime: string
    breaks?: Break[]
}

export async function updateAvailability(proProfileId: string, slots: AvailabilitySlot[]) {
    try {
        // Delete existing availability for this profile
        await prisma.availability.deleteMany({
            where: { proProfileId }
        })

        // Create new availability slots
        const availabilityData = slots.map(slot => ({
            proProfileId,
            dayOfWeek: slot.dayOfWeek,
            isAvailable: slot.isAvailable,
            startTime: slot.startTime,
            endTime: slot.endTime,
            // Serialize breaks as JSON string
            breaks: slot.breaks && slot.breaks.length > 0 ? JSON.stringify(slot.breaks) : null
        }))

        await prisma.availability.createMany({
            data: availabilityData
        })

        return { success: true }
    } catch (error) {
        console.error("Error updating availability:", error)
        return { success: false, error: "Erreur lors de la mise à jour" }
    }
}
