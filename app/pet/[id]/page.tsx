'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getPetById, Pet, addSighting } from '../../utils/storage';
import { generatePoster } from '../../utils/posterGenerator';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import SightingModal from '../../components/SightingModal';
import { MapPinIcon, PhoneIcon, PrinterIcon, ShareIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const PetMap = dynamic(() => import('../../components/PetMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
});

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [pet, setPet] = useState<Pet | null>(null);
    const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPet = () => {
            const foundPet = getPetById(resolvedParams.id);
            setPet(foundPet || null);
            setIsLoading(false);
        };
        loadPet();
    }, [resolvedParams.id]);

    const handleSightingSubmit = (sightingData: any) => {
        if (pet) {
            addSighting(pet.id, {
                id: crypto.randomUUID(),
                ...sightingData,
            });
            // Reload pet data
            const updatedPet = getPetById(pet.id);
            setPet(updatedPet || null);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!pet) return <div className="min-h-screen flex items-center justify-center">Pet not found</div>;

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header Image */}
            <div className="relative h-96 w-full bg-gray-900">
                {pet.photo ? (
                    <Image src={pet.photo} alt={pet.name} fill className="object-cover opacity-90" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No photo available</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute top-4 left-4">
                    <Link href="/map">
                        <Button variant="ghost" className="text-white hover:bg-white/20">
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Back to Map
                        </Button>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                    <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row justify-between items-end gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge status={pet.status} className="text-sm py-1 px-3" />
                                <span className="text-gray-300 text-sm">
                                    Posted {formatDistanceToNow(new Date(pet.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold mb-2">{pet.name}</h1>
                            <p className="text-xl text-gray-200">{pet.breed} • {pet.color}</p>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => generatePoster(pet)} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <PrinterIcon className="h-5 w-5 mr-2" />
                                Print Poster
                            </Button>
                            <Button onClick={() => setIsSightingModalOpen(true)} className="shadow-lg shadow-primary-500/50">
                                Report Sighting
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About {pet.name}</h2>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{pet.description}</p>

                            {pet.reward && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-4">
                                    <div className="text-3xl">💰</div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Reward Offered</p>
                                        <p className="text-2xl font-bold text-green-700">${pet.reward}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Last Seen Location</h2>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <MapPinIcon className="h-5 w-5 text-primary-600" />
                                <span>{pet.lastSeenLocation.address}</span>
                            </div>
                            <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                                <PetMap
                                    pets={[pet]}
                                    center={[pet.lastSeenLocation.lat, pet.lastSeenLocation.lng]}
                                    zoom={15}
                                />
                            </div>
                        </div>

                        {pet.sightings.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Sighting History</h2>
                                <div className="space-y-4">
                                    {pet.sightings.map((sighting) => (
                                        <div key={sighting.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="flex-shrink-0 mt-1">
                                                <MapPinIcon className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Sighted near {sighting.location.address}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDistanceToNow(new Date(sighting.date), { addSuffix: true })}
                                                </p>
                                                {sighting.notes && (
                                                    <p className="text-gray-600 mt-2 text-sm">{sighting.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Owner</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                        {pet.contactName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{pet.contactName}</p>
                                        <p className="text-xs text-gray-500">Owner</p>
                                    </div>
                                </div>

                                <a href={`tel:${pet.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                                    <PhoneIcon className="h-5 w-5" />
                                    {pet.contactPhone}
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Share Alert</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" size="sm" onClick={() => navigator.share({ title: `Help find ${pet.name}`, url: window.location.href })}>
                                    <ShareIcon className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => generatePoster(pet)}>
                                    <PrinterIcon className="h-4 w-4 mr-2" />
                                    Poster
                                </Button>
                            </div>
                        </div>
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
