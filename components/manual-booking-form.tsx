"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createManualReservation } from "@/app/lib/manual-booking-actions"
import { CalendarPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ManualBookingFormProps {
    trigger?: React.ReactNode
}

export function ManualBookingForm({ trigger }: ManualBookingFormProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.date || !formData.startTime || !formData.endTime) {
            toast.error("Veuillez remplir tous les champs obligatoires")
            return
        }

        setIsLoading(true)
        try {
            // Combine date and time
            const startDate = new Date(`${formData.date}T${formData.startTime}:00`)
            const endDate = new Date(`${formData.date}T${formData.endTime}:00`)

            if (endDate <= startDate) {
                toast.error("L'heure de fin doit être après l'heure de début")
                setIsLoading(false)
                return
            }

            const result = await createManualReservation({
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                notes: formData.notes
            })

            if (result.success) {
                toast.success("Réservation créée avec succès !")
                setOpen(false)
                setFormData({
                    clientName: "",
                    clientEmail: "",
                    clientPhone: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    notes: ""
                })
            } else {
                toast.error(result.error || "Erreur lors de la création")
            }
        } catch (error) {
            toast.error("Une erreur inattendue est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-navy hover:bg-navy-light text-white">
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Créer une réservation
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer une réservation manuelle</DialogTitle>
                    <DialogDescription>
                        Ajoutez un rendez-vous pour un client. Si l'email n'existe pas, un compte sera créé automatiquement.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="clientName">Nom du client *</Label>
                        <Input
                            id="clientName"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="clientEmail">Email *</Label>
                        <Input
                            id="clientEmail"
                            type="email"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="clientPhone">Téléphone</Label>
                        <Input
                            id="clientPhone"
                            type="tel"
                            value={formData.clientPhone}
                            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startTime">Heure de début *</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endTime">Heure de fin *</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Informations complémentaires..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="bg-navy hover:bg-navy-light">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer la réservation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
