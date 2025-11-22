'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPets, updatePet, Pet } from '../utils/storage';
import PetCard from '../components/PetCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { Button } from '../components/Button';
import Link from 'next/link';
import { PlusIcon, CheckCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import EditPetModal from '../components/EditPetModal';

export default function MyPetsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [myPets, setMyPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            toast.error('Debes iniciar sesión para ver tus reportes');
            return;
        }

        if (user) {
            loadMyPets();
        }
    }, [user, authLoading, router]);

    const loadMyPets = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const allPets = await getPets();
            const filtered = allPets.filter(pet => pet.userId === user.uid);
            setMyPets(filtered);
        } catch (error) {
            console.error('Error loading pets:', error);
            toast.error('Error al cargar tus reportes');
        } finally {
            setIsLoading(false);
        }
    };

    const markAsFound = async (petId: string) => {
        const pet = myPets.find(p => p.id === petId);
        if (!pet) return;

        try {
            await updatePet(petId, { status: 'found' });
            toast.success('¡Mascota marcada como encontrada!');
            
            // Send email notification
            try {
                await fetch('/api/emails/pet-found', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: pet.contactEmail,
                        petData: {
                            name: pet.name,
                            breed: pet.breed,
                            contactName: pet.contactName,
                            petUrl: `${window.location.origin}/pet/${pet.id}`,
                        },
                    }),
                });
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
            }
            
            loadMyPets(); // Reload
        } catch (error) {
            console.error('Error updating pet:', error);
            toast.error('Error al actualizar el estado');
        }
    };

    const handleEditPet = (pet: Pet) => {
        setEditingPet(pet);
    };

    const handleSaveEdit = async (updatedData: Partial<Pet>) => {
        if (!editingPet) return;
        
        try {
            await updatePet(editingPet.id, updatedData);
            // Update local state immediately
            setMyPets(prev => prev.map(p => 
                p.id === editingPet.id ? { ...p, ...updatedData } : p
            ));
            setEditingPet(null);
        } catch (error) {
            console.error('Error updating pet:', error);
            throw error;
        }
    };

    if (authLoading || isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Reportes</h1>
                        <p className="mt-2 text-gray-600">
                            Gestiona tus mascotas reportadas
                        </p>
                    </div>
                    <Link href="/report">
                        <Button>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Nuevo Reporte
                        </Button>
                    </Link>
                </div>

                {myPets.length === 0 ? (
                    <EmptyState
                        icon={<PlusIcon className="h-8 w-8 text-gray-400" />}
                        title="No tienes reportes aún"
                        description="Crea tu primer reporte para ayudar a encontrar a tu mascota perdida"
                        action={
                            <Link href="/report">
                                <Button>
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Crear Primer Reporte
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="text-2xl font-bold text-gray-900">
                                    {myPets.length}
                                </div>
                                <div className="text-sm text-gray-500">Total Reportes</div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {myPets.filter(p => p.status === 'lost').length}
                                </div>
                                <div className="text-sm text-gray-500">Perdidos</div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {myPets.filter(p => p.status === 'found').length}
                                </div>
                                <div className="text-sm text-gray-500">Encontrados</div>
                            </div>
                        </div>

                        {/* Pet Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myPets.map((pet) => (
                                <div key={pet.id} className="relative">
                                    <PetCard pet={pet} />
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditPet(pet)}
                                        >
                                            <PencilSquareIcon className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                        {pet.status !== 'found' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => markAsFound(pet.id)}
                                            >
                                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                Encontrado
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingPet && (
                <EditPetModal
                    isOpen={!!editingPet}
                    onClose={() => setEditingPet(null)}
                    pet={editingPet}
                    onSave={handleSaveEdit}
                />
            )}
        </main>
    );
}
