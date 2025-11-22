'use client';

import { useState, useEffect } from 'react';
import { MapIcon, ListBulletIcon, FunnelIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon, Squares2X2Icon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import PetMapWrapper from '../components/PetMapWrapper';
import HybridMapView from '../components/HybridMapView';
import PetCard from '../components/PetCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import GlobalFeed from '../components/GlobalFeed';
import AlertBanner from '../components/AlertBanner';
import Link from 'next/link';
import { getPets, Pet } from '../utils/storage';
import { getCurrentLocation } from '../utils/geolocation';
import { filterPetsByRadius, sortPetsByDistance } from '../utils/distance';

type PetType = 'dog' | 'cat' | 'other' | 'all';
type PetStatus = 'lost' | 'sighted' | 'found' | 'all';
type DateFilter = 'all' | 'today' | 'week' | 'month';

type ViewMode = 'map' | 'list' | 'hybrid';

export default function MapPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
    const [pets, setPets] = useState<Pet[]>([]);
    const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showGlobalFeed, setShowGlobalFeed] = useState(false);
    const [newAlerts, setNewAlerts] = useState<Pet[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    // Filter states
    const [typeFilter, setTypeFilter] = useState<PetType>('all');
    const [statusFilter, setStatusFilter] = useState<PetStatus>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = all, others in km
    const [sortByDistance, setSortByDistance] = useState(false);

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

                    // Check for new alerts (posts from the last 30 minutes)
                    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
                    const recentPets = fetchedPets.value.filter(pet => 
                        new Date(pet.createdAt).getTime() > thirtyMinutesAgo &&
                        pet.status === 'lost'
                    );
                    setNewAlerts(recentPets);
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

        // Poll for new pets every 2 minutes
        const interval = setInterval(async () => {
            try {
                const fetchedPets = await getPets();
                const existingIds = new Set(pets.map(p => p.id));
                const trulyNewPets = fetchedPets.filter(pet => 
                    !existingIds.has(pet.id) && pet.status === 'lost'
                );
                
                if (trulyNewPets.length > 0) {
                    setPets(fetchedPets);
                    setNewAlerts(prev => [...prev, ...trulyNewPets]);
                }
            } catch (error) {
                console.error('Error polling for new pets:', error);
            }
        }, 120000); // 2 minutes

        return () => clearInterval(interval);
    }, []);

    // Apply filters whenever filter values change
    useEffect(() => {
        let filtered = [...pets];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(pet =>
                pet.name.toLowerCase().includes(query) ||
                pet.breed.toLowerCase().includes(query) ||
                pet.color.toLowerCase().includes(query) ||
                pet.lastSeenLocation.address.toLowerCase().includes(query) ||
                (pet.description && pet.description.toLowerCase().includes(query))
            );
        }

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

        // Radius filter
        if (radiusFilter > 0 && userLocation) {
            filtered = filterPetsByRadius(
                filtered,
                userLocation.lat,
                userLocation.lng,
                radiusFilter
            );
        }

        // Sort by distance
        if (sortByDistance && userLocation) {
            filtered = sortPetsByDistance(filtered, userLocation.lat, userLocation.lng);
        }

        setFilteredPets(filtered);
    }, [pets, typeFilter, statusFilter, dateFilter, searchQuery, radiusFilter, sortByDistance, userLocation]);

    const clearFilters = () => {
        setTypeFilter('all');
        setStatusFilter('all');
        setDateFilter('all');
        setSearchQuery('');
        setRadiusFilter(0);
        setSortByDistance(false);
    };

    const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery.trim() !== '' || radiusFilter > 0 || sortByDistance;

    const handleDismissAlert = (petId: string) => {
        setDismissedAlerts(prev => new Set([...prev, petId]));
        setNewAlerts(prev => prev.filter(p => p.id !== petId));
    };

    const activeAlerts = newAlerts.filter(pet => !dismissedAlerts.has(pet.id));

    return (
        <main className="h-[calc(100vh-64px)] flex flex-col">
            {/* Alert Banner */}
            <AlertBanner newPets={activeAlerts} onDismiss={handleDismissAlert} />
            {/* Header / Controls */}
            <div className="bg-white border-b border-gray-200 shrink-0">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Alertas Activas</h1>

                    <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('hybrid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'hybrid'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Vista Híbrida"
                            title="Vista Híbrida"
                        >
                            <Squares2X2Icon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'map'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Solo Mapa"
                            title="Solo Mapa"
                        >
                            <MapIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-white shadow text-primary-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            aria-label="Solo Lista"
                            title="Solo Lista"
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
                                {[typeFilter !== 'all', statusFilter !== 'all', dateFilter !== 'all', searchQuery.trim() !== ''].filter(Boolean).length}
                            </span>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGlobalFeed(true)}
                    >
                        <GlobeAltIcon className="h-4 w-4 mr-2" />
                        Feed Global
                    </Button>

                    <Link href="/report">
                        <Button size="sm">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Reportar Mascota
                        </Button>
                    </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 pb-3">
                    <div className="relative max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, raza, color o ubicación..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
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

                            {/* Radius Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Radio de búsqueda {userLocation ? '' : '(ubicación requerida)'}
                                </label>
                                <select
                                    value={radiusFilter}
                                    onChange={(e) => setRadiusFilter(Number(e.target.value))}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                    disabled={!userLocation}
                                >
                                    <option value="0">Todas las distancias</option>
                                    <option value="1">Hasta 1 km</option>
                                    <option value="5">Hasta 5 km</option>
                                    <option value="10">Hasta 10 km</option>
                                    <option value="25">Hasta 25 km</option>
                                    <option value="50">Hasta 50 km</option>
                                </select>
                            </div>

                            {/* Sort by Distance */}
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sortByDistance}
                                        onChange={(e) => setSortByDistance(e.target.checked)}
                                        disabled={!userLocation}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Ordenar por distancia
                                    </span>
                                </label>
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
                    viewMode === 'list' ? (
                        <div className="h-full overflow-y-auto p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                                {[...Array(6)].map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Cargando mapa...</p>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        {viewMode === 'hybrid' ? (
                            <HybridMapView pets={filteredPets} userLocation={userLocation} />
                        ) : viewMode === 'map' ? (
                            <PetMapWrapper pets={filteredPets} userLocation={userLocation} />
                        ) : (
                            <div className="h-full overflow-y-auto p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                                    {filteredPets.map((pet) => (
                                        <PetCard key={pet.id} pet={pet} userLocation={userLocation} />
                                    ))}
                                    {filteredPets.length === 0 && (
                                        <div className="col-span-full">
                                            <EmptyState
                                                icon={<MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />}
                                                title={hasActiveFilters ? 'No se encontraron mascotas' : 'No hay alertas activas'}
                                                description={hasActiveFilters 
                                                    ? 'Intenta ajustar los filtros para ver más resultados.' 
                                                    : 'Sé el primero en reportar una mascota perdida.'}
                                                action={hasActiveFilters ? (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                                    >
                                                        Limpiar filtros
                                                    </button>
                                                ) : (
                                                    <Link href="/report">
                                                        <Button>
                                                            <PlusIcon className="h-5 w-5 mr-2" />
                                                            Reportar Mascota
                                                        </Button>
                                                    </Link>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Global Feed Sidebar */}
            <GlobalFeed isOpen={showGlobalFeed} onClose={() => setShowGlobalFeed(false)} />
        </main>
    );
}
