import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { startOfWeek, addDays } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { InteractiveAgenda } from '@/components/pro/interactive-agenda'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

async function getInitialReservations(proProfileId: string) {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    // Get 4 weeks of data for navigation
    const rangeEnd = addDays(weekStart, 28)

    try {
        const reservations = await prisma.reservation.findMany({
            where: {
                proId: proProfileId,
                startDate: { gte: weekStart, lte: rangeEnd },
                status: { in: ['CONFIRMED', 'PENDING', 'COMPLETED'] }
            },
            include: {
                client: { select: { name: true, email: true } },
                service: { select: { name: true } }
            },
            orderBy: { startDate: 'asc' }
        })

        return reservations.map(r => ({
            id: r.id,
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
            status: r.status,
            totalPrice: r.totalPrice,
            client: {
                name: r.client.name || 'Client',
                email: r.client.email
            },
            service: r.service ? { name: r.service.name } : undefined
        }))
    } catch {
        return []
    }
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

    const initialReservations = await getInitialReservations(proProfile.id)

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link href="/dashboard/pro">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au tableau de bord
                </Button>
            </Link>

            <InteractiveAgenda
                initialReservations={initialReservations}
                proProfileId={proProfile.id}
            />
        </div>
    )
}
