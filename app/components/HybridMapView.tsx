'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pet } from '../utils/storage';
import PetMapWrapper from './PetMapWrapper';
import { Badge } from './Badge';
import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, CalendarIcon, PhoneIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface HybridMapViewProps {
    pets: Pet[];
    userLocation: { lat: number; lng: number } | null;
}

export default function HybridMapView({ pets, userLocation }: HybridMapViewProps) {
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [hoveredPet, setHoveredPet] = useState<string | null>(null);
    const [mapBounds, setMapBounds] = useState<any>(null);

    // Filter pets within visible map bounds
    const visiblePets = useMemo(() => {
        if (!mapBounds) return pets;
        
        return pets.filter(pet => {
            const lat = pet.lastSeenLocation.lat;
            const lng = pet.lastSeenLocation.lng;
            
            return (
                lat >= mapBounds.south &&
                lat <= mapBounds.north &&
                lng >= mapBounds.west &&
                lng <= mapBounds.east
            );
        });
    }, [pets, mapBounds]);

    const handlePetClick = (pet: Pet) => {
        setSelectedPet(pet);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar with list */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">
                        Mascotas en el Área
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {visiblePets.length} {visiblePets.length === 1 ? 'mascota' : 'mascotas'} en la vista actual
                    </p>
                </div>

                {/* Pet List */}
                <div className="flex-1 overflow-y-auto">
                    {visiblePets.length === 0 ? (
                        <div className="p-8 text-center">
                            <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                No hay mascotas en esta área del mapa.
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                                Mueve el mapa para explorar otras ubicaciones
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {visiblePets.map((pet) => (
                                <div
                                    key={pet.id}
                                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                        selectedPet?.id === pet.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                                    } ${hoveredPet === pet.id ? 'bg-gray-50' : ''}`}
                                    onClick={() => handlePetClick(pet)}
                                    onMouseEnter={() => setHoveredPet(pet.id)}
                                    onMouseLeave={() => setHoveredPet(null)}
                                >
                                    <div className="flex gap-3">
                                        {/* Pet Image */}
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            {pet.photo ? (
                                                <Image
                                                    src={pet.photo}
                                                    alt={pet.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    Sin foto
                                                </div>
                                            )}
                                        </div>

                                        {/* Pet Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {pet.name}
                                                </h3>
                                                <Badge status={pet.status} className="text-xs px-2 py-0.5" />
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {pet.breed} • {pet.color}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                <CalendarIcon className="h-3 w-3" />
                                                <span>{formatDistanceToNow(new Date(pet.lastSeenDate), { addSuffix: true, locale: es })}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 truncate">
                                                <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{pet.lastSeenLocation.address.split(',')[0]}</span>
                                            </div>
                                        </div>

                                        <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <PetMapWrapper
                    pets={pets}
                    userLocation={userLocation}
                    selectedPetId={selectedPet?.id}
                    onPetSelect={handlePetClick}
                    onBoundsChange={setMapBounds}
                />

                {/* Selected Pet Card Overlay */}
                {selectedPet && (
                    <div className="absolute bottom-6 left-6 right-6 max-w-md mx-auto">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4">
                            <div className="flex gap-4">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    {selectedPet.photo ? (
                                        <Image
                                            src={selectedPet.photo}
                                            alt={selectedPet.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            Sin foto
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{selectedPet.name}</h3>
                                            <p className="text-sm text-gray-600">{selectedPet.breed} • {selectedPet.color}</p>
                                        </div>
                                        <Badge status={selectedPet.status} />
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {selectedPet.description}
                                    </p>

                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/pet/${selectedPet.id}`}
                                            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center"
                                        >
                                            Ver Detalles
                                        </Link>
                                        <a
                                            href={`tel:${selectedPet.contactPhone}`}
                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <PhoneIcon className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPet(null)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
