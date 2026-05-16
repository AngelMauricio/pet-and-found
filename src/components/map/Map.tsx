"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customPin = new L.Icon({
    iconUrl: '/map-pin.png',
    iconSize: [50, 50], 
    iconAnchor: [25, 50], 
    popupAnchor: [0, -50] 
});

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default center: Curitiba
const DEFAULT_CENTER: [number, number] = [-25.4284, -49.2733];

const mockPets = [
    { id: 1, lat: -25.4428, lng: -49.2384, name: "Rex", desc: "Cachorro caramelo visto perto do Jardim Botânico" },
    { id: 2, lat: -25.4251, lng: -49.3082, name: "Mimi", desc: "Gatinha preta perto do Parque Barigui" },
    { id: 3, lat: -25.4102, lng: -49.2665, name: "Thor", desc: "Golden Retriever perdido no Museu do Olho" }
];

const Map = () => {
    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            className="h-full w-full rounded-lg"
            style={{ zIndex: 0 }} // Prevents Leaflet from overlapping your absolute Header/Modals
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mockPets.map((pet) => (
                <Marker key={pet.id} position={[pet.lat, pet.lng]} icon={customPin}>
                    <Popup>
                        <strong className="text-brand-primary">{pet.name}</strong><br />
                        {pet.desc}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;