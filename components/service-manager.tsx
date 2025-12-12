"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addProService, removeProService, updateProService } from "@/app/lib/service-actions"
import { Plus, Trash2, Edit2, Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"

interface ProService {
    id: string
    categoryId: string
    category: { id: string; name: string }
    customPrice: number | null
    description: string | null
    duration: number | null
    isActive: boolean
}

interface ServiceManagerProps {
    services: ProService[]
    availableCategories: { id: string; name: string }[]
    defaultHourlyRate: number
}

export function ServiceManager({ services, availableCategories, defaultHourlyRate }: ServiceManagerProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [newService, setNewService] = useState({
        categoryId: "",
        customPrice: "",
        description: "",
        duration: ""
    })

    const handleAddService = async () => {
        if (!newService.categoryId) {
            toast.error("Veuillez sélectionner un service")
            return
        }

        setIsLoading(true)
        try {
            const result = await addProService({
                categoryId: newService.categoryId,
                customPrice: newService.customPrice ? parseFloat(newService.customPrice) : undefined,
                description: newService.description || undefined,
                duration: newService.duration ? parseInt(newService.duration) : undefined,
            })

            if (result.success) {
                toast.success("Service ajouté avec succès !")
                setIsAddDialogOpen(false)
                setNewService({ categoryId: "", customPrice: "", description: "", duration: "" })
                window.location.reload() // Refresh to show new service
            } else {
                toast.error(result.error || "Erreur lors de l'ajout")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveService = async (categoryId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir retirer ce service ?")) return

        try {
            const result = await removeProService(categoryId)
            if (result.success) {
                toast.success("Service retiré")
                window.location.reload()
            } else {
                toast.error(result.error || "Erreur")
            }
        } catch (error) {
            toast.error("Erreur")
        }
    }

    const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
        try {
            const result = await updateProService(categoryId, { isActive: !currentStatus })
            if (result.success) {
                toast.success(currentStatus ? "Service désactivé" : "Service activé")
                window.location.reload()
            }
        } catch (error) {
            toast.error("Erreur")
        }
    }

    // Filter out already added services
    const availableToAdd = availableCategories.filter(
        cat => !services.find(s => s.categoryId === cat.id)
    )

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Mes Services & Tarifs</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gérez vos prestations et définissez des prix personnalisés
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-navy hover:bg-navy-light">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter un service
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un service</DialogTitle>
                                <DialogDescription>
                                    Choisissez un service et personnalisez le tarif si nécessaire
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Service *</Label>
                                    <Select value={newService.categoryId} onValueChange={(v) => setNewService({ ...newService, categoryId: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableToAdd.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Prix personnalisé (₪/h)</Label>
                                    <Input
                                        type="number"
                                        placeholder={`Par défaut: ${defaultHourlyRate}₪`}
                                        value={newService.customPrice}
                                        onChange={(e) => setNewService({ ...newService, customPrice: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Durée typique (minutes)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 60"
                                        value={newService.duration}
                                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Décrivez ce service..."
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddService} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Ajouter
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {services.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Aucun service ajouté. Commencez par ajouter vos prestations.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {services.map(service => (
                            <div
                                key={service.id}
                                className={`border rounded-lg p-4 ${!service.isActive && 'opacity-50 bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-navy">{service.category.name}</h4>
                                            {!service.isActive && (
                                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Désactivé</span>
                                            )}
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p className="text-gray-600">
                                                <span className="font-medium">Prix:</span>{" "}
                                                {service.customPrice ? `${service.customPrice}₪/h` : `${defaultHourlyRate}₪/h (par défaut)`}
                                            </p>
                                            {service.duration && (
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Durée:</span> {service.duration} min
                                                </p>
                                            )}
                                            {service.description && (
                                                <p className="text-gray-600 italic">"{service.description}"</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(service.categoryId, service.isActive)}
                                        >
                                            {service.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveService(service.categoryId)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
