"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { addHours, format, setHours, setMinutes } from "date-fns"
import { fr } from "date-fns/locale"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2, Clock, Calendar as CalendarIcon, Star, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export function BookingWidget({ proId, availability, hourlyRate, reviews }: {
    proId: string,
    availability: any[],
    hourlyRate: number,
    reviews?: any[]
}) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isBooking, setIsBooking] = useState(false)

    // Calculate available slots for the selected date
    const getSlots = () => {
        if (!date) return []
        const dayOfWeek = date.getDay() // 0-6

        const rule = availability.find(a => a.dayOfWeek === dayOfWeek)
        if (!rule) return []

        const slots = []
        let start = parseInt(rule.startTime.split(':')[0])
        let end = parseInt(rule.endTime.split(':')[0])

        for (let h = start; h < end; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`)
        }
        return slots
    }

    const slots = getSlots()

    const handleBook = async () => {
        if (!date || !selectedSlot) return
        setIsBooking(true)

        const [h] = selectedSlot.split(':').map(Number)
        const startDate = setMinutes(setHours(date, h), 0)
        const endDate = addHours(startDate, 1) // 1 hour duration by default

        try {
            const result = await createReservation({ proId, startDate, endDate, totalPrice: hourlyRate })

            if (result.success) {
                toast.success('Demande de réservation envoyée avec succès !')
                setSelectedSlot(null)
            } else {
                toast.error(result.error || 'Erreur lors de la réservation')
            }
        } catch (e) {
            console.error(e)
            toast.error("Une erreur inattendue est survenue")
        } finally {
            setIsBooking(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Booking Calendar Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-primary/5">
                <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <CalendarIcon className="h-5 w-5" />
                        Réserver un Rendez-vous
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Modern Calendar */}
                    <div className="flex justify-center bg-white rounded-xl shadow-inner p-4 border border-primary/10">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date < new Date()}
                            locale={fr}
                            className="rounded-lg"
                        />
                    </div>

                    {/* Time Slots */}
                    {date && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                                <Clock className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-lg">
                                    {format(date, "EEEE d MMMM", { locale: fr })}
                                </h3>
                            </div>
                            {slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {slots.map(slot => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            size="lg"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`font-semibold transition-all duration-200 ${selectedSlot === slot
                                                    ? 'bg-gradient-to-r from-primary to-secondary shadow-lg scale-105'
                                                    : 'hover:scale-105 hover:border-primary'
                                                }`}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl border-2 border-dashed border-muted">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        😔 Aucune disponibilité ce jour
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Essayez un autre jour de la semaine
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Booking Summary */}
                    {selectedSlot && (
                        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6 rounded-xl border-2 border-primary/30 shadow-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Durée</p>
                                    <p className="text-lg font-bold">1 heure</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Total</p>
                                    <p className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        {hourlyRate}₪
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-primary/20">
                                <p className="text-sm font-medium text-center">
                                    📅 {format(date!, "EEEE d MMMM yyyy", { locale: fr })} à {selectedSlot}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/30 rounded-b-lg p-6">
                    <Button
                        className="w-full font-bold text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={!date || !selectedSlot || isBooking}
                        onClick={handleBook}
                        size="lg"
                    >
                        {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isBooking ? 'Envoi en cours...' : '✨ Demander une réservation'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Reviews Section */}
            <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-secondary to-primary text-white">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Star className="h-5 w-5 fill-current" />
                        Avis Clients
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-white to-muted/30 p-5 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                                                {review.clientName?.[0] || 'A'}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-lg">{review.clientName || 'Client'}</h4>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < (review.rating || 5)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>{review.date || 'Récemment'}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {review.comment || 'Excellent service, très professionnel !'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl">
                            <Star className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground font-medium">
                                Aucun avis pour le moment
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Soyez le premier à laisser un avis !
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
