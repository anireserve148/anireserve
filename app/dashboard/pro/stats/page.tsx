import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Calendar, Users, Clock, DollarSign, Star, AlertCircle } from 'lucide-react'

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

    if (!session?.user?.id || session.user.role !== 'PRO') {
        redirect('/login')
    }

    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!proProfile) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="p-6">
                    <CardContent>
                        <AlertCircle className="w-12 h-12 text-gold mx-auto mb-4" />
                        <p className="text-center text-muted-foreground">
                            Veuillez d'abord compléter votre profil professionnel.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const stats = await getStats(proProfile.id)

    const statCards = [
        {
            label: 'Total Réservations',
            value: stats.totalReservations.toString(),
            icon: Calendar,
            color: 'text-turquoise',
            bg: 'bg-turquoise/10'
        },
        {
            label: 'Ce mois',
            value: stats.thisMonthReservations.toString(),
            icon: TrendingUp,
            change: `${stats.growthRate}%`,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Complétées',
            value: stats.completedReservations.toString(),
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Annulées',
            value: stats.cancelledReservations.toString(),
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
        {
            label: 'Revenu Total',
            value: `${stats.totalRevenue} ₪`,
            icon: DollarSign,
            color: 'text-gold',
            bg: 'bg-gold/10'
        },
        {
            label: 'Note Moyenne',
            value: stats.averageRating,
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Statistiques</h1>
                <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.change && (
                                <p className="text-xs text-muted-foreground">
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

            {/* Placeholder for charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Réservations par mois</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Graphique bientôt disponible</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenus par mois</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center text-muted-foreground">
                            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Graphique bientôt disponible</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
