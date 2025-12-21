import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, User, MapPin, MessageSquare, Search, Heart, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ClientProfileEdit } from '@/components/client-profile-edit';
import { ReviewForm } from '@/components/reviews/review-form';
import { AddToCalendarButton } from '@/components/add-to-calendar-button';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f7fa]">
                <p className="text-[#1E3A5F]">Votre session a expiré. Veuillez vous reconnecter.</p>
                <a href="/login" className="text-[#3DBAA2] hover:underline mt-2">Aller à la page de connexion</a>
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
    const upcomingReservations = user?.clientReservations
        .filter(r => (r.status === 'CONFIRMED' || r.status === 'PENDING') && new Date(r.startDate) >= new Date())
        .slice(0, 3) || [];

    const firstName = session.user.name?.split(' ')[0] || 'Client';

    return (
        <div className="min-h-screen bg-[#f5f7fa] pb-20">
            {/* Header Hero Section */}
            <div className="bg-[#1E3A5F] pt-24 pb-32 px-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-20 w-48 h-48 bg-[#3DBAA2] rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Bonjour, {firstName} ! 👋
                            </h1>
                            <p className="text-white/70 mt-2 text-lg">
                                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>

                        {/* Profile Avatar */}
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                            <span className="text-white text-xl font-bold">{firstName[0]}</span>
                        </div>
                    </div>

                    {/* Quick Action Pills */}
                    <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                        <Link href="/search" className="bg-white text-[#1E3A5F] px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors whitespace-nowrap">
                            <Search className="w-4 h-4" /> Rechercher
                        </Link>
                        <Link href="/dashboard/favorites" className="bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors whitespace-nowrap">
                            <Heart className="w-4 h-4" /> Favoris
                        </Link>
                        <Link href="/dashboard/messages" className="bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors whitespace-nowrap">
                            <MessageSquare className="w-4 h-4" /> Messages
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content - Overlapping Cards */}
            <div className="container mx-auto max-w-6xl px-4 -mt-20 relative z-20">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#3DBAA2]/10 flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-[#3DBAA2]" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#1E3A5F]">{activeReservations}</p>
                                <p className="text-sm text-gray-500">RDV confirmés</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <Clock className="w-7 h-7 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#1E3A5F]">{pendingReservations}</p>
                                <p className="text-sm text-gray-500">En attente</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center">
                                <CreditCard className="w-7 h-7 text-[#1E3A5F]" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#1E3A5F]">
                                    {user?.clientReservations
                                        .filter(r => r.status === 'COMPLETED' || r.status === 'CONFIRMED')
                                        .reduce((acc, curr) => acc + curr.totalPrice, 0)}₪
                                </p>
                                <p className="text-sm text-gray-500">Total dépensé</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Upcoming & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Section */}
                        {upcomingReservations.length > 0 && (
                            <Card className="bg-white border-0 shadow-lg overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6B] text-white pb-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <Calendar className="w-5 h-5" /> Prochains RDV
                                        </CardTitle>
                                        <Badge className="bg-white/20 text-white hover:bg-white/30">
                                            {upcomingReservations.length}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="divide-y">
                                    {upcomingReservations.map(res => (
                                        <div key={res.id} className="py-4 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F] font-bold">
                                                {res.pro.user.name?.[0] || 'P'}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-[#1E3A5F]">{res.pro.user.name}</h4>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {res.pro.city.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-[#1E3A5F]">
                                                    {new Date(res.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(res.startDate).getHours()}h</p>
                                            </div>
                                            <Badge className={`${res.status === 'CONFIRMED' ? 'bg-[#3DBAA2] hover:bg-[#3DBAA2]' : 'bg-amber-500 hover:bg-amber-500'} text-white`}>
                                                {res.status === 'CONFIRMED' ? '✓' : '⏳'}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* History Section */}
                        <Card className="bg-white border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">Historique</CardTitle>
                                {(user?.clientReservations.length || 0) > 3 && (
                                    <Link href="/dashboard/reservations" className="text-[#3DBAA2] text-sm font-medium flex items-center gap-1 hover:underline">
                                        Voir tout <ChevronRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user?.clientReservations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="font-semibold text-[#1E3A5F] mb-2">Aucune réservation</h3>
                                        <p className="text-gray-500 text-sm mb-4">Trouvez votre premier professionnel</p>
                                        <Link href="/search">
                                            <Button className="bg-[#3DBAA2] hover:bg-[#34a08b] text-white rounded-full">
                                                Explorer les services
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    user?.clientReservations.slice(0, 5).map(res => (
                                        <div key={res.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1E3A5F] font-bold">
                                                {res.pro.user.name?.[0] || 'P'}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-[#1E3A5F]">{res.pro.user.name}</h4>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(res.startDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <span className="font-medium text-[#3DBAA2]">{res.totalPrice}₪</span>
                                                </div>
                                            </div>
                                            <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {res.status === 'CONFIRMED' ? 'Confirmé' :
                                                    res.status === 'COMPLETED' ? 'Terminé' :
                                                        res.status === 'PENDING' ? 'En attente' :
                                                            res.status === 'REJECTED' ? 'Refusé' : 'Annulé'}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/dashboard/messages?proId=${res.proId}`}>
                                                    <Button variant="ghost" size="icon" className="text-[#1E3A5F] hover:bg-[#1E3A5F]/10">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                {res.status === 'COMPLETED' && !res.review && (
                                                    <ReviewForm reservationId={res.id} proName={res.pro.user.name || "Pro"} />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Profile & Actions */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <Card className="bg-white border-0 shadow-lg overflow-hidden">
                            <div className="h-20 bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6B] relative">
                                <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-[#1E3A5F] text-2xl font-bold border-4 border-white">
                                    {firstName[0]}
                                </div>
                            </div>
                            <div className="pt-12 px-6 pb-6">
                                <h3 className="font-bold text-lg text-[#1E3A5F]">{user?.name || session.user.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{user?.email || session.user.email}</p>
                                <ClientProfileEdit user={{
                                    name: user?.name || session.user.name || '',
                                    email: user?.email || session.user.email || '',
                                    phoneNumber: user?.phoneNumber,
                                    address: user?.address
                                }} />
                            </div>
                        </Card>

                        {/* Quick Search Card */}
                        <Card className="bg-gradient-to-br from-[#3DBAA2] to-[#2a9a84] text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Search className="w-6 h-6" />
                                    <h3 className="font-bold text-lg">Trouver un pro</h3>
                                </div>
                                <p className="text-white/80 text-sm mb-4">
                                    Découvrez les meilleurs professionnels près de chez vous
                                </p>
                                <Link href="/search">
                                    <Button className="w-full bg-white text-[#3DBAA2] hover:bg-gray-100 font-semibold">
                                        Rechercher
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Support Card */}
                        <Card className="bg-[#1E3A5F] text-white border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="w-5 h-5" />
                                    <h3 className="font-semibold">Besoin d'aide ?</h3>
                                </div>
                                <p className="text-white/70 text-sm mb-4">
                                    Notre support est disponible 7j/7
                                </p>
                                <a href="mailto:contact@anireserve.com">
                                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                                        📧 Contacter le support
                                    </Button>
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
