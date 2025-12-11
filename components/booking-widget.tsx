"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { addHours, format, setHours, setMinutes, isSameDay } from "date-fns"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2 } from "lucide-react"

export function BookingWidget({ proId, availability, hourlyRate }: { proId: string, availability: any[], hourlyRate: number }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isBooking, setIsBooking] = useState(false)

    // Calculate available slots for the selected date
    // This is a simplified logic. Real logic needs to check existing reservations too.
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
            await createReservation(proId, startDate, endDate, hourlyRate)
        } catch (e) {
            console.error(e)
            alert("Booking failed. Please try again.")
            setIsBooking(false)
        }
    }

    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle>Réserver un Rendez-vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center border rounded-md p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                    />
                </div>

                {date && (
                    <div>
                        <h3 className="font-semibold mb-2">Horaires disponibles ({format(date, "d MMM")})</h3>
                        {slots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {slots.map(slot => (
                                    <Button
                                        key={slot}
                                        variant={selectedSlot === slot ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-destructive">Pas de disponibilité ce jour.</p>
                        )}
                    </div>
                )}

                {selectedSlot && (
                    <div className="bg-muted p-3 rounded-md flex justify-between items-center text-sm">
                        <span>Total (1 heure)</span>
                        <span className="font-bold text-lg">{hourlyRate}€</span>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!date || !selectedSlot || isBooking} onClick={handleBook}>
                    {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Demander une réservation
                </Button>
            </CardFooter>
        </Card>
    )
}
