import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AdminProDetails } from '@/components/admin/admin-pro-details';
import { AdminReservationsTable } from '@/components/admin/admin-reservations-table';
import { CategoryManager } from '@/components/admin/category-manager';
import { getAdminAnalytics } from '@/app/lib/analytics-actions';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { UserGrowthChart } from '@/components/admin/user-growth-chart';
import { StatusPieChart } from '@/components/admin/status-pie-chart';
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Search,
    UserCheck,
    AlertCircle,
    Shield,
    Trash2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    // Parallel data fetching
    const [
        totalUsers,
        totalPros,
        totalReservations,
        totalRevenue,
        recentUsers,
        allUsers,
        allPros,
        recentReservations,
        analyticsData,
        allCategories
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'PRO' } }),
        prisma.reservation.count(),
        prisma.reservation.aggregate({
            _sum: { totalPrice: true },
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }
        }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { proProfile: true }
        }),
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        }),
        prisma.proProfile.findMany({
            include: { user: true, city: true, serviceCategories: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.reservation.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                client: true,
                pro: { include: { user: true } }
            }
        }),
        getAdminAnalytics(),
        prisma.serviceCategory.findMany({
            include: {
                _count: {
                    select: { proServices: true }
                }
            },
            orderBy: { name: 'asc' }
        })
    ]);

    const formattedRevenue = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(totalRevenue._sum.totalPrice || 0);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-24">
            <main className="container mx-auto px-4 max-w-7xl space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Shield className="h-10 w-10 text-navy" />
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-navy font-poppins">Dashboard Super Admin</h1>
                            <p className="text-gray-500 text-sm mt-1">Gérez les utilisateurs, professionnels et réservations.</p>
                        </div>
                    </div>

                    {/* Applications Button */}
                    <a href="/dashboard/admin/applications">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Candidatures Pro
                            {await prisma.proApplication.count({ where: { status: 'PENDING' } }) > 0 && (
                                <Badge className="bg-white text-orange-500 ml-2">
                                    {await prisma.proApplication.count({ where: { status: 'PENDING' } })}
                                </Badge>
                            )}
                        </Button>
                    </a>
                </div>

                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-6 max-w-4xl bg-white p-1 rounded-full shadow-sm">
                        <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Analytics</TabsTrigger>
                        <TabsTrigger value="reservations" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Réservations</TabsTrigger>
                        <TabsTrigger value="categories" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Catégories</TabsTrigger>
                        <TabsTrigger value="users" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Utilisateurs</TabsTrigger>
                        <TabsTrigger value="pros" className="rounded-full data-[state=active]:bg-navy data-[state=active]:text-white">Professionnels</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid gap-6 md:grid-cols-4">
                            <Card className="border-none shadow-sm shadow-gray-200/50 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Revenu Total</CardTitle>
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-navy">{formattedRevenue}</div>
                                    <p className="text-xs text-gray-400 mt-1">+20.1% ce mois-ci</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm shadow-gray-200/50 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Utilisateurs</CardTitle>
                                    <Users className="h-5 w-5 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-navy">{totalUsers}</div>
                                    <p className="text-xs text-gray-400 mt-1">Dont {totalPros} professionnels</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm shadow-gray-200/50 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Réservations</CardTitle>
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-navy">{totalReservations}</div>
                                    <p className="text-xs text-gray-400 mt-1">Total depuis le lancement</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm shadow-gray-200/50 bg-white">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Performance</CardTitle>
                                    <TrendingUp className="h-5 w-5 text-[#3DBAA2]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-navy">98%</div>
                                    <p className="text-xs text-gray-400 mt-1">Taux de succès</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="border-none shadow-sm shadow-gray-200/50 bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-[#3DBAA2]" />
                                        Nouveaux inscrits
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                    {user.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-navy text-sm">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant={user.role === 'PRO' ? 'default' : 'secondary'} className={user.role === 'PRO' ? 'bg-navy' : ''}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm shadow-gray-200/50 bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                        Dernières Réservations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentReservations.map(res => (
                                        <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-navy text-sm">
                                                    {res.client.name} ➔ {res.pro.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(res.startDate).toLocaleDateString()} · {res.totalPrice}€
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    res.status === 'CONFIRMED' ? 'text-green-600 border-green-200 bg-green-50' :
                                                        res.status === 'PENDING' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : ''
                                                }
                                            >
                                                {res.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ANALYTICS TAB */}
                    <TabsContent value="analytics" className="space-y-8 animate-in fade-in-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <RevenueChart data={analyticsData.revenueData} />
                            <StatusPieChart data={analyticsData.statusData} />
                        </div>
                        <UserGrowthChart data={analyticsData.growthData} />
                    </TabsContent>

                    {/* RESERVATIONS TAB */}
                    <TabsContent value="reservations" className="space-y-6 animate-in fade-in-50">
                        <AdminReservationsTable />
                    </TabsContent>

                    {/* CATEGORIES TAB */}
                    <TabsContent value="categories" className="space-y-6 animate-in fade-in-50">
                        <CategoryManager categories={allCategories} />
                    </TabsContent>

                    {/* USERS TAB */}
                    <TabsContent value="users" className="space-y-6 animate-in fade-in-50">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Gestion des Utilisateurs ({allUsers.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {allUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-navy">
                                                    {user.name?.[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-navy">{user.name}</h3>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Inscrit le {new Date(user.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'PRO' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PROS TAB */}
                    <TabsContent value="pros" className="space-y-6 animate-in fade-in-50">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Gestion des Professionnels ({allPros.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    {allPros.map((pro) => (
                                        <div key={pro.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border rounded-2xl hover:shadow-md transition-all bg-white relative overflow-hidden">

                                            {/* Status Indicator Bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-2 
                                            ${pro.verificationStatus === 'VERIFIED' ? 'bg-green-500' :
                                                    pro.verificationStatus === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-400'}`}
                                            />

                                            <div className="flex items-center gap-6 mb-4 md:mb-0 pl-4">
                                                <div className="h-16 w-16 rounded-2xl bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-gray-400">{pro.user.name?.[0]}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-xl text-navy">{pro.user.name}</h3>
                                                        {pro.verificationStatus === 'VERIFIED' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-2">{pro.user.email}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="outline" className="bg-gray-50">
                                                            {pro.city?.name || 'Ville inconnue'}
                                                        </Badge>
                                                        {pro.serviceCategories.map(cat => (
                                                            <Badge key={cat.id} className="bg-turquoise/10 text-[#3DBAA2] hover:bg-turquoise/20 border-0">
                                                                {cat.name}
                                                            </Badge>
                                                        ))}

                                                        {/* Status Badge */}
                                                        {pro.verificationStatus !== 'VERIFIED' && (
                                                            <Badge variant={pro.verificationStatus === 'REJECTED' ? "destructive" : "secondary"}>
                                                                {pro.verificationStatus || 'PENDING'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 self-end md:self-center">
                                                <div className="text-right mr-4 hidden md:block">
                                                    <div className="font-bold text-navy">{pro.hourlyRate}€ /h</div>
                                                    <div className="text-xs text-gray-400">Tarif horaire</div>
                                                </div>

                                                {/* Use AdminProDetails Component */}
                                                <AdminProDetails pro={pro} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
