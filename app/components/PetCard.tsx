import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Pet } from '../utils/storage';
import { Badge } from './Badge';
import { calculateDistance } from '../utils/geolocation';

interface PetCardProps {
    pet: Pet;
    userLocation?: { lat: number; lng: number } | null;
}

export default function PetCard({ pet, userLocation }: PetCardProps) {
    // Calculate distance if user location is available
    const distance = userLocation
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            pet.lastSeenLocation.lat,
            pet.lastSeenLocation.lng
        )
        : null;
    return (
        <Link href={`/pet/${pet.id}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full bg-gray-100">
                    {pet.photo ? (
                        <Image
                            src={pet.photo}
                            alt={pet.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No photo
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <Badge status={pet.status} />
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {pet.name}
                        </h3>
                        {pet.reward && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                                Reward: ${pet.reward}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {pet.description}
                    </p>

                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                        <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="truncate">{pet.lastSeenLocation.address}</span>
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{formatDistanceToNow(new Date(pet.lastSeenDate), { addSuffix: true })}</span>
                        </div>
                        {distance !== null && (
                            <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1 text-primary-500" />
                                <span className="font-medium text-primary-600">
                                    {distance < 1
                                        ? `${(distance * 1000).toFixed(0)}m de ti`
                                        : `${distance.toFixed(1)}km de ti`
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
