'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShareIcon, PrinterIcon, PencilIcon, PhoneIcon, MapPinIcon, CalendarIcon, ChatBubbleLeftRightIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import SightingModal from '../../components/SightingModal';
import ChatWindow from '../../components/ChatWindow';
import ShareModal from '../../components/ShareModal';
import PosterModal from '../../components/PosterModal';
import PhotoGallery from '../../components/PhotoGallery';
import SightingsHistory from '../../components/SightingsHistory';
import { getPetById, Pet, addSighting } from '../../utils/storage';
import { getOrCreateConversation } from '../../utils/messaging';
import { formatReward } from '../../utils/currency';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Dynamic import for map to avoid SSR issues
const PetMapWrapper = dynamic(() => import('../../components/PetMapWrapper'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg" />
});

export default function PetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [pet, setPet] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
    const [chatConversationId, setChatConversationId] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

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

            // Send email notification to owner
            try {
                await fetch('/api/emails/sighting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: pet.contactEmail,
                        sightingData: {
                            petName: pet.name,
                            petBreed: pet.breed,
                            location: data.location.address,
                            notes: data.notes || 'Sin notas adicionales',
                            ownerName: pet.contactName,
                            petUrl: `${window.location.origin}/pet/${pet.id}`,
                        },
                    }),
                });
            } catch (error) {
                console.error('Error sending email notification:', error);
                // Don't block the flow if email fails
            }

            // Refresh pet data
            const updatedPet = await getPetById(pet.id);
            setPet(updatedPet || null);
            setIsSightingModalOpen(false);
        }
    };

    const handleShare = async () => {
        setIsShareModalOpen(true);
    };

    const handleOpenChat = async () => {
        if (!user) {
            toast.error('Debes iniciar sesión para enviar mensajes');
            return;
        }

        if (pet && pet.userId === user.uid) {
            toast.error('No puedes chatear con tu propia publicación');
            return;
        }

        if (pet && user) {
            try {
                const conversationId = await getOrCreateConversation(
                    pet.id,
                    pet.name,
                    pet.userId,
                    pet.contactName,
                    user.uid,
                    user.displayName || user.email || 'Usuario'
                );
                setChatConversationId(conversationId);
                setIsChatOpen(true);
            } catch (error) {
                console.error('Error opening chat:', error);
                toast.error('Error al abrir el chat');
            }
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
            {/* Hero Section with Info Overlay */}
            <div className="relative bg-gradient-to-br from-primary-600 to-primary-700">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Badge status={pet.status} className="text-sm px-3 py-1" />
                            {user && user.uid === pet.userId && (
                                <Link href="/my-pets">
                                    <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={handleShare}>
                                <ShareIcon className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Compartir</span>
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => setIsPosterModalOpen(true)}>
                                <PrinterIcon className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Cartel</span>
                            </Button>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{pet.name}</h1>
                    <p className="text-lg text-white/90">{pet.breed} • {pet.color} • {pet.size}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Photo Gallery */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <PhotoGallery 
                                photos={pet.photos && pet.photos.length > 0 ? pet.photos : [pet.photo]}
                                petName={pet.name}
                            />
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre {pet.name}</h2>
                            <p className="text-gray-600 whitespace-pre-line">{pet.description}</p>

                            {pet.distinguishingFeatures && (
                                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-amber-900 mb-2">🔍 Características distintivas</h3>
                                    <p className="text-sm text-amber-800">{pet.distinguishingFeatures}</p>
                                </div>
                            )}

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
                        {pet.sightings && pet.sightings.length > 0 ? (
                            <SightingsHistory sightings={pet.sightings} />
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <div className="text-center">
                                    <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin avistamientos aún</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Sé el primero en reportar si ves a {pet.name}
                                    </p>
                                    <div className="mt-6">
                                        <Button onClick={() => setIsSightingModalOpen(true)}>
                                            <MapPinIcon className="h-4 w-4 mr-2" />
                                            Reportar Avistamiento
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-primary-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contactar Dueño</h3>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                        {pet.contactName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{pet.contactName}</p>
                                        <p className="text-xs text-gray-500">Dueño</p>
                                    </div>
                                </div>

                                {user && user.uid !== pet.userId && (
                                    <Button className="w-full justify-center" onClick={handleOpenChat}>
                                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                                        Enviar Mensaje
                                    </Button>
                                )}

                                <a href={`tel:${pet.contactPhone}`} className="block">
                                    <Button variant="outline" className="w-full justify-center">
                                        <PhoneIcon className="h-5 w-5 mr-2" />
                                        {pet.contactPhone}
                                    </Button>
                                </a>

                                <Link href={`/pet/${pet.id}/qr`} className="block">
                                    <Button variant="outline" className="w-full justify-center">
                                        <QrCodeIcon className="h-5 w-5 mr-2" />
                                        Código QR
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Reward Card */}
                        {pet.reward && (
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white text-center">
                                <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Recompensa</p>
                                <p className="text-4xl font-extrabold mt-2">{formatReward(pet.reward, pet.rewardCurrency)}</p>
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

            {/* Poster Modal */}
            <PosterModal
                isOpen={isPosterModalOpen}
                onClose={() => setIsPosterModalOpen(false)}
                pet={pet}
            />

            {/* Share Modal */}
            {pet && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    pet={pet}
                />
            )}

            {/* Chat Window */}
            {isChatOpen && chatConversationId && pet && user && (
                <ChatWindow
                    conversationId={chatConversationId}
                    petId={pet.id}
                    petName={pet.name}
                    otherUserId={pet.userId}
                    otherUserName={pet.contactName}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </main>
    );
}
