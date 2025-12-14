import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, DollarSign, Users, Briefcase } from 'lucide-react';
import { AgendaEditor } from '@/components/agenda-editor';
import { ReservationManager } from '@/components/reservation-manager';
import { ManualBookingForm } from '@/components/manual-booking-form';
import { ProProfileEdit } from '@/components/pro-profile-edit';
import { ServiceManager } from '@/components/service-manager';
import { ProCalendar } from '@/components/pro/pro-calendar';
import { ProClientsTable } from '@/components/pro/pro-clients-table';
import { getProAnalytics } from '@/app/lib/pro-analytics-actions';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AgendaBoard } from '@/components/dashboard/AgendaBoard';
import { RequestsListClient } from '@/components/dashboard/RequestsListClient';
import { getDashboardMetrics, getUpcomingSchedule, getPendingRequests } from '@/app/lib/dashboard-actions';

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
    const [proProfile, allCategories, analyticsData, metricsResult, scheduleResult, requestsResult] = await Promise.all([
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
        }),
        getProAnalytics().catch(() => ({ revenueData: [], clients: [] })),
        getDashboardMetrics(),
        getUpcomingSchedule(),
        getPendingRequests()
    ]);

    // Extract metrics data
    const metrics = metricsResult.success ? metricsResult.data : { revenueWeek: 0, occupancyRate: 0, noShowRate: 0, pendingRequests: 0 };
    const { revenueWeek, occupancyRate, noShowRate, pendingRequests } = metrics;

    // Extract schedule and requests
    const schedule = scheduleResult.success ? scheduleResult.data : [];
    const requests = requestsResult.success ? requestsResult.data : [];

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
                        <p className="text-gray-500 mt-2 text-lg">Bienvenue, {session?.user?.name}. Gérer votre activité.</p>
                    </div>
                    <div className="flex gap-3">
                        <ManualBookingForm />
                        <Button className="bg-navy hover:bg-navy-light text-white shadow-lg shadow-navy/20">
                            <Users className="w-4 h-4 mr-2" />
                            Voir mon profil public
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-white p-1 rounded-full shadow-sm">
                        <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Aperçu</TabsTrigger>
                        <TabsTrigger value="calendar" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Calendrier</TabsTrigger>
                        <TabsTrigger value="clients" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Clients</TabsTrigger>
                        <TabsTrigger value="services" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Services & Profil</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-8 animate-in fade-in-50">
                        {/* KPIs Grid - 4 columns */}
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                label="CA semaine"
                                value={`${revenueWeek.toLocaleString('fr-FR')} ₪`}
                                changeLabel="vs semaine dernière"
                                changeValue="+8%"
                            />
                            <MetricCard
                                label="Taux d'occupation"
                                value={`${Math.round(occupancyRate * 100)}%`}
                                progress={occupancyRate}
                            />
                            <MetricCard
                                label="Taux de no-show"
                                value={`${(noShowRate * 100).toFixed(1)}%`}
                                accent="orange"
                                progress={noShowRate}
                            />
                            <MetricCard
                                label="Demandes en attente"
                                value={pendingRequests.toString()}
                            />
                        </div>

                        {/* Agenda + Requests Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-8">
                                <AgendaBoard schedule={schedule} />
                            </div>
                            <div className="xl:col-span-4">
                                <RequestsListClient requests={requests} />
                            </div>
                        </div>

                        {/* Legacy Stats - Keep for reference */}
                        <div className="border-t pt-8">
                            <h3 className="text-lg font-semibold text-navy mb-4">Statistiques Détaillées</h3>
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-navy to-navy-light text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <div className="absolute right-0 top-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                        <CardTitle className="text-sm font-medium text-white/80">Revenu Total</CardTitle>
                                        <DollarSign className="h-5 w-5 text-turquoise" />
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="text-4xl font-bold font-poppins">{totalEarnings.toFixed(2)}€</div>
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
                                        <CardTitle className="text-sm font-medium text-gray-500">Clients Uniques</CardTitle>
                                        <Users className="h-5 w-5 text-turquoise" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold text-navy">{analyticsData.clients.length}</div>
                                        <p className="text-xs text-gray-400 mt-1">Clients servis</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CALENDAR TAB */}
                    <TabsContent value="calendar" className="space-y-6 animate-in fade-in-50 h-[800px]">
                        <ProCalendar reservations={proProfile.reservations} />
                    </TabsContent>

                    {/* CLIENTS TAB */}
                    <TabsContent value="clients" className="space-y-6 animate-in fade-in-50">
                        <ProClientsTable clients={analyticsData.clients} />
                    </TabsContent>

                    {/* SERVICES & PROFILE TAB */}
                    <TabsContent value="services" className="space-y-6 animate-in fade-in-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <ServiceManager
                                    services={proProfile.services}
                                    availableCategories={allCategories}
                                    defaultHourlyRate={proProfile.hourlyRate}
                                />
                            </div>
                            <div>
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
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
