'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPinIcon, CalendarIcon, ChatBubbleLeftIcon, PhotoIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Sighting } from '../utils/storage';
import Image from 'next/image';

interface SightingsHistoryProps {
    sightings: Sighting[];
}

export default function SightingsHistory({ sightings }: SightingsHistoryProps) {
    const [expandedSightings, setExpandedSightings] = useState<Set<number>>(new Set([0])); // First one expanded by default

    if (!sightings || sightings.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPinIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin avistamientos aún</h3>
                <p className="text-gray-500 text-sm">
                    Sé el primero en reportar un avistamiento de esta mascota
                </p>
            </div>
        );
    }

    const toggleSighting = (index: number) => {
        const newExpanded = new Set(expandedSightings);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedSightings(newExpanded);
    };

    const sortedSightings = [...sightings].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                    Historial de Avistamientos
                </h3>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    {sightings.length} {sightings.length === 1 ? 'avistamiento' : 'avistamientos'}
                </span>
            </div>

            <div className="space-y-3">
                {sortedSightings.map((sighting, index) => {
                    const isExpanded = expandedSightings.has(index);
                    const sightingDate = new Date(sighting.date);

                    return (
                        <div
                            key={sighting.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors"
                        >
                            {/* Header - Always visible */}
                            <button
                                onClick={() => toggleSighting(index)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 text-left">
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <MapPinIcon className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {sighting.location.address || 'Ubicación no especificada'}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>{format(sightingDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
                                            {sighting.photo && (
                                                <>
                                                    <span>•</span>
                                                    <PhotoIcon className="h-4 w-4" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUpIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-4 py-4 space-y-4 bg-white">
                                    {/* Date and Time */}
                                    <div className="flex items-start gap-3">
                                        <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Fecha y hora</p>
                                            <p className="text-sm text-gray-600">
                                                {format(sightingDate, "EEEE d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-3">
                                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700">Ubicación</p>
                                            <p className="text-sm text-gray-600">{sighting.location.address}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {sighting.location.lat.toFixed(6)}, {sighting.location.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {sighting.notes && (
                                        <div className="flex items-start gap-3">
                                            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-700">Notas</p>
                                                <p className="text-sm text-gray-600 whitespace-pre-line">{sighting.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Photo */}
                                    {sighting.photo && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Foto del avistamiento</p>
                                            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                                                <Image
                                                    src={sighting.photo}
                                                    alt="Foto del avistamiento"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Reported By */}
                                    {sighting.reportedBy && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                Reportado por: <span className="font-medium text-gray-700">{sighting.reportedBy}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
