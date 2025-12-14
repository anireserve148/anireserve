'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
    handleActionError,
    createSuccessResponse,
    AuthenticationError,
    type ActionResponse
} from '@/lib/errors'

export interface DashboardMetrics {
    revenueWeek: number
    occupancyRate: number
    noShowRate: number
    pendingRequests: number
}

export async function getDashboardMetrics(): Promise<ActionResponse<DashboardMetrics>> {
    try {
        const session = await auth()

        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError("Accès réservé aux professionnels")
        }

        // Get pro profile
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!proProfile) {
            throw new Error("Profil professionnel non trouvé")
        }

        // Date calculations
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // 1. Revenue Week - Sum of confirmed/completed reservations in last 7 days
        const weekReservations = await prisma.reservation.findMany({
            where: {
                proId: proProfile.id,
                createdAt: { gte: weekAgo },
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            select: { totalPrice: true }
        })
        const revenueWeek = weekReservations.reduce((sum, r) => sum + r.totalPrice, 0)

        // 2. Occupancy Rate - Reservations vs available slots
        const totalReservations = await prisma.reservation.count({
            where: {
                proId: proProfile.id,
                startDate: { gte: weekAgo },
                status: { in: ['CONFIRMED', 'COMPLETED', 'PENDING'] }
            }
        })

        const availableSlots = await prisma.availability.count({
            where: { proProfileId: proProfile.id }
        })

        // Calculate occupancy (reservations / (available slots * 7 days))
        const totalPossibleSlots = availableSlots * 7 // 7 days
        const occupancyRate = totalPossibleSlots > 0 ? totalReservations / totalPossibleSlots : 0

        // 3. No-Show Rate - Cancelled/no-show vs total
        const totalCompletedOrCancelled = await prisma.reservation.count({
            where: {
                proId: proProfile.id,
                status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] }
            }
        })

        const noShows = await prisma.reservation.count({
            where: {
                proId: proProfile.id,
                status: 'NO_SHOW'
            }
        })

        const noShowRate = totalCompletedOrCancelled > 0 ? noShows / totalCompletedOrCancelled : 0

        // 4. Pending Requests - Count of PENDING reservations
        const pendingRequests = await prisma.reservation.count({
            where: {
                proId: proProfile.id,
                status: 'PENDING'
            }
        })

        const metrics: DashboardMetrics = {
            revenueWeek,
            occupancyRate,
            noShowRate,
            pendingRequests
        }

        return createSuccessResponse(metrics)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function getUpcomingSchedule() {
    try {
        const session = await auth()

        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError("Accès réservé aux professionnels")
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!proProfile) {
            throw new Error("Profil professionnel non trouvé")
        }

        const now = new Date()
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const schedule = await prisma.reservation.findMany({
            where: {
                proId: proProfile.id,
                startDate: {
                    gte: now,
                    lte: weekFromNow
                },
                status: { in: ['CONFIRMED', 'PENDING'] }
            },
            include: {
                client: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { startDate: 'asc' },
            take: 10
        })

        return createSuccessResponse(schedule)
    } catch (error) {
        return handleActionError(error)
    }
}

export async function getPendingRequests() {
    try {
        const session = await auth()

        if (!session?.user?.id || session.user.role !== 'PRO') {
            throw new AuthenticationError("Accès réservé aux professionnels")
        }

        const proProfile = await prisma.proProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!proProfile) {
            throw new Error("Profil professionnel non trouvé")
        }

        const requests = await prisma.reservation.findMany({
            where: {
                proId: proProfile.id,
                status: 'PENDING'
            },
            include: {
                client: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        return createSuccessResponse(requests)
    } catch (error) {
        return handleActionError(error)
    }
}
