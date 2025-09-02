"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadManager, BatchUploadProgress, vehicleUploadConfig } from '@/lib/uploadManager';
import { imageCacheManager, CachedImage } from '@/lib/imageCache';
import { ImageUploadProgress } from './ImageUploadProgress';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadSectionProps {
  onImagesChange: (imageUrls: string[]) => void;
  onUploadStateChange?: (isUploading: boolean) => void; // Callback to notify parent of upload state
  maxImages?: number;
  maxFileSize?: number;
  vehicleId: string;
  initialImages?: string[];
  className?: string;
  isEditMode?: boolean; // Flag to indicate if we're editing (enables periodic sync)
}

interface SortableImageItemProps {
  id: string;
  image: CachedImage;
  index: number;
  onRemove: () => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({
  id,
  image,
  index,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const imageName = image.fileName || image.url.split('/').pop() || 'Image';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      {...attributes}
    >
      <Card className="overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-2">
          <div className="relative aspect-square">
            <img
              src={image.url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                console.error('Failed to load image:', image.url);
                e.currentTarget.src = '/placeholder-image.jpg';
              }}
            />
            
            {/* Drag handle */}
            <div
              className="absolute top-1 left-1 p-1 bg-black/50 rounded cursor-grab hover:bg-black/70 transition-colors"
              {...listeners}
            >
              <GripVertical className="h-3 w-3 text-white" />
            </div>
            
            {/* Remove button */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
            
            {/* Image position indicator */}
            <Badge
              variant="secondary"
              className="absolute bottom-1 left-1 text-xs bg-black/50 text-white"
            >
              {index + 1}
            </Badge>
          </div>
          
          <div className="mt-1 text-xs text-gray-600 truncate">
            {imageName}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  onImagesChange,
  onUploadStateChange,
  maxImages = 20,
  maxFileSize = 15 * 1024 * 1024, // 15MB
  vehicleId,
  initialImages = [],
  className = "",
  isEditMode = false,
}) => {
  const [batchProgress, setBatchProgress] = useState<BatchUploadProgress>({
    overallProgress: 0,
    completedUploads: 0,
    totalUploads: 0,
    activeUploads: 0,
    uploads: {},
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [cachedImages, setCachedImages] = useState<CachedImage[]>([]);
  const uploadManagerRef = useRef<UploadManager | null>(null);
  const previousImageUrlsRef = useRef<string[]>([]);
  const initializedVehicleIdRef = useRef<string | null>(null);

  // Initialize cache and upload manager once
  useEffect(() => {
    let mounted = true;
    const initializationKey = `${vehicleId}_${initialImages.length}_${initialImages.join(',')}`;
    
    const initializeCache = async () => {
      try {
        // Check if cache is already initialized for this vehicle to prevent duplicate initialization
        const isAlreadyInitialized = imageCacheManager.isCacheInitialized(vehicleId);
        const existingImages = isAlreadyInitialized ? imageCacheManager.getImages(vehicleId) : [];

        // Determine if we need to (re)initialize
        const needsInitialization = !isAlreadyInitialized || 
          (initialImages.length > 0 && 
           JSON.stringify(existingImages.map(img => img.url).sort()) !== JSON.stringify(initialImages.sort()));

        if (needsInitialization) {
          await imageCacheManager.initializeCache(vehicleId, initialImages, isEditMode);
          
          if (mounted) {
            const images = imageCacheManager.getImages(vehicleId);
            setCachedImages(images);
            previousImageUrlsRef.current = imageCacheManager.getImageUrls(vehicleId);
          }
        } else {
          // Just update the state with existing images
          if (mounted) {
            setCachedImages(existingImages);
            previousImageUrlsRef.current = imageCacheManager.getImageUrls(vehicleId);
          }
        }

        // Initialize upload manager only once per vehicle
        if (!uploadManagerRef.current || initializedVehicleIdRef.current !== vehicleId) {
          const config = {
            ...vehicleUploadConfig,
            batchSize: 4,
            vehicleId: vehicleId
          };
          
          // Cleanup old upload manager if exists
          if (uploadManagerRef.current) {
            uploadManagerRef.current.destroy();
          }
          
          uploadManagerRef.current = new UploadManager(config);
          uploadManagerRef.current.setProgressCallback(setBatchProgress);
          initializedVehicleIdRef.current = vehicleId;
          
          // Set upload completion callback
          uploadManagerRef.current.setUploadCompleteCallback(async (uploadId: string, downloadURL: string, file: File) => {
            try {
              const imageId = await imageCacheManager.addUploadedImage(vehicleId, downloadURL, file.name);
              setCachedImages(prev => imageCacheManager.getImages(vehicleId));
            } catch (error) {
              console.error('Error adding uploaded image to cache:', error);
              toast.error('Failed to add image to cache');
            }
          });
        }
      } catch (error) {
        console.error('Failed to initialize image cache:', error);
        if (mounted) {
          toast.error('Failed to initialize image cache');
        }
      }
    };

    // Only initialize if we have a valid vehicleId
    if (vehicleId) {
      initializeCache();
    }

    return () => {
      mounted = false;
      if (uploadManagerRef.current) {
        uploadManagerRef.current.destroy();
        uploadManagerRef.current = null;
      }
      // Clean up cache for this vehicle when component unmounts
      if (vehicleId) {
        imageCacheManager.cleanupVehicleCache(vehicleId);
      }
      initializedVehicleIdRef.current = null;
    };
  }, [vehicleId, initialImages, isEditMode]); // Include isEditMode in dependencies

  // Notify parent component of upload state changes
  useEffect(() => {
    if (onUploadStateChange) {
      onUploadStateChange(isUploading);
    }
  }, [isUploading, onUploadStateChange]);

  // Update parent component when images change - use useCallback to prevent infinite loops
  const updateParentImages = useCallback(() => {
    try {
      const imageUrls = imageCacheManager.getImageUrls(vehicleId);
      
      // Only update if URLs actually changed
      const previousUrls = previousImageUrlsRef.current;
      if (JSON.stringify(imageUrls) !== JSON.stringify(previousUrls)) {
        previousImageUrlsRef.current = imageUrls;
        onImagesChange(imageUrls);
      }
    } catch (error) {
      console.error('Error getting image URLs:', error);
    }
  }, [vehicleId, onImagesChange]);

  useEffect(() => {
    updateParentImages();
  }, [cachedImages, updateParentImages]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large (max ${Math.round(maxFileSize / (1024 * 1024))}MB)`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a valid image file`);
        } else {
          toast.error(`${file.name}: ${error.message}`);
        }
      });
    });
    
    // Validate accepted files
    const validFiles = acceptedFiles.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large (max ${Math.round(maxFileSize / (1024 * 1024))}MB)`);
        return false;
      }
      return true;
    });

    const currentImageCount = cachedImages.length;

    if (currentImageCount + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (validFiles.length > 0) {
      // Start upload process
      if (uploadManagerRef.current) {
        setIsUploading(true);
        uploadManagerRef.current.addFiles(validFiles);
      } else {
        console.error('Upload manager not available');
      }
    }
  }, [cachedImages, maxImages, maxFileSize, vehicleId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: maxFileSize,
    disabled: isUploading,
  });

  // Handle upload completion
  useEffect(() => {
    if (batchProgress.completedUploads === batchProgress.totalUploads && 
        batchProgress.totalUploads > 0 && 
        batchProgress.overallProgress === 100) {
      
      setIsUploading(false);
      
      if (uploadManagerRef.current) {
        uploadManagerRef.current.clear();
      }
    }
  }, [batchProgress]);

  // Add a diagnostic timer to check for stuck uploads
  useEffect(() => {
    if (!isUploading) return;

    const diagnosticInterval = setInterval(() => {
      if (uploadManagerRef.current) {
        const diagnostics = uploadManagerRef.current.getUploadDiagnostics();
        
        // Check if uploads are stuck
        if (diagnostics.activeUploads === 0 && diagnostics.queueLength > 0) {
          uploadManagerRef.current.restartStuckUploads();
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(diagnosticInterval);
  }, [isUploading]);

  const removeImage = async (imageId: string) => {
    try {
      const success = await imageCacheManager.removeImage(vehicleId, imageId, true);
      if (success) {
        setCachedImages(imageCacheManager.getImages(vehicleId));
        toast.success('Image removed successfully');
      } else {
        console.error('Failed to remove image - removeImage returned false');
        toast.error('Failed to remove image from storage');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      if (error instanceof Error && error.message.includes('storage/unauthorized')) {
        toast.error('Permission denied: Unable to delete image from storage');
      } else {
        toast.error('Failed to remove image');
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      try {
        const activeIndex = cachedImages.findIndex(img => img.id === active.id);
        const overIndex = cachedImages.findIndex(img => img.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          const newOrder = arrayMove(cachedImages.map(img => img.id), activeIndex, overIndex);
          imageCacheManager.reorderImages(vehicleId, newOrder);
          setCachedImages(imageCacheManager.getImages(vehicleId));
        }
      } catch (error) {
        console.error('Error reordering images:', error);
        toast.error('Failed to reorder images');
      }
    }
  };

  const canAddMore = cachedImages.length < maxImages && !isUploading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Progress */}
      {isUploading && batchProgress.totalUploads > 0 && (
        <ImageUploadProgress
          batchProgress={batchProgress}
          onRetryUpload={(id) => uploadManagerRef.current?.retryFailedUpload(id)}
          onRetryFailed={() => uploadManagerRef.current?.retryFailed()}
        />
      )}

      {/* Drop Zone */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop images here' : 'Upload Vehicle Images'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop images here, or click to select files
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <Badge variant="outline">JPG, PNG, WebP</Badge>
            <Badge variant="outline">Max {Math.round(maxFileSize / (1024 * 1024))}MB per file</Badge>
            <Badge variant="outline">{cachedImages.length}/{maxImages} images</Badge>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {cachedImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">
              Vehicle Images ({cachedImages.length}/{maxImages})
            </h3>
            {cachedImages.length >= maxImages && (
              <Badge variant="outline" className="text-yellow-600">
                Maximum images reached
              </Badge>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cachedImages.map(img => img.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cachedImages.map((image, index) => (
                  <SortableImageItem
                    key={image.id}
                    id={image.id}
                    image={image}
                    index={index}
                    onRemove={() => removeImage(image.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-3 text-sm text-gray-500">
            <p>• Drag images to reorder them</p>
            <p>• The first image will be used as the main photo</p>
          </div>
        </div>
      )}
    </div>
  );
};
