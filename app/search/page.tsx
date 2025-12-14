import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" // We need to create this or perform a basic setup
import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Recherche de Professionnels",
    description: "Trouvez des professionnels francophones en Israël : coachs, thérapeutes, consultants et plus. Filtrez par ville et catégorie.",
    openGraph: {
        title: "Recherche | AniReserve",
        description: "Trouvez des professionnels francophones en Israël.",
    },
}

async function getPros(query: string | undefined, city: string | undefined) {
    const where: any = {}

    if (city && city !== "all") {
        where.city = { name: city }
    }

    if (query) {
        where.OR = [
            { bio: { contains: query } }, // Simple search in bio
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
        },
    })
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; city?: string }>
}) {
    const params = await searchParams
    const pros = await getPros(params.q, params.city)

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    {pros.length} Résultat{pros.length !== 1 && "s"}
                    {params.q && ` pour "${params.q}"`}
                    {params.city && ` à ${params.city}`}
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pros.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-20 text-lg">
                        Aucun professionnel trouvé. Essayez d'ajuster vos filtres.
                    </p>
                ) : (
                    pros.map((pro) => (
                        <Card key={pro.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-32 bg-secondary/30 relative">
                                {/* Espace réservé pour l'image de couverture */}
                                <div className="absolute bottom-[-20px] left-6">
                                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold border-4 border-background">
                                        {pro.user.name?.[0] || "P"}
                                    </div>
                                </div>
                            </div>
                            <CardHeader className="mt-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{pro.user.name}</CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {pro.city.name}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm font-semibold">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                                        5.0
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {pro.serviceCategories.map(cat => (
                                        <span key={cat.id} className="bg-accent px-2 py-1 rounded-md text-xs font-medium text-accent-foreground">
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {pro.bio || "Aucune bio disponible."}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center border-t pt-4">
                                <div className="font-semibold">
                                    {pro.hourlyRate}₪ <span className="text-muted-foreground font-normal text-xs">/h</span>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/pros/${pro.id}`}>Voir le profil</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
