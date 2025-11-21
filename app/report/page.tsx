'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';
import { Button } from '../components/Button';
import { savePet, Pet } from '../utils/storage';
import { ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ReportMissingPet() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Pet>>({
        status: 'lost',
        sightings: [],
        createdAt: new Date().toISOString(),
    });

    const handleImageSelect = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        } else {
            setFormData({ ...formData, photo: undefined });
        }
    };

    const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
        setFormData({ ...formData, lastSeenLocation: location });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const newPet: Pet = {
                ...formData as Pet,
                id: crypto.randomUUID(),
                lastSeenDate: new Date().toISOString(), // Or use a date picker
            };

            savePet(newPet);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push(`/pet/${newPet.id}`);
        } catch (error) {
            console.error('Error saving pet:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Progress Steps */}
                <nav aria-label="Progress" className="mb-12">
                    <ol role="list" className="flex items-center">
                        {[1, 2, 3, 4].map((s, stepIdx) => (
                            <li key={s} className={`relative ${stepIdx !== 3 ? 'pr-8 sm:pr-20' : ''}`}>
                                {s < step ? (
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-primary-600" />
                                    </div>
                                ) : null}
                                <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${s <= step ? 'bg-primary-600 hover:bg-primary-900' : 'bg-gray-200'
                                    }`}>
                                    {s < step ? (
                                        <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                    ) : (
                                        <span className={`text-sm font-medium ${s === step ? 'text-white' : 'text-gray-500'}`}>
                                            {s}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="px-8 py-10">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Upload a Photo</h2>
                                    <p className="mt-2 text-gray-500">A clear photo helps neighbors identify your pet quickly.</p>
                                </div>
                                <ImageUpload onImageSelect={handleImageSelect} initialImage={formData.photo} />
                                <div className="flex justify-end pt-6">
                                    <Button onClick={nextStep} disabled={!formData.photo}>Next: Pet Details</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Pet Details</h2>
                                    <p className="mt-2 text-gray-500">Tell us about your missing friend.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Pet Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={formData.name || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            id="type"
                                            name="type"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={formData.type || 'dog'}
                                            onChange={handleInputChange}
                                        >
                                            <option value="dog">Dog</option>
                                            <option value="cat">Cat</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
                                        <input
                                            type="text"
                                            name="breed"
                                            id="breed"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={formData.breed || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={formData.description || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} disabled={!formData.name}>Next: Location</Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Last Seen Location</h2>
                                    <p className="mt-2 text-gray-500">Where was your pet last seen?</p>
                                </div>

                                <LocationPicker onLocationSelect={handleLocationSelect} />

                                <div className="flex justify-between pt-6">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={nextStep} disabled={!formData.lastSeenLocation}>Next: Contact</Button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                                    <p className="mt-2 text-gray-500">How can people reach you?</p>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Your Name</label>
                                        <input
                                            type="text"
                                            name="contactName"
                                            id="contactName"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={formData.contactName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="contactPhone"
                                            id="contactPhone"
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                            value={formData.contactPhone || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="reward" className="block text-sm font-medium text-gray-700">Reward (Optional)</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="reward"
                                                id="reward"
                                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md border p-2"
                                                placeholder="0.00"
                                                value={formData.reward || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                                    <Button onClick={handleSubmit} isLoading={isLoading} disabled={!formData.contactName || !formData.contactPhone}>
                                        Submit Report
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
