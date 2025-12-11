import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Star, Clock } from "lucide-react"
import { BookingWidget } from "@/components/booking-widget"

export default async function ProProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const pro = await prisma.proProfile.findUnique({
        where: { id },
        include: {
            user: true,
            city: true,
            serviceCategories: true,
            availability: true
        }
    })

    if (!pro) notFound()

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
                                    <h1 className="text-3xl font-bold">{pro.user.name}</h1>
                                    <div className="flex items-center text-muted-foreground mt-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {pro.city.name}, {pro.city.region}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">{pro.hourlyRate}€ <span className="text-sm font-normal text-muted-foreground">/hr</span></div>
                                    <div className="flex items-center justify-end text-sm font-medium mt-1">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                                        5.0 (24 reviews)
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
                </div>

                {/* Right Column: Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <BookingWidget proId={pro.id} availability={pro.availability} hourlyRate={pro.hourlyRate} />
                    </div>
                </div>
            </div>
        </div>
    )
}
