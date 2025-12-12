"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { addHours, format, setHours, setMinutes } from "date-fns"
import { fr } from "date-fns/locale"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2, Clock, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"

export function BookingWidget({ proId, availability, hourlyRate }: { proId: string, availability: any[], hourlyRate: number }) {
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
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Réserver un Rendez-vous
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center border rounded-md p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        locale={fr}
                    />
                </div>

                {date && (
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Horaires disponibles - {format(date, "EEEE d MMMM", { locale: fr })}
                        </h3>
                        {slots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {slots.map(slot => (
                                    <Button
                                        key={slot}
                                        variant={selectedSlot === slot ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSlot(slot)}
                                        className="font-medium"
                                    >
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    Aucune disponibilité ce jour.
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Essayez un autre jour de la semaine
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {selectedSlot && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Durée</p>
                                <p className="font-semibold">1 heure</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-primary">{hourlyRate}₪</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {format(date!, "EEEE d MMMM", { locale: fr })} à {selectedSlot}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full font-semibold"
                    disabled={!date || !selectedSlot || isBooking}
                    onClick={handleBook}
                    size="lg"
                >
                    {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isBooking ? 'Envoi en cours...' : 'Demander une réservation'}
                </Button>
            </CardFooter>
        </Card>
    )
}
