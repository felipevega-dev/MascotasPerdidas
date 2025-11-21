'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pet } from '../utils/storage';
import Link from 'next/link';
import Image from 'next/image';

// Custom icons based on status
const createIcon = (status: string) => {
    const color = status === 'lost' ? 'red' : status === 'found' ? 'green' : 'yellow';
    // Using a simple colored marker for now. In production, could use custom SVG or DivIcon.
    // For this prototype, we'll use standard markers but maybe different colors if possible, 
    // or just the standard one for now to ensure it works.
    // Leaflet doesn't support changing color of default marker easily without custom images.
    // We'll stick to default for now but maybe add a class.

    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

interface PetMapProps {
    pets: Pet[];
    userLocation?: { lat: number; lng: number } | null;
}

export default function PetMap({ pets, userLocation }: PetMapProps) {
    // Default to a central location if no user location is available
    const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : pets.length > 0
            ? [pets[0].lastSeenLocation.lat, pets[0].lastSeenLocation.lng]
            : [40.4168, -3.7038]; // Madrid, Spain as default

    const zoom = 13;

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pets.map((pet) => (
                <Marker
                    key={pet.id}
                    position={[pet.lastSeenLocation.lat, pet.lastSeenLocation.lng]}
                    icon={createIcon(pet.status)}
                >
                    <Popup>
                        <div className="w-48">
                            <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                                {pet.photo ? (
                                    <Image src={pet.photo} alt={pet.name} fill className="object-cover" />
                                ) : (
                                    <div className="bg-gray-100 h-full w-full flex items-center justify-center text-xs">No Photo</div>
                                )}
                            </div>
                            <h3 className="font-bold text-lg">{pet.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{pet.breed}</p>
                            <Link href={`/pet/${pet.id}`} className="block w-full text-center bg-primary-600 text-white py-1 rounded text-sm hover:bg-primary-700">
                                View Details
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
