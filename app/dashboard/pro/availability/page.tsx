import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Check, X, AlertCircle, Calendar } from 'lucide-react'
import { BlockedPeriodsManager } from '@/components/pro/blocked-periods-manager'
import { AvailabilityEditor } from '@/components/pro/availability-editor'

const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

async function getAvailability(userId: string) {
    try {
        const proProfile = await prisma.proProfile.findUnique({
            where: { userId },
            include: { availability: true }
        })
        return {
            proProfileId: proProfile?.id || '',
            availability: proProfile?.availability || []
        }
    } catch {
        return { proProfileId: '', availability: [] }
    }
}

export default async function AvailabilityPage() {
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

    const { availability } = await getAvailability(session.user.id)

    // Calculate total hours per week
    const totalHours = availability.reduce((acc, avail) => {
        if (avail.isAvailable) {
            const start = parseInt(avail.startTime.split(':')[0])
            const end = parseInt(avail.endTime.split(':')[0])
            return acc + (end - start)
        }
        return acc
    }, 0)

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Disponibilités</h1>
                    <p className="text-muted-foreground">Gérez vos horaires de travail</p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-turquoise/10">
                                <Clock className="w-5 h-5 text-turquoise" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalHours}h</p>
                                <p className="text-sm text-muted-foreground">par semaine</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {availability.filter(a => a.isAvailable).length}
                                </p>
                                <p className="text-sm text-muted-foreground">jours actifs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <X className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {7 - availability.filter(a => a.isAvailable).length}
                                </p>
                                <p className="text-sm text-muted-foreground">jours fermés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Availability Editor */}
            <AvailabilityEditor
                initialAvailability={availability.map(a => ({
                    id: a.id,
                    dayOfWeek: a.dayOfWeek ?? 0,
                    isAvailable: a.isAvailable,
                    startTime: a.startTime,
                    endTime: a.endTime
                }))}
                proProfileId={proProfile.id}
            />

            {/* Blocked Periods */}
            <BlockedPeriodsManager />
        </div>
    )
}
