import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';

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
    photo: string; // URL from Firebase Storage
    lastSeenLocation: { lat: number; lng: number; address: string };
    lastSeenDate: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    reward?: string;
    sightings: Sighting[];
    createdAt: string;
}

const COLLECTION_NAME = 'pets';

export const getPets = async (): Promise<Pet[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
    } catch (error) {
        console.error("Error getting pets: ", error);
        return [];
    }
};

export const getPetById = async (id: string): Promise<Pet | undefined> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Pet;
        }
        return undefined;
    } catch (error) {
        console.error("Error getting pet: ", error);
        return undefined;
    }
};

export const savePet = async (pet: Omit<Pet, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), pet);
        return docRef.id;
    } catch (error) {
        console.error("Error saving pet: ", error);
        throw error;
    }
};

export const updatePet = async (id: string, updatedFields: Partial<Pet>): Promise<void> => {
    try {
        const petRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(petRef, updatedFields);
    } catch (error) {
        console.error("Error updating pet: ", error);
        throw error;
    }
};

export const addSighting = async (petId: string, sighting: Sighting): Promise<void> => {
    try {
        const pet = await getPetById(petId);
        if (pet) {
            const updatedSightings = [...pet.sightings, sighting];
            await updatePet(petId, {
                sightings: updatedSightings,
                status: 'sighted'
            });
        }
    } catch (error) {
        console.error("Error adding sighting: ", error);
        throw error;
    }
};

