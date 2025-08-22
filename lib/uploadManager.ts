// lib/uploadManager.ts
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage } from './firebase';
import { uploadPerformanceMonitor } from './uploadPerformanceMonitor';

export interface UploadProgress {
  id: string;
  file: File;
  originalFile?: File;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  downloadURL?: string;
  uploadTask?: UploadTask;
  originalSize?: number;
  compressedSize?: number;
}

export interface BatchUploadProgress {
  overallProgress: number;
  completedUploads: number;
  totalUploads: number;
  activeUploads: number;
  estimatedTimeRemaining?: number;
  uploads: Record<string, UploadProgress>;
}

export interface UploadManagerConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  compressionOptions: {
    maxWidth: number;
    quality: number;
  };
  vehicleId?: string; // Add vehicle ID for proper path structure
}

export class UploadManager {
  private config: UploadManagerConfig;
  private worker: Worker | null = null;
  private uploads: Record<string, UploadProgress> = {};
  private progressCallback: ((progress: BatchUploadProgress) => void) | null = null;
  private activeUploads = 0;
  private uploadQueue: string[] = [];
  private isPaused = false;
  private retryTimeouts: Record<string, NodeJS.Timeout> = {};
  private startTime: number = 0;

  constructor(config: UploadManagerConfig) {
    this.config = config;
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      // Check if Worker is supported
      if (typeof Worker === 'undefined') {
        console.warn('Web Workers not supported, compression will be disabled');
        return;
      }

      this.worker = new Worker('/workers/imageWorker.js');
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        // Disable worker if it fails to load
        this.worker = null;
      };
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, id } = event.data;

    if (type === 'IMAGE_COMPRESSED') {
      const { compressedFile, originalSize, compressedSize, compressionStage } = event.data;
      
      // Log compression results
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      const targetSize = 150 * 1024; // 150KB
      const underTarget = compressedSize <= targetSize;
      
      console.log(`🖼️ Image compressed (${compressionStage}): ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${compressionRatio}% reduction) ${underTarget ? '✅' : '⚠️'}`);
      
      this.updateUploadStatus(id, {
        status: 'uploading',
        file: compressedFile,
        originalSize,
        compressedSize,
      });
      this.startFirebaseUpload(id, compressedFile);
    } else if (type === 'IMAGE_COMPRESSION_ERROR') {
      const { error } = event.data;
      this.updateUploadStatus(id, {
        status: 'error',
        error: `Compression failed: ${error}`,
      });
      this.processNextInQueue();
    }
  }

  private updateUploadStatus(id: string, updates: Partial<UploadProgress>): void {
    if (this.uploads[id]) {
      this.uploads[id] = { ...this.uploads[id], ...updates };
      this.notifyProgress();
    }
  }

  private notifyProgress(): void {
    if (!this.progressCallback) return;

    const uploadArray = Object.values(this.uploads);
    const totalUploads = uploadArray.length;
    const completedUploads = uploadArray.filter(u => u.status === 'completed').length;
    const totalProgress = uploadArray.reduce((sum, upload) => sum + upload.progress, 0);
    const overallProgress = totalUploads > 0 ? totalProgress / totalUploads : 0;

    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    if (this.startTime && overallProgress > 0 && overallProgress < 100) {
      const elapsedTime = Date.now() - this.startTime;
      const remainingProgress = 100 - overallProgress;
      estimatedTimeRemaining = Math.round((elapsedTime / overallProgress) * remainingProgress);
    }

    const batchProgress: BatchUploadProgress = {
      overallProgress,
      completedUploads,
      totalUploads,
      activeUploads: this.activeUploads,
      estimatedTimeRemaining,
      uploads: { ...this.uploads },
    };

    this.progressCallback(batchProgress);
  }

  private async startFirebaseUpload(id: string, file: File): Promise<void> {
    try {
      // Record upload start time for performance tracking
      (this.uploads[id] as any).uploadStartTime = Date.now();
      
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      
      // Use the correct path structure based on storage rules
      const vehicleId = this.config.vehicleId || 'temp';
      const storagePath = `vehicles/${vehicleId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      // Store the upload task for pause/resume functionality
      this.updateUploadStatus(id, { uploadTask });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.updateUploadStatus(id, { progress });
        },
        (error) => {
          console.error('Upload error:', error);
          this.handleUploadError(id, error.message);
        },
        async () => {
          try {
            const uploadEndTime = Date.now();
            const upload = this.uploads[id];
            const uploadStartTime = (upload as any).uploadStartTime || uploadEndTime;
            const uploadDuration = uploadEndTime - uploadStartTime;
            
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            this.updateUploadStatus(id, {
              status: 'completed',
              progress: 100,
              downloadURL,
            });
            
            // Record performance metrics
            uploadPerformanceMonitor.recordFileProcessed(
              upload.originalSize || 0,
              upload.compressedSize || upload.originalSize || 0,
              uploadDuration
            );
            uploadPerformanceMonitor.recordConcurrentUploads(this.activeUploads);
            
            this.activeUploads--;
            
            // Check if all uploads are complete
            const allUploads = Object.values(this.uploads);
            const completedUploads = allUploads.filter(u => u.status === 'completed');
            if (completedUploads.length === allUploads.length && allUploads.length > 0) {
              uploadPerformanceMonitor.end();
              uploadPerformanceMonitor.logPerformanceReport();
            }
            
            this.processNextInQueue();
          } catch (error) {
            this.handleUploadError(id, 'Failed to get download URL');
          }
        }
      );
    } catch (error) {
      this.handleUploadError(id, error instanceof Error ? error.message : 'Upload failed');
    }
  }

  private handleUploadError(id: string, errorMessage: string): void {
    const upload = this.uploads[id];
    if (!upload) return;

    const retryCount = (upload as any).retryCount || 0;
    
    if (retryCount < this.config.maxRetries) {
      // Retry with exponential backoff
      const delay = this.config.retryDelay * Math.pow(2, retryCount);
      
      this.updateUploadStatus(id, {
        status: 'error',
        error: `Upload failed. Retrying in ${Math.round(delay / 1000)}s... (${retryCount + 1}/${this.config.maxRetries})`,
      });

      this.retryTimeouts[id] = setTimeout(() => {
        (this.uploads[id] as any).retryCount = retryCount + 1;
        this.retryUpload(id);
      }, delay);
    } else {
      this.updateUploadStatus(id, {
        status: 'error',
        error: `Upload failed after ${this.config.maxRetries} retries: ${errorMessage}`,
      });
      this.activeUploads--;
      this.processNextInQueue();
    }
  }

  private retryUpload(id: string): void {
    const upload = this.uploads[id];
    if (!upload || !upload.originalFile) return;

    this.updateUploadStatus(id, {
      status: 'compressing',
      progress: 0,
      error: undefined,
    });

    // Restart the compression and upload process
    this.compressAndUpload(id, upload.originalFile);
  }

  public retryFailedUpload(id: string): void {
    const upload = this.uploads[id];
    if (!upload || upload.status !== 'error') return;

    // Reset upload status and add back to queue
    this.updateUploadStatus(id, {
      status: 'pending',
      progress: 0,
      error: undefined,
    });

    // Add to queue if not already there
    if (!this.uploadQueue.includes(id)) {
      this.uploadQueue.unshift(id); // Add to front for priority
    }

    // Process the queue to start this upload if there's capacity
    this.processNextInQueue();
  }

  private processNextInQueue(): void {
    if (this.isPaused) {
      return;
    }
    
    if (this.uploadQueue.length === 0) {
      return;
    }

    // Process multiple items in parallel up to batch size
    while (this.activeUploads < this.config.batchSize && this.uploadQueue.length > 0) {
      const nextId = this.uploadQueue.shift();
      if (nextId && this.uploads[nextId]) {
        const upload = this.uploads[nextId];
        if (upload.status === 'pending') {
          this.activeUploads++;
          this.compressAndUpload(nextId, upload.originalFile!);
        }
      }
    }
  }

  private compressAndUpload(id: string, file: File): void {
    if (!this.worker) {
      // If no worker available, skip compression and upload directly
      console.warn('No worker available, uploading original file');
      this.updateUploadStatus(id, {
        status: 'uploading',
        file: file,
        originalSize: file.size,
        compressedSize: file.size,
      });
      this.startFirebaseUpload(id, file);
      return;
    }

    this.updateUploadStatus(id, {
      status: 'compressing',
    });

    this.worker.postMessage({
      type: 'COMPRESS_IMAGE',
      file,
      id,
      maxWidth: this.config.compressionOptions.maxWidth,
      quality: this.config.compressionOptions.quality,
    });
  }

  public addFiles(files: File[]): string[] {
    const ids: string[] = [];
    
    // Start performance monitoring
    if (files.length > 0) {
      uploadPerformanceMonitor.start();
      uploadPerformanceMonitor.setBatchSize(this.config.batchSize);
    }
    
    files.forEach((file) => {
      const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.uploads[id] = {
        id,
        file,
        originalFile: file,
        progress: 0,
        status: 'pending',
        originalSize: file.size,
      };

      this.uploadQueue.push(id);
      ids.push(id);
    });

    if (!this.startTime) {
      this.startTime = Date.now();
    }

    // Notify progress before starting uploads
    this.notifyProgress();
    
    // Start parallel processing immediately for up to batch size
    this.processNextInQueue();
    
    return ids;
  }

  public pauseUpload(id: string): void {
    const upload = this.uploads[id];
    if (upload && upload.uploadTask && upload.status === 'uploading') {
      upload.uploadTask.pause();
      this.updateUploadStatus(id, { status: 'paused' });
    }
  }

  public resumeUpload(id: string): void {
    const upload = this.uploads[id];
    if (upload && upload.uploadTask && upload.status === 'paused') {
      upload.uploadTask.resume();
      this.updateUploadStatus(id, { status: 'uploading' });
    }
  }

  public pauseAll(): void {
    this.isPaused = true;
    Object.values(this.uploads).forEach((upload) => {
      if (upload.status === 'uploading') {
        this.pauseUpload(upload.id);
      }
    });
  }

  public resumeAll(): void {
    this.isPaused = false;
    
    // Resume any paused uploads
    Object.values(this.uploads).forEach((upload) => {
      if (upload.status === 'paused') {
        this.resumeUpload(upload.id);
      }
    });
    
    // Process pending uploads in parallel up to batch size
    this.processNextInQueue();
  }

  public retryFailed(): void {
    // Get failed uploads and add them back to the queue for parallel processing
    const failedUploads = Object.values(this.uploads).filter(upload => upload.status === 'error');
    
    failedUploads.forEach((upload) => {
      // Reset the upload status and add back to queue
      this.updateUploadStatus(upload.id, {
        status: 'pending',
        progress: 0,
        error: undefined,
      });
      
      // Add to front of queue for priority processing
      if (!this.uploadQueue.includes(upload.id)) {
        this.uploadQueue.unshift(upload.id);
      }
    });
    
    // Start processing the queue in parallel
    this.processNextInQueue();
  }

  public removeUpload(id: string): void {
    if (this.uploads[id]) {
      // Cancel upload if in progress
      if (this.uploads[id].uploadTask) {
        this.uploads[id].uploadTask!.cancel();
      }
      
      // Clear retry timeout
      if (this.retryTimeouts[id]) {
        clearTimeout(this.retryTimeouts[id]);
        delete this.retryTimeouts[id];
      }

      delete this.uploads[id];
      
      // Remove from queue if pending
      const queueIndex = this.uploadQueue.indexOf(id);
      if (queueIndex > -1) {
        this.uploadQueue.splice(queueIndex, 1);
      }

      this.notifyProgress();
    }
  }

  public getCompletedUploads(): string[] {
    return Object.values(this.uploads)
      .filter(upload => upload.status === 'completed' && upload.downloadURL)
      .map(upload => upload.downloadURL!);
  }



  public setProgressCallback(callback: (progress: BatchUploadProgress) => void): void {
    this.progressCallback = callback;
  }

  public clear(): void {
    // Cancel all active uploads
    Object.values(this.uploads).forEach((upload) => {
      if (upload.uploadTask) {
        upload.uploadTask.cancel();
      }
    });

    // Clear all retry timeouts
    Object.values(this.retryTimeouts).forEach(timeout => clearTimeout(timeout));
    
    this.uploads = {};
    this.uploadQueue = [];
    this.activeUploads = 0;
    this.retryTimeouts = {};
    this.startTime = 0;
    this.notifyProgress();
  }



  public setBatchSize(batchSize: number): void {
    if (batchSize > 0 && batchSize <= 10) { // Reasonable limits
      this.config.batchSize = batchSize;
      // If we can process more uploads now, do so
      if (this.activeUploads < batchSize) {
        this.processNextInQueue();
      }
    }
  }



  public destroy(): void {
    this.clear();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Default configuration with optimized batch processing
export const defaultUploadConfig: UploadManagerConfig = {
  batchSize: 4, // Process 4 images in parallel
  maxRetries: 3,
  retryDelay: 1000,
  compressionOptions: {
    maxWidth: 1200,
    quality: 0.7,
  },
};

// Vehicle listing specific configuration with enhanced compression
export const vehicleUploadConfig: UploadManagerConfig = {
  batchSize: 4, // Process 4 images in parallel
  maxRetries: 3,
  retryDelay: 1000,
  compressionOptions: {
    maxWidth: 1200, // Initial size, worker will handle multi-stage compression
    quality: 0.7,   // Initial quality, worker will handle quality reduction if needed
  },
};

/**
 * Utility function to delete an image from Firebase Storage using admin SDK
 * @param imageUrl - The download URL of the image to delete
 * @param vehicleId - The vehicle ID (used to construct the path) - optional for backwards compatibility
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function deleteImageFromStorage(imageUrl: string, vehicleId?: string): Promise<boolean> {
  try {
    // Use admin SDK via API endpoint for secure deletion
    const response = await fetch('/api/images/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to delete image via API:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Successfully deleted image via admin SDK:', result.deletedPath);
    return true;
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return false;
  }
}
