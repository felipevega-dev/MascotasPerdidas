'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Pet } from '../utils/storage';
import { generatePoster, PosterConfig } from '../utils/posterGenerator';

interface PosterModalProps {
    isOpen: boolean;
    onClose: () => void;
    pet: Pet;
}

export default function PosterModal({ isOpen, onClose, pet }: PosterModalProps) {
    const [headerText, setHeaderText] = useState(
        pet.status === 'lost' ? 'MASCOTA PERDIDA' : 'MASCOTA ENCONTRADA'
    );
    const [description, setDescription] = useState(pet.description);
    const [contactText, setContactText] = useState('SI LA VES, POR FAVOR CONTACTA:');
    const [rewardText, setRewardText] = useState(
        pet.reward ? `RECOMPENSA: ${pet.reward}` : ''
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const config: PosterConfig = {
                headerText,
                description,
                contactText,
                rewardText,
            };
            await generatePoster(pet, config);
            onClose();
        } catch (error) {
            console.error('Error generating poster:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setHeaderText(pet.status === 'lost' ? 'MASCOTA PERDIDA' : 'MASCOTA ENCONTRADA');
        setDescription(pet.description);
        setContactText('SI LA VES, POR FAVOR CONTACTA:');
        setRewardText(pet.reward ? `RECOMPENSA: ${pet.reward}` : '');
    };

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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                    <Dialog.Title className="text-xl font-bold text-gray-900">
                                        Personalizar Cartel
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-6 space-y-6">
                                    <p className="text-sm text-gray-600">
                                        Personaliza el texto del cartel antes de generarlo. Puedes editar cualquier campo o usar los valores por defecto.
                                    </p>

                                    {/* Preview Image */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Vista previa de la foto
                                        </label>
                                        <div className="relative h-48 w-full bg-white rounded-lg overflow-hidden">
                                            {pet.photo ? (
                                                <img
                                                    src={pet.photo}
                                                    alt={pet.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    Sin foto
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Header Text */}
                                    <div>
                                        <label htmlFor="headerText" className="block text-sm font-medium text-gray-700 mb-2">
                                            Texto del encabezado
                                        </label>
                                        <input
                                            type="text"
                                            id="headerText"
                                            value={headerText}
                                            onChange={(e) => setHeaderText(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="MASCOTA PERDIDA"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Descripción de la mascota"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Se mostrarán máximo 3 líneas en el cartel
                                        </p>
                                    </div>

                                    {/* Reward Text */}
                                    {pet.reward && (
                                        <div>
                                            <label htmlFor="rewardText" className="block text-sm font-medium text-gray-700 mb-2">
                                                Texto de recompensa
                                            </label>
                                            <input
                                                type="text"
                                                id="rewardText"
                                                value={rewardText}
                                                onChange={(e) => setRewardText(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="RECOMPENSA: $50,000"
                                            />
                                        </div>
                                    )}

                                    {/* Contact Text */}
                                    <div>
                                        <label htmlFor="contactText" className="block text-sm font-medium text-gray-700 mb-2">
                                            Texto de contacto
                                        </label>
                                        <input
                                            type="text"
                                            id="contactText"
                                            value={contactText}
                                            onChange={(e) => setContactText(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="SI LA VES, POR FAVOR CONTACTA:"
                                        />
                                    </div>

                                    {/* Pet Info (Read-only) */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">
                                            Información incluida automáticamente:
                                        </p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Nombre: <span className="font-medium">{pet.name}</span></li>
                                            <li>• Raza: <span className="font-medium">{pet.breed}</span></li>
                                            <li>• Color: <span className="font-medium">{pet.color}</span></li>
                                            <li>• Contacto: <span className="font-medium">{pet.contactName} - {pet.contactPhone}</span></li>
                                            <li>• Código QR con enlace directo a la publicación</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="text-sm"
                                    >
                                        Restablecer valores
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={onClose}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleGenerate} disabled={isGenerating}>
                                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                            {isGenerating ? 'Generando...' : 'Generar PDF'}
                                        </Button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
