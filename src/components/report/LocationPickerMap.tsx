"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuração do Pin
const customPin = new L.Icon({
    iconUrl: '/map-pin.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
});

interface LocationPickerProps {
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
    initialLocation?: { lat: number; lng: number } | null; // <-- 1. Adicionar na interface
}

// Subcomponente para lidar com cliques no mapa
const LocationMarker = ({ position, setPosition, onLocationSelect }: any) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customPin}></Marker>
    );
};

// Subcomponente para forçar o mapa a ir para o local inicial na edição
const MapController = ({ center }: { center: { lat: number; lng: number } | null }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], 15);
        }
    }, [center, map]);
    return null;
};

export default function LocationPickerMap({ onLocationSelect, initialLocation }: LocationPickerProps) {
    // 2. O estado inicial usa o initialLocation (se existir)
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialLocation || null);

    // Default: Curitiba
    const defaultCenter: [number, number] = [-25.4284, -49.2733];
    const centerToUse = initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter;

    return (
        <div className="h-72 w-full rounded-xl overflow-hidden border border-sand-300 relative z-0">
            <MapContainer 
                center={centerToUse as [number, number]} 
                zoom={initialLocation ? 15 : 12} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Reposiciona o mapa se um initialLocation for detectado */}
                <MapController center={initialLocation || null} />

                <LocationMarker 
                    position={position} 
                    setPosition={setPosition} 
                    onLocationSelect={onLocationSelect} 
                />
            </MapContainer>
        </div>
    );
}