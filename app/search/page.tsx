import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, Star, ArrowLeft, Search } from "lucide-react"
import { Metadata } from "next"
import { ModernNavbar } from "@/components/modern-navbar"
import { auth } from "@/auth"

export const metadata: Metadata = {
    title: "Recherche de Professionnels",
    description: "Trouvez des professionnels francophones en Israël : coachs, thérapeutes, consultants et plus.",
}

async function getPros(query: string | undefined, city: string | undefined) {
    const where: any = {}

    if (city && city !== "all") {
        where.city = { name: city }
    }

    if (query) {
        where.OR = [
            { bio: { contains: query } },
            { user: { name: { contains: query } } },
            { serviceCategories: { some: { name: { contains: query } } } }
        ]
    }

    return await prisma.proProfile.findMany({
        where,
        include: {
            user: true,
            city: true,
            serviceCategories: true,
            reviews: true,
        },
    })
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; city?: string }>
}) {
    const session = await auth()
    const params = await searchParams
    const pros = await getPros(params.q, params.city)

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
            <ModernNavbar user={session?.user} />

            <main className="container mx-auto py-8 px-4 pt-24">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-navy">
                            {pros.length} Résultat{pros.length !== 1 && "s"}
                        </h1>
                        {(params.q || params.city) && (
                            <p className="text-sm text-muted-foreground">
                                {params.q && `Recherche : "${params.q}"`}
                                {params.q && params.city && " · "}
                                {params.city && `Ville : ${params.city}`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pros.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-navy mb-2">Aucun professionnel trouvé</h2>
                            <p className="text-muted-foreground mb-6">Essayez d'ajuster vos critères de recherche</p>
                            <Link href="/">
                                <Button className="bg-emerald-500 hover:bg-emerald-600">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour à l'accueil
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        pros.map((pro) => {
                            const avgRating = pro.reviews.length > 0
                                ? pro.reviews.reduce((sum, r) => sum + r.rating, 0) / pro.reviews.length
                                : 0

                            return (
                                <Card key={pro.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                                    {/* Gradient Header */}
                                    <div className="h-24 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
                                        <div className="absolute -bottom-6 left-6">
                                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-emerald-600 text-xl font-bold border-4 border-white shadow-lg">
                                                {pro.user.name?.[0] || "P"}
                                            </div>
                                        </div>
                                    </div>

                                    <CardHeader className="pt-8 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg font-bold text-navy">{pro.user.name}</CardTitle>
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {pro.city.name}
                                                </div>
                                            </div>
                                            {avgRating > 0 && (
                                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                                                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                                                    <span className="text-sm font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="py-2">
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {pro.serviceCategories.slice(0, 2).map(cat => (
                                                <span key={cat.id} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {pro.bio || "Professionnel certifié"}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="flex justify-between items-center border-t pt-4 bg-gray-50/50">
                                        <div className="font-bold text-navy">
                                            {pro.hourlyRate}₪ <span className="text-muted-foreground font-normal text-xs">/heure</span>
                                        </div>
                                        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-4">
                                            <Link href={`/pros/${pro.id}`}>Réserver</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })
                    )}
                </div>
            </main>
        </div>
    )
}
