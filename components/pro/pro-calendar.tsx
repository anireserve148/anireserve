"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from "date-fns"
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

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

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
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-navy" />
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>Aujourd'hui</Button>
                    <div className="flex items-center rounded-md border">
                        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2 text-center text-sm font-medium text-gray-500">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                        <div key={day} className="py-2">{day}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 border rounded-lg overflow-hidden">
                    {/* Add empty slots for days before start of month if needed, simplified here to start from 1st */}
                    {/* Note: Ideally we'd calculate start of week vs start of month offset */}

                    {days.map((day) => {
                        const dayReservations = getReservationsForDay(day)
                        return (
                            <div
                                key={day.toISOString()}
                                className={`min-h-[100px] bg-white p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50
                                    ${isToday(day) ? 'bg-blue-50/50' : ''}
                                `}
                            >
                                <div className={`text-right text-xs mb-1 font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {format(day, 'd')}
                                </div>

                                {dayReservations.map((res, idx) => (
                                    <div
                                        key={res.id}
                                        className={`text-[10px] p-1 rounded truncate border-l-2
                                            ${res.status === 'CONFIRMED' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-yellow-50 border-yellow-500 text-yellow-700'}
                                        `}
                                        title={`${res.client.name} - ${format(res.startDate, 'HH:mm')}`}
                                    >
                                        <span className="font-bold">{format(res.startDate, 'HH:mm')}</span> {res.client.name}
                                    </div>
                                ))}
                                {dayReservations.length > 3 && (
                                    <div className="text-[10px] text-gray-400 text-center font-medium">
                                        + {dayReservations.length - 3} autres
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
