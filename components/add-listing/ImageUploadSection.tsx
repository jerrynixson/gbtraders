"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  GripVertical,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadManager, BatchUploadProgress, defaultUploadConfig, deleteImageFromStorage } from '@/lib/uploadManager';
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
  images: File[];
  existingImages: string[];
  uploadedImageUrls?: string[]; // Add uploaded URLs prop
  onImagesChange: (images: File[]) => void;
  onExistingImagesChange: (images: string[]) => void;
  onUploadComplete: (urls: string[]) => void;
  onUploadedImageRemove?: (url: string) => void; // Add callback for removing uploaded images
  maxImages?: number;
  maxFileSize?: number;
  vehicleId?: string; // Add vehicle ID prop
  className?: string;
}

interface SortableImageItemProps {
  id: string;
  image: File | string;
  index: number;
  isExisting: boolean;
  objectUrl?: string; // Add object URL prop
  onRemove: () => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({
  id,
  image,
  index,
  isExisting,
  objectUrl,
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

  const imageUrl = isExisting 
    ? (image as string)
    : objectUrl || '';

  const imageName = isExisting
    ? (image as string).split('/').pop() || 'Image'
    : (image as File).name;

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
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                }}
                onLoad={() => {
                  // Image loaded successfully
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            {/* Drag handle */}
            <div
              {...listeners}
              className="absolute top-1 left-1 p-1 bg-black/50 rounded cursor-grab hover:bg-black/70 transition-colors"
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
            
            {/* Image type badge */}
            <Badge
              variant="secondary"
              className="absolute bottom-1 left-1 text-xs bg-black/50 text-white"
            >
              {isExisting ? 'Existing' : 'New'}
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
  images,
  existingImages,
  uploadedImageUrls = [],
  onImagesChange,
  onExistingImagesChange,
  onUploadComplete,
  onUploadedImageRemove,
  maxImages = 20,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  vehicleId,
  className = "",
}) => {
  const [batchProgress, setBatchProgress] = useState<BatchUploadProgress>({
    overallProgress: 0,
    completedUploads: 0,
    totalUploads: 0,
    activeUploads: 0,
    uploads: {},
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [objectUrls, setObjectUrls] = useState<Map<number, string>>(new Map());
  const uploadManagerRef = useRef<UploadManager | null>(null);

  // Initialize upload manager
  useEffect(() => {
    const config = {
      ...defaultUploadConfig,
      batchSize: 4, // Explicitly set batch size for parallel processing
      vehicleId: vehicleId || 'temp'
    };
    uploadManagerRef.current = new UploadManager(config);
    uploadManagerRef.current.setProgressCallback(setBatchProgress);

    return () => {
      if (uploadManagerRef.current) {
        uploadManagerRef.current.destroy();
      }
    };
  }, [vehicleId]);

  // Manage object URLs for file previews
  useEffect(() => {
    const newObjectUrls = new Map<number, string>();
    
    images.forEach((file, index) => {
      if (!objectUrls.has(index)) {
        const url = URL.createObjectURL(file);
        newObjectUrls.set(index, url);
      } else {
        newObjectUrls.set(index, objectUrls.get(index)!);
      }
    });

    // Clean up old URLs that are no longer needed
    objectUrls.forEach((url, index) => {
      if (index >= images.length) {
        URL.revokeObjectURL(url);
      }
    });

    setObjectUrls(newObjectUrls);

    // Cleanup function
    return () => {
      newObjectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Files dropped:', { accepted: acceptedFiles, rejected: rejectedFiles });
    console.log('Max file size:', maxFileSize);
    
    // Handle rejected files first
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        console.log('Rejected file error:', error);
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
      console.log(`Checking file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      if (!file.type.startsWith('image/')) {
        console.log(`File ${file.name} is not an image`);
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > maxFileSize) {
        console.log(`File ${file.name} is too large: ${file.size} > ${maxFileSize}`);
        toast.error(`${file.name} is too large (max ${Math.round(maxFileSize / (1024 * 1024))}MB)`);
        return false;
      }
      return true;
    });

    console.log('Valid files:', validFiles);
    console.log('Current image counts:', { existing: existingImages.length, new: images.length });

    if (existingImages.length + images.length + validFiles.length > maxImages) {
      console.log('Too many images');
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (validFiles.length > 0) {
      // Add files to the form state
      onImagesChange([...images, ...validFiles]);

      // Start upload process with batch processing
      if (uploadManagerRef.current) {
        setIsUploading(true);
        const uploadIds = uploadManagerRef.current.addFiles(validFiles);
        
        // Get batch size with multiple fallback methods
        let batchSize = 4; // Default fallback
        try {
          if (uploadManagerRef.current.getBatchSize) {
            batchSize = uploadManagerRef.current.getBatchSize();
          } else if (uploadManagerRef.current.getCurrentBatchInfo) {
            batchSize = uploadManagerRef.current.getCurrentBatchInfo().batchSize;
          }
        } catch (error) {
          console.warn('Could not get batch size, using default:', error);
        }
      }
    }
  }, [images, existingImages, maxImages, maxFileSize, onImagesChange]);

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
      
      if (uploadManagerRef.current) {
        const completedUrls = uploadManagerRef.current.getCompletedUploads();
        onUploadComplete(completedUrls);
        setIsUploading(false);
        
        // Clear the upload manager state
        uploadManagerRef.current.clear();
      }
    }
  }, [batchProgress, onUploadComplete]);

  const removeImage = (index: number) => {
    // Clean up object URL before removing the image
    const url = objectUrls.get(index);
    if (url) {
      URL.revokeObjectURL(url);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Show feedback to user
    toast.success('Image removed from upload queue');
  };

  const removeExistingImage = async (index: number) => {
    const imageUrl = existingImages[index];
    
    // If this is an uploaded image URL, delete it from storage and notify parent
    if (uploadedImageUrls.includes(imageUrl)) {
      try {
        // Show loading toast
        const loadingToast = toast.loading('Deleting image from storage...');
        
        const deleted = await deleteImageFromStorage(imageUrl, vehicleId);
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        if (deleted && onUploadedImageRemove) {
          onUploadedImageRemove(imageUrl);
          toast.success('Image deleted successfully');
        } else {
          toast.error('Failed to delete image from storage');
          return; // Don't remove from UI if storage deletion failed
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image from storage');
        return;
      }
    } else {
      // For existing images that weren't uploaded in this session, just show a simple message
      toast.success('Image removed from listing');
    }
    
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    onExistingImagesChange(newExistingImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Determine if we're dealing with existing or new images
      const isActiveExisting = activeId.startsWith('existing-');
      const isOverExisting = overId.startsWith('existing-');

      if (isActiveExisting && isOverExisting) {
        // Reordering existing images
        const activeIndex = parseInt(activeId.replace('existing-', ''));
        const overIndex = parseInt(overId.replace('existing-', ''));
        
        const newExistingImages = arrayMove(existingImages, activeIndex, overIndex);
        onExistingImagesChange(newExistingImages);
      } else if (!isActiveExisting && !isOverExisting) {
        // Reordering new images
        const activeIndex = parseInt(activeId.replace('new-', ''));
        const overIndex = parseInt(overId.replace('new-', ''));
        
        const newImages = arrayMove(images, activeIndex, overIndex);
        onImagesChange(newImages);
      }
      // Note: We don't allow mixing existing and new images in the same drag operation
    }
  };

  // Combine images for display
  const allImageIds = [
    ...existingImages.map((_, index) => `existing-${index}`),
    ...images.map((_, index) => `new-${index}`),
  ];

  const totalImages = existingImages.length + images.length;
  const canAddMore = totalImages < maxImages && !isUploading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Progress */}
      {isUploading && batchProgress.totalUploads > 0 && (
        <ImageUploadProgress
          batchProgress={batchProgress}
          onPauseUpload={(id) => uploadManagerRef.current?.pauseUpload(id)}
          onResumeUpload={(id) => uploadManagerRef.current?.resumeUpload(id)}
          onRemoveUpload={(id) => uploadManagerRef.current?.removeUpload(id)}
          onRetryUpload={(id) => uploadManagerRef.current?.retryFailedUpload(id)}
          onPauseAll={() => uploadManagerRef.current?.pauseAll()}
          onResumeAll={() => uploadManagerRef.current?.resumeAll()}
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
            <Badge variant="outline">{totalImages}/{maxImages} images</Badge>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {totalImages > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">
              Vehicle Images ({totalImages}/{maxImages})
            </h3>
            {totalImages >= maxImages && (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Maximum images reached</span>
              </div>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allImageIds}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Existing Images */}
                {existingImages.map((image, index) => (
                  <SortableImageItem
                    key={`existing-${index}`}
                    id={`existing-${index}`}
                    image={image}
                    index={index}
                    isExisting={true}
                    onRemove={() => removeExistingImage(index)}
                  />
                ))}
                
                {/* New Images */}
                {images.map((image, index) => (
                  <SortableImageItem
                    key={`new-${index}`}
                    id={`new-${index}`}
                    image={image}
                    index={index}
                    isExisting={false}
                    objectUrl={objectUrls.get(index)}
                    onRemove={() => removeImage(index)}
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