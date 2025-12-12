"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateAvailability } from "@/app/lib/agenda-actions"
import { Loader2, Save, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

type TimeSlot = {
    id: string
    start: string
    end: string
}

export function AgendaEditor({ initialAvailability }: { initialAvailability: any[] }) {
    // Group slots by day - allow multiple slots per day
    const [schedule, setSchedule] = useState<Map<number, TimeSlot[]>>(() => {
        const map = new Map<number, TimeSlot[]>()
        initialAvailability.forEach(a => {
            if (a.dayOfWeek !== null) {
                const existing = map.get(a.dayOfWeek) || []
                existing.push({
                    id: a.id || crypto.randomUUID(),
                    start: a.startTime,
                    end: a.endTime
                })
                map.set(a.dayOfWeek, existing)
            }
        })
        return map
    })

    const [isSaving, setIsSaving] = useState(false)

    const addSlot = (dayIndex: number) => {
        const newSchedule = new Map(schedule)
        const existing = newSchedule.get(dayIndex) || []
        existing.push({
            id: crypto.randomUUID(),
            start: "09:00",
            end: "17:00"
        })
        newSchedule.set(dayIndex, existing)
        setSchedule(newSchedule)
    }

    const removeSlot = (dayIndex: number, slotId: string) => {
        const newSchedule = new Map(schedule)
        const existing = newSchedule.get(dayIndex) || []
        const filtered = existing.filter(s => s.id !== slotId)
        if (filtered.length === 0) {
            newSchedule.delete(dayIndex)
        } else {
            newSchedule.set(dayIndex, filtered)
        }
        setSchedule(newSchedule)
    }

    const updateSlotTime = (dayIndex: number, slotId: string, field: 'start' | 'end', value: string) => {
        const newSchedule = new Map(schedule)
        const existing = newSchedule.get(dayIndex) || []
        const updated = existing.map(s =>
            s.id === slotId ? { ...s, [field]: value } : s
        )
        newSchedule.set(dayIndex, updated)
        setSchedule(newSchedule)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const payload: { dayOfWeek: number; startTime: string; endTime: string }[] = []
            schedule.forEach((slots, day) => {
                slots.forEach(slot => {
                    payload.push({
                        dayOfWeek: day,
                        startTime: slot.start,
                        endTime: slot.end
                    })
                })
            })

            const result = await updateAvailability(payload)

            if (result.success) {
                toast.success('Disponibilités enregistrées avec succès')
            } else {
                toast.error(result.error || 'Erreur lors de l\'enregistrement')
            }
        } catch (e) {
            console.error(e)
            toast.error("Une erreur inattendue est survenue")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Disponibilité Hebdomadaire</CardTitle>
                <p className="text-sm text-muted-foreground">Ajoutez plusieurs créneaux par jour pour gérer vos pauses</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {DAYS.map((day, index) => {
                    const slots = schedule.get(index) || []
                    const hasSlots = slots.length > 0

                    return (
                        <div key={day} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${!hasSlots && "text-muted-foreground"}`}>
                                    {day}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSlot(index)}
                                    className="h-8"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Ajouter un créneau
                                </Button>
                            </div>

                            {!hasSlots && (
                                <p className="text-sm text-muted-foreground">Aucun créneau défini</p>
                            )}

                            {slots.map((slot, slotIndex) => (
                                <div key={slot.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-muted-foreground w-8">#{slotIndex + 1}</span>
                                    <Select value={slot.start} onValueChange={(v) => updateSlotTime(index, slot.id, 'start', v)}>
                                        <SelectTrigger className="w-[100px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm">à</span>
                                    <Select value={slot.end} onValueChange={(v) => updateSlotTime(index, slot.id, 'end', v)}>
                                        <SelectTrigger className="w-[100px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSlot(index, slot.id)}
                                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving} className="bg-navy hover:bg-navy-light">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Enregistrer les modifications
                </Button>
            </CardFooter>
        </Card>
    )
}
