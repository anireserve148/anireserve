'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Pro {
    id: string;
    user: {
        name: string;
        image: string | null;
    };
    latitude: number | null;
    longitude: number | null;
    hourlyRate: number;
    city: {
        name: string;
    };
}

interface ProMapWebProps {
    pros: Pro[];
    onMarkerClick?: (proId: string) => void;
}

// Fonction pour créer un marker custom avec photo
const createCustomIcon = (photoUrl?: string | null) => {
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
      ">
        <img src="${photoUrl}" alt="Pro" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" />
      </div>`
        : `<div style="
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 3px solid #2EB190;
        background: #2EB190;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: white;"></div>
      </div>`;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
    });
};

// Composant pour centrer la carte
function MapCenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 12);
    }, [center, map]);
    return null;
}

export default function ProMapWeb({ pros, onMarkerClick }: ProMapWebProps) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Filtrer les pros avec coordonnées
    const prosWithCoords = pros.filter(p => p.latitude && p.longitude);

    // Centre initial (Paris ou position utilisateur)
    const initialCenter: [number, number] = userLocation || [48.8566, 2.3522];

    useEffect(() => {
        // Demander géolocalisation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                }
            );
        }
    }, []);

    return (
        <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <MapContainer
                center={initialCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && <MapCenter center={userLocation} />}

                {prosWithCoords.map((pro) => (
                    <Marker
                        key={pro.id}
                        position={[pro.latitude!, pro.longitude!]}
                        icon={createCustomIcon(pro.user.image)}
                        eventHandlers={{
                            click: () => onMarkerClick?.(pro.id),
                        }}
                    >
                        <Popup>
                            <div style={{ padding: '8px', minWidth: '200px' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                                    {pro.user.name}
                                </h3>
                                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                                    📍 {pro.city.name}
                                </p>
                                <p style={{ margin: '4px 0', fontSize: '16px', fontWeight: 'bold', color: '#2EB190' }}>
                                    {pro.hourlyRate}₪/h
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
