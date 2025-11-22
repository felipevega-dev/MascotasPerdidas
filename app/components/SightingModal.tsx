'use client';

import { useState } from 'react';
import { Button } from './Button';
import LocationPicker from './LocationPicker';
import ImageUpload from './ImageUpload';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SightingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export default function SightingModal({ isOpen, onClose, onSubmit }: SightingModalProps) {
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [notes, setNotes] = useState('');
    const [contact, setContact] = useState('');
    const [photo, setPhoto] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (location) {
            onSubmit({
                location,
                notes,
                contact,
                photo,
                date: new Date().toISOString(),
            });
            // Reset form
            setLocation(null);
            setNotes('');
            setContact('');
            setPhoto('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Reportar Avistamiento
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Proporciona detalles sobre dónde y cuándo viste a esta mascota.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                                    <LocationPicker onLocationSelect={setLocation} />
                                </div>

                                <div>
                                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Foto (Opcional)</label>
                                    <ImageUpload onImageSelect={(url) => setPhoto(url || '')} />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Una foto ayuda a confirmar el avistamiento
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas *</label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Describe qué estaba haciendo la mascota, su condición, etc..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Tu Contacto (Opcional)</label>
                                    <input
                                        type="text"
                                        id="contact"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Teléfono o Email"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                    />
                                </div>

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <Button type="submit" disabled={!location} className="w-full sm:ml-3 sm:w-auto">
                                        Enviar Reporte
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={onClose} className="mt-3 w-full sm:mt-0 sm:w-auto">
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
