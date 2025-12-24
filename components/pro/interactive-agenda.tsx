'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

interface Reservation {
    id: string
    startDate: string
    endDate: string
    status: string
    totalPrice: number
    client: {
        name: string
        email: string
    }
    service?: {
        name: string
    }
}

interface TimeSlot {
    time: string
    available: boolean
}

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

const statusColors: Record<string, string> = {
    'CONFIRMED': 'bg-green-500/20 text-green-700 border-green-500/30',
    'PENDING': 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    'COMPLETED': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    'CANCELLED': 'bg-red-500/20 text-red-700 border-red-500/30',
}

const statusLabels: Record<string, string> = {
    'CONFIRMED': 'Confirmé',
    'PENDING': 'En attente',
    'COMPLETED': 'Terminé',
    'CANCELLED': 'Annulé',
}

interface InteractiveAgendaProps {
    initialReservations: Reservation[]
    proProfileId: string
}

export function InteractiveAgenda({ initialReservations, proProfileId }: InteractiveAgendaProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

    // Form state for new reservation
    const [newReservation, setNewReservation] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        duration: '60',
    })

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
    const today = new Date()

    const goToPreviousWeek = () => {
        setCurrentWeekStart(prev => subWeeks(prev, 1))
    }

    const goToNextWeek = () => {
        setCurrentWeekStart(prev => addWeeks(prev, 1))
    }

    const goToToday = () => {
        setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))
    }

    const getReservationsForDay = (day: Date) => {
        return reservations.filter(r => isSameDay(new Date(r.startDate), day))
    }

    const getReservationAtTime = (day: Date, time: string) => {
        const [hours] = time.split(':').map(Number)
        return reservations.find(r => {
            const start = new Date(r.startDate)
            return isSameDay(start, day) && start.getHours() === hours
        })
    }

    const isSlotOccupied = (day: Date, time: string) => {
        return !!getReservationAtTime(day, time)
    }

    const handleSlotClick = (day: Date, time: string) => {
        const existingRes = getReservationAtTime(day, time)
        if (existingRes) {
            setSelectedReservation(existingRes)
            setShowDetailsModal(true)
        } else {
            setSelectedDay(day)
            setSelectedSlot(time)
            setShowAddModal(true)
        }
    }

    const handleAddReservation = async () => {
        if (!selectedDay || !selectedSlot || !newReservation.clientName || !newReservation.clientEmail) {
            return
        }

        setIsLoading(true)

        const [hours, minutes] = selectedSlot.split(':').map(Number)
        const startDate = new Date(selectedDay)
        startDate.setHours(hours, minutes, 0, 0)

        const duration = parseInt(newReservation.duration)
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

        try {
            const response = await fetch('/api/pro/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: newReservation.clientName,
                    clientEmail: newReservation.clientEmail,
                    clientPhone: newReservation.clientPhone,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setReservations(prev => [...prev, data])
                setShowAddModal(false)
                setNewReservation({ clientName: '', clientEmail: '', clientPhone: '', duration: '60' })
            }
        } catch (error) {
            console.error('Error adding reservation:', error)
        }

        setIsLoading(false)
    }

    const handleUpdateStatus = async (reservationId: string, status: string) => {
        try {
            const response = await fetch('/api/pro/reservations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId, status }),
            })

            if (response.ok) {
                setReservations(prev =>
                    prev.map(r => r.id === reservationId ? { ...r, status } : r)
                )
                setShowDetailsModal(false)
            }
        } catch (error) {
            console.error('Error updating reservation:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Agenda</h1>
                    <p className="text-muted-foreground">
                        Semaine du {format(currentWeekStart, 'd MMMM yyyy', { locale: fr })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Aujourd'hui
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid gap-2 lg:grid-cols-7">
                {weekDays.map((day) => {
                    const dayReservations = getReservationsForDay(day)
                    const isToday = isSameDay(day, today)
                    const isPast = day < today && !isToday

                    return (
                        <Card
                            key={day.toISOString()}
                            className={`
                                min-h-[300px] transition-all
                                ${isToday ? 'ring-2 ring-turquoise shadow-lg' : ''}
                                ${isPast ? 'opacity-60' : ''}
                            `}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className={`
                                    text-sm font-medium flex items-center justify-between
                                    ${isToday ? 'text-turquoise' : 'text-muted-foreground'}
                                `}>
                                    <span>{format(day, 'EEE d', { locale: fr })}</span>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                        {dayReservations.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 p-2">
                                {HOURS.map((time) => {
                                    const reservation = getReservationAtTime(day, time)
                                    const occupied = !!reservation

                                    return (
                                        <button
                                            key={time}
                                            onClick={() => !isPast && handleSlotClick(day, time)}
                                            disabled={isPast}
                                            className={`
                                                w-full text-left px-2 py-1.5 rounded text-xs transition-all
                                                ${occupied
                                                    ? statusColors[reservation.status] + ' border font-medium'
                                                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                                }
                                                ${isPast ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            `}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{time}</span>
                                                {occupied && (
                                                    <span className="truncate ml-1 max-w-[60px]">
                                                        {reservation.client.name?.split(' ')[0] || 'Client'}
                                                    </span>
                                                )}
                                                {!occupied && !isPast && (
                                                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {reservations.filter(r =>
                        weekDays.some(d => isSameDay(new Date(r.startDate), d))
                    ).length} rendez-vous cette semaine
                </div>
            </div>

            {/* Add Reservation Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle Réservation</DialogTitle>
                        <DialogDescription>
                            {selectedDay && selectedSlot && (
                                <span>
                                    {format(selectedDay, 'EEEE d MMMM', { locale: fr })} à {selectedSlot}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Nom du client *</Label>
                            <Input
                                id="clientName"
                                value={newReservation.clientName}
                                onChange={(e) => setNewReservation(prev => ({ ...prev, clientName: e.target.value }))}
                                placeholder="Jean Dupont"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientEmail">Email *</Label>
                            <Input
                                id="clientEmail"
                                type="email"
                                value={newReservation.clientEmail}
                                onChange={(e) => setNewReservation(prev => ({ ...prev, clientEmail: e.target.value }))}
                                placeholder="jean@exemple.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientPhone">Téléphone</Label>
                            <Input
                                id="clientPhone"
                                value={newReservation.clientPhone}
                                onChange={(e) => setNewReservation(prev => ({ ...prev, clientPhone: e.target.value }))}
                                placeholder="0501234567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Durée</Label>
                            <Select
                                value={newReservation.duration}
                                onValueChange={(value) => setNewReservation(prev => ({ ...prev, duration: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 heure</SelectItem>
                                    <SelectItem value="90">1h30</SelectItem>
                                    <SelectItem value="120">2 heures</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleAddReservation} disabled={isLoading}>
                            {isLoading ? 'Création...' : 'Créer la réservation'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reservation Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Détails de la Réservation</DialogTitle>
                    </DialogHeader>
                    {selectedReservation && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-turquoise/20 flex items-center justify-center">
                                    <User className="w-6 h-6 text-turquoise" />
                                </div>
                                <div>
                                    <p className="font-semibold">{selectedReservation.client.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedReservation.client.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedReservation.startDate), 'EEEE d MMMM', { locale: fr })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Heure</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedReservation.startDate), 'HH:mm')} -
                                        {format(new Date(selectedReservation.endDate), 'HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Prix</p>
                                    <p className="font-medium text-turquoise">{selectedReservation.totalPrice}₪</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Statut</p>
                                    <Badge className={statusColors[selectedReservation.status]}>
                                        {statusLabels[selectedReservation.status]}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                {selectedReservation.status === 'PENDING' && (
                                    <>
                                        <Button
                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                            onClick={() => handleUpdateStatus(selectedReservation.id, 'CONFIRMED')}
                                        >
                                            Confirmer
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => handleUpdateStatus(selectedReservation.id, 'CANCELLED')}
                                        >
                                            Annuler
                                        </Button>
                                    </>
                                )}
                                {selectedReservation.status === 'CONFIRMED' && (
                                    <Button
                                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                                        onClick={() => handleUpdateStatus(selectedReservation.id, 'COMPLETED')}
                                    >
                                        Marquer comme terminé
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
