import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, Camera, MessageSquare, ArrowLeft, Grid3X3, List, User } from "lucide-react"
import { BookingWidget } from "@/components/booking-widget"
import { ProGallery } from "@/components/pro-gallery"
import { ReviewList } from "@/components/reviews/review-list"
import { ProBadges } from "@/components/pro-badges"
import { auth } from "@/auth"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"
import { Metadata } from "next"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
            reviews: { include: { client: true }, orderBy: { createdAt: 'desc' }, take: 10 }
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

    const averageRating = pro.reviews.length > 0
        ? pro.reviews.reduce((acc, r) => acc + r.rating, 0) / pro.reviews.length
        : 0

    return (
        <div className="min-h-screen bg-background">
            <ModernNavbar user={session?.user} />

            <div className="container mx-auto py-8 px-4 max-w-5xl">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                </Link>


                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Main Content Area - 3 columns (60%) */}
                    <div className="lg:col-span-3 space-y-10">
                        {/* Instagram Style Header */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-2 border-primary/10 p-1 bg-background">
                                <AvatarImage src={pro.user.image || ""} alt={pro.user.name || ""} />
                                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-secondary/20 font-bold">
                                    {pro.user.name?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-6">
                                <div className="flex flex-wrap items-center gap-4">
                                    <h1 className="text-2xl font-bold tracking-tight">{pro.user.name}</h1>
                                    <div className="flex gap-2">
                                        <a
                                            href={session?.user ? `/dashboard/messages?proId=${pro.id}` : `/login/client?callbackUrl=${encodeURIComponent(`/dashboard/messages?proId=${pro.id}`)}`}
                                            className="px-6 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy/90 transition-all flex items-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Message
                                        </a>
                                        <FavoriteButton proId={pro.id} isFavorite={isFavorite} />
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="flex gap-8 border-y md:border-y-0 py-4 md:py-0 border-gray-100">
                                    <div className="text-center md:text-left">
                                        <span className="block font-bold text-lg">{pro.services.length}</span>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Prestations</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="block font-bold text-lg">{pro.reviews.length}</span>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Avis</span>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="block font-bold text-lg">{pro.gallery.length}</span>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Photos</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="font-bold text-sm text-navy">{pro.serviceCategories.map(c => c.name).join(" • ")}</p>
                                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                        {pro.bio || "Ce professionnel n'a pas encore ajouté de bio."}
                                    </p>
                                    <div className="flex items-center text-sm font-medium text-muted-foreground pt-1">
                                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                                        {pro.city.name}, Israël
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="services" className="w-full mt-12">
                            <TabsList className="w-full justify-start border-b rounded-none h-14 bg-transparent p-0 gap-8 mb-8">
                                <TabsTrigger
                                    value="services"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-4 font-bold text-sm tracking-widest uppercase flex items-center gap-2"
                                >
                                    <List className="w-4 h-4" />
                                    Services
                                </TabsTrigger>
                                <TabsTrigger
                                    value="gallery"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-4 font-bold text-sm tracking-widest uppercase flex items-center gap-2"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                    Portfolio
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full px-4 font-bold text-sm tracking-widest uppercase flex items-center gap-2"
                                >
                                    <Star className="w-4 h-4" />
                                    Avis ({pro.reviews.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="services" className="animate-in fade-in-50 slide-in-from-top-2">
                                <div className="grid gap-6">
                                    {pro.services.length > 0 ? (
                                        pro.services.map(service => (
                                            <Card key={service.id} className="border-none shadow-sm bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="space-y-1">
                                                            <h3 className="font-bold text-lg text-navy">{service.name}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                                                            <div className="flex items-center gap-4 pt-2">
                                                                <span className="flex items-center text-xs font-semibold text-gray-500">
                                                                    <ArrowLeft className="w-3 h-3 rotate-180 mr-1" />
                                                                    {service.duration} mins
                                                                </span>
                                                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                                                    {service.category?.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-bold text-primary">{service.customPrice}₪</div>
                                                            <Button size="sm" variant="outline" className="mt-2 text-xs border-primary hover:bg-primary hover:text-white transition-all">
                                                                Sélectionner
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                                            <p className="text-muted-foreground">Aucun service listé pour le moment.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="gallery" className="animate-in fade-in-50 slide-in-from-top-2">
                                <ProGallery photos={pro.gallery} />
                            </TabsContent>

                            <TabsContent value="reviews" className="animate-in fade-in-50 slide-in-from-top-2">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-navy">Notes & Avis</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold">{averageRating.toFixed(1)} sur 5</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="px-4 py-1 text-sm">{pro.reviews.length} avis clients</Badge>
                                </div>
                                <ReviewList reviews={pro.reviews} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column: Booking Widget - 2 columns (40%) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
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
            <ModernFooter />
        </div>
    )
}
