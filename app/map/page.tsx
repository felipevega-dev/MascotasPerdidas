'use client';

import { useState, useEffect } from 'react';
import { MapIcon, ListBulletIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import PetMapWrapper from '../components/PetMapWrapper';
import PetCard from '../components/PetCard';
import Link from 'next/link';
import { getPets, Pet } from '../utils/storage';
import { getCurrentLocation } from '../utils/geolocation';

export default function MapPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [pets, setPets] = useState<Pet[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get user location first (parallel with pets)
                const [fetchedPets, location] = await Promise.allSettled([
                    getPets(),
                    getCurrentLocation()
                ]);

                if (fetchedPets.status === 'fulfilled') {
                    setPets(fetchedPets.value);
                } else {
                    console.error('Error fetching pets:', fetchedPets.reason);
                }

                if (location.status === 'fulfilled') {
                    setUserLocation(location.value);
                } else {
                    console.warn('Could not get user location. Using default location.', location.reason);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <main className="h-[calc(100vh-64px)] flex flex-col">
            {/* Header / Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Alertas Activas</h1>

                <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'map'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Vista de Mapa"
                        >
                            <MapIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Vista de Lista"
                        >
                            <ListBulletIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <Button variant="outline" size="sm">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtros
                    </Button>

                    <Link href="/report">
                        <Button size="sm">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Reportar Mascota
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-gray-50">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'map' ? (
                            <PetMapWrapper pets={pets} userLocation={userLocation} />
                        ) : (
                            <div className="h-full overflow-y-auto p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                                    {pets.map((pet) => (
                                        <PetCard key={pet.id} pet={pet} userLocation={userLocation} />
                                    ))}
                                    {pets.length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-gray-500 text-lg">No hay alertas activas en este momento.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
