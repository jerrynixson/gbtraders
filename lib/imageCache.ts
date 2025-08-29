// lib/imageCache.ts
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface CachedImage {
  id: string;
  url: string;
  order: number;
  isUploaded: boolean;
  uploadedAt?: Date;
  fileName?: string;
}

export interface ImageCacheData {
  vehicleId: string;
  images: CachedImage[];
  lastSynced: Date;
  isDirty: boolean; // Indicates if cache has unsaved changes
}

class ImageCacheManager {
  private cache: Map<string, ImageCacheData> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  /**
   * Initialize cache for a vehicle
   */
  async initializeCache(vehicleId: string, existingImages: string[] = [], isEditMode = false): Promise<void> {
    // Check if cache is already initialized
    if (this.cache.has(vehicleId)) {
      console.log(`Cache already exists for vehicle ${vehicleId}, clearing and reinitializing`);
      // Clear existing sync interval
      const existingInterval = this.syncIntervals.get(vehicleId);
      if (existingInterval) {
        clearInterval(existingInterval);
        this.syncIntervals.delete(vehicleId);
      }
    }
    
    console.log(`Initializing cache for vehicle ${vehicleId} with ${existingImages.length} existing images (Edit mode: ${isEditMode})`);
    
    const cacheData: ImageCacheData = {
      vehicleId,
      images: existingImages.map((url, index) => ({
        id: `existing-${index}-${Date.now()}`,
        url,
        order: index,
        isUploaded: true,
        uploadedAt: new Date(),
      })),
      lastSynced: new Date(),
      isDirty: false,
    };

    this.cache.set(vehicleId, cacheData);
    
    // Only start periodic sync in edit mode (when vehicle document exists)
    if (isEditMode) {
      console.log(`Starting periodic sync for vehicle ${vehicleId} (edit mode)`);
      this.startPeriodicSync(vehicleId);
    } else {
      console.log(`Skipping periodic sync for vehicle ${vehicleId} (create mode - no document exists yet)`);
    }
    
    console.log(`Cache initialized for vehicle ${vehicleId} with ${cacheData.images.length} images`);
  }

