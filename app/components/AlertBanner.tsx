'use client';

import { useState, useEffect } from 'react';
import { Pet } from '../utils/storage';
import Link from 'next/link';
import { BellAlertIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AlertBannerProps {
    newPets: Pet[];
    onDismiss: (petId: string) => void;
}

export default function AlertBanner({ newPets, onDismiss }: AlertBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (newPets.length > 0) {
            setIsVisible(true);
        }
    }, [newPets]);

    useEffect(() => {
        if (newPets.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % newPets.length);
            }, 5000); // Rotate every 5 seconds

            return () => clearInterval(interval);
        }
    }, [newPets.length]);

    if (!isVisible || newPets.length === 0) return null;

    const currentPet = newPets[currentIndex];

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slide-down">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-2xl p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center animate-pulse">
                            <BellAlertIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">¡Alerta Nueva!</h3>
                            {newPets.length > 1 && (
                                <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                                    {currentIndex + 1}/{newPets.length}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-white text-opacity-90">
                            <span className="font-semibold">{currentPet.name}</span> ({currentPet.breed}) se perdió{' '}
                            {formatDistanceToNow(new Date(currentPet.lastSeenDate), { addSuffix: true, locale: es })} en{' '}
                            <span className="font-semibold">{currentPet.lastSeenLocation.address.split(',')[0]}</span>
                        </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link
                            href={`/pet/${currentPet.id}`}
                            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all text-sm"
                        >
                            Ver Detalles
                        </Link>
                        <button
                            onClick={() => {
                                onDismiss(currentPet.id);
                                if (newPets.length === 1) {
                                    setIsVisible(false);
                                }
                            }}
                            className="text-white hover:text-opacity-80 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Progress dots */}
                {newPets.length > 1 && (
                    <div className="flex justify-center gap-1 mt-3">
                        {newPets.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${
                                    idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white bg-opacity-40'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
