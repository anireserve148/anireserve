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
    const [selectedService, setSelectedService] = useState<any | null>(null)
    const [isBooking, setIsBooking] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingServices, setIsLoadingServices] = useState(true)
    const [success, setSuccess] = useState(false)
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
    const [slots, setSlots] = useState<any[]>([])
    const [proServices, setProServices] = useState<any[]>([])

    // Fetch availability and services when modal opens
    useEffect(() => {
        if (open && pro.id) {
            setIsLoading(true)
            setIsLoadingServices(true)

            const from = startOfMonth(currentMonth).toISOString()
            const to = endOfMonth(currentMonth).toISOString()

            // Fetch availability
            fetch(`/api/availability?proId=${pro.id}&from=${from}&to=${to}`)
                .then(res => res.json())
                .then(data => {
                    setAvailability(data.availability || [])
                    setSlots(data.slots || [])
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false))

            // Fetch pro services
            fetch(`/api/pros/${pro.id}/services`)
                .then(res => res.json())
                .then(data => {
                    setProServices(data.services || [])
                    // Set first service as default if only one
                    if (data.services?.length === 1) {
                        setSelectedService(data.services[0])
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoadingServices(false))
        }
    }, [open, pro.id, currentMonth])

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
        return slots.some(slot => slot.available && isSameDay(new Date(slot.start), date))
    }

    // Calculate available slots for the selected date
    const daySlots = (() => {
        if (!selectedDate) return []

        return slots.filter(slot => isSameDay(new Date(slot.start), selectedDate))
    })()

    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) return
        setIsBooking(true)

        const [h] = selectedSlot.split(':').map(Number)
        const startDate = setMinutes(setHours(selectedDate, h), 0)
        // Duration from service or 1h default
        const duration = selectedService?.duration || 60
        const endDate = addHours(startDate, duration / 60)

        const totalPrice = selectedService ? selectedService.customPrice : pro.hourlyRate

        try {
            const result = await createReservation({
                proId: pro.id,
                startDate,
                endDate,
                totalPrice,
                serviceId: selectedService?.id
            })

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
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl max-h-[95vh] flex flex-col">
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
                            className="flex-1 flex flex-col min-h-0"
                        >
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                {isLoading || isLoadingServices ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                        <p className="text-gray-500 font-medium">Récupération des disponibilités...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Left Column: Calendar */}
                                        <div className="lg:col-span-7 space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4" /> 1. Choisir une date
                                                </h4>
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
                                            </div>
                                        </div>

                                        {/* Right Column: Prestation & Slots */}
                                        <div className="lg:col-span-5 space-y-8">
                                            {/* Prestation selection if multiple */}
                                            {proServices.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                        <Star className="w-4 h-4" /> 2. Choisir une prestation
                                                    </h4>
                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                        {proServices.map(service => (
                                                            <button
                                                                key={service.id}
                                                                onClick={() => setSelectedService(service)}
                                                                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedService?.id === service.id
                                                                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                                                                    : 'hover:border-gray-300 bg-white'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-bold text-navy text-sm">{service.name}</span>
                                                                    <span className="font-bold text-emerald-600">{service.customPrice}₪</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-500 font-medium">
                                                                    {service.duration} mins
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Time Slots */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> 3. Choisir un créneau
                                                </h4>
                                                {selectedDate ? (
                                                    daySlots.length > 0 ? (
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                                                            {daySlots.map(slot => {
                                                                const timeStr = format(new Date(slot.start), 'HH:mm')
                                                                const isAvailable = slot.available

                                                                return (
                                                                    <Button
                                                                        key={slot.start}
                                                                        variant={selectedSlot === timeStr ? "default" : "outline"}
                                                                        size="sm"
                                                                        disabled={!isAvailable}
                                                                        onClick={() => setSelectedSlot(timeStr)}
                                                                        className={`text-sm font-bold h-11 rounded-xl ${selectedSlot === timeStr
                                                                            ? 'bg-emerald-500 hover:bg-emerald-600 border-none shadow-md'
                                                                            : isAvailable
                                                                                ? 'hover:border-emerald-400 hover:text-emerald-600'
                                                                                : 'opacity-30 cursor-not-allowed bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        {timeStr}
                                                                    </Button>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                            <p className="text-gray-400 font-bold text-sm">Pas de disponibilité</p>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400 text-sm">
                                                        Sélectionnez d'abord une date
                                                    </div>
                                                )}
                                            </div>

                                            {/* Summary */}
                                            {selectedSlot && (
                                                <div className="bg-gradient-to-br from-navy/90 to-navy p-5 rounded-2xl text-white shadow-xl shadow-navy/10 relative overflow-hidden group">
                                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                                    <div className="relative z-10 flex justify-between items-end">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Récapitulatif</p>
                                                            <p className="text-sm font-bold leading-tight">
                                                                {selectedService?.name || 'Prestation'}<br />
                                                                <span className="text-[11px] text-gray-300 font-medium">
                                                                    {format(selectedDate!, "d MMMM yyyy", { locale: fr })} à {selectedSlot}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Total</p>
                                                            <p className="text-3xl font-black">{selectedService ? selectedService.customPrice : pro.hourlyRate}₪</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {!isLoading && !isLoadingServices && (
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
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
