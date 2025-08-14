// Image compression worker (compiled from TypeScript)
// Handles image resizing and WebP conversion in a separate thread

self.onmessage = async (event) => {
  const { type, file, id, maxWidth, quality } = event.data;

  if (type !== 'COMPRESS_IMAGE') {
    return;
  }

  try {
    const compressedFile = await compressImage(file, maxWidth, quality);
    
    const response = {
      type: 'IMAGE_COMPRESSED',
      id,
      compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size
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
