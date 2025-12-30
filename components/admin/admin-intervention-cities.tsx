"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Check, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toggleWorkCity } from "@/app/lib/admin-actions"
import { toast } from "sonner"

interface City {
    id: string
    name: string
}

interface AdminInterventionCitiesProps {
    proId: string
    currentWorkCities: City[]
    allCities: City[]
}

export function AdminInterventionCities({ proId, currentWorkCities, allCities }: AdminInterventionCitiesProps) {
    const [search, setSearch] = useState("")
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [localWorkCities, setLocalWorkCities] = useState(currentWorkCities)

    const filteredCities = allCities.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 10) // Limit to 10 for performance/UI

    const handleToggle = async (cityId: string) => {
        setIsUpdating(cityId)
        const result = await toggleWorkCity(proId, cityId)
        setIsUpdating(null)

        if (result.success) {
            const city = allCities.find(c => c.id === cityId)
            if (!city) return

            const isAlreadyThere = localWorkCities.some(c => c.id === cityId)
            if (isAlreadyThere) {
                setLocalWorkCities(prev => prev.filter(c => c.id !== cityId))
                toast.success(`Ville retirée`)
            } else {
                setLocalWorkCities(prev => [...prev, city])
                toast.success(`Ville ajoutée`)
            }
        } else {
            toast.error("Erreur lors de la mise à jour")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Villes d'intervention actuelles
                </h3>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 min-h-[60px]">
                    {localWorkCities.length === 0 ? (
                        <span className="text-gray-400 text-sm italic">Aucune zone additionnelle</span>
                    ) : (
                        localWorkCities.map(city => (
                            <Badge
                                key={city.id}
                                className="bg-white text-navy border-gray-200 gap-1 pr-1 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                                onClick={() => handleToggle(city.id)}
                            >
                                {city.name}
                                <Plus className="w-3 h-3 rotate-45" />
                            </Badge>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-navy text-sm">Ajouter une zone</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher une ville..."
                        className="pl-10 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCities.map(city => {
                        const isSelected = localWorkCities.some(c => c.id === city.id)
                        return (
                            <div
                                key={city.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100 hover:border-gray-200'
                                    }`}
                                onClick={() => handleToggle(city.id)}
                            >
                                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-navy'}`}>
                                    {city.name}
                                </span>
                                {isUpdating === city.id ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : isSelected ? (
                                    <Check className="w-4 h-4 text-primary" />
                                ) : (
                                    <Plus className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
