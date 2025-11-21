export interface Sighting {
    id: string;
    location: { lat: number; lng: number; address: string };
    date: string;
    notes: string;
    photo?: string;
    reportedBy?: string;
}

export interface Pet {
    id: string;
    status: 'lost' | 'sighted' | 'found';
    type: 'dog' | 'cat' | 'other';
    name: string;
    breed: string;
    color: string;
    size: string;
    description: string;
    distinguishingFeatures: string;
    photo: string; // base64 or URL
    lastSeenLocation: { lat: number; lng: number; address: string };
    lastSeenDate: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    reward?: string;
    sightings: Sighting[];
    createdAt: string;
}

const STORAGE_KEY = 'pawalert_pets';

export const getPets = (): Pet[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const getPetById = (id: string): Pet | undefined => {
    const pets = getPets();
    return pets.find((pet) => pet.id === id);
};

export const savePet = (pet: Pet): void => {
    const pets = getPets();
    pets.push(pet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
};

export const updatePet = (updatedPet: Pet): void => {
    const pets = getPets();
    const index = pets.findIndex((p) => p.id === updatedPet.id);
    if (index !== -1) {
        pets[index] = updatedPet;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    }
};

export const addSighting = (petId: string, sighting: Sighting): void => {
    const pets = getPets();
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
        pet.sightings.push(sighting);
        pet.status = 'sighted'; // Auto update status? Maybe optional
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    }
};
