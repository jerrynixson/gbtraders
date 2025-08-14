# Firebase Image Deletion Fix

## Problem
When users clicked the cross (X) button to cancel/remove an image during the upload process in the AddVehicleForm component, the image was only removed from the UI state but not deleted from Firebase Storage. This resulted in orphaned files in Firebase Storage that could accumulate over time.

## Root Cause
The image removal functionality (`removeImage` and `removeExistingImage` functions) only updated the local component state but did not interact with Firebase Storage to delete the actual uploaded files.

## Solution Implementation

### 1. Enhanced Upload Manager with Deletion Capability

**File: `lib/uploadManager.ts`**
- Added `deleteImageFromStorage` utility function
- Imports `deleteObject` from Firebase Storage SDK
- Extracts file path from Firebase Storage download URLs
- Handles proper URL decoding and file reference creation

```typescript
export async function deleteImageFromStorage(imageUrl: string, vehicleId?: string): Promise<boolean> {
  try {
    // Extract the file path from the download URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)$/);
    
    if (!pathMatch) {
      console.error('Could not extract path from URL:', imageUrl);
      return false;
    }
    
    // Decode the path (Firebase Storage encodes special characters)
    const encodedPath = pathMatch[1];
    const decodedPath = decodeURIComponent(encodedPath);
    
    // Create a reference to the file and delete it
    const fileRef = ref(storage, decodedPath);
    await deleteObject(fileRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return false;
  }
}
```

### 2. Updated ImageUploadSection Component

**File: `components/add-listing/ImageUploadSection.tsx`**

#### Enhanced Props Interface
- Added `uploadedImageUrls?: string[]` - tracks URLs of successfully uploaded images
- Added `onUploadedImageRemove?: (url: string) => void` - callback for when uploaded images are removed

#### Enhanced removeExistingImage Function
```typescript
const removeExistingImage = async (index: number) => {
  const imageUrl = existingImages[index];
  
  // If this is an uploaded image URL, delete it from storage and notify parent
  if (uploadedImageUrls.includes(imageUrl)) {
    try {
      const deleted = await deleteImageFromStorage(imageUrl, vehicleId);
      if (deleted && onUploadedImageRemove) {
        onUploadedImageRemove(imageUrl);
        toast.success('Image deleted from storage');
      } else {
        toast.error('Failed to delete image from storage');
        return; // Don't remove from UI if storage deletion failed
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image from storage');
      return;
    }
  }
  
  const newExistingImages = existingImages.filter((_, i) => i !== index);
  onExistingImagesChange(newExistingImages);
};
```

### 3. Updated AddVehicleForm Component

**File: `components/add-listing/AddVehicleForm.tsx`**

#### New Handler Function
```typescript
const handleUploadedImageRemove = (url: string) => {
  setUploadedImageUrls(prev => prev.filter(existingUrl => existingUrl !== url))
}
```

#### Enhanced ImageUploadSection Usage
```typescript
<ImageUploadSection
  images={formData.images}
  existingImages={existingImages}
  uploadedImageUrls={uploadedImageUrls}
  onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
  onExistingImagesChange={setExistingImages}
  onUploadComplete={handleUploadComplete}
  onUploadedImageRemove={handleUploadedImageRemove}
  maxImages={MAX_IMAGES}
  maxFileSize={MAX_FILE_SIZE}
  vehicleId={currentVehicleId}
/>
```

## How It Works

### Upload Process
1. User selects images → Images uploaded to Firebase Storage
2. Upload completion triggers `handleUploadComplete` → URLs added to `uploadedImageUrls` state
3. All URLs (existing + uploaded) displayed in UI

### Deletion Process
1. User clicks X button on uploaded image → `removeExistingImage` called
2. Function checks if URL exists in `uploadedImageUrls`
3. If yes → calls `deleteImageFromStorage` to remove from Firebase Storage
4. If deletion successful → calls `onUploadedImageRemove` to update parent state
5. UI updated to remove image from display

### Error Handling
- Shows success toast when image deleted successfully
- Shows error toast if deletion fails
- Prevents UI removal if storage deletion fails
- Logs detailed error information for debugging

## Benefits

1. **No Orphaned Files**: Uploaded images are properly deleted from Firebase Storage
2. **User Feedback**: Toast notifications inform users of success/failure
3. **Robust Error Handling**: Graceful handling of deletion failures
4. **State Consistency**: UI state stays synchronized with actual storage state
5. **Cost Optimization**: Prevents accumulation of unused files in Firebase Storage

## Testing Scenarios

1. **Upload and Cancel**: Upload images, then cancel them before form submission
2. **Partial Deletion**: Upload multiple images, delete some, keep others
3. **Error Handling**: Test with invalid URLs or network issues
4. **Form Submission**: Ensure only non-cancelled images are saved to Firestore

## Future Considerations

1. **Batch Deletion**: Could optimize for deleting multiple images at once
2. **Cleanup on Form Abandon**: Consider deleting uploaded images if user leaves form
3. **Storage Rules**: Ensure Firebase Storage security rules allow deletion
4. **Admin Cleanup**: Periodic cleanup of truly orphaned files
