'use client';

import { useState, useEffect } from 'react';
import { MapIcon, ListBulletIcon, FunnelIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import PetMapWrapper from '../components/PetMapWrapper';
import PetCard from '../components/PetCard';
import Link from 'next/link';
import { getPets, Pet } from '../utils/storage';
import { getCurrentLocation } from '../utils/geolocation';

type PetType = 'dog' | 'cat' | 'other' | 'all';
type PetStatus = 'lost' | 'sighted' | 'found' | 'all';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function MapPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [pets, setPets] = useState<Pet[]>([]);
    const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [typeFilter, setTypeFilter] = useState<PetType>('all');
    const [statusFilter, setStatusFilter] = useState<PetStatus>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get user location first (parallel with pets)
                const [fetchedPets, location] = await Promise.allSettled([
                    getPets(),
                    getCurrentLocation()
                ]);

                if (fetchedPets.status === 'fulfilled') {
                    setPets(fetchedPets.value);
                    setFilteredPets(fetchedPets.value);
                } else {
                    console.error('Error fetching pets:', fetchedPets.reason);
                }

                if (location.status === 'fulfilled') {
                    setUserLocation(location.value);
                } else {
                    console.warn('Could not get user location. Using default location.', location.reason);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply filters whenever filter values change
    useEffect(() => {
        let filtered = [...pets];

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(pet => pet.type === typeFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(pet => pet.status === statusFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(pet => {
                const petDate = new Date(pet.lastSeenDate);
                const diffMs = now.getTime() - petDate.getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                switch (dateFilter) {
                    case 'today':
                        return diffDays < 1;
                    case 'week':
                        return diffDays < 7;
                    case 'month':
                        return diffDays < 30;
                    default:
                        return true;
                }
            });
        }

        setFilteredPets(filtered);
    }, [pets, typeFilter, statusFilter, dateFilter]);

    const clearFilters = () => {
        setTypeFilter('all');
        setStatusFilter('all');
        setDateFilter('all');
    };

    const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all';

    return (
        <main className="h-[calc(100vh-64px)] flex flex-col">
            {/* Header / Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Alertas Activas</h1>

                <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'map'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Vista de Mapa"
                        >
                            <MapIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Vista de Lista"
                        >
                            <ListBulletIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <Button
                        variant={hasActiveFilters ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtros
                        {hasActiveFilters && (
                            <span className="ml-2 bg-white text-primary-600 rounded-full px-2 py-0.5 text-xs font-bold">
                                {[typeFilter !== 'all', statusFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length}
                            </span>
                        )}
                    </Button>

                    <Link href="/report">
                        <Button size="sm">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Reportar Mascota
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200 px-4 py-4 shrink-0">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Type Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Tipo de Mascota
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value as PetType)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                >
                                    <option value="all">Todas</option>
                                    <option value="dog">Perros</option>
                                    <option value="cat">Gatos</option>
                                    <option value="other">Otras</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as PetStatus)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                >
                                    <option value="all">Todos</option>
                                    <option value="lost">Perdidos</option>
                                    <option value="sighted">Avistados</option>
                                    <option value="found">Encontrados</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Fecha
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                >
                                    <option value="all">Todas las fechas</option>
                                    <option value="today">Hoy</option>
                                    <option value="week">Última semana</option>
                                    <option value="month">Último mes</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                            Mostrando {filteredPets.length} de {pets.length} mascotas
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-gray-50">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'map' ? (
                            <PetMapWrapper pets={filteredPets} userLocation={userLocation} />
                        ) : (
                            <div className="h-full overflow-y-auto p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                                    {filteredPets.map((pet) => (
                                        <PetCard key={pet.id} pet={pet} userLocation={userLocation} />
                                    ))}
                                    {filteredPets.length === 0 && (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-gray-500 text-lg">
                                                {hasActiveFilters
                                                    ? 'No se encontraron mascotas con estos filtros.'
                                                    : 'No hay alertas activas en este momento.'
                                                }
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
