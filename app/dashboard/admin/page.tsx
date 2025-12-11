import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, DollarSign, Star } from 'lucide-react';

export default async function AdminDashboard() {
    let session = await auth();

    // Dev Bypass: Mock session if auth fails locally
    if (!session?.user?.id && process.env.NODE_ENV === 'development') {
        session = {
            user: {
                id: 'mock-admin',
                role: 'ADMIN',
                name: 'Dev Admin',
                email: 'admin@anireserve.com'
            },
            expires: new Date(Date.now() + 86400000).toISOString()
        } as any;
    }

    if (!session?.user?.id) {
        return <div>Access Denied</div>;
    }

    // Fetch Stats
    const totalUsers = await prisma.user.count();
    const totalReservations = await prisma.reservation.count();
    const totalRevenue = await prisma.reservation.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'COMPLETED' }
    });
    const totalReviews = await prisma.review.count();

    // Fetch Recent Users
    const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });

    // Fetch Recent Reservations
    const recentReservations = await prisma.reservation.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            client: true,
            pro: { include: { user: true } }
        }
    });

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center px-8 shadow-md">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">AniReserve Admin</span>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-200">SUPER ADMIN</Badge>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300">{session.user.name}</span>
                    <form
                        action={async () => {
                            'use server';
                            await signOut();
                        }}
                    >
                        <Button variant="destructive" size="sm">Se déconnecter</Button>
                    </form>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalReservations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Volume d'Affaire</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalRevenue._sum.totalPrice || 0}€</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avis Total</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalReviews}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users Table */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Utilisateurs Récents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-2">Nom</th>
                                            <th className="px-4 py-2">Email</th>
                                            <th className="px-4 py-2">Rôle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.map(user => (
                                            <tr key={user.id} className="border-b">
                                                <td className="px-4 py-2 font-medium">{user.name}</td>
                                                <td className="px-4 py-2 truncate max-w-[150px]">{user.email}</td>
                                                <td className="px-4 py-2">
                                                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'PRO' ? 'default' : 'secondary'}>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Reservations Table */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Dernières Réservations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-2">Client</th>
                                            <th className="px-4 py-2">Pro</th>
                                            <th className="px-4 py-2">Montant</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentReservations.map(res => (
                                            <tr key={res.id} className="border-b">
                                                <td className="px-4 py-2">{res.client.name}</td>
                                                <td className="px-4 py-2">{res.pro.user.name}</td>
                                                <td className="px-4 py-2">{res.totalPrice}€</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${res.status === 'CONFIRMED' || res.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                        res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                            res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
