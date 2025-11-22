'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPets, updatePet, Pet } from '../utils/storage';
import PetCard from '../components/PetCard';
import { Button } from '../components/Button';
import Link from 'next/link';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function MyPetsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [myPets, setMyPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        try {
            await updatePet(petId, { status: 'found' });
            toast.success('¡Mascota marcada como encontrada!');
            loadMyPets(); // Reload
        } catch (error) {
            console.error('Error updating pet:', error);
            toast.error('Error al actualizar el estado');
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <PlusIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No tienes reportes aún
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Crea tu primer reporte para ayudar a encontrar a tu mascota perdida
                            </p>
                            <Link href="/report">
                                <Button>
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Crear Primer Reporte
                                </Button>
                            </Link>
                        </div>
                    </div>
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
                                    {pet.status !== 'found' && (
                                        <div className="mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => markAsFound(pet.id)}
                                            >
                                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                Marcar como Encontrado
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
