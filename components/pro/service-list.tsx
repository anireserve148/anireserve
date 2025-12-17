"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ToggleLeft, ToggleRight, Clock, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { removeProService, toggleServiceActive } from "@/app/lib/service-actions"

interface Service {
    id: string
    name: string
    categoryId: string | null
    category: { name: string } | null
    description: string | null
    customPrice: number
    duration: number
    isActive: boolean
}

export function ServiceList({ services }: {
    services: Service[]
}) {
    const handleDelete = async (serviceId: string, name: string) => {
        if (!confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return

        const result = await removeProService(serviceId)
        if (result.success) {
            toast.success("Service supprimé")
        } else {
            toast.error(result.error || "Erreur")
        }
    }

    const handleToggle = async (serviceId: string) => {
        const result = await toggleServiceActive(serviceId)
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
                Vos services ({services.filter(s => s.isActive).length} actifs)
            </h2>
            <div className="grid gap-4">
                {services.map((service) => (
                    <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-navy">
                                            {service.name}
                                        </h3>
                                        <Badge variant={service.isActive ? "default" : "secondary"}>
                                            {service.isActive ? "Actif" : "Inactif"}
                                        </Badge>
                                    </div>
                                    {service.category && (
                                        <p className="text-sm text-gray-500 mb-2">
                                            Catégorie: {service.category.name}
                                        </p>
                                    )}
                                    {service.description && (
                                        <p className="text-gray-600 text-sm mb-3">
                                            {service.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-gray-700">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="font-semibold">{service.customPrice} ₪</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span>{service.duration} min</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggle(service.id)}
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
                                        onClick={() => handleDelete(service.id, service.name)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
