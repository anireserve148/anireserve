"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Get monthly stats for charts
export async function getMonthlyStats() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: "Non autorisé" }
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return { success: false, error: "Profil non trouvé" }
    }

    try {
        // Get last 6 months of data
        const now = new Date()
        const months = []

        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

            const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short' })

            const [reservationCount, revenueSum] = await Promise.all([
                prisma.reservation.count({
                    where: {
                        proId: proProfile.id,
                        createdAt: { gte: monthStart, lte: monthEnd }
                    }
                }),
                prisma.reservation.aggregate({
                    where: {
                        proId: proProfile.id,
                        status: 'COMPLETED',
                        createdAt: { gte: monthStart, lte: monthEnd }
                    },
                    _sum: { totalPrice: true }
                })
            ])

            months.push({
                month: monthName,
                reservations: reservationCount,
                revenue: revenueSum._sum.totalPrice || 0
            })
        }

        return { success: true, data: months }
    } catch (error) {
        console.error("Error fetching monthly stats:", error)
        return { success: false, error: "Erreur serveur" }
    }
}

// Get top services
export async function getTopServices() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: "Non autorisé" }
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return { success: false, error: "Profil non trouvé" }
    }

    try {
        const services = await prisma.reservation.groupBy({
            by: ['serviceId'],
            where: {
                proId: proProfile.id,
                serviceId: { not: null }
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        })

        // Get service names
        const serviceIds = services.map(s => s.serviceId).filter(Boolean) as string[]
        const serviceDetails = await prisma.proService.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, name: true }
        })

        const serviceMap = new Map(serviceDetails.map(s => [s.id, s.name]))

        const data = services.map(s => ({
            name: serviceMap.get(s.serviceId || '') || 'Service inconnu',
            count: s._count.id
        }))

        return { success: true, data }
    } catch (error) {
        console.error("Error fetching top services:", error)
        return { success: false, error: "Erreur serveur" }
    }
}

// Get busiest hours
export async function getBusiestHours() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: "Non autorisé" }
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return { success: false, error: "Profil non trouvé" }
    }

    try {
        const reservations = await prisma.reservation.findMany({
            where: { proId: proProfile.id },
            select: { time: true }
        })

        // Count by hour
        const hourCounts: { [key: string]: number } = {}
        reservations.forEach(r => {
            const hour = r.time.split(':')[0] + ':00'
            hourCounts[hour] = (hourCounts[hour] || 0) + 1
        })

        // Convert to sorted array and take top 5
        const data = Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return { success: true, data }
    } catch (error) {
        console.error("Error fetching busiest hours:", error)
        return { success: false, error: "Erreur serveur" }
    }
}

// Export all reservations as CSV-friendly data
export async function exportReservationsCSV() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'PRO') {
        return { success: false, error: "Non autorisé" }
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return { success: false, error: "Profil non trouvé" }
    }

    try {
        const reservations = await prisma.reservation.findMany({
            where: { proId: proProfile.id },
            include: {
                client: { select: { name: true, email: true } },
                service: { select: { name: true } }
            },
            orderBy: { startDate: 'desc' }
        })

        // Prepare CSV lines
        const headers = ["ID", "Client", "Email", "Service", "Date", "Heure", "Prix (₪)", "Statut"]
        const rows = reservations.map(r => [
            r.id,
            r.client?.name || "Inconnu",
            r.client?.email || "",
            r.service?.name || r.serviceName || "Service",
            new Date(r.startDate).toLocaleDateString('fr-FR'),
            r.time || "",
            r.totalPrice.toString(),
            r.status
        ])

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")

        return { success: true, data: csvContent }
    } catch (error) {
        console.error("Error exporting CSV:", error)
        return { success: false, error: "Erreur serveur" }
    }
}
