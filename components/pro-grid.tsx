import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"

// Define a type for the Pro data we expect
export type ProCardData = {
    id: string
    name: string
    bio: string | null
    imageUrl: string | null
    city: string
    category: string
    priceRange: string | null
    rating?: number
}

interface ProGridProps {
    pros: ProCardData[]
}

export function ProGrid({ pros }: ProGridProps) {
    if (!pros || pros.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Aucun professionnel trouvé pour le moment.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pros.map((pro) => (
                <Card key={pro.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                        {/* Placeholder for actual image if missing, or use Next/Image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-4xl font-bold text-primary/20 uppercase">
                            {pro.name.substring(0, 2)}
                        </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <Badge variant="secondary" className="mb-2">{pro.category}</Badge>
                            {pro.rating && (
                                <div className="flex items-center text-amber-500 text-sm font-medium">
                                    <Star className="w-4 h-4 mr-1 fill-current" />
                                    {pro.rating}
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-xl line-clamp-1">{pro.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {pro.city}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {pro.bio || "Pas de biographie disponible."}
                        </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full">
                            <Link href={`/pros/${pro.id}`}>Voir le profil</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
