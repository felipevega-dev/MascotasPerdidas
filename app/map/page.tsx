'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getPets, Pet } from '../utils/storage';
import PetCard from '../components/PetCard';
import { Button } from '../components/Button';
import { MapIcon, ListBulletIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { getCurrentLocation } from '../utils/geolocation';

const PetMap = dynamic(() => import('../components/PetMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Loading map...</p>
        </div>
    ),
});

export default function MapPage() {
    const [view, setView] = useState<'map' | 'list'>('map');
    const [pets, setPets] = useState<Pet[]>([]);
    const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load pets
        const loadedPets = getPets();
        setPets(loadedPets);

        // Get user location
        getCurrentLocation()
            .then((coords) => {
                setCenter([coords.lat, coords.lng]);
            })
            .catch((err) => {
                console.error('Could not get location', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <main className="h-screen flex flex-col bg-gray-50">
            {/* Header / Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">Active Alerts</h1>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" />
                        Filters
                    </Button>
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setView('map')}
                            className={`p-2 rounded-md transition-all ${view === 'map' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <MapIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <ListBulletIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {view === 'map' ? (
                            <div className="h-full w-full">
                                <PetMap pets={pets} center={center} zoom={13} />
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                                    {pets.length > 0 ? (
                                        pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
                                    ) : (
                                        <div className="col-span-full text-center py-20">
                                            <p className="text-gray-500 text-lg">No active alerts in this area.</p>
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
