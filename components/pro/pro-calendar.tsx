"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    isToday,
    startOfWeek,
    endOfWeek,
    isSameMonth
} from "date-fns"
import { fr } from "date-fns/locale"

interface Reservation {
    id: string
    startDate: Date | string
    endDate: Date | string
    status: string
    client: {
        name: string | null
    }
}

interface ProCalendarProps {
    reservations: Reservation[]
}

export function ProCalendar({ reservations }: ProCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const goToToday = () => setCurrentDate(new Date())

    // Get all days to display including padding days
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start on Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    // Normalize reservations dates
    const normalizedReservations = reservations.map(r => ({
        ...r,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate)
    }))

    const getReservationsForDay = (day: Date) => {
        return normalizedReservations.filter(r =>
            isSameDay(r.startDate, day) && r.status !== 'CANCELLED' && r.status !== 'REJECTED'
        )
    }

    return (
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToToday}
                        className="text-xs h-7 px-2 text-emerald-700 hover:bg-emerald-100"
                    >
                        Aujourd'hui
                    </Button>
                    <div className="flex items-center rounded-lg border bg-white">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3">
                {/* Days Header */}
                <div className="grid grid-cols-7 mb-1 text-center text-xs font-semibold text-gray-500">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div key={i} className="py-1">{day}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                    {allDays.map((day) => {
                        const dayReservations = getReservationsForDay(day)
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const hasReservations = dayReservations.length > 0

                        return (
                            <div
                                key={day.toISOString()}
                                className={`
                                    relative aspect-square p-1 rounded-lg transition-all text-center
                                    ${!isCurrentMonth ? 'opacity-30' : ''}
                                    ${isToday(day) ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'hover:bg-gray-50'}
                                    ${hasReservations ? 'bg-emerald-50' : ''}
                                `}
                            >
                                <div className={`
                                    text-xs font-medium
                                    ${isToday(day) ? 'text-emerald-700 font-bold' : 'text-gray-700'}
                                `}>
                                    {format(day, 'd')}
                                </div>

                                {hasReservations && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                        {dayReservations.slice(0, 3).map((res) => (
                                            <div
                                                key={res.id}
                                                className={`w-1.5 h-1.5 rounded-full ${res.status === 'CONFIRMED'
                                                        ? 'bg-emerald-500'
                                                        : 'bg-amber-400'
                                                    }`}
                                                title={`${res.client.name} - ${format(res.startDate, 'HH:mm')}`}
                                            />
                                        ))}
                                        {dayReservations.length > 3 && (
                                            <span className="text-[8px] text-gray-500">+{dayReservations.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Confirmé</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span>En attente</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
