import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { AgendaEditor } from '@/components/agenda-editor';
import { ReservationManager } from '@/components/reservation-manager';

export default async function ProDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>Votre session a expiré. Veuillez vous reconnecter.</p>
                <a href="/login" className="text-primary hover:underline mt-2">Aller à la page de connexion</a>
            </div>
        );
    }
    const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session?.user?.id },
        include: {
            reservations: {
                include: { client: true },
                orderBy: { createdAt: 'desc' }
            },
            city: true,
            serviceCategories: true,
            availability: true
        }
    });

    if (!proProfile) {
        return <div>Profile not found. Please contact support.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <header className="bg-background border-b p-4 flex justify-between items-center px-8">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-primary">AniReserve Pro</span>
                    <span className="text-sm text-muted-foreground">| {session?.user?.name}</span>
                </div>
                <form
                    action={async () => {
                        'use server';
                        await signOut();
                    }}
                >
                    <Button variant="outline" size="sm">Se déconnecter</Button>
                </form>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">450.00€</div>
                            <p className="text-xs text-muted-foreground">+20.1% du mois dernier</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Réservations Actives</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{proProfile.reservations.length}</div>
                            <p className="text-xs text-muted-foreground">2 en attente d'approbation</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vues du Profil</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+573</div>
                            <p className="text-xs text-muted-foreground">+201 depuis la dernière heure</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ReservationManager reservations={proProfile.reservations} />

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Mes Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {proProfile.serviceCategories.map(s => (
                                    <span key={s.id} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4">
                                <span className="font-semibold">{proProfile.hourlyRate}€</span> / heure
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Gestion de l'Agenda</h2>
                    <AgendaEditor initialAvailability={proProfile.availability} />
                </div>
            </main>
        </div>
    );
}
