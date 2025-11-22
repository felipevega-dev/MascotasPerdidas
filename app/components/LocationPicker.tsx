'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from './Button';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { getCurrentLocation, getAddressFromCoordinates } from '../utils/geolocation';

// Dynamically import the MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
            <p className="text-gray-500">Loading map...</p>
        </div>
    ),
});

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    // Default to Spain (Madrid)
    const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]);

    useEffect(() => {
        // Try to get user's location on mount
        handleGetLocation();
    }, []);

    const handleGetLocation = async () => {
        setIsLoading(true);
        setError('');
        try {
            const coords = await getCurrentLocation();
            const newLocation = { lat: coords.lat, lng: coords.lng };
            setLocation(newLocation);
            setMapCenter([coords.lat, coords.lng]);

            const addr = await getAddressFromCoordinates(coords.lat, coords.lng);
            setAddress(addr);
            onLocationSelect({ ...newLocation, address: addr });
        } catch (error) {
            console.error('Error getting location:', error);
            setError('No se pudo obtener tu ubicación. Por favor, haz clic en el mapa para seleccionar la ubicación manualmente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMapClick = async (lat: number, lng: number) => {
        const newLocation = { lat, lng };
        setLocation(newLocation);

        const addr = await getAddressFromCoordinates(lat, lng);
        setAddress(addr);
        onLocationSelect({ ...newLocation, address: addr });
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetLocation}
                        isLoading={isLoading}
                        size="sm"
                    >
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Usar Mi Ubicación Actual
                    </Button>
                    {address && (
                        <p className="text-sm text-gray-600 truncate flex-1">
                            Seleccionado: <span className="font-medium text-gray-900">{address}</span>
                        </p>
                    )}
                </div>
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}
                {!location && !error && (
                    <p className="text-sm text-gray-500">
                        Haz clic en el mapa para marcar la última ubicación donde viste a tu mascota
                    </p>
                )}
            </div>

            <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <MapComponent
                    center={mapCenter}
                    zoom={13}
                    onLocationSelect={handleMapClick}
                    selectedLocation={location ? [location.lat, location.lng] : null}
                />
            </div>
        </div>
    );
}
