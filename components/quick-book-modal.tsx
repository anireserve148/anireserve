"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { addHours, format, setHours, setMinutes } from "date-fns"
import { fr } from "date-fns/locale"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2, Clock, Calendar as CalendarIcon, MapPin, Star } from "lucide-react"
import { toast } from "sonner"

interface QuickBookModalProps {
    open: boolean
    onClose: () => void
    pro: {
        id: string
        name: string
        city: string
        hourlyRate: number
        categories: string[]
        rating?: number
    }
}

interface AvailabilitySlot {
    dayOfWeek: number
    startTime: string
    endTime: string
}

export function QuickBookModal({ open, onClose, pro }: QuickBookModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isBooking, setIsBooking] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([])

    // Fetch availability when modal opens
    useEffect(() => {
        if (open && pro.id) {
            setIsLoading(true)
            fetch(`/api/availability?proId=${pro.id}`)
                .then(res => res.json())
                .then(data => {
                    setAvailability(data.availability || [])
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false))
        }
    }, [open, pro.id])

    // Calculate available slots for the selected date
    const getSlots = () => {
        if (!date) return []
        const dayOfWeek = date.getDay()

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
        if (!date || !selectedSlot) return
        setIsBooking(true)

        const [h] = selectedSlot.split(':').map(Number)
        const startDate = setMinutes(setHours(date, h), 0)
        const endDate = addHours(startDate, 1)

        try {
            const result = await createReservation({ proId: pro.id, startDate, endDate, totalPrice: pro.hourlyRate })

            if (result.success) {
                toast.success('Demande de réservation envoyée !')
                onClose()
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-lg text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            Réserver {pro.name}
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100 text-sm">
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {pro.city}
                                </span>
                                {pro.rating && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> {pro.rating.toFixed(1)}
                                    </span>
                                )}
                                <span className="font-bold">{pro.hourlyRate}₪/h</span>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <>
                            {/* Calendar */}
                            <div className="flex justify-center bg-gray-50 rounded-xl p-3 border">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => { setDate(d); setSelectedSlot(null) }}
                                    disabled={(date) => date < new Date()}
                                    locale={fr}
                                    className="rounded-lg"
                                />
                            </div>

                            {/* Time Slots */}
                            {date && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                        {format(date, "EEEE d MMMM", { locale: fr })}
                                    </div>

                                    {slots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {slots.map(slot => (
                                                <Button
                                                    key={slot}
                                                    variant={selectedSlot === slot ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`text-sm font-medium ${selectedSlot === slot
                                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                                            : 'hover:border-emerald-300'
                                                        }`}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed">
                                            <p className="text-sm text-gray-500">
                                                Pas de disponibilité ce jour
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Essayez un autre jour
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Summary */}
                            {selectedSlot && (
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Rendez-vous</p>
                                            <p className="font-semibold text-sm">
                                                {format(date!, "d MMM yyyy", { locale: fr })} à {selectedSlot}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="text-xl font-bold text-emerald-600">{pro.hourlyRate}₪</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t">
                    <Button
                        className="w-full bg-emerald-500 hover:bg-emerald-600 font-semibold py-5"
                        disabled={!date || !selectedSlot || isBooking}
                        onClick={handleBook}
                    >
                        {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isBooking ? 'Envoi...' : '✨ Confirmer la réservation'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
