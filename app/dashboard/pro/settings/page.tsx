import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, MapPin, Clock, FileText, AlertCircle, Share2, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getProProfile(userId: string) {
    try {
        return await prisma.proProfile.findUnique({
            where: { userId },
            include: {
                user: true,
                city: true,
                availability: true,
                serviceCategories: true
            }
        })
    } catch {
        return null
    }
}

const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'PRO') {
        redirect('/login')
    }

    const proProfile = await getProProfile(session.user.id)

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

    return (
        <div className="space-y-6 max-w-4xl">
            <Link href="/dashboard/pro" className="flex items-center gap-2 text-[#A0A0B8] hover:text-white transition-colors mb-4 group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Retour au tableau de bord
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-white font-poppins">Paramètres</h1>
                <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
            </div>

            {/* Profile Info */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informations du Profil
                    </CardTitle>
                    <CardDescription>Vos informations publiques</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Nom</p>
                            <p className="font-medium">{proProfile.user.name || 'Non défini'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-4 h-4" /> Email
                            </p>
                            <p className="font-medium">{proProfile.user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="w-4 h-4" /> Téléphone
                            </p>
                            <p className="font-medium">{proProfile.user.phoneNumber || 'Non défini'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> Ville
                            </p>
                            <p className="font-medium">{proProfile.city?.name || 'Non définie'}</p>
                        </div>
                    </div>

                    {proProfile.bio && (
                        <div className="space-y-1 pt-4 border-t">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <FileText className="w-4 h-4" /> Bio
                            </p>
                            <p className="text-sm">{proProfile.bio}</p>
                        </div>
                    )}

                    {/* Categories */}
                    {proProfile.serviceCategories.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">Catégories</p>
                            <div className="flex flex-wrap gap-2">
                                {proProfile.serviceCategories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary">
                                        {cat.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Availability */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Disponibilités
                    </CardTitle>
                    <CardDescription>Vos horaires de travail</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {dayLabels.map((dayLabel, dayIndex) => {
                            const avail = proProfile.availability.find(a => a.dayOfWeek === dayIndex)
                            return (
                                <div
                                    key={dayIndex}
                                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                                >
                                    <span className="font-medium text-sm">{dayLabel}</span>
                                    {avail && avail.isAvailable ? (
                                        <span className="text-sm text-turquoise">
                                            {avail.startTime} - {avail.endTime}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            Fermé
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>Tarification</CardTitle>
                    <CardDescription>Vos tarifs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Taux horaire</p>
                            <p className="text-2xl font-bold text-turquoise">
                                {proProfile.hourlyRate || 0} ₪/h
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Connectivity */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Connectivité
                    </CardTitle>
                    <CardDescription>Synchronisez vos outils externes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm">
                                <Calendar className="w-6 h-6 text-[#4285F4]" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Google Calendar</p>
                                <p className="text-xs text-muted-foreground">Synchronisez vos rendez-vous automatiquement</p>
                            </div>
                        </div>
                        <Badge variant={(proProfile as any).googleCalendarSyncEnabled ? "default" : "secondary"}>
                            {(proProfile as any).googleCalendarSyncEnabled ? "Connecté" : "Non connecté"}
                        </Badge>
                    </div>
                    {!(proProfile as any).googleCalendarSyncEnabled && (
                        <div className="p-4 border-2 border-dashed rounded-xl text-center">
                            <p className="text-sm text-muted-foreground mb-3">La synchronisation bidirectionnelle arrive bientôt !</p>
                            <Button variant="outline" size="sm" disabled>
                                Se connecter avec Google
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
