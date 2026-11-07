/**
 * Automatically optimizes raster images before uploading over the network.
 * If image is smaller than threshold (1.5MB) or is a video/PDF, returns as-is.
 * Resizes ultra-high-resolution images to max 2400px width/height and 90% JPEG quality,
 * keeping payloads well within Vercel's 4.5MB Serverless function limit.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  // Only optimize raster images larger than 1.5MB
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/gif' ||
    file.type === 'image/svg+xml' ||
    file.size <= 1.5 * 1024 * 1024
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_DIM = 2400;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            return resolve(file);
          }
          const safeName = file.name.replace(/\.[^/.]+$/, '.jpg');
          const optimizedFile = new File([blob], safeName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        'image/jpeg',
        0.90
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
