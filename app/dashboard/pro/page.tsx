import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { AgendaEditor } from '@/components/agenda-editor';
import { ReservationManager } from '@/components/reservation-manager';
import { ManualBookingForm } from '@/components/manual-booking-form';
import { ProProfileEdit } from '@/components/pro-profile-edit';
import { ServiceManager } from '@/components/service-manager';

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

    // Fetch all data in parallel
    const [proProfile, allCategories] = await Promise.all([
        prisma.proProfile.findUnique({
            where: { userId: session?.user?.id },
            include: {
                reservations: {
                    include: { client: true },
                    orderBy: { createdAt: 'desc' }
                },
                city: true,
                serviceCategories: true,
                availability: true,
                gallery: {
                    orderBy: { order: 'asc' }
                },
                services: {
                    include: {
                        category: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        }),
        prisma.serviceCategory.findMany({
            where: { parentId: null },
            orderBy: { name: 'asc' }
        })
    ]);

    if (!proProfile) {
        return <div>Profile not found. Please contact support.</div>;
    }

    const totalEarnings = proProfile.reservations
        .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

    const pendingCount = proProfile.reservations.filter(r => r.status === 'PENDING').length;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 pt-24 pb-10">
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-10 animate-slide-up">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold font-poppins text-navy">Espace Pro</h1>
                            <span className="bg-turquoise/10 text-turquoise px-3 py-1 rounded-full text-sm font-semibold">Vérifié</span>
                        </div>
                        <p className="text-gray-500 mt-2 text-lg">Bienvenue, {session?.user?.name}. Voici vos performances.</p>
                    </div>
                    <div className="flex gap-3">
                        <ManualBookingForm />
                        <Button className="bg-navy hover:bg-navy-light text-white shadow-lg shadow-navy/20">
                            <Users className="w-4 h-4 mr-2" />
                            Voir mon profil public
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-navy to-navy-light text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute right-0 top-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-white/80">Revenu Total</CardTitle>
                            <DollarSign className="h-5 w-5 text-turquoise" />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold font-poppins">{totalEarnings.toFixed(2)}₪</div>
                            <p className="text-xs text-white/60 mt-1">Générés sur la plateforme</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-white group hover:scale-[1.02] transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Activité</CardTitle>
                            <Calendar className="h-5 w-5 text-turquoise" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-4xl font-bold text-navy">{proProfile.reservations.length}</div>
                                <div className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                    {pendingCount} en attente
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Réservations totales</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-white group hover:scale-[1.02] transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Vues du Profil</CardTitle>
                            <Users className="h-5 w-5 text-turquoise" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-navy">+573</div>
                            <p className="text-xs text-green-600 font-medium mt-1 inline-flex items-center">
                                +12% <span className="text-gray-400 font-normal ml-1"> ce mois-ci</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-navy mb-6 font-poppins">Réservations Récentes</h2>
                            <ReservationManager reservations={proProfile.reservations} />
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-navy mb-6 font-poppins">Gestion de l'Agenda</h2>
                            <AgendaEditor initialAvailability={proProfile.availability} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <ServiceManager
                            services={proProfile.services}
                            availableCategories={allCategories}
                            defaultHourlyRate={proProfile.hourlyRate}
                        />

                        <ProProfileEdit
                            initialData={{
                                userId: proProfile.userId,
                                bio: proProfile.bio,
                                hourlyRate: proProfile.hourlyRate,
                                gallery: proProfile.gallery
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
