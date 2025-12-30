"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { addHours, format, setHours, setMinutes, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { createReservation } from "@/app/lib/booking-actions"
import { Loader2, Clock, Calendar as CalendarIcon, MapPin, Star, ChevronLeft, ChevronRight, X, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

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

const DAYS = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']

export function QuickBookModal({ open, onClose, pro }: QuickBookModalProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isBooking, setIsBooking] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [success, setSuccess] = useState(false)
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

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Add padding days for proper alignment (French calendar: Monday = 0, Sunday = 6)
    const startDayOfWeek = monthStart.getDay()
    // Convert Sunday=0 to 6, and shift others (Mon=1 -> 0, Tue=2 -> 1, etc.)
    const frenchDayIndex = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
    const paddingDays = Array(frenchDayIndex).fill(null)

    // Check if a day has availability
    const hasAvailability = (date: Date) => {
        const dayOfWeek = date.getDay()
        return availability.some(a => a.dayOfWeek === dayOfWeek)
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
        const startDate = setMinutes(setHours(selectedDate, h), 0)
        const endDate = addHours(startDate, 1)

        try {
            const result = await createReservation({ proId: pro.id, startDate, endDate, totalPrice: pro.hourlyRate })

            if (result.success) {
                setSuccess(true)
                // We keep the modal open to show the success state
                setTimeout(() => {
                    // Option to close automatically after 5s or stay until user clicks
                }, 5000)
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

    const isDateDisabled = (date: Date) => {
        return isBefore(startOfDay(date), startOfDay(new Date()))
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {!success && (
                        <DialogHeader>
                            <DialogTitle className="text-xl text-white flex items-center gap-2 font-bold pr-10">
                                <CalendarIcon className="w-5 h-5" />
                                Réserver {pro.name}
                            </DialogTitle>
                            <DialogDescription className="text-emerald-100 text-sm mt-1">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {pro.city}
                                    </span>
                                    {pro.rating && pro.rating > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> {pro.rating.toFixed(1)}
                                        </span>
                                    )}
                                    <span className="font-bold text-white">{pro.hourlyRate}₪/h</span>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 text-center space-y-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </motion.div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-800">Réservation Envoyée !</h3>
                                <p className="text-gray-500">
                                    Une demande a été envoyée à {pro.name}. Vous recevrez une notification dès qu'elle sera acceptée.
                                </p>
                            </div>
                            <div className="pt-4 space-y-3">
                                <Button
                                    asChild
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl py-6"
                                >
                                    <Link href="/dashboard">
                                        Voir mes réservations
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="w-full text-gray-400"
                                >
                                    Fermer
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="booking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="p-5 space-y-5">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Custom Calendar */}
                                        <div className="bg-white rounded-xl border shadow-sm">
                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                                <button
                                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <h3 className="font-bold text-gray-800 capitalize">
                                                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                                                </h3>
                                                <button
                                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>

                                            {/* Days Header */}
                                            <div className="grid grid-cols-7 gap-1 px-3 py-2 border-b bg-gray-50">
                                                {DAYS.map(day => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar Grid */}
                                            <div className="grid grid-cols-7 gap-1 p-3">
                                                {paddingDays.map((_, i) => (
                                                    <div key={`pad-${i}`} className="aspect-square" />
                                                ))}
                                                {calendarDays.map(day => {
                                                    const disabled = isDateDisabled(day)
                                                    const available = hasAvailability(day)
                                                    const selected = selectedDate && isSameDay(day, selectedDate)
                                                    const today = isToday(day)

                                                    return (
                                                        <button
                                                            key={day.toISOString()}
                                                            onClick={() => {
                                                                if (!disabled) {
                                                                    setSelectedDate(day)
                                                                    setSelectedSlot(null)
                                                                }
                                                            }}
                                                            disabled={disabled}
                                                            className={`
                                                                aspect-square rounded-lg text-sm font-medium transition-all
                                                                flex items-center justify-center relative
                                                                ${disabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'hover:bg-emerald-50 cursor-pointer'
                                                                }
                                                                ${selected
                                                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                                    : ''
                                                                }
                                                                ${today && !selected
                                                                    ? 'ring-2 ring-emerald-300 ring-inset'
                                                                    : ''
                                                                }
                                                                ${!disabled && available && !selected
                                                                    ? 'text-emerald-700 font-bold'
                                                                    : ''
                                                                }
                                                            `}
                                                        >
                                                            {format(day, 'd')}
                                                            {!disabled && available && !selected && (
                                                                <span className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full" />
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Time Slots */}
                                        {selectedDate && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                    <Clock className="w-4 h-4 text-emerald-500" />
                                                    {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                                                </div>

                                                {slots.length > 0 ? (
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {slots.map(slot => (
                                                            <Button
                                                                key={slot}
                                                                variant={selectedSlot === slot ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`text-sm font-semibold h-10 ${selectedSlot === slot
                                                                    ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500'
                                                                    : 'hover:border-emerald-400 hover:text-emerald-600'
                                                                    }`}
                                                            >
                                                                {slot}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                        <p className="text-gray-500 font-medium">
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
                                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Rendez-vous</p>
                                                        <p className="font-bold text-gray-800">
                                                            {format(selectedDate!, "d MMMM yyyy", { locale: fr })} à {selectedSlot}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                                                        <p className="text-2xl font-black text-emerald-600">{pro.hourlyRate}₪</p>
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
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-6 text-base rounded-xl shadow-lg shadow-emerald-200"
                                    disabled={!selectedDate || !selectedSlot || isBooking}
                                    onClick={handleBook}
                                >
                                    {isBooking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    {isBooking ? 'Envoi en cours...' : '✨ Confirmer la réservation'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
