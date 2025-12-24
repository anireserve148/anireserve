import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, TrendingUp, Star, Clock, ChevronRight } from 'lucide-react';
import { getDashboardMetrics, getUpcomingSchedule, getPendingRequests } from '@/app/lib/dashboard-actions';
import Link from 'next/link';

export default async function ProDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-white">Votre session a expiré. Veuillez vous reconnecter.</p>
                <a href="/login" className="text-[#2EB190] hover:underline mt-2">Aller à la page de connexion</a>
            </div>
        );
    }

    // Fetch all data in parallel
    const [proProfile, metricsResult, scheduleResult, requestsResult] = await Promise.all([
        prisma.proProfile.findUnique({
            where: { userId: session?.user?.id },
            include: {
                reservations: {
                    include: { client: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 3
                },
                services: {
                    where: { isActive: true },
                    take: 4
                }
            }
        }),
        getDashboardMetrics(),
        getUpcomingSchedule(),
        getPendingRequests()
    ]);

    // Extract metrics data
    const metrics = metricsResult.success ? metricsResult.data : { revenueWeek: 0, occupancyRate: 0, noShowRate: 0, pendingRequests: 0 };
    const { revenueWeek, pendingRequests } = metrics;
    const schedule = scheduleResult.success ? scheduleResult.data : [];
    const requests = requestsResult.success ? requestsResult.data : [];

    if (!proProfile) {
        return <div className="text-white">Profile not found. Please contact support.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#7B68EE] text-white text-xs font-bold px-3 py-1 rounded-full">
                            ESPACE PRO
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        Bonjour, {session?.user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-[#A0A0B8] mt-1">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <Link href="/dashboard/pro/agenda">
                    <Button className="bg-[#2EB190] hover:bg-[#238B70] text-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        Voir mon agenda
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Revenue */}
                <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#2EB190]/50 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#2EB190]/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-[#2EB190]" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{revenueWeek.toLocaleString('fr-FR')} ₪</p>
                        <p className="text-[#6C6C8A] text-sm mt-1">Revenus cette semaine</p>
                    </CardContent>
                </Card>

                {/* Bookings */}
                <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#7B68EE]/50 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#7B68EE]/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[#7B68EE]" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{schedule.length}</p>
                        <p className="text-[#6C6C8A] text-sm mt-1">RDV cette semaine</p>
                    </CardContent>
                </Card>

                {/* Pending Requests */}
                <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#F39C12]/50 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#F39C12]/20 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-[#F39C12]" />
                            </div>
                            {pendingRequests > 0 && (
                                <span className="text-[#F39C12] text-sm font-medium bg-[#F39C12]/20 px-2 py-1 rounded-full animate-pulse">
                                    À traiter
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-white">{pendingRequests}</p>
                        <p className="text-[#6C6C8A] text-sm mt-1">Demandes en attente</p>
                    </CardContent>
                </Card>

                {/* Rating */}
                <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#FFD700]/50 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                                <Star className="w-6 h-6 text-[#FFD700]" />
                            </div>
                            <span className="text-[#FFD700] text-sm font-medium">⭐</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {proProfile.reviews.length > 0
                                ? (proProfile.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / proProfile.reviews.length).toFixed(1)
                                : '5.0'}
                        </p>
                        <p className="text-[#6C6C8A] text-sm mt-1">Note moyenne</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content - Full Width (no leaderboard) */}
            <div className="space-y-6">
                {/* Pending Requests */}
                {requests.length > 0 && (
                    <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-[#2A2A4A] pb-4">
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                🔔 Demandes en attente
                                <span className="bg-[#E74C3C] text-white text-xs px-2 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            </CardTitle>
                            <Link href="/dashboard/pro/requests" className="text-[#2EB190] text-sm hover:underline flex items-center gap-1">
                                Voir tout <ChevronRight className="w-4 h-4" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {requests.slice(0, 3).map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between p-4 bg-[#16162D] rounded-xl border border-[#F39C12]/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#F39C12]/20 flex items-center justify-center">
                                            <span className="text-[#F39C12] font-bold">{req.client?.name?.[0] || 'C'}</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{req.client?.name || 'Client'}</p>
                                            <p className="text-[#6C6C8A] text-sm">
                                                {new Date(req.date).toLocaleDateString('fr-FR')} à {req.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#2EB190] font-bold">{req.totalPrice} ₪</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Active Services */}
                <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#2A2A4A] pb-4">
                        <CardTitle className="text-lg font-semibold text-white">✨ Mes Services Actifs</CardTitle>
                        <Link href="/dashboard/pro/services" className="text-[#2EB190] text-sm hover:underline flex items-center gap-1">
                            Gérer les services <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {proProfile.services.length === 0 ? (
                                <div className="col-span-full text-center py-4 text-[#6C6C8A]">
                                    Aucun service créé. <Link href="/dashboard/pro/services" className="text-[#2EB190] underline">En ajouter un</Link>
                                </div>
                            ) : (
                                proProfile.services.filter((s: any) => s.isActive).slice(0, 4).map((service: any) => (
                                    <div key={service.id} className="flex items-center justify-between p-3 bg-[#16162D] rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-white font-medium text-sm">{service.name}</p>
                                            <p className="text-[#6C6C8A] text-xs">{service.duration} min</p>
                                        </div>
                                        <p className="text-[#2EB190] font-bold text-sm">{service.customPrice} ₪</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="bg-[#1A1A2E] border-[#2A2A4A]">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#2A2A4A] pb-4">
                        <CardTitle className="text-lg font-semibold text-white">📅 Prochains RDV</CardTitle>
                        <Link href="/dashboard/pro/agenda" className="text-[#2EB190] text-sm hover:underline flex items-center gap-1">
                            Agenda complet <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {schedule.length === 0 ? (
                            <div className="text-center py-8 text-[#6C6C8A]">
                                Aucun RDV prévu
                            </div>
                        ) : (
                            schedule.slice(0, 5).map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-[#16162D] rounded-xl hover:bg-[#252545] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#2EB190] text-white px-3 py-1 rounded-lg text-sm font-bold">
                                            {item.time}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{item.client?.name || 'Client'}</p>
                                            <p className="text-[#6C6C8A] text-sm">{item.service?.name || 'Service'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#2EB190] font-bold">{item.totalPrice} ₪</p>
                                        <span className="text-xs text-[#27AE60] bg-[#27AE60]/20 px-2 py-0.5 rounded-full">
                                            Confirmé
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/pro/agenda" className="block">
                        <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#2EB190] transition-colors cursor-pointer group">
                            <CardContent className="p-6 text-center">
                                <div className="w-14 h-14 rounded-xl bg-[#2EB190]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-7 h-7 text-[#2EB190]" />
                                </div>
                                <p className="text-white font-medium">Agenda</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/pro/services" className="block">
                        <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#7B68EE] transition-colors cursor-pointer group">
                            <CardContent className="p-6 text-center">
                                <div className="w-14 h-14 rounded-xl bg-[#7B68EE]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-7 h-7 text-[#7B68EE]" />
                                </div>
                                <p className="text-white font-medium">Services</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/pro/clients" className="block">
                        <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#3498DB] transition-colors cursor-pointer group">
                            <CardContent className="p-6 text-center">
                                <div className="w-14 h-14 rounded-xl bg-[#3498DB]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-[#3498DB]" />
                                </div>
                                <p className="text-white font-medium">Clients</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/pro/stats" className="block">
                        <Card className="bg-[#1A1A2E] border-[#2A2A4A] hover:border-[#FFD700] transition-colors cursor-pointer group">
                            <CardContent className="p-6 text-center">
                                <div className="w-14 h-14 rounded-xl bg-[#FFD700]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-[#FFD700]" />
                                </div>
                                <p className="text-white font-medium">Statistiques</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
            );
}
