import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, User, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ClientProfileEdit } from '@/components/client-profile-edit';
import { ReviewForm } from '@/components/reviews/review-form';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>Votre session a expiré. Veuillez vous reconnecter.</p>
                <a href="/login" className="text-primary hover:underline mt-2">Aller à la page de connexion</a>
            </div>
        );
    }

    /* Fetch user with reservations */
    const user = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        include: {
            clientReservations: {
                include: {
                    pro: {
                        include: {
                            user: true,
                            city: true
                        }
                    },
                    review: true
                },
                orderBy: { startDate: 'desc' }
            }
        }
    });

    const pendingReservations = user?.clientReservations.filter(r => r.status === 'PENDING').length || 0;
    const activeReservations = user?.clientReservations.filter(r => r.status === 'CONFIRMED').length || 0;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-24">
            <main className="container mx-auto px-4 max-w-6xl space-y-10">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-navy font-poppins">Bonjour, {session.user.name} 👋</h1>
                        <p className="text-gray-500 mt-2 text-lg">Gérez vos réservations et retrouvez vos professionnels favoris.</p>
                    </div>
                    <Link href="/search">
                        <Button className="h-12 px-6 rounded-full bg-[#3DBAA2] hover:bg-[#34a08b] text-white shadow-lg shadow-[#3DBAA2]/20 font-semibold transition-all hover:scale-105">
                            Trouver un professionnel
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-[#3DBAA2] to-[#34a08b] text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-white/90">Réservations en cours</CardTitle>
                            <Calendar className="h-5 w-5 text-white/80" />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold">{activeReservations}</div>
                            <p className="text-xs text-white/80 mt-1">Confirmées et à venir</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">En attente</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-navy">{pendingReservations}</div>
                            <p className="text-xs text-gray-400 mt-1">En attente de validation</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Dépensé</CardTitle>
                            <CreditCard className="h-5 w-5 text-navy" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-navy">
                                {user?.clientReservations
                                    .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
                                    .reduce((acc, curr) => acc + curr.totalPrice, 0)}₪
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Sur les réservations terminées</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {/* Reservations List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-navy font-poppins">Historique</h2>
                            {(user?.clientReservations.length || 0) > 3 && (
                                <Link href="/dashboard/reservations">
                                    <Button variant="link" className="text-[#3DBAA2]">Voir tout</Button>
                                </Link>
                            )}
                        </div>

                        {user?.clientReservations.length === 0 ? (
                            <Card className="border-dashed border-2 bg-transparent shadow-none">
                                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                                    <div className="rounded-full bg-gray-100 p-4 mb-4">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold text-xl text-navy">Aucune réservation</h3>
                                    <p className="text-gray-500 max-w-sm mt-2 mb-6">
                                        Vous n'avez pas encore réservé de professionnel. Lancez une recherche pour trouver la perle rare.
                                    </p>
                                    <Link href="/search">
                                        <Button className="bg-navy hover:bg-navy-light text-white rounded-full">Explorer les services</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {user?.clientReservations.map(res => (
                                    <div key={res.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center group">
                                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 text-2xl group-hover:bg-turquoise/10 transition-colors">
                                            {res.pro.user.name?.[0] || 'P'}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div>
                                                    <h4 className="font-bold text-lg text-navy">{res.pro.user.name}</h4>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-2">
                                                        <MapPin className="h-3 w-3" />
                                                        {res.pro.city.name}
                                                    </div>
                                                </div>
                                                <Badge className={`px-3 py-1.5 rounded-full text-xs font-semibold ${res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                    res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                                        'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}>
                                                    {res.status === 'CONFIRMED' ? 'Confirmé' :
                                                        res.status === 'COMPLETED' ? 'Terminé' :
                                                            res.status === 'PENDING' ? 'En attente' :
                                                                res.status === 'REJECTED' ? 'Refusé' : 'Annulé'}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-50 w-full">
                                                <div className="flex items-center text-sm text-gray-600 font-medium">
                                                    <Calendar className="w-4 h-4 mr-2 text-[#3DBAA2]" />
                                                    {new Date(res.startDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 font-medium">
                                                    <Clock className="w-4 h-4 mr-2 text-[#3DBAA2]" />
                                                    {new Date(res.startDate).getHours()}h
                                                </div>
                                                <div className="font-bold text-lg text-navy">
                                                    {res.totalPrice}₪
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 ml-auto">
                                                    {/* Contact Pro Button */}
                                                    <Link href={`/dashboard/messages?proId=${res.proId}`}>
                                                        <Button variant="outline" size="sm" className="text-[#3DBAA2] border-[#3DBAA2] hover:bg-[#3DBAA2]/10">
                                                            <MessageSquare className="w-4 h-4 mr-1" />
                                                            Contacter
                                                        </Button>
                                                    </Link>

                                                    {/* Review Button */}
                                                    {(res.status === 'CONFIRMED' || res.status === 'COMPLETED') && !res.review && (
                                                        <ReviewForm
                                                            reservationId={res.id}
                                                            proName={res.pro.user.name || "Professionnel"}
                                                        />
                                                    )}
                                                    {res.review && (
                                                        <span className="text-sm text-gray-500 italic flex items-center">
                                                            <span className="mr-1">★</span> Avis publié
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Profile & Quick Actions */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg shadow-navy/5 bg-white overflow-hidden">
                            <div className="h-24 bg-navy relative">
                                <div className="absolute -bottom-8 left-6 h-16 w-16 rounded-full border-4 border-white bg-gray-200">
                                    {/* Avatar placeholder */}
                                </div>
                            </div>
                            <div className="pt-10 px-6 pb-6">
                                <h3 className="font-bold text-lg text-navy">{user?.name || session.user.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{user?.email || session.user.email}</p>
                                <ClientProfileEdit user={{
                                    name: user?.name || session.user.name || '',
                                    email: user?.email || session.user.email || '',
                                    phoneNumber: user?.phoneNumber,
                                    address: user?.address
                                }} />
                            </div>
                        </Card>

                        <Card className="bg-[#3DBAA2] text-white border-none shadow-lg shadow-[#3DBAA2]/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Besoin d'aide ?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                                    Une question sur une réservation ? Notre support est disponible 7j/7 pour vous aider.
                                </p>
                                <a href="mailto:contact@anireserve.com?subject=Support AniReserve">
                                    <Button className="w-full bg-white text-[#3DBAA2] hover:bg-gray-50 font-bold border-none">
                                        📧 Contacter le support
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

import { Sparkles } from "lucide-react";
