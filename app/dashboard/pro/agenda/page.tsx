import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Clock, User, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function getWeeklySchedule(proProfileId: string) {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weekEnd = addDays(weekStart, 7)

    try {
        const reservations = await prisma.reservation.findMany({
            where: {
                proId: proProfileId,
                startDate: { gte: weekStart, lte: weekEnd },
                status: { in: ['CONFIRMED', 'PENDING'] }
            },
            include: {
                client: { select: { name: true, email: true } }
            },
            orderBy: { startDate: 'asc' }
        })

        return reservations
    } catch {
        return []
    }
}

const statusColors: Record<string, string> = {
    'CONFIRMED': 'bg-green-500/20 text-green-700 border-green-500/30',
    'PENDING': 'bg-gold/20 text-gold border-gold/30',
    'COMPLETED': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'CANCELLED': 'bg-red-500/20 text-red-700 border-red-500/30',
}

const statusLabels: Record<string, string> = {
    'CONFIRMED': 'Confirmé',
    'PENDING': 'En attente',
    'COMPLETED': 'Terminé',
    'CANCELLED': 'Annulé',
}

export default async function AgendaPage() {
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

    const reservations = await getWeeklySchedule(proProfile.id)

    // Group reservations by day
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Agenda</h1>
                    <p className="text-muted-foreground">
                        Semaine du {format(weekStart, 'd MMMM', { locale: fr })}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                {weekDays.map((day) => {
                    const dayReservations = reservations.filter(r =>
                        isSameDay(new Date(r.startDate), day)
                    )
                    const isToday = isSameDay(day, today)

                    return (
                        <Card
                            key={day.toISOString()}
                            className={`
                                border-border/50
                                ${isToday ? 'ring-2 ring-turquoise' : ''}
                            `}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className={`
                                    text-sm font-medium
                                    ${isToday ? 'text-turquoise' : 'text-muted-foreground'}
                                `}>
                                    {format(day, 'EEE d', { locale: fr })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {dayReservations.length === 0 ? (
                                    <p className="text-xs text-muted-foreground/50">
                                        Pas de RDV
                                    </p>
                                ) : (
                                    dayReservations.map((res) => (
                                        <div
                                            key={res.id}
                                            className="p-2 rounded-lg bg-muted/50 space-y-1"
                                        >
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(res.startDate), 'HH:mm')} - {format(new Date(res.endDate), 'HH:mm')}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-medium truncate">
                                                <User className="w-3 h-3" />
                                                {res.client.name || 'Client'}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${statusColors[res.status] || ''}`}
                                            >
                                                {statusLabels[res.status] || res.status}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {reservations.length} rendez-vous cette semaine
                </div>
            </div>
        </div>
    )
}
