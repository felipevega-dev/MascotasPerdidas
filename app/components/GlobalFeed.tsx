'use client';

import { useState, useEffect } from 'react';
import { Pet, getPets } from '../utils/storage';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './Badge';
import { MapPinIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface GlobalFeedProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalFeed({ isOpen, onClose }: GlobalFeedProps) {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);

    useEffect(() => {
        if (isOpen) {
            loadPets();
        }
    }, [isOpen]);

    const loadPets = async () => {
        setIsLoading(true);
        try {
            const allPets = await getPets();
            // Sort by creation date, most recent first
            const sorted = allPets.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setPets(sorted);
        } catch (error) {
            console.error('Error loading pets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        setDisplayCount(prev => prev + 10);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            
            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Feed Global</h2>
                        <p className="text-primary-100 text-sm mt-1">Últimas mascotas reportadas</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Cargando publicaciones...</p>
                        </div>
                    ) : pets.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No hay publicaciones aún</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {pets.slice(0, displayCount).map((pet) => (
                                    <Link
                                        key={pet.id}
                                        href={`/pet/${pet.id}`}
                                        className="block hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="p-4">
                                            <div className="flex gap-3">
                                                {/* Pet Image */}
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
                                                        <h3 className="font-bold text-gray-900 truncate">
                                                            {pet.name}
                                                        </h3>
                                                        <Badge status={pet.status} className="text-xs px-2 py-0.5" />
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate mb-2">
                                                        {pet.breed} • {pet.color}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                        <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{pet.lastSeenLocation.address.split(',').slice(0, 2).join(',')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        <span>{formatDistanceToNow(new Date(pet.createdAt), { addSuffix: true, locale: es })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {displayCount < pets.length && (
                                <div className="p-4 text-center border-t border-gray-200">
                                    <button
                                        onClick={loadMore}
                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                    >
                                        Cargar más ({pets.length - displayCount} restantes)
                                    </button>
                                </div>
                            )}

                            {displayCount >= pets.length && pets.length > 10 && (
                                <div className="p-4 text-center border-t border-gray-200">
                                    <p className="text-gray-400 text-sm">Has visto todas las publicaciones</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
