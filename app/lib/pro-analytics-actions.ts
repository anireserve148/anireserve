'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AuthorizationError } from '@/lib/errors'
import { format, subMonths, startOfMonth, eachMonthOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function getProAnalytics() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        throw new AuthorizationError()
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) throw new Error('Profil pro introuvable')

    // 1. Revenue Last 6 Months
    const endDate = new Date()
    const startDate = subMonths(startOfMonth(endDate), 5)

    const reservations = await prisma.reservation.findMany({
        where: {
            proId: proProfile.id,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            createdAt: { gte: startDate }
        },
        select: {
            createdAt: true,
            totalPrice: true
        }
    })

    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    const revenueData = months.map(month => {
        const monthKey = format(month, 'yyyy-MM')
        const monthLabel = format(month, 'MMM', { locale: fr })

        const revenue = reservations
            .filter(r => format(r.createdAt, 'yyyy-MM') === monthKey)
            .reduce((acc, curr) => acc + curr.totalPrice, 0)

        return {
            name: monthLabel,
            revenue: revenue
        }
    })

    // 2. Client CRM Data
    // Fetch all completed/confirmed reservations to aggregate clients
    const allReservations = await prisma.reservation.findMany({
        where: {
            proId: proProfile.id,
            status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Aggregate by Client
    const clientMap = new Map()

    allReservations.forEach(res => {
        if (!clientMap.has(res.client.id)) {
            clientMap.set(res.client.id, {
                client: res.client,
                totalSpend: 0,
                bookingsCount: 0,
                lastBooking: res.createdAt
            })
        }
        const data = clientMap.get(res.client.id)
        data.totalSpend += res.totalPrice
        data.bookingsCount += 1
        // Since sorted by desc, the first encounter is the last booking
    })

    const clients = Array.from(clientMap.values())

    return {
        revenueData,
        clients
    }
}
