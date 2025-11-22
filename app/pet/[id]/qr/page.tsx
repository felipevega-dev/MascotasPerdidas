'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPetById, Pet } from '../../../utils/storage';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneIcon, MapPinIcon, ShareIcon, PrinterIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';

export default function PetQRPage() {
    const params = useParams();
    const [pet, setPet] = useState<Pet | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPet = async () => {
            if (params.id) {
                setIsLoading(true);
                const foundPet = await getPetById(params.id as string);
                setPet(foundPet || null);
                
                if (foundPet) {
                    // Generate QR code
                    const petUrl = `${window.location.origin}/pet/${params.id}`;
                    const qr = await QRCode.toDataURL(petUrl, {
                        width: 400,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF',
                        },
                    });
                    setQrCodeUrl(qr);
                }
                
                setIsLoading(false);
            }
        };
        fetchPet();
    }, [params.id]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (!pet) return;

        const shareData = {
            title: `Información de ${pet.name}`,
            text: `Escanea este código QR para ver información de ${pet.name}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900">Mascota no encontrada</h1>
                <Link href="/map" className="mt-4 text-primary-600 hover:text-primary-700">
                    Volver al Mapa
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* No Print Buttons */}
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <Link href={`/pet/${pet.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                        ← Volver al anuncio
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={handleShare}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ShareIcon className="h-5 w-5" />
                            Compartir
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <PrinterIcon className="h-5 w-5" />
                            Imprimir QR
                        </button>
                    </div>
                </div>

                {/* QR Card - Optimized for printing */}
                <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🐾 {pet.name}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {pet.breed} • {pet.color}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Pet Image */}
                        {pet.photo && (
                            <div className="flex justify-center items-center">
                                <div className="relative w-64 h-64 rounded-lg overflow-hidden border-4 border-gray-200">
                                    <Image
                                        src={pet.photo}
                                        alt={pet.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center">
                            {qrCodeUrl && (
                                <div className="bg-white p-4 rounded-lg border-4 border-gray-800">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                                </div>
                            )}
                            <p className="text-center mt-4 text-sm text-gray-600 font-medium">
                                Escanea este código para ver toda la información
                            </p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-8 border-t-2 border-gray-200 pt-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                            Información de Contacto
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-bold text-lg">
                                            {pet.contactName.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Dueño</p>
                                        <p className="font-semibold text-gray-900">{pet.contactName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <PhoneIcon className="h-10 w-10 text-primary-600" />
                                    <div>
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="font-semibold text-gray-900">{pet.contactPhone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
                        <h3 className="font-bold text-primary-900 mb-3 text-center text-lg">
                            ¿Encontraste a esta mascota?
                        </h3>
                        <ol className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                <span>Escanea el código QR con tu teléfono</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                <span>Verás toda la información del dueño</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                <span>Llama o envía un mensaje al dueño</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                                <span>¡Ayuda a reunir a {pet.name} con su familia!</span>
                            </li>
                        </ol>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p className="font-semibold">PawAlert</p>
                        <p>Plataforma de Mascotas Perdidas</p>
                        <p className="text-xs mt-2">{window.location.origin}/pet/{pet.id}</p>
                    </div>
                </div>

                {/* Print instructions */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Tip: Imprime este QR</h3>
                    <p className="text-sm text-blue-800">
                        Puedes imprimir este código QR y colocarlo en el collar de tu mascota. Si alguien encuentra a tu mascota, 
                        podrá escanear el código y contactarte inmediatamente.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </main>
    );
}
