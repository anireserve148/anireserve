'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Check, Calendar } from 'lucide-react'

interface TimeSlot {
    start: string
    end: string
    available: boolean
}

interface SlotPickerProps {
    professionalId: string
    onSelectSlot: (slot: TimeSlot) => void
    selectedSlot?: TimeSlot | null
}

export function SlotPicker({ professionalId, onSelectSlot, selectedSlot }: SlotPickerProps) {
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSlots() {
            try {
                setLoading(true)
                const today = new Date().toISOString()
                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

                const response = await fetch(
                    `/api/availability?professionalId=${professionalId}&from=${today}&to=${nextWeek}`
                )

                if (!response.ok) {
                    throw new Error('Impossible de charger les créneaux')
                }

                const data = await response.json()
                setSlots(data.slots || [])
            } catch (err) {
                setError('Erreur lors du chargement des créneaux')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchSlots()
    }, [professionalId])

    // Group slots by date
    const slotsByDate = slots.reduce((acc, slot) => {
        const date = format(new Date(slot.start), 'yyyy-MM-dd')
        if (!acc[date]) acc[date] = []
        acc[date].push(slot)
        return acc
    }, {} as Record<string, TimeSlot[]>)

    const dates = Object.keys(slotsByDate)

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Choisir un créneau
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-red-500">
                    {error}
                </CardContent>
            </Card>
        )
    }

    if (slots.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun créneau disponible cette semaine</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Choisir un créneau
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date Picker */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map(date => (
                        <Button
                            key={date}
                            variant={selectedDate === date ? "default" : "outline"}
                            className="flex-shrink-0"
                            onClick={() => setSelectedDate(date)}
                        >
                            {format(new Date(date), 'EEE d MMM', { locale: fr })}
                        </Button>
                    ))}
                </div>

                {/* Time Slots Grid */}
                {selectedDate && slotsByDate[selectedDate] && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {slotsByDate[selectedDate].map((slot, index) => {
                            const isSelected = selectedSlot?.start === slot.start
                            const startTime = format(new Date(slot.start), 'HH:mm')
                            const endTime = format(new Date(slot.end), 'HH:mm')

                            return (
                                <Button
                                    key={index}
                                    variant={slot.available ? (isSelected ? "default" : "outline") : "ghost"}
                                    disabled={!slot.available}
                                    className={`
                    h-auto py-3 flex flex-col items-center gap-1
                    ${!slot.available && 'opacity-50 line-through bg-red-50 text-red-400'}
                    ${isSelected && 'ring-2 ring-primary'}
                  `}
                                    onClick={() => slot.available && onSelectSlot(slot)}
                                >
                                    <span className="font-semibold">{startTime}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {slot.available ? 'Dispo' : 'Occupé'}
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                </Button>
                            )
                        })}
                    </div>
                )}

                {!selectedDate && (
                    <p className="text-center text-muted-foreground py-4">
                        Sélectionnez une date ci-dessus
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
