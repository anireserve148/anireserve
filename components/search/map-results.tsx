"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ProResult } from "./home-results"
import { Star, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Fix for default marker icons in Leaflet + Next.js
if (typeof window !== 'undefined') {
    const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    })

    L.Marker.prototype.options.icon = DefaultIcon
}

interface MapResultsProps {
    pros: ProResult[]
}

export function MapResults({ pros }: MapResultsProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-gray-400 flex flex-col items-center gap-2">
                    <MapPin className="w-8 h-8" />
                    <p className="font-medium text-sm">Chargement de la carte...</p>
                </div>
            </div>
        )
    }

    // Focus exclusively on Israel
    const centerIsrael: [number, number] = [31.5, 34.8]
    const israelBounds: L.LatLngBoundsExpression = [
        [29.453, 34.208], // South (Eilat)
        [33.332, 35.895]  // North (Hermon)
    ]

    return (
        <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border relative group animate-in fade-in duration-500">
            <MapContainer
                center={centerIsrael}
                zoom={8}
                maxBounds={israelBounds}
                minZoom={7}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {pros.filter(pro => pro.latitude && pro.longitude).map((pro) => (
                    <Marker
                        key={pro.id}
                        position={[pro.latitude!, pro.longitude!]}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[200px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {pro.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-navy truncate">{pro.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{pro.city}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        {pro.categories.slice(0, 2).map((cat, i) => (
                                            <span key={i} className="text-[9px] bg-primary/5 text-primary px-1.5 py-0.5 rounded">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-[#3DBAA2]">{pro.hourlyRate}₪/h</span>
                                        {pro.rating && (
                                            <div className="flex items-center gap-0.5">
                                                <Star className="w-3 h-3 text-amber-500 fill-current" />
                                                <span className="font-bold">{pro.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Link href={`/pros/${pro.id}`} className="block">
                                    <Button size="sm" className="w-full bg-[#3DBAA2] hover:bg-[#34a08b] text-white text-[11px] h-8 rounded-lg shadow-sm">
                                        Voir le Profil <ExternalLink className="w-3 h-3 ml-1.5" />
                                    </Button>
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend/Info Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-md border border-white/20 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100">
                <p className="text-[11px] font-bold text-navy flex items-center gap-1.5 px-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {pros.filter(pro => pro.latitude && pro.longitude).length} Pros disponibles sur la carte
                </p>
            </div>
        </div>
    )
}
