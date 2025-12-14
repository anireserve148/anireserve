'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'
import { subMonths, startOfMonth, endOfMonth, format, eachMonthOfInterval, startOfYear } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function getAdminAnalytics() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new AuthorizationError()
    }

    // 1. Revenue Over Time (Last 6 months)
    const endDate = new Date()
    const startDate = subMonths(startOfMonth(endDate), 5) // 6 months total

    const monthlyRevenue = await prisma.reservation.groupBy({
        by: ['createdAt'],
        where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            createdAt: { gte: startDate }
        },
        _sum: {
            totalPrice: true
        }
    })

    // We need to aggregate this manually because Prisma groupBy date is specific
    // For a real app, raw SQL is often better for date truncation, but let's do JS aggregation for simplicity with SQLite/Postgres compatibility
    const reservations = await prisma.reservation.findMany({
        where: {
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
            revenue: revenue,
            commission: revenue * 0.1 // Assuming 10% commission
        }
    })

    // 2. User Growth (Last 6 months)
    const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, role: true }
    })

    const growthData = months.map(month => {
        const monthKey = format(month, 'yyyy-MM')
        const monthLabel = format(month, 'MMM', { locale: fr })

        const newClients = users.filter(u => u.role === 'CLIENT' && format(u.createdAt, 'yyyy-MM') === monthKey).length
        const newPros = users.filter(u => u.role === 'PRO' && format(u.createdAt, 'yyyy-MM') === monthKey).length

        return {
            name: monthLabel,
            Clients: newClients,
            Pros: newPros
        }
    })

    // 3. Reservation Status Distribution (All time or last year)
    const statusStats = await prisma.reservation.groupBy({
        by: ['status'],
        _count: {
            status: true
        }
    })

    const statusData = statusStats.map(stat => ({
        name: stat.status,
        value: stat._count.status
    }))

    return {
        revenueData,
        growthData,
        statusData
    }
}
