'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, LinkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Pet } from '../utils/storage';
import Image from 'next/image';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    pet: Pet;
}

export default function ShareModal({ isOpen, onClose, pet }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const petUrl = typeof window !== 'undefined' ? `${window.location.origin}/pet/${pet.id}` : '';
    const shareText = `¡Ayuda a encontrar a ${pet.name}! ${pet.breed} ${pet.color}, visto por última vez en ${pet.lastSeenLocation.address.split(',')[0]}. `;

    const socialPlatforms = [
        {
            name: 'WhatsApp',
            icon: '📱',
            color: 'bg-green-500 hover:bg-green-600',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + petUrl)}`,
        },
        {
            name: 'Facebook',
            icon: '👥',
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(petUrl)}`,
        },
        {
            name: 'Twitter/X',
            icon: '🐦',
            color: 'bg-black hover:bg-gray-800',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(petUrl)}`,
        },
        {
            name: 'Telegram',
            icon: '✈️',
            color: 'bg-blue-500 hover:bg-blue-600',
            url: `https://t.me/share/url?url=${encodeURIComponent(petUrl)}&text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'Email',
            icon: '📧',
            color: 'bg-gray-600 hover:bg-gray-700',
            url: `mailto:?subject=${encodeURIComponent(`Ayuda a encontrar a ${pet.name}`)}&body=${encodeURIComponent(shareText + '\n\n' + petUrl)}`,
        },
    ];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(petUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const handlePlatformShare = (url: string) => {
        window.open(url, '_blank', 'width=600,height=400');
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                        Compartir {pet.name}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Pet Preview */}
                                <div className="mb-6 bg-gray-50 rounded-lg p-4 flex gap-3">
                                    {pet.photo && (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={pet.photo}
                                                alt={pet.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{pet.name}</p>
                                        <p className="text-sm text-gray-600 truncate">
                                            {pet.breed} • {pet.color}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {pet.lastSeenLocation.address.split(',')[0]}
                                        </p>
                                    </div>
                                </div>

                                {/* Social Platforms */}
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Compartir en:
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {socialPlatforms.map((platform) => (
                                            <button
                                                key={platform.name}
                                                onClick={() => handlePlatformShare(platform.url)}
                                                className={`${platform.color} text-white rounded-lg p-4 transition-colors flex items-center justify-center gap-2 font-medium`}
                                            >
                                                <span className="text-2xl">{platform.icon}</span>
                                                <span>{platform.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Copy Link */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        O copia el enlace:
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={petUrl}
                                            readOnly
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                copied
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {copied ? (
                                                <CheckIcon className="h-5 w-5" />
                                            ) : (
                                                <LinkIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 font-medium mb-2">
                                        💡 Consejos para maximizar el alcance:
                                    </p>
                                    <ul className="text-xs text-blue-800 space-y-1">
                                        <li>• Comparte en grupos locales de Facebook</li>
                                        <li>• Publica en grupos de WhatsApp de tu vecindario</li>
                                        <li>• Usa hashtags locales en Twitter/X</li>
                                        <li>• Pide a tus amigos que compartan también</li>
                                    </ul>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
