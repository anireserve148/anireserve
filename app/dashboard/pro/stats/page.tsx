import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, Star, AlertCircle, ArrowLeft } from 'lucide-react'
import { RevenueChart, ReservationsChart, ServicesChart, HourlyChart } from '@/components/pro/stats-charts'
import { getMonthlyStats, getTopServices, getBusiestHours } from '@/app/lib/stats-actions'
import { ExportCSVButton } from '@/components/pro/export-button'

// Helper function to safely handle database errors
async function getStats(proProfileId: string) {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        const [
            totalReservations,
            thisMonthReservations,
            lastMonthReservations,
            completedReservations,
            cancelledReservations,
            totalRevenue,
            averageRating
        ] = await Promise.all([
            prisma.reservation.count({
                where: { proId: proProfileId }
            }),
            prisma.reservation.count({
                where: {
                    proId: proProfileId,
                    createdAt: { gte: startOfMonth }
                }
            }),
            prisma.reservation.count({
                where: {
                    proId: proProfileId,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
                }
            }),
            prisma.reservation.count({
                where: { proId: proProfileId, status: 'COMPLETED' }
            }),
            prisma.reservation.count({
                where: { proId: proProfileId, status: 'CANCELLED' }
            }),
            prisma.reservation.aggregate({
                where: { proId: proProfileId, status: 'COMPLETED' },
                _sum: { totalPrice: true }
            }),
            prisma.review.aggregate({
                where: { proId: proProfileId },
                _avg: { rating: true }
            })
        ])

        const growthRate = lastMonthReservations > 0
            ? ((thisMonthReservations - lastMonthReservations) / lastMonthReservations * 100).toFixed(1)
            : '0'

        return {
            totalReservations,
            thisMonthReservations,
            growthRate,
            completedReservations,
            cancelledReservations,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
            averageRating: averageRating._avg.rating?.toFixed(1) || 'N/A'
        }
    } catch {
        return {
            totalReservations: 0,
            thisMonthReservations: 0,
            growthRate: '0',
            completedReservations: 0,
            cancelledReservations: 0,
            totalRevenue: 0,
            averageRating: 'N/A'
        }
    }
}

export default async function StatsPage() {
    const session = await auth()

    if (!session?.user?.id || session?.user?.role !== 'PRO') {
        redirect('/login')
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="p-6 bg-[#1A1A2E] border-[#2A2A4A]">
                    <CardContent>
                        <AlertCircle className="w-12 h-12 text-[#F39C12] mx-auto mb-4" />
                        <p className="text-center text-[#A0A0B8]">
                            Veuillez d'abord compléter votre profil professionnel.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Fetch all stats in parallel
    const [stats, monthlyResult, servicesResult, hoursResult] = await Promise.all([
        getStats(proProfile.id),
        getMonthlyStats(),
        getTopServices(),
        getBusiestHours()
    ])

    const monthlyData = monthlyResult.success ? monthlyResult.data : []
    const serviceData = servicesResult.success ? servicesResult.data : []
    const hourlyData = hoursResult.success ? hoursResult.data : []

    const statCards = [
        {
            label: 'Total Réservations',
            value: stats.totalReservations.toString(),
            icon: Calendar,
            color: 'text-[#2EB190]',
            bg: 'bg-[#2EB190]/20'
        },
        {
            label: 'Ce mois',
            value: stats.thisMonthReservations.toString(),
            icon: TrendingUp,
            change: `${stats.growthRate}%`,
            color: 'text-green-500',
            bg: 'bg-green-500/20'
        },
        {
            label: 'Complétées',
            value: stats.completedReservations.toString(),
            icon: Users,
            color: 'text-[#7B68EE]',
            bg: 'bg-[#7B68EE]/20'
        },
        {
            label: 'Annulées',
            value: stats.cancelledReservations.toString(),
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-500/20'
        },
        {
            label: 'Revenu Total',
            value: `${stats.totalRevenue.toLocaleString('fr-FR')} ₪`,
            icon: DollarSign,
            color: 'text-[#F39C12]',
            bg: 'bg-[#F39C12]/20'
        },
        {
            label: 'Note Moyenne',
            value: stats.averageRating,
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/20'
        }
    ]

    return (
        <div className="space-y-8">
            <Link href="/dashboard/pro" className="flex items-center gap-2 text-[#A0A0B8] hover:text-white transition-colors mb-4 group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Retour au tableau de bord
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Statistiques</h1>
                    <p className="text-[#A0A0B8]">Vue d'overview de votre activité (données personnelles uniquement)</p>
                </div>
                <ExportCSVButton />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="bg-[#1A1A2E] border-[#2A2A4A]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#A0A0B8]">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            {stat.change && (
                                <p className="text-xs text-[#6C6C8A]">
                                    <span className={Number(stat.change.replace('%', '')) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                        {Number(stat.change.replace('%', '')) >= 0 ? '↑' : '↓'} {stat.change}
                                    </span>
                                    {' '}vs mois dernier
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
                <RevenueChart data={monthlyData || []} />
                <ReservationsChart data={monthlyData || []} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2">
                <ServicesChart data={serviceData || []} />
                <HourlyChart data={hourlyData || []} />
            </div>
        </div>
    )
}
