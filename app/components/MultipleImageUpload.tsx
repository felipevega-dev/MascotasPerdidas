'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MultipleImageUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    label?: string;
}

export default function MultipleImageUpload({
    images,
    onImagesChange,
    maxImages = 5,
    label = 'Fotos de la mascota'
}: MultipleImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding these files would exceed the limit
        if (images.length + files.length > maxImages) {
            alert(`Solo puedes subir un máximo de ${maxImages} fotos`);
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`El archivo ${file.name} no es una imagen válida`);
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`La imagen ${file.name} es muy grande. Máximo 5MB`);
                continue;
            }

            try {
                // Convert to base64
                const base64 = await fileToBase64(file);
                newImages.push(base64);
            } catch (error) {
                console.error('Error converting file:', error);
                alert(`Error al procesar ${file.name}`);
            }
        }

        onImagesChange([...images, ...newImages]);
        setUploading(false);
        
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {images.length > 0 && (
                    <span className="ml-2 text-gray-500 font-normal">
                        ({images.length}/{maxImages})
                    </span>
                )}
            </label>

            {/* Images Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-all"
                        >
                            <Image
                                src={image}
                                alt={`Foto ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            
                            {/* Primary badge */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                    Principal
                                </div>
                            )}

                            {/* Remove button */}
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                type="button"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>

                            {/* Move buttons */}
                            {images.length > 1 && (
                                <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {index > 0 && (
                                        <button
                                            onClick={() => moveImage(index, index - 1)}
                                            className="flex-1 px-2 py-1 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium rounded shadow"
                                            type="button"
                                        >
                                            ←
                                        </button>
                                    )}
                                    {index < images.length - 1 && (
                                        <button
                                            onClick={() => moveImage(index, index + 1)}
                                            className="flex-1 px-2 py-1 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium rounded shadow"
                                            type="button"
                                        >
                                            →
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            {images.length < maxImages && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="multi-image-upload"
                    />
                    <label
                        htmlFor="multi-image-upload"
                        className={`
                            flex flex-col items-center justify-center w-full h-32 
                            border-2 border-dashed rounded-lg cursor-pointer
                            transition-colors
                            ${uploading
                                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary-400'
                            }
                        `}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                                <p className="mt-2 text-sm text-gray-500">Cargando...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                {images.length === 0 ? (
                                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                                ) : (
                                    <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    {images.length === 0 ? (
                                        <>
                                            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                        </>
                                    ) : (
                                        `Agregar más fotos (${maxImages - images.length} disponibles)`
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    PNG, JPG, GIF hasta 5MB
                                </p>
                            </div>
                        )}
                    </label>
                </div>
            )}

            {images.length > 0 && (
                <p className="text-xs text-gray-500">
                    💡 La primera foto será la imagen principal. Puedes reordenarlas usando las flechas.
                </p>
            )}
        </div>
    );
}
