// Image compression worker (compiled from TypeScript)
// Handles image resizing and WebP conversion in a separate thread with multi-stage compression

self.onmessage = async (event) => {
  const { type, file, id, maxWidth, quality } = event.data;

  if (type !== 'COMPRESS_IMAGE') {
    return;
  }

  try {
    const { compressedFile, compressionStage } = await compressImageWithStages(file, maxWidth, quality);
    
    const response = {
      type: 'IMAGE_COMPRESSED',
      id,
      compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionStage
    };

    self.postMessage(response);
  } catch (error) {
    const errorResponse = {
      type: 'IMAGE_COMPRESSION_ERROR',
      id,
      error: error instanceof Error ? error.message : 'Unknown compression error'
    };

    self.postMessage(errorResponse);
  }
};

async function compressImageWithStages(file, maxWidth, quality) {
  const TARGET_SIZE = 150 * 1024; // 150KB target
  
  // Get original image dimensions to prevent upscaling
  const originalDimensions = await getImageDimensions(file);
  const originalWidth = originalDimensions.width;
  
  // Determine maximum width to prevent upscaling for images smaller than 1000px
  const effectiveMaxWidth = originalWidth < 1000 ? originalWidth : 1200;
  const stage3MaxWidth = originalWidth < 1000 ? originalWidth : 1000;
  
  // Stage 1: Resize to effective max width, quality=70
  let compressedFile = await compressImage(file, effectiveMaxWidth, 0.7);
  
  // Check if under 150KB
  if (compressedFile.size <= TARGET_SIZE) {
    return { compressedFile, compressionStage: 'stage1' };
  }
  
  // Stage 2: Re-encode at quality=65 (same size)
  compressedFile = await compressImage(file, effectiveMaxWidth, 0.65);
  
  // Check if under 150KB
  if (compressedFile.size <= TARGET_SIZE) {
    return { compressedFile, compressionStage: 'stage2' };
  }
  
  // Stage 3: Resize to smaller width if original allows, quality=65
  if (stage3MaxWidth < effectiveMaxWidth) {
    compressedFile = await compressImage(file, stage3MaxWidth, 0.65);
  }
  
  if (compressedFile.size <= TARGET_SIZE) {
    return { compressedFile, compressionStage: 'stage3' };
  } else {
    return { compressedFile, compressionStage: 'stage3_max' };
  }
}

async function compressImage(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    // Check if OffscreenCanvas is supported
    if (typeof OffscreenCanvas === 'undefined') {
      reject(new Error('OffscreenCanvas not supported in this browser'));
      return;
    }

    // Create ImageBitmap from the file
    createImageBitmap(file)
      .then(imageBitmap => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = calculateDimensions(imageBitmap.width, imageBitmap.height, maxWidth);
          
          // Create OffscreenCanvas for processing
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw image on canvas
          ctx.drawImage(imageBitmap, 0, 0, width, height);
          
          // Convert to WebP blob
          canvas.convertToBlob({
            type: 'image/webp',
            quality: quality
          }).then(blob => {
            if (!blob) {
              reject(new Error('Failed to convert image to WebP'));
              return;
            }

            // Create new file with WebP extension
            const fileName = file.name.replace(/\.[^/.]+$/, '.webp');
            const compressedFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now()
            });

            // Clean up ImageBitmap
            imageBitmap.close();
            
            resolve(compressedFile);
          }).catch(error => {
            imageBitmap.close();
            reject(error);
          });
          
        } catch (error) {
          imageBitmap.close();
          reject(error);
        }
      })
      .catch(error => {
        reject(new Error('Failed to create ImageBitmap: ' + error.message));
      });
  });
}

function calculateDimensions(originalWidth, originalHeight, maxWidth) {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalHeight / originalWidth;
  const newWidth = maxWidth;
  const newHeight = Math.round(newWidth * aspectRatio);
  
  return { width: newWidth, height: newHeight };
}

async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    createImageBitmap(file)
      .then(imageBitmap => {
        const dimensions = {
          width: imageBitmap.width,
          height: imageBitmap.height
        };
        imageBitmap.close();
        resolve(dimensions);
      })
      .catch(error => {
        reject(new Error('Failed to get image dimensions: ' + error.message));
      });
  });
}
