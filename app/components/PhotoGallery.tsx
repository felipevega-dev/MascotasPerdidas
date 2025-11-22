'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PhotoGalleryProps {
    photos: string[];
    petName: string;
}

export default function PhotoGallery({ photos, petName }: PhotoGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!photos || photos.length === 0) {
        return (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center text-gray-400">
                Sin fotos disponibles
            </div>
        );
    }

    const currentPhoto = photos[selectedIndex];

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    const openLightbox = () => {
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-4">
                {/* Main Photo */}
                <div className="relative h-96 w-full bg-gray-900 rounded-lg overflow-hidden group cursor-pointer" onClick={openLightbox}>
                    <Image
                        src={currentPhoto}
                        alt={`${petName} - Foto ${selectedIndex + 1}`}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        priority
                    />
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRightIcon className="h-6 w-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                {selectedIndex + 1} / {photos.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                        {photos.map((photo, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`
                                    relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                    ${index === selectedIndex
                                        ? 'border-primary-500 ring-2 ring-primary-200'
                                        : 'border-gray-200 hover:border-primary-300'
                                    }
                                `}
                            >
                                <Image
                                    src={photo}
                                    alt={`Miniatura ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={closeLightbox}>
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all z-10"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
                            <Image
                                src={currentPhoto}
                                alt={`${petName} - Foto ${selectedIndex + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                                >
                                    <ChevronLeftIcon className="h-8 w-8" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                                >
                                    <ChevronRightIcon className="h-8 w-8" />
                                </button>
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                                    {selectedIndex + 1} / {photos.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
