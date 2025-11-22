'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShareIcon, PrinterIcon, EyeIcon, PhoneIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import SightingModal from '../../components/SightingModal';
import { getPetById, Pet, addSighting } from '../../utils/storage';
import { generatePoster } from '../../utils/posterGenerator';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Dynamic import for map to avoid SSR issues
const PetMapWrapper = dynamic(() => import('../../components/PetMapWrapper'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg" />
});

export default function PetDetailPage() {
    const params = useParams();
    const [pet, setPet] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);

    useEffect(() => {
        const fetchPet = async () => {
            if (params.id) {
                setIsLoading(true);
                const foundPet = await getPetById(params.id as string);
                setPet(foundPet || null);
                setIsLoading(false);
            }
        };
        fetchPet();
    }, [params.id]);

    const handleSightingSubmit = async (data: any) => {
        if (pet) {
            const sighting = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                ...data
            };
            await addSighting(pet.id, sighting);

            // Refresh pet data
            const updatedPet = await getPetById(pet.id);
            setPet(updatedPet || null);
            setIsSightingModalOpen(false);
        }
    };

    const handleShare = async () => {
        if (!pet) return;

        const shareData = {
            title: `Ayuda a encontrar a ${pet.name} - PawAlert`,
            text: `${pet.name}, ${pet.breed} ${pet.color}, se perdió en ${pet.lastSeenLocation.address}. ¡Por favor ayuda a encontrarlo!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900">Mascota no encontrada</h1>
                <p className="text-gray-500 mt-2">El reporte que buscas no existe o ha sido eliminado.</p>
                <Link href="/map" className="mt-4">
                    <Button>Volver al Mapa</Button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Image */}
            <div className="relative h-96 w-full bg-gray-900">
                {pet.photo ? (
                    <Image
                        src={pet.photo}
                        alt={pet.name}
                        fill
                        className="object-contain"
                        priority
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Sin foto disponible
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-white container mx-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <Badge status={pet.status} className="mb-4 text-sm px-3 py-1" />
                            <h1 className="text-4xl font-bold">{pet.name}</h1>
                            <p className="text-lg opacity-90 mt-1">{pet.breed} • {pet.color}</p>
                        </div>
                        <div className="hidden sm:flex gap-3">
                            <Button variant="secondary" onClick={handleShare}>
                                <ShareIcon className="h-5 w-5 mr-2" />
                                Compartir
                            </Button>
                            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => generatePoster(pet)}>
                                <PrinterIcon className="h-5 w-5 mr-2" />
                                Imprimir Cartel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Actions Bar (Mobile) */}
                        <div className="bg-white rounded-xl shadow-sm p-4 flex sm:hidden justify-between gap-2">
                            <Button variant="secondary" size="sm" className="flex-1" onClick={handleShare}>
                                <ShareIcon className="h-4 w-4 mr-2" />
                                Compartir
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => generatePoster(pet)}>
                                <PrinterIcon className="h-4 w-4 mr-2" />
                                Cartel
                            </Button>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre {pet.name}</h2>
                            <p className="text-gray-600 whitespace-pre-line">{pet.description}</p>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="text-sm text-gray-500 block">Visto por última vez</span>
                                    <span className="font-medium text-gray-900 flex items-center mt-1">
                                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                                        {formatDistanceToNow(new Date(pet.lastSeenDate), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <span className="text-sm text-gray-500 block">Ubicación</span>
                                    <span className="font-medium text-gray-900 flex items-center mt-1">
                                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                        {pet.lastSeenLocation.address.split(',')[0]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 overflow-hidden">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación del Reporte</h2>
                            <div className="h-80 rounded-lg overflow-hidden border border-gray-200">
                                <PetMapWrapper
                                    pets={[pet]}
                                    userLocation={null}
                                />
                            </div>
                        </div>

                        {/* Sightings Timeline */}
                        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Historial de Avistamientos</h2>
                                <Button size="sm" onClick={() => setIsSightingModalOpen(true)}>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Reportar Avistamiento
                                </Button>
                            </div>

                            {pet.sightings && pet.sightings.length > 0 ? (
                                <div className="flow-root">
                                    <ul role="list" className="-mb-8">
                                        {pet.sightings.map((sighting, eventIdx) => (
                                            <li key={sighting.id}>
                                                <div className="relative pb-8">
                                                    {eventIdx !== pet.sightings.length - 1 ? (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                                <EyeIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    Avistado en <span className="font-medium text-gray-900">{sighting.location.address.split(',')[0]}</span>
                                                                </p>
                                                                {sighting.notes && (
                                                                    <p className="mt-1 text-sm text-gray-600">"{sighting.notes}"</p>
                                                                )}
                                                            </div>
                                                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                                <time dateTime={sighting.date}>{formatDistanceToNow(new Date(sighting.date), { addSuffix: true, locale: es })}</time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin avistamientos aún</h3>
                                    <p className="mt-1 text-sm text-gray-500">Sé el primero en reportar si ves a {pet.name}.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-primary-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contactar Dueño</h3>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                        {pet.contactName.charAt(0)}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{pet.contactName}</p>
                                        <p className="text-xs text-gray-500">Dueño</p>
                                    </div>
                                </div>

                                <a href={`tel:${pet.contactPhone}`} className="block">
                                    <Button className="w-full justify-center">
                                        <PhoneIcon className="h-5 w-5 mr-2" />
                                        Llamar: {pet.contactPhone}
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Reward Card */}
                        {pet.reward && (
                            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white text-center">
                                <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Recompensa</p>
                                <p className="text-4xl font-extrabold mt-2">${pet.reward}</p>
                                <p className="text-sm mt-2 opacity-90">Por regreso seguro</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SightingModal
                isOpen={isSightingModalOpen}
                onClose={() => setIsSightingModalOpen(false)}
                onSubmit={handleSightingSubmit}
            />
        </main>
    );
}
