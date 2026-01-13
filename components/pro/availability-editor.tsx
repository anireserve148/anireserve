"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Clock, Plus, Trash2, Coffee } from "lucide-react"
import { toast } from "sonner"
import { updateAvailability } from "@/app/lib/availability-actions"

const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
})

interface Break {
    start: string
    end: string
}

interface AvailabilitySlot {
    id?: string
    dayOfWeek: number
    isAvailable: boolean
    startTime: string
    endTime: string
    breaks?: Break[]
}

interface AvailabilityEditorProps {
    initialAvailability: AvailabilitySlot[]
    proProfileId: string
}

export function AvailabilityEditor({ initialAvailability, proProfileId }: AvailabilityEditorProps) {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>(() => {
        // Initialize all 7 days
        return dayLabels.map((_, index) => {
            const existing = initialAvailability.find(a => a.dayOfWeek === index)
            return existing || {
                dayOfWeek: index,
                isAvailable: false,
                startTime: "09:00",
                endTime: "18:00"
            }
        })
    })

    const [isSaving, setIsSaving] = useState(false)

    const toggleDay = (dayIndex: number) => {
        setAvailability(prev => prev.map(slot =>
            slot.dayOfWeek === dayIndex
                ? { ...slot, isAvailable: !slot.isAvailable }
                : slot
        ))
    }

    const updateTime = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
        setAvailability(prev => prev.map(slot =>
            slot.dayOfWeek === dayIndex
                ? { ...slot, [field]: value }
                : slot
        ))
    }

    const addBreak = (dayIndex: number) => {
        setAvailability(prev => prev.map(slot =>
            slot.dayOfWeek === dayIndex
                ? { ...slot, breaks: [...(slot.breaks || []), { start: "12:00", end: "13:00" }] }
                : slot
        ))
    }

    const removeBreak = (dayIndex: number, breakIndex: number) => {
        setAvailability(prev => prev.map(slot =>
            slot.dayOfWeek === dayIndex
                ? { ...slot, breaks: (slot.breaks || []).filter((_, i) => i !== breakIndex) }
                : slot
        ))
    }

    const updateBreak = (dayIndex: number, breakIndex: number, field: 'start' | 'end', value: string) => {
        setAvailability(prev => prev.map(slot => {
            if (slot.dayOfWeek === dayIndex && slot.breaks) {
                const newBreaks = [...slot.breaks]
                newBreaks[breakIndex] = { ...newBreaks[breakIndex], [field]: value }
                return { ...slot, breaks: newBreaks }
            }
            return slot
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateAvailability(proProfileId, availability)
            if (result.success) {
                toast.success("Disponibilités mises à jour !")
            } else {
                toast.error(result.error || "Erreur lors de la sauvegarde")
            }
        } catch {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Modifier mes horaires
                </CardTitle>
                <Button onClick={handleSave} disabled={isSaving} className="bg-turquoise hover:bg-turquoise/90">
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Sauvegarder
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {availability.map((slot) => (
                    <div
                        key={slot.dayOfWeek}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${slot.isAvailable
                            ? 'border-turquoise/30 bg-turquoise/5'
                            : 'border-border/50 bg-muted/20'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={slot.isAvailable}
                                onCheckedChange={() => toggleDay(slot.dayOfWeek)}
                            />
                            <span className={`font-medium min-w-[100px] ${slot.isAvailable ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {dayLabels[slot.dayOfWeek]}
                            </span>
                        </div>

                        {slot.isAvailable && (
                            <div className="flex items-center gap-2">
                                <Select
                                    value={slot.startTime}
                                    onValueChange={(v) => updateTime(slot.dayOfWeek, 'startTime', v)}
                                >
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-muted-foreground">à</span>
                                <Select
                                    value={slot.endTime}
                                    onValueChange={(v) => updateTime(slot.dayOfWeek, 'endTime', v)}
                                >
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Breaks Management */}
                        {slot.isAvailable && (
                            <div className="w-full mt-3 pl-8 space-y-2">
                                {slot.breaks && slot.breaks.length > 0 && (
                                    <div className="space-y-2">
                                        {slot.breaks.map((breakSlot, breakIndex) => (
                                            <div key={breakIndex} className="flex items-center gap-2 text-sm">
                                                <Coffee className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Pause:</span>
                                                <Select
                                                    value={breakSlot.start}
                                                    onValueChange={(v) => updateBreak(slot.dayOfWeek, breakIndex, 'start', v)}
                                                >
                                                    <SelectTrigger className="w-20 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timeSlots.map(time => (
                                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-xs text-muted-foreground">à</span>
                                                <Select
                                                    value={breakSlot.end}
                                                    onValueChange={(v) => updateBreak(slot.dayOfWeek, breakIndex, 'end', v)}
                                                >
                                                    <SelectTrigger className="w-20 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timeSlots.map(time => (
                                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => removeBreak(slot.dayOfWeek, breakIndex)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addBreak(slot.dayOfWeek)}
                                    className="h-8 text-xs"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Ajouter une pause
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
