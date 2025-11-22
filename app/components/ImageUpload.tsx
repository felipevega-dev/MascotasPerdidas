'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Button } from './Button';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageUploadProps {
    onImageSelect: (url: string | null) => void;
    initialImage?: string;
}

export default function ImageUpload({ onImageSelect, initialImage }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadImage = async (file: File) => {
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `pets/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            onImageSelect(downloadURL);
            setPreview(downloadURL);
        } catch (error) {
            console.error("Error uploading image: ", error);
            alert("Error al subir la imagen. Por favor intenta de nuevo.");
            // Clear preview on error
            setPreview(null);
            onImageSelect(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFile = (file: File) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido.');
            return;
        }

        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('El archivo es demasiado grande. El tamaño máximo permitido es 5MB.');
            return;
        }

        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Firebase
        uploadImage(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const removeImage = () => {
        setPreview(null);
        onImageSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200 group">
                    <Image
                        src={preview}
                        alt="Pet preview"
                        fill
                        className={`object-cover ${isUploading ? 'opacity-50' : ''}`}
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={removeImage}
                            type="button"
                            disabled={isUploading}
                        >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Eliminar Foto
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4 text-primary-600">
                            <PhotoIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Sube una foto
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Arrastra y suelta o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-gray-400 mt-4">
                            PNG, JPG, GIF hasta 5MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
