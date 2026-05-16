"use client";

import React, { useState, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { X, UploadCloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ImageUploaderProps {
    maxImages?: number;
    onImagesChange: (images: File[]) => void;
}

export const ImageUploader = ({ maxImages = 3, onImagesChange }: ImageUploaderProps) => {
    const t = useTranslations('ImageUploader');
    const [images, setImages] = useState<{ file: File, preview: string }[]>([]);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const cropperRef = useRef<ReactCropperElement>(null);

    // Handle input change or drop
    const handleFileProcess = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            alert(t('errorSize'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCurrentFile(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const files = e.target.files;
        if (files && files.length > 0) handleFileProcess(files[0]);
        e.target.value = ''; // Reset input
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleFileProcess(files[0]);
    };

    const handleCrop = () => {
        if (typeof cropperRef.current?.cropper !== "undefined") {
            cropperRef.current?.cropper.getCroppedCanvas().toBlob((blob) => {
                if (!blob) return;

                const croppedFile = new File([blob], `pet-${Date.now()}.jpg`, { type: 'image/jpeg' });

                const preview = URL.createObjectURL(croppedFile);
                const newImages = [...images, { file: croppedFile, preview }];

                setImages(newImages);
                onImagesChange(newImages.map(img => img.file));
                setCurrentFile(null);
            }, 'image/jpeg');
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        URL.revokeObjectURL(images[index].preview);

        setImages(newImages);
        onImagesChange(newImages.map(img => img.file)); // Alterado de img.blob para img.file
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-brand-secondary mb-1">
                {t('title')} ({images.length}/{maxImages})
            </label>

            {/* Cropper Modal / Area */}
            {currentFile && (
                <div className="p-4 border border-sand-300 rounded-xl bg-sand-50">
                    <div className="mb-4">
                        <Cropper
                            src={currentFile}
                            style={{ height: 300, width: "100%" }}
                            initialAspectRatio={1}
                            aspectRatio={1} // Force square
                            guides={true} // Show 3x3 grid
                            ref={cropperRef}
                            viewMode={1}
                            background={false}
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setCurrentFile(null)}>
                            {t('cancelCrop')}
                        </Button>
                        <Button type="button" onClick={handleCrop}>
                            <Check className="w-4 h-4 mr-2" />
                            {t('confirmCrop')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Dropzone and Image List */}
            {!currentFile && (
                <>
                    {images.length < maxImages && (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-sand-300 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors cursor-pointer"
                        >
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleInputChange}
                            />
                            <UploadCloud className="w-8 h-8 text-sand-400 mb-2" />
                            <p className="text-sm font-medium text-sand-600">{t('dragDrop')}</p>
                            <p className="text-xs text-sand-400 mt-1">{t('maxSize')}</p>
                        </div>
                    )}

                    {/* Thumbnails */}
                    {images.length > 0 && (
                        <div className="flex gap-4 flex-wrap mt-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-sand-200">
                                    <img src={img.preview} alt={`preview ${index}`} className="object-cover w-full h-full" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};