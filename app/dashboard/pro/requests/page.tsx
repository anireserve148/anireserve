import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, User, Check, X, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RequestsListClient } from '@/components/dashboard/RequestsListClient'

async function getPendingRequests(proProfileId: string) {
    try {
        const requests = await prisma.reservation.findMany({
            where: {
                proId: proProfileId,
                status: 'PENDING'
            },
            include: {
                client: { select: { name: true, email: true, image: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return requests
    } catch {
        return []
    }
}

export default async function RequestsPage() {
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

    const requests = await getPendingRequests(proProfile.id)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Demandes en attente</h1>
                <p className="text-muted-foreground">
                    {requests.length} demande{requests.length !== 1 ? 's' : ''} en attente de validation
                </p>
            </div>

            {requests.length === 0 ? (
                <Card className="border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Check className="w-12 h-12 text-turquoise mb-4" />
                        <p className="text-lg font-medium">Aucune demande en attente</p>
                        <p className="text-sm text-muted-foreground">
                            Toutes les demandes ont été traitées
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <Card key={request.id} className="border-border/50">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-turquoise/20 flex items-center justify-center shrink-0">
                                            <User className="w-6 h-6 text-turquoise" />
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1">
                                            <p className="font-semibold">
                                                {request.client.name || 'Client'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {request.client.email}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {format(new Date(request.startDate), 'EEEE d MMMM à HH:mm', { locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-turquoise">
                                                {request.totalPrice} ₪
                                            </p>
                                            {request.notes && (
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Note: {request.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <RequestsListClient
                                        requests={[{
                                            id: request.id,
                                            startDate: request.startDate,
                                            endDate: request.endDate,
                                            totalPrice: request.totalPrice,
                                            client: {
                                                name: request.client.name,
                                                email: request.client.email
                                            }
                                        }]}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
