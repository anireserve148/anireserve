"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ProResult } from "./home-results"
import { Star, MapPin, ExternalLink, Locate } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Component to center map on user location
function MapCenter({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, 12)
    }, [center, map])
    return null
}

// Create custom marker icon with pro photo
const createCustomMarkerIcon = (photoUrl?: string | null, isUser?: boolean) => {
    if (isUser) {
        // User location marker (blue dot)
        return L.divIcon({
            html: `<div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #2196F3;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(33,150,243,0.5);
            "></div>`,
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        })
    }

    const iconHtml = photoUrl
        ? `<div style="
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 3px solid #2EB190;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <img src="${photoUrl}" alt="Pro" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" />
          </div>`
        : `<div style="
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 3px solid #2EB190;
            background: linear-gradient(135deg, #2EB190 0%, #26a384 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: white;"></div>
          </div>`

    return L.divIcon({
        html: iconHtml,
        className: 'custom-pro-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44],
    })
}

interface MapResultsProps {
    pros: ProResult[]
}

export function MapResults({ pros }: MapResultsProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

    useEffect(() => {
        setIsMounted(true)

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    console.log('Geolocation error:', error)
                }
            )
        }
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

    // Default to Israel center, or user location if available
    const mapCenter: [number, number] = userLocation || [31.5, 34.8]
    const israelBounds: L.LatLngBoundsExpression = [
        [29.453, 34.208], // South (Eilat)
        [33.332, 35.895]  // North (Hermon)
    ]

    // Center on user location
    const centerOnUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    alert('Impossible d\'obtenir votre position')
                }
            )
        }
    }

    return (
        <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border relative group animate-in fade-in duration-500">
            <MapContainer
                center={mapCenter}
                zoom={userLocation ? 12 : 8}
                maxBounds={israelBounds}
                minZoom={7}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && <MapCenter center={userLocation} />}

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={createCustomMarkerIcon(null, true)}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <p className="font-bold text-sm">📍 Votre position</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Pro markers with photos */}
                {pros.filter(pro => pro.latitude && pro.longitude).map((pro) => (
                    <Marker
                        key={pro.id}
                        position={[pro.latitude!, pro.longitude!]}
                        icon={createCustomMarkerIcon(pro.image)}
                    >
                        <Popup className="custom-popup" maxWidth={250}>
                            <div className="p-2 min-w-[220px]">
                                <div className="flex items-center gap-3 mb-3">
                                    {pro.image ? (
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                                            <Image
                                                src={pro.image}
                                                alt={pro.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                                            {pro.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-navy">{pro.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {pro.city}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        {pro.categories.slice(0, 2).map((cat, i) => (
                                            <span key={i} className="text-[9px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-primary text-base">{pro.hourlyRate}₪/h</span>
                                        {pro.rating && (
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                                                <Star className="w-3 h-3 text-amber-500 fill-current" />
                                                <span className="font-bold text-xs">{pro.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Link href={`/pros/${pro.id}`} className="block">
                                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-9 rounded-xl shadow-sm">
                                        Voir le Profil <ExternalLink className="w-3 h-3 ml-1.5" />
                                    </Button>
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Center on user button */}
            <button
                onClick={centerOnUser}
                className="absolute bottom-6 right-6 z-[1000] bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110"
                title="Me localiser"
            >
                <Locate className="w-5 h-5 text-primary" />
            </button>

            {/* Legend/Info Overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100">
                <p className="text-[11px] font-bold text-navy flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    {pros.filter(pro => pro.latitude && pro.longitude).length} Pros sur la carte
                </p>
            </div>
        </div>
    )
}
