import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Star, Clock, Camera, MessageSquare } from "lucide-react"
import { BookingWidget } from "@/components/booking-widget"
import { ProGallery } from "@/components/pro-gallery"
import { ReviewList } from "@/components/reviews/review-list"
import { ProBadges } from "@/components/pro-badges"
import { auth } from "@/auth"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { Metadata } from "next"

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params

    const pro = await prisma.proProfile.findUnique({
        where: { id },
        include: { user: true, city: true, serviceCategories: true }
    })

    if (!pro) {
        return {
            title: "Professionnel non trouvé",
        }
    }

    const categories = pro.serviceCategories.map(c => c.name).join(", ")

    return {
        title: `${pro.user.name} - ${categories || "Professionnel"}`,
        description: pro.bio || `${pro.user.name}, professionnel à ${pro.city.name}. Réservez en ligne sur AniReserve.`,
        openGraph: {
            title: `${pro.user.name} | AniReserve`,
            description: pro.bio || `Réservez ${pro.user.name} à ${pro.city.name}`,
            type: "profile",
        },
        alternates: {
            canonical: `/pros/${id}`,
        },
    }
}

export default async function ProProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    const pro = await prisma.proProfile.findUnique({
        where: { id },
        include: {
            user: true,
            city: true,
            serviceCategories: true,
            services: {
                where: { isActive: true },
                include: { category: true },
                orderBy: { createdAt: 'desc' }
            },
            availability: true,
            gallery: { orderBy: { order: 'asc' } },
            reviews: { include: { client: true }, orderBy: { createdAt: 'desc' }, take: 5 }
        }
    })

    if (!pro) notFound()

    let isFavorite = false
    if (session?.user?.id) {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_proId: {
                    userId: session.user.id,
                    proId: pro.id
                }
            }
        })
        isFavorite = !!favorite
    }

    // Calculate average rating
    const averageRating = pro.reviews.length > 0
        ? pro.reviews.reduce((acc, r) => acc + r.rating, 0) / pro.reviews.length
        : 0

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card w-full rounded-xl overflow-hidden shadow-sm border">
                        <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-32 h-32 rounded-full bg-background p-1 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground">
                                        {pro.user.name?.[0]}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 pb-8 px-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold">{pro.user.name}</h1>
                                        <FavoriteButton proId={pro.id} isFavorite={isFavorite} />
                                    </div>
                                    {/* Contact Button */}
                                    <a
                                        href={`/dashboard/messages?proId=${pro.id}`}
                                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-navy hover:bg-navy/90 text-white rounded-full text-sm font-medium transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Envoyer un message
                                    </a>
                                    <div className="flex items-center text-muted-foreground mt-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {pro.city.name}, {pro.city.region}
                                    </div>
                                    <ProBadges
                                        reviewCount={pro.reviews.length}
                                        averageRating={averageRating}
                                        isVerified={true}
                                    />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">{pro.hourlyRate}₪ <span className="text-sm font-normal text-muted-foreground">/hr</span></div>
                                    <div className="flex items-center justify-end text-sm font-medium mt-1">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                                        {averageRating.toFixed(1)} ({pro.reviews.length} avis)
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {pro.serviceCategories.map(cat => (
                                    <Badge key={cat.id} variant="secondary" className="px-3 py-1 text-sm">
                                        {cat.name}
                                    </Badge>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-3">À propos de moi</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {pro.bio || "Ce professionnel n'a pas encore ajouté de bio."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Section */}
                    {pro.gallery && pro.gallery.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Galerie Photos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProGallery photos={pro.gallery} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Reviews Section */}
                    {pro.reviews && pro.reviews.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Avis Clients
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ReviewList reviews={pro.reviews} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <BookingWidget
                            proId={pro.id}
                            availability={pro.availability}
                            hourlyRate={pro.hourlyRate}
                            services={pro.services}
                            reviews={pro.reviews}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
