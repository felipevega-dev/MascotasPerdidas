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
    const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]); // Default to London, but will update

    useEffect(() => {
        // Try to get user's location on mount
        handleGetLocation();
    }, []);

    const handleGetLocation = async () => {
        setIsLoading(true);
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
            // Fallback or show error
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
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    isLoading={isLoading}
                    size="sm"
                >
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    Use My Current Location
                </Button>
                {address && (
                    <p className="text-sm text-gray-600 truncate flex-1">
                        Selected: <span className="font-medium text-gray-900">{address}</span>
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
