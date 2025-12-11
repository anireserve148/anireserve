"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateAvailability } from "@/app/lib/agenda-actions"
import { Loader2, Save } from "lucide-react"

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

export function AgendaEditor({ initialAvailability }: { initialAvailability: any[] }) {
    // Transform initial data to a simpler state
    // We assume 1 slot per day for MVP simplicity
    const [schedule, setSchedule] = useState(() => {
        const map = new Map()
        initialAvailability.forEach(a => {
            if (a.dayOfWeek !== null) map.set(a.dayOfWeek, { start: a.startTime, end: a.endTime, active: true })
        })
        return map
    })

    const [isSaving, setIsSaving] = useState(false)

    const toggleDay = (dayIndex: number) => {
        const newSchedule = new Map(schedule)
        if (newSchedule.has(dayIndex)) {
            newSchedule.delete(dayIndex)
        } else {
            newSchedule.set(dayIndex, { start: "09:00", end: "17:00", active: true })
        }
        setSchedule(newSchedule)
    }

    const updateTime = (dayIndex: number, field: 'start' | 'end', value: string) => {
        const newSchedule = new Map(schedule)
        const current = newSchedule.get(dayIndex)
        if (current) {
            newSchedule.set(dayIndex, { ...current, [field]: value })
            setSchedule(newSchedule)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload = Array.from(schedule.entries()).map(([day, times]) => ({
                dayOfWeek: day,
                startTime: times.start,
                endTime: times.end
            }))
            await updateAvailability(payload)
        } catch (e) {
            console.error(e)
            alert("Failed to save schedule")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Disponibilité Hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {DAYS.map((day, index) => {
                    const isActive = schedule.has(index)
                    const times = schedule.get(index) || { start: "09:00", end: "17:00" }

                    return (
                        <div key={day} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => toggleDay(index)}
                                    className="h-4 w-4"
                                />
                                <span className={`w-24 font-medium ${!isActive && "text-muted-foreground"}`}>{day}</span>
                            </div>

                            {isActive && (
                                <div className="flex items-center gap-2">
                                    <Select value={times.start} onValueChange={(v) => updateTime(index, 'start', v)}>
                                        <SelectTrigger className="w-[100px] h-8"> <SelectValue /> </SelectTrigger>
                                        <SelectContent>
                                            {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <span>to</span>
                                    <Select value={times.end} onValueChange={(v) => updateTime(index, 'end', v)}>
                                        <SelectTrigger className="w-[100px] h-8"> <SelectValue /> </SelectTrigger>
                                        <SelectContent>
                                            {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {!isActive && <span className="text-sm text-muted-foreground">Non disponible</span>}
                        </div>
                    )
                })}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Enregistrer les modifications
                </Button>
            </CardFooter>
        </Card>
    )
}
