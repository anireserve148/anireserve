"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { MapPin, Save, Crosshair } from "lucide-react"
import { updateProLocation } from "@/app/lib/admin-actions"
import { toast } from "sonner"

// Fix for default marker icons
if (typeof window !== 'undefined') {
    const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    })

    L.Marker.prototype.options.icon = DefaultIcon
}

interface AdminGeoConfigProps {
    proId: string
    initialLat?: number | null
    initialLng?: number | null
    proName: string
}

export function AdminGeoConfig({ proId, initialLat, initialLng, proName }: AdminGeoConfigProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : [32.0853, 34.7818]
    )
    const [isSaving, setIsSaving] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng])
            },
        })

        return position === null ? null : (
            <Marker position={position}></Marker>
        )
    }

    const handleSave = async () => {
        if (!position) return
        setIsSaving(true)
        const result = await updateProLocation(proId, position[0], position[1])
        setIsSaving(false)
        if (result.success) {
            toast.success("Position mise à jour avec succès")
        } else {
            toast.error("Erreur lors de la sauvegarde")
        }
    }

    if (!isMounted) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-xl" />

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-navy">Position Géo : {proName}</h3>
                </div>
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#3DBAA2] hover:bg-[#34a08b] text-white gap-2 rounded-full"
                >
                    <Save className="w-4 h-4" /> Enregistrer
                </Button>
            </div>

            <div className="h-[300px] w-full rounded-xl overflow-hidden border shadow-inner relative group">
                <MapContainer
                    center={position || [32.0853, 34.7818]}
                    zoom={13}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                </MapContainer>

                <div className="absolute top-2 right-2 z-[1000] pointer-events-none">
                    <Badge className="bg-white/90 text-navy border-none shadow-sm flex items-center gap-1">
                        <Crosshair className="w-3 h-3" /> Cliquer pour déplacer
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-2 rounded-lg border">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Latitude</p>
                    <p className="text-sm font-mono">{position?.[0].toFixed(6)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Longitude</p>
                    <p className="text-sm font-mono">{position?.[1].toFixed(6)}</p>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`px-2 py-1 rounded text-xs font-medium border ${className}`}>
            {children}
        </div>
    )
}
