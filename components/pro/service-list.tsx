"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ToggleLeft, ToggleRight, Clock, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { removeProService, updateProService } from "@/app/lib/service-actions"

interface Service {
    id: string
    categoryId: string
    category: { name: string }
    description: string | null
    customPrice: number | null
    duration: number | null
    isActive: boolean
}

export function ServiceList({ services, hourlyRate }: {
    services: Service[]
    hourlyRate: number
}) {
    const handleDelete = async (categoryId: string, name: string) => {
        if (!confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return

        const result = await removeProService(categoryId)
        if (result.success) {
            toast.success("Service supprimé")
        } else {
            toast.error(result.error || "Erreur")
        }
    }

    const handleToggle = async (categoryId: string, currentStatus: boolean) => {
        const result = await updateProService(categoryId, { isActive: !currentStatus })
        if (result.success) {
            toast.success("Statut mis à jour")
        } else {
            toast.error(result.error || "Erreur")
        }
    }

    if (services.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-gray-500">
                    <p>Aucun service créé. Ajoutez-en un ci-dessus.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy">
                Services actifs ({services.filter(s => s.isActive).length})
            </h2>
            <div className="grid gap-4">
                {services.map((service) => {
                    const price = service.customPrice || hourlyRate
                    const duration = service.duration || 60

                    return (
                        <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-navy">
                                                {service.category.name}
                                            </h3>
                                            <Badge variant={service.isActive ? "default" : "secondary"}>
                                                {service.isActive ? "Actif" : "Inactif"}
                                            </Badge>
                                        </div>
                                        {service.description && (
                                            <p className="text-gray-600 text-sm mb-3">
                                                {service.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="font-semibold">{price} ₪</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span>{duration} min</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggle(service.categoryId, service.isActive)}
                                            title={service.isActive ? "Désactiver" : "Activer"}
                                        >
                                            {service.isActive ? (
                                                <ToggleRight className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(service.categoryId, service.category.name)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
