'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { Button } from './Button';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="PawAlert"
                                    fill
                                    className="object-contain rounded-full"
                                />
                            </div>
                            <span className="text-xl font-bold text-gray-900">PawAlert</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                href="/map"
                                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                Ver Alertas
                            </Link>
                            {user && (
                                <Link
                                    href="/my-pets"
                                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Mis Reportes
                                </Link>
                            )}
                            <Link
                                href="/report"
                                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                Reportar Mascota
                            </Link>
                        </div>

                        {/* Auth Section */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <div className="hidden sm:flex items-center space-x-2">
                                        <UserCircleIcon className="h-6 w-6 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {user.displayName || user.email}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => logout()}
                                    >
                                        <ArrowRightOnRectangleIcon className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Cerrar Sesión</span>
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    Iniciar Sesión
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
