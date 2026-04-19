import imageCompression from 'browser-image-compression';

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  initialQuality: number;
  fileType?: string; // e.g. 'image/jpeg', 'image/webp'
}

export const defaultSettings: CompressionSettings = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

export async function compressImage(file: File, settings: CompressionSettings): Promise<File> {
  try {
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: settings.maxSizeMB,
      maxWidthOrHeight: settings.maxWidthOrHeight,
      useWebWorker: settings.useWebWorker,
      initialQuality: settings.initialQuality,
      fileType: settings.fileType,
    });
    
    // browser-image-compression doesn't always handle fileType conversion perfectly in all versions
    // so we might need a fallback if the user explicitly requested a different type.
    
    return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + (settings.fileType === 'image/webp' ? '.webp' : '.jpg'), {
       type: settings.fileType || file.type 
    });
  } catch (error) {
    console.error('Compression failed:', error);
    throw error;
  }
}

export async function convertToFormat(file: File, format: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert to blob'));
      }, format, 0.9);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
