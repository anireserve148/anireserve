"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { addHours, format, setHours, setMinutes, isBefore, startOfDay, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2, Clock, Calendar as CalendarIcon, Star, MessageSquare, Info, ChevronRight, LogIn } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Service {
    id: string
    name: string
    categoryId: string | null
    category: { name: string } | null
    customPrice: number
    duration: number
    description: string | null
}

// Default availability: Sunday-Thursday 9:00-18:00 (Israel work week)
const DEFAULT_AVAILABILITY = [
    { dayOfWeek: 0, startTime: "09:00", endTime: "18:00" }, // Sunday
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, // Monday
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, // Tuesday
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, // Wednesday
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" }, // Thursday
]

export function BookingWidget({ proId, availability, hourlyRate, services, reviews }: {
    proId: string,
    availability: any[],
    hourlyRate: number,
    services?: Service[],
    reviews?: any[]
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [isBooking, setIsBooking] = useState(false)

    // Use default availability if none configured
    const effectiveAvailability = availability && availability.length > 0 ? availability : DEFAULT_AVAILABILITY

    // Check if a day has availability
    const isDayAvailable = (date: Date) => {
        const dayOfWeek = date.getDay()
        return effectiveAvailability.some(a => a.dayOfWeek === dayOfWeek)
    }

    // Disable past days and days without availability
    const isDateDisabled = (date: Date) => {
        return isBefore(date, startOfDay(new Date())) || !isDayAvailable(date)
    }

    // Calculate available slots for the selected date
    const getSlots = () => {
        if (!selectedDate) return []
        const dayOfWeek = selectedDate.getDay()

        const rule = effectiveAvailability.find(a => a.dayOfWeek === dayOfWeek)
        if (!rule) return []

        const slots = []
        const start = parseInt(rule.startTime.split(':')[0])
        const end = parseInt(rule.endTime.split(':')[0])

        // Generate hourly slots
        for (let h = start; h < end; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`)
        }
        return slots
    }

    const slots = getSlots()

    const handleBook = async () => {
        // Check if user is logged in
        if (status === "unauthenticated" || !session?.user) {
            // Redirect to login with callback URL
            const callbackUrl = `/pros/${proId}`
            router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
            return
        }

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

    const isLoggedIn = status === "authenticated" && session?.user

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl ring-1 ring-primary/5">
                <CardHeader className="bg-gradient-to-br from-navy via-navy-light to-primary p-6 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold relative z-10">
                        <CalendarIcon className="h-5 w-5" />
                        Réserver un créneau
                    </CardTitle>
                    <p className="text-sm text-white/80 mt-1 relative z-10 font-medium">
                        Réponse garantie sous 24h
                    </p>
                </CardHeader>
                <CardContent className="p-6 space-y-8 bg-white">
                    {/* Service Selection */}
                    {services && services.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Choisissez votre prestation
                            </h3>
                            <div className="grid gap-3">
                                {services.slice(0, 3).map((service) => {
                                    const isSelected = selectedService?.id === service.id
                                    return (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all group relative overflow-hidden",
                                                isSelected
                                                    ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                                                    : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                                            )}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex-1">
                                                    <p className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-navy")}>{service.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{service.duration} min • {service.category?.name}</p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="font-extrabold text-base">{service.customPrice} ₪</p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                                {services.length > 3 && (
                                    <button className="text-xs text-primary font-bold text-center py-2 hover:underline">
                                        Voir les {services.length - 3} autres services
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Premium Calendar Component */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" />
                            Date du rendez-vous
                        </h3>
                        <div className="flex justify-center bg-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={isDateDisabled}
                                locale={fr}
                                className="rounded-md border-0 w-full"
                                classNames={{
                                    months: "flex flex-col space-y-4",
                                    month: "space-y-3",
                                    caption: "flex flex-col items-center pt-1 relative mb-2",
                                    caption_label: "text-sm font-bold mb-2",
                                    nav: "flex items-center gap-3",
                                    nav_button: "h-8 w-8 bg-white/80 hover:bg-white p-0 opacity-70 hover:opacity-100 border border-gray-200 hover:border-primary/30 rounded-lg transition-all",
                                    nav_button_previous: "relative",
                                    nav_button_next: "relative",
                                    table: "w-full border-collapse mt-2",
                                    head_row: "flex",
                                    head_cell: "text-muted-foreground font-bold text-xs uppercase h-10 w-10",
                                    row: "flex w-full mt-1",
                                    cell: "h-11 w-11 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-10 w-10 p-0 font-bold text-sm hover:bg-primary/10 rounded-full transition-all",
                                    day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-full shadow-lg shadow-primary/20 scale-110 z-10",
                                    day_today: "bg-secondary/20 text-secondary-foreground font-black ring-2 ring-secondary/30",
                                }}
                            />
                        </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Créneaux disponibles
                                </h3>
                                <span className="text-xs font-bold text-primary capitalize">
                                    {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                                </span>
                            </div>
                            {slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map(slot => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={cn(
                                                "font-bold text-xs h-10 rounded-lg transition-all",
                                                selectedSlot === slot
                                                    ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-105'
                                                    : 'border-gray-100 hover:border-primary/50'
                                            )}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-xs font-bold text-muted-foreground">Pas de disponibilité ce jour</p>
                                    <p className="text-xs text-muted-foreground mt-1">Essayez un autre jour</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Booking Summary Card */}
                    {selectedSlot && selectedDate && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-sm animate-in zoom-in-95 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-primary/10 transition-colors"></div>
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-1">Résumé</p>
                                    <p className="text-sm font-bold text-navy">
                                        {selectedService?.name || "Prestation standard"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {format(selectedDate, "dd/MM/yyyy")} • {selectedSlot}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary">
                                        {selectedService?.customPrice || hourlyRate}₪
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Total TTC</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button
                        onClick={handleBook}
                        disabled={!selectedDate || !selectedSlot || isBooking}
                        className="w-full h-14 bg-gradient-to-r from-navy to-primary text-white font-black text-base rounded-2xl shadow-xl shadow-navy/10 hover:shadow-2xl hover:shadow-navy/20 active:scale-95 transition-all border-none"
                    >
                        {isBooking ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Confirmation...
                            </>
                        ) : !isLoggedIn ? (
                            <span className="flex items-center gap-2">
                                <LogIn className="w-5 h-5" />
                                Se connecter pour réserver
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Réserver maintenant
                                <ChevronRight className="w-5 h-5" />
                            </span>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Help / Trust Card */}
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-navy">Avis Clients</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Ce professionnel a une note moyenne de <span className="font-bold text-navy">{reviews?.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0"}</span> basée sur {reviews?.length || 0} avis vérifiés.
                    </p>
                </div>
            </div>
        </div>
    )
}
