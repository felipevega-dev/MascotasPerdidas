'use client';

import dynamic from 'next/dynamic';
import { Pet } from '../utils/storage';

// Dynamically import PetMap with no SSR to avoid "window is not defined" error
const PetMap = dynamic(() => import('./PetMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mapa...</p>
            </div>
        </div>
    ),
});

interface PetMapWrapperProps {
    pets: Pet[];
    userLocation?: { lat: number; lng: number } | null;
    selectedPetId?: string;
    onPetSelect?: (pet: Pet) => void;
    onBoundsChange?: (bounds: any) => void;
}

export default function PetMapWrapper({ pets, userLocation, selectedPetId, onPetSelect, onBoundsChange }: PetMapWrapperProps) {
    return <PetMap pets={pets} userLocation={userLocation} selectedPetId={selectedPetId} onPetSelect={onPetSelect} onBoundsChange={onBoundsChange} />;
}
