'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import ImageUpload from './ImageUpload';
import LocationPicker from './LocationPicker';
import { Pet } from '../utils/storage';
import toast from 'react-hot-toast';

interface EditPetModalProps {
    isOpen: boolean;
    onClose: () => void;
    pet: Pet;
    onSave: (updatedPet: Partial<Pet>) => Promise<void>;
}

export default function EditPetModal({ isOpen, onClose, pet, onSave }: EditPetModalProps) {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Pet>>({});

    useEffect(() => {
        if (isOpen && pet) {
            setFormData({
                name: pet.name,
                type: pet.type,
                breed: pet.breed,
                color: pet.color,
                size: pet.size,
                description: pet.description,
                distinguishingFeatures: pet.distinguishingFeatures,
                photo: pet.photo,
                lastSeenLocation: pet.lastSeenLocation,
                lastSeenDate: pet.lastSeenDate,
                contactName: pet.contactName,
                contactPhone: pet.contactPhone,
                contactEmail: pet.contactEmail,
                reward: pet.reward,
                status: pet.status,
            });
            setStep(1);
        }
    }, [isOpen, pet]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'lastSeenDate' && value) {
            const date = new Date(value);
            setFormData({ ...formData, [name]: date.toISOString() });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageSelect = (url: string | null) => {
        setFormData({ ...formData, photo: url || undefined });
    };

    const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
        setFormData({ ...formData, lastSeenLocation: location });
    };

    const handleSubmit = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            await onSave(formData);
            toast.success('Mascota actualizada exitosamente');
            onClose();
        } catch (error) {
            console.error('Error updating pet:', error);
            toast.error('Error al actualizar la mascota');
        } finally {
            setIsSaving(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                        Editar {pet.name}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Progress Indicator */}
                                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between text-xs">
                                        {['Información Básica', 'Detalles', 'Ubicación', 'Contacto'].map((label, idx) => (
                                            <div key={idx} className="flex items-center">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                    idx + 1 === step ? 'bg-primary-600 text-white' : 
                                                    idx + 1 < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <span className={`ml-2 ${idx + 1 === step ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                                                    {label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <ImageUpload onImageSelect={handleImageSelect} initialImage={formData.photo} />
                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Estado
                                                </label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                    value={formData.status || 'lost'}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="lost">Perdido</option>
                                                    <option value="sighted">Avistado</option>
                                                    <option value="found">Encontrado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="lastSeenDate" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha de última vez visto
                                                </label>
                                                <input
                                                    type="date"
                                                    name="lastSeenDate"
                                                    id="lastSeenDate"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                    value={formData.lastSeenDate ? new Date(formData.lastSeenDate).toISOString().split('T')[0] : ''}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.name || ''}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                                    <select
                                                        id="type"
                                                        name="type"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.type || 'dog'}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="dog">Perro</option>
                                                        <option value="cat">Gato</option>
                                                        <option value="other">Otro</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                                                <input
                                                    type="text"
                                                    name="breed"
                                                    id="breed"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                    value={formData.breed || ''}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                                    <input
                                                        type="text"
                                                        name="color"
                                                        id="color"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.color || ''}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                                                    <select
                                                        id="size"
                                                        name="size"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.size || ''}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Selecciona</option>
                                                        <option value="Pequeño">Pequeño (0-10 kg)</option>
                                                        <option value="Mediano">Mediano (10-25 kg)</option>
                                                        <option value="Grande">Grande (25+ kg)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows={3}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                    value={formData.description || ''}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="distinguishingFeatures" className="block text-sm font-medium text-gray-700 mb-1">Señas Particulares</label>
                                                <textarea
                                                    id="distinguishingFeatures"
                                                    name="distinguishingFeatures"
                                                    rows={2}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                    value={formData.distinguishingFeatures || ''}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 mb-4">Actualiza la ubicación donde fue visto por última vez</p>
                                            <LocationPicker 
                                                onLocationSelect={handleLocationSelect}
                                                initialLocation={formData.lastSeenLocation}
                                            />
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
                                                <input
                                                    type="text"
                                                    name="contactName"
                                                    id="contactName"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                    value={formData.contactName || ''}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                                    <input
                                                        type="tel"
                                                        name="contactPhone"
                                                        id="contactPhone"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.contactPhone || ''}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="contactEmail"
                                                        id="contactEmail"
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.contactEmail || ''}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-1">Recompensa (Opcional)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                    <input
                                                        type="number"
                                                        name="reward"
                                                        id="reward"
                                                        min="0"
                                                        step="0.01"
                                                        className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm border p-2"
                                                        value={formData.reward || ''}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
                                    {step > 1 && (
                                        <Button variant="ghost" onClick={prevStep}>
                                            Atrás
                                        </Button>
                                    )}
                                    {step < 4 ? (
                                        <Button onClick={nextStep} className="ml-auto">
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={handleSubmit} 
                                            isLoading={isSaving}
                                            disabled={isSaving}
                                            className="ml-auto"
                                        >
                                            Guardar Cambios
                                        </Button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
