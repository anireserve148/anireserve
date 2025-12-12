import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { FavoriteButton } from '@/components/favorites/favorite-button';

export default async function FavoritesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>Votre session a expiré. Veuillez vous reconnecter.</p>
                <a href="/login" className="text-primary hover:underline mt-2">Aller à la page de connexion</a>
            </div>
        );
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
            pro: {
                include: {
                    user: true,
                    city: true,
                    serviceCategories: true,
                    reviews: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-24">
            <main className="container mx-auto px-4 max-w-6xl space-y-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold tracking-tight text-navy font-poppins">Mes Favoris ❤️</h1>
                    <Badge variant="secondary" className="text-lg px-3 py-1">{favorites.length}</Badge>
                </div>

                {favorites.length === 0 ? (
                    <Card className="border-dashed border-2 bg-transparent shadow-none">
                        <CardContent className="flex flex-col items-center justify-center h-96 text-center p-6">
                            <div className="rounded-full bg-red-50 p-6 mb-6">
                                <Heart className="h-10 w-10 text-red-200 fill-red-50" />
                            </div>
                            <h3 className="font-semibold text-2xl text-navy">Aucun favori pour le moment</h3>
                            <p className="text-gray-500 max-w-sm mt-2 mb-8 text-lg">
                                Sauvegardez les profils qui vous intéressent pour les retrouver facilement ici.
                            </p>
                            <Link href="/search">
                                <Button size="lg" className="bg-navy hover:bg-navy-light text-white rounded-full px-8">Explor les professionnels</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {favorites.map((fav) => {
                            const pro = fav.pro;
                            const rating = pro.reviews.reduce((acc, r) => acc + r.rating, 0) / (pro.reviews.length || 1);

                            return (
                                <div
                                    key={fav.id}
                                    className="group relative bg-white border border-gray-100 hover:border-red-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-red-50"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center shrink-0 text-3xl font-bold text-navy/30 uppercase">
                                            {pro.user.name?.[0]}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-navy group-hover:text-red-500 transition-colors">
                                                        {pro.user.name}
                                                    </h3>
                                                    <div className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
                                                        <MapPin className="w-3 h-3" />
                                                        {pro.city.name}
                                                    </div>
                                                </div>
                                                <FavoriteButton proId={pro.id} isFavorite={true} />
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {pro.serviceCategories.map(cat => (
                                                    <Badge key={cat.id} variant="outline" className="bg-gray-50 border-gray-100 text-gray-600">
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <Link href={`/pros/${pro.id}`}>
                                                <Button className="w-full bg-gray-50 hover:bg-navy hover:text-white text-navy font-semibold rounded-lg transition-colors">
                                                    Voir le profil
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
