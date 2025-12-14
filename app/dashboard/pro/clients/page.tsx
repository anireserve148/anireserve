import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User, Mail, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function getClients(proProfileId: string) {
    try {
        // Get unique clients who have made reservations with this pro
        const reservations = await prisma.reservation.findMany({
            where: { proId: proProfileId },
            include: {
                client: { select: { id: true, name: true, email: true, image: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Group by client and calculate stats
        const clientMap = new Map<string, {
            id: string
            name: string
            email: string
            image: string | null
            totalReservations: number
            totalSpent: number
            lastVisit: Date
        }>()

        reservations.forEach(res => {
            const existing = clientMap.get(res.client.id)
            if (existing) {
                existing.totalReservations++
                existing.totalSpent += res.totalPrice || 0
                if (res.createdAt > existing.lastVisit) {
                    existing.lastVisit = res.createdAt
                }
            } else {
                clientMap.set(res.client.id, {
                    id: res.client.id,
                    name: res.client.name || 'Client',
                    email: res.client.email || '',
                    image: res.client.image,
                    totalReservations: 1,
                    totalSpent: res.totalPrice || 0,
                    lastVisit: res.createdAt
                })
            }
        })

        return Array.from(clientMap.values()).sort((a, b) =>
            b.totalReservations - a.totalReservations
        )
    } catch {
        return []
    }
}

export default async function ClientsPage() {
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

    const clients = await getClients(proProfile.id)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Mes Clients</h1>
                <p className="text-muted-foreground">
                    {clients.length} client{clients.length !== 1 ? 's' : ''} au total
                </p>
            </div>

            {clients.length === 0 ? (
                <Card className="border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <User className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium">Aucun client encore</p>
                        <p className="text-sm text-muted-foreground">
                            Vos clients apparaîtront ici après leur première réservation
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Card key={client.id} className="border-border/50 hover:border-turquoise/50 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-turquoise/20 flex items-center justify-center shrink-0">
                                        <span className="text-turquoise font-semibold">
                                            {client.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <p className="font-semibold truncate">{client.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{client.email}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {client.totalReservations} RDV
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs bg-turquoise/10 text-turquoise">
                                                <DollarSign className="w-3 h-3 mr-1" />
                                                {client.totalSpent} ₪
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-muted-foreground pt-1">
                                            Dernière visite: {format(client.lastVisit, 'd MMM yyyy', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