  /**
   * Check if cache is initialized for a vehicle
   */
  isCacheInitialized(vehicleId: string): boolean {
    return this.cache.has(vehicleId);
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(vehicleId: string): { initialized: boolean; imageCount: number } {
    const cacheData = this.cache.get(vehicleId);
    return {
      initialized: !!cacheData,
      imageCount: cacheData?.images.length || 0
    };
  }

  /**
   * Add a new uploaded image to cache
   */
  async addUploadedImage(vehicleId: string, url: string, fileName?: string): Promise<string> {
    let cacheData = this.cache.get(vehicleId);
    
    // Auto-initialize cache if it doesn't exist
    if (!cacheData) {
      console.warn(`Cache not found for vehicle ${vehicleId}, auto-initializing...`);
      await this.initializeCache(vehicleId, []);
      cacheData = this.cache.get(vehicleId);
      
      if (!cacheData) {
        throw new Error(`Failed to initialize cache for vehicle ${vehicleId}`);
      }
    }

    const imageId = `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newImage: CachedImage = {
      id: imageId,
      url,
      order: cacheData.images.length,
      isUploaded: true,
      uploadedAt: new Date(),
      fileName,
    };

    cacheData.images.push(newImage);
    cacheData.isDirty = true;

    this.cache.set(vehicleId, cacheData);
    return imageId;
  }

  /**
   * Remove image from cache and optionally from storage
   */
  async removeImage(vehicleId: string, imageId: string, deleteFromStorage = false): Promise<boolean> {
    const cacheData = this.cache.get(vehicleId);
    if (!cacheData) {
      return false;
    }

    const imageIndex = cacheData.images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return false;
    }

    const image = cacheData.images[imageIndex];

    // Delete from storage if requested
    if (deleteFromStorage && image.isUploaded) {
      try {
        // Check if user is authenticated before attempting storage deletion
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        if (!auth.currentUser) {
          console.error('User not authenticated - cannot delete from storage');
          // Still remove from cache even if storage deletion fails
        } else {
          console.log('User authenticated, attempting storage deletion for:', image.url);
          const deletionSuccess = await this.deleteFromStorage(image.url);
          if (!deletionSuccess) {
            console.error('Storage deletion failed, but continuing with cache removal');
          }
        }
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
        // Don't return false here - still remove from cache even if storage deletion fails
      }
    }

    // Remove from cache and reorder
    cacheData.images.splice(imageIndex, 1);
    this.updateImageOrder(cacheData.images);
    cacheData.isDirty = true;

    this.cache.set(vehicleId, cacheData);
    return true;
  }

  /**
   * Reorder images based on new order array
   */
  reorderImages(vehicleId: string, newOrder: string[]): void {
    const cacheData = this.cache.get(vehicleId);
    if (!cacheData) {
      return;
    }

    const reorderedImages: CachedImage[] = [];
    
    newOrder.forEach((imageId, index) => {
      const image = cacheData.images.find(img => img.id === imageId);
      if (image) {
        reorderedImages.push({
          ...image,
          order: index,
        });
      }
    });

    cacheData.images = reorderedImages;
    cacheData.isDirty = true;
    this.cache.set(vehicleId, cacheData);
  }

  /**
   * Helper to update image order indices
   */
  private updateImageOrder(images: CachedImage[]): void {
    images.forEach((image, index) => {
      image.order = index;
    });
  }

  /**
   * Get all images for a vehicle in order
   */
  getImages(vehicleId: string): CachedImage[] {
    const cacheData = this.cache.get(vehicleId);
    if (!cacheData) {
      return [];
    }

    return [...cacheData.images].sort((a, b) => a.order - b.order);
  }

  /**
   * Get image URLs in order
   */
  getImageUrls(vehicleId: string): string[] {
    return this.getImages(vehicleId).map(img => img.url);
  }

  /**
   * Enable periodic sync for a vehicle (used when vehicle document is created)
   */
  enablePeriodicSync(vehicleId: string): void {
    const cacheData = this.cache.get(vehicleId);
    if (!cacheData) {
      console.warn(`Cannot enable periodic sync - no cache found for vehicle ${vehicleId}`);
      return;
    }
    
    // Only start if not already running
    if (!this.syncIntervals.has(vehicleId)) {
      console.log(`Enabling periodic sync for vehicle ${vehicleId}`);
      this.startPeriodicSync(vehicleId);
    } else {
      console.log(`Periodic sync already enabled for vehicle ${vehicleId}`);
    }
  }

  /**
   * Start periodic sync to Firestore
   */
  private startPeriodicSync(vehicleId: string): void {
    // Clear existing interval if any
    this.stopPeriodicSync(vehicleId);

    const interval = setInterval(async () => {
      await this.syncToFirestore(vehicleId);
    }, this.SYNC_INTERVAL);

    this.syncIntervals.set(vehicleId, interval);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(vehicleId: string): void {
    const interval = this.syncIntervals.get(vehicleId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(vehicleId);
    }
  }

  /**
   * Sync cache to Firestore if dirty
   */
  async syncToFirestore(vehicleId: string, force = false): Promise<boolean> {
    const cacheData = this.cache.get(vehicleId);
    if (!cacheData || (!cacheData.isDirty && !force)) {
      return false;
    }

    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      const imageUrls = this.getImageUrls(vehicleId);

      // Check if document exists before trying to update it
      const { getDoc } = await import('firebase/firestore');
      const docSnap = await getDoc(vehicleRef);
      
      if (!docSnap.exists()) {
        console.log(`Vehicle document ${vehicleId} does not exist yet. Skipping sync.`);
        return false;
      }

      await updateDoc(vehicleRef, {
        images: imageUrls,
        lastImageSync: new Date(),
      });

      cacheData.isDirty = false;
      cacheData.lastSynced = new Date();
      this.cache.set(vehicleId, cacheData);

      console.log(`Synced ${imageUrls.length} images to Firestore for vehicle ${vehicleId}`);
      return true;
    } catch (error) {
      console.error('Failed to sync images to Firestore:', error);
      
      // If it's a "document not found" error in create mode, that's expected
      if (error instanceof Error && error.message.includes('No document to update')) {
        console.log(`Document ${vehicleId} not found - likely in create mode, skipping sync.`);
        return false;
      }
      
      return false;
    }
  }

  /**
   * Final save - sync to Firestore and clean up cache
   * In create mode, this is called after the vehicle document is created
   */
  async finalSave(vehicleId: string): Promise<string[]> {
    // Get image URLs before syncing
    const imageUrls = this.getImageUrls(vehicleId);
    
    // Try to sync to Firestore (will work if document exists)
    // In create mode, the document should exist by now since finalSave is called after vehicle creation
    const syncSuccess = await this.syncToFirestore(vehicleId, true);
    
    if (!syncSuccess) {
      console.log(`Sync failed for vehicle ${vehicleId}, but continuing with cleanup. Images will be included in vehicle document.`);
    }
    
    // Clean up cache and stop sync
    this.stopPeriodicSync(vehicleId);
    this.cache.delete(vehicleId);
    
    console.log(`Final save completed for vehicle ${vehicleId}. Cache cleaned up. Returning ${imageUrls.length} image URLs.`);
    return imageUrls;
  }

  /**
   * Clear cache for a vehicle
   */
  clearCache(vehicleId: string): void {
    this.stopPeriodicSync(vehicleId);
    this.cache.delete(vehicleId);
  }

  /**
   * Check if cache is dirty (has unsaved changes)
   */
  isDirty(vehicleId: string): boolean {
    const cacheData = this.cache.get(vehicleId);
    return cacheData?.isDirty || false;
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(vehicleId: string): { totalImages: number; uploadedImages: number; lastSynced?: Date } {
    const cacheData = this.cache.get(vehicleId);
    if (!cacheData) {
      return { totalImages: 0, uploadedImages: 0 };
    }

    return {
      totalImages: cacheData.images.length,
      uploadedImages: cacheData.images.filter(img => img.isUploaded).length,
      lastSynced: cacheData.lastSynced,
    };
  }

  /**
   * Delete image from Firebase Storage
   */
  private async deleteFromStorage(imageUrl: string): Promise<boolean> {
    try {
      console.log('Attempting to delete image from storage:', imageUrl);
      
      let fullPath = '';
      
      // Try multiple methods to extract the storage path
      try {
        // Method 1: Standard Firebase Storage URL parsing
        const url = new URL(imageUrl);
        const pathStart = url.pathname.indexOf('/o/') + 3;
        const pathEnd = url.pathname.indexOf('?');
        fullPath = decodeURIComponent(url.pathname.slice(pathStart, pathEnd > -1 ? pathEnd : url.pathname.length));
        
        // Handle URL encoding issues (Firebase sometimes double-encodes)
        if (fullPath.includes('%2F')) {
          fullPath = decodeURIComponent(fullPath);
        }
      } catch (urlError) {
        console.error('URL parsing method 1 failed:', urlError);
        
        // Method 2: Extract from Firebase storage URL pattern
        const match = imageUrl.match(/\/o\/(.+?)\?/);
        if (match) {
          fullPath = decodeURIComponent(match[1]);
        } else {
          // Method 3: Try extracting from the URL path directly
          const urlParts = imageUrl.split('/o/');
          if (urlParts.length > 1) {
            const pathPart = urlParts[1].split('?')[0];
            fullPath = decodeURIComponent(pathPart);
          } else {
            throw new Error('Could not extract storage path from URL');
          }
        }
      }
      
      console.log('Extracted storage path:', fullPath);
      
      if (!fullPath) {
        throw new Error('Failed to extract storage path from URL');
      }
      
      const imageRef = ref(storage, fullPath);
      await deleteObject(imageRef);
      console.log('Successfully deleted image from storage:', fullPath);
      return true;
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      // Check if it's a permission error specifically
      if (error instanceof Error && error.message.includes('storage/unauthorized')) {
        console.error('Storage unauthorized error - check if user is authenticated and has delete permissions');
      }
      return false;
    }
  }

  /**
   * Clean up cache for a specific vehicle
   */
  cleanupVehicleCache(vehicleId: string): void {
    console.log(`Cleaning up cache for vehicle ${vehicleId}`);
    
    // Clear sync interval
    const interval = this.syncIntervals.get(vehicleId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(vehicleId);
    }
    
    // Remove from cache
    this.cache.delete(vehicleId);
  }

  /**
   * Cleanup - stop all intervals and clear cache
   */
  destroy(): void {
    this.syncIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.syncIntervals.clear();
    this.cache.clear();
  }
}

// Export singleton instance
export const imageCacheManager = new ImageCacheManager();
