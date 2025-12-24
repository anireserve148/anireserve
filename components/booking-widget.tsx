"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { addHours, format, setHours, setMinutes, isBefore, startOfDay, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2, Clock, Calendar as CalendarIcon, Star, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface Service {
    id: string
    name: string
    categoryId: string | null
    category: { name: string } | null
    customPrice: number
    duration: number
    description: string | null
}

export function BookingWidget({ proId, availability, hourlyRate, services, reviews }: {
    proId: string,
    availability: any[],
    hourlyRate: number,
    services?: Service[],
    reviews?: any[]
}) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [isBooking, setIsBooking] = useState(false)

    // Check if a day has availability
    const isDayAvailable = (date: Date) => {
        const dayOfWeek = date.getDay()
        // 0 is Sunday in JS, check if availability matches
        return availability.some(a => a.dayOfWeek === dayOfWeek)
    }

    // Disable past days and days without availability
    const isDateDisabled = (date: Date) => {
        return isBefore(date, startOfDay(new Date())) || !isDayAvailable(date)
    }

    // Calculate available slots for the selected date
    const getSlots = () => {
        if (!selectedDate) return []
        const dayOfWeek = selectedDate.getDay()

        const rule = availability.find(a => a.dayOfWeek === dayOfWeek)
        if (!rule) return []

        const slots = []
        const start = parseInt(rule.startTime.split(':')[0])
        const end = parseInt(rule.endTime.split(':')[0])

        for (let h = start; h < end; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`)
        }
        return slots
    }

    const slots = getSlots()

    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) return
        setIsBooking(true)

        const [h] = selectedSlot.split(':').map(Number)
        const duration = selectedService?.duration || 60
        const price = selectedService?.customPrice || hourlyRate

        const startDate = setMinutes(setHours(selectedDate, h), 0)
        const endDate = addHours(startDate, duration / 60)

        try {
            const result = await createReservation({
                proId,
                startDate,
                endDate,
                totalPrice: price,
                serviceId: selectedService?.id
            })

            if (result.success) {
                toast.success('Demande de réservation envoyée !')
                setSelectedSlot(null)
                setSelectedDate(undefined)
            } else {
                toast.error(result.error || 'Erreur lors de la réservation')
            }
        } catch (e) {
            console.error(e)
            toast.error("Une erreur est survenue")
        } finally {
            setIsBooking(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="sticky top-24 border-2 border-primary/10 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/90 to-secondary/90 text-white">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Réserver
                    </CardTitle>
                    <p className="text-sm text-white/90 mt-1">
                        {selectedService
                            ? `${selectedService.customPrice || hourlyRate} ₪`
                            : `À partir de ${hourlyRate} ₪`
                        }
                    </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Service Selection */}
                    {services && services.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-navy">Service</label>
                            <div className="grid gap-2">
                                {services.map((service) => {
                                    const price = service.customPrice
                                    const duration = service.duration
                                    const isSelected = selectedService?.id === service.id

                                    return (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service)}
                                            className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-navy">{service.name}</p>
                                                    {service.category && (
                                                        <p className="text-xs text-gray-500">{service.category.name}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">{price} ₪</p>
                                                    <p className="text-xs text-gray-500">{duration} min</p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Standard Calendar Component */}
                    <div className="flex justify-center bg-gray-50 rounded-xl p-2 border">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={isDateDisabled}
                            locale={fr}
                            className="rounded-md border-0"
                            classNames={{
                                head_cell: "text-muted-foreground font-normal text-[0.8rem] capitalize",
                            }}
                        />
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <Clock className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-navy capitalize">
                                    {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                                </h3>
                            </div>
                            {slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map(slot => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`font-semibold ${selectedSlot === slot
                                                ? 'bg-primary shadow-md'
                                                : 'hover:border-primary'
                                                }`}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                                    <p className="text-sm text-gray-500">Aucune disponibilité ce jour-là</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Booking Summary */}
                    {selectedSlot && selectedDate && (
                        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6 rounded-xl border-2 border-primary/30 shadow-md animate-in zoom-in-95">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Durée</p>
                                    <p className="text-lg font-bold">1 heure</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Total</p>
                                    <p className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        {selectedService?.customPrice || hourlyRate}₪
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-primary/20">
                                <p className="text-sm font-medium text-center">
                                    📅 {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} à {selectedSlot}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Book Button */}
                    <Button
                        onClick={handleBook}
                        disabled={!selectedDate || !selectedSlot || isBooking}
                        className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        {isBooking ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Réservation...
                            </>
                        ) : (
                            'Demander une réservation'
                        )}
                    </Button>
                </CardContent>
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
