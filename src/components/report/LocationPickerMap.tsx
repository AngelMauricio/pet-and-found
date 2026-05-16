"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customPin = new L.Icon({
    iconUrl: '/map-pin.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
});

const DEFAULT_CENTER: [number, number] = [-25.4284, -49.2733];

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number }) => void;
}

// Helper component to handle map clicks
const LocationMarker = ({ onLocationSelect }: LocationPickerProps) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customPin} />
    );
};

const LocationPickerMap = ({ onLocationSelect }: LocationPickerProps) => {
    return (
        <MapContainer 
            center={DEFAULT_CENTER} 
            zoom={12} 
            className="h-72 w-full rounded-xl border border-sand-300 z-0"
            style={{ zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
};

export default LocationPickerMap;