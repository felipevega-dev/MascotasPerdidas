// Calculate distance between two coordinates in km using Haversine formula
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
}

// Get pets within a radius
export function filterPetsByRadius(
    pets: any[],
    centerLat: number,
    centerLng: number,
    radiusKm: number
): any[] {
    return pets.filter(pet => {
        const distance = calculateDistance(
            centerLat,
            centerLng,
            pet.lastSeenLocation.lat,
            pet.lastSeenLocation.lng
        );
        return distance <= radiusKm;
    });
}

// Sort pets by distance
export function sortPetsByDistance(
    pets: any[],
    userLat: number,
    userLng: number
): any[] {
    return pets.map(pet => ({
        ...pet,
        distance: calculateDistance(
            userLat,
            userLng,
            pet.lastSeenLocation.lat,
            pet.lastSeenLocation.lng
        )
    })).sort((a, b) => a.distance - b.distance);
}
