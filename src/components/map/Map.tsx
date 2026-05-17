"use client";

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, startAt, endAt, getDocs, DocumentData, limit } from 'firebase/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import { Link } from '@/i18n/routing';

const customPin = new L.Icon({
    iconUrl: '/map-pin.png',
    iconSize: [50, 50], 
    iconAnchor: [25, 50], 
    popupAnchor: [0, -50] 
});

const DEFAULT_CENTER: [number, number] = [-25.4284, -49.2733];

const MapEventsController = ({ onBoundsChanged }: { onBoundsChanged: (center: [number, number], radiusInMeters: number) => void }) => {
    const map = useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            const bounds = map.getBounds();
            const radius = map.distance(center, bounds.getNorthEast());
            onBoundsChanged([center.lat, center.lng], radius);
        },
        load: () => {
             const center = map.getCenter();
             const bounds = map.getBounds();
             const radius = map.distance(center, bounds.getNorthEast());
             onBoundsChanged([center.lat, center.lng], radius);
        }
    });
    return null;
};

const Map = () => {
    const [pets, setPets] = useState<DocumentData[]>([]);

    const fetchPetsInRadius = useCallback(async (center: [number, number], radiusInMeters: number) => {
        const bounds = geohashQueryBounds(center, radiusInMeters);
        const promises = [];

        for (const b of bounds) {
            const q = query(
                collection(db, 'reports'),
                orderBy('geohash'),
                startAt(b[0]),
                endAt(b[1]),
                limit(10)
            );
            promises.push(getDocs(q));
        }

        try {
            const snapshots = await Promise.all(promises);
            const matchingDocs: DocumentData[] = [];

            for (const snap of snapshots) {
                for (const doc of snap.docs) {
                    const data = doc.data();
                    const lat = data.location.lat;
                    const lng = data.location.lng;

                    const distanceInKm = distanceBetween([lat, lng], center);
                    const distanceInM = distanceInKm * 1000;
                    
                    if (distanceInM <= radiusInMeters) {
                        matchingDocs.push({ id: doc.id, ...data });
                    }
                }
            }

            setPets(matchingDocs);
        } catch (error) {
            console.error("Erro ao buscar pins no mapa:", error);
        }
    }, []);

    useEffect(() => {
        fetchPetsInRadius(DEFAULT_CENTER, 5000);
    }, [fetchPetsInRadius]);

    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            className="h-full w-full rounded-lg"
            style={{ zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapEventsController onBoundsChanged={fetchPetsInRadius} />

            {pets.map((pet) => (
                <Marker key={pet.id} position={[pet.location.lat, pet.location.lng]} icon={customPin}>
                    <Popup className="rounded-xl">
                        <div className="text-center w-40">
                            {pet.images?.[0] && (
                                <img 
                                    src={pet.images[0].startsWith('http') ? pet.images[0] : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${pet.images[0]}`}
                                    alt={pet.title}
                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                />
                            )}
                            <strong className="text-brand-primary block text-sm">{pet.title}</strong>
                            <Link href={`/pet/${pet.id}`} className="text-xs text-blue-500 hover:underline mt-1 block">
                                Ver detalhes
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;