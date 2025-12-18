"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarOff, Plus, Trash2, Loader2, Palmtree, Stethoscope, User, Calendar } from "lucide-react"
import { createBlockedPeriod, deleteBlockedPeriod, getBlockedPeriods } from "@/app/lib/blocked-period-actions"
import { toast } from "sonner"

interface BlockedPeriod {
    id: string
    startDate: Date
    endDate: Date
    reason: string | null
}

const REASONS = [
    { value: "vacances", label: "Vacances", icon: Palmtree },
    { value: "conge_maladie", label: "Congé maladie", icon: Stethoscope },
    { value: "personnel", label: "Personnel", icon: User },
    { value: "autre", label: "Autre", icon: Calendar },
]

export function BlockedPeriodsManager() {
    const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form state
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [reason, setReason] = useState("")

    useEffect(() => {
        loadBlockedPeriods()
    }, [])

    const loadBlockedPeriods = async () => {
        setIsLoading(true)
        const result = await getBlockedPeriods()
        if (result.success && result.data) {
            setBlockedPeriods(result.data)
        }
        setIsLoading(false)
    }

    const handleSubmit = async () => {
        if (!startDate || !endDate) {
            toast.error("Veuillez remplir les dates")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createBlockedPeriod({
                startDate,
                endDate,
                reason: reason || undefined
            })

            if (result.success) {
                toast.success("Période bloquée ajoutée !")
                setIsOpen(false)
                setStartDate("")
                setEndDate("")
                setReason("")
                loadBlockedPeriods()
            } else {
                toast.error(result.error || "Erreur lors de l'ajout")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const result = await deleteBlockedPeriod(id)
            if (result.success) {
                toast.success("Période supprimée")
                loadBlockedPeriods()
            } else {
                toast.error(result.error || "Erreur lors de la suppression")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getReasonDisplay = (reasonValue: string | null) => {
        if (!reasonValue) return null
        const found = REASONS.find(r => r.value === reasonValue)
        return found || { label: reasonValue, icon: Calendar }
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarOff className="w-5 h-5 text-orange-500" />
                        Périodes bloquées
                    </CardTitle>
                    <CardDescription>
                        Bloquez des périodes où vous n'êtes pas disponible (vacances, congés...)
                    </CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-navy hover:bg-navy-light">
                            <Plus className="w-4 h-4 mr-2" />
                            Bloquer une période
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bloquer une période</DialogTitle>
                            <DialogDescription>
                                Les clients ne pourront pas réserver pendant cette période.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">Date de début</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="endDate">Date de fin</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reason">Raison (optionnel)</Label>
                                <Select value={reason} onValueChange={setReason}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une raison" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REASONS.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                <div className="flex items-center gap-2">
                                                    <r.icon className="w-4 h-4" />
                                                    {r.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-navy hover:bg-navy-light">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Bloquer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : blockedPeriods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <CalendarOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucune période bloquée</p>
                        <p className="text-sm">Ajoutez vos vacances ou congés pour éviter les réservations.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {blockedPeriods.map((period) => {
                            const reasonInfo = getReasonDisplay(period.reason)
                            const ReasonIcon = reasonInfo?.icon || Calendar

                            return (
                                <div
                                    key={period.id}
                                    className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                                            <ReasonIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-navy dark:text-white">
                                                {formatDate(period.startDate)} → {formatDate(period.endDate)}
                                            </p>
                                            {reasonInfo && (
                                                <p className="text-sm text-gray-500">{reasonInfo.label}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(period.id)}
                                        disabled={deletingId === period.id}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        {deletingId === period.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
