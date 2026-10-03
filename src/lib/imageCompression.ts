import imageCompression from 'browser-image-compression';

export interface CompressedImageResult {
  dataUrl: string;
  compressedBytes: number;
  originalBytes: number;
  mimeType: string;
  fileName: string;
}

export async function compressAndConvertToDataUrl(
  file: File,
  maxWidthOrHeight = 1200,
  maxSizeMB = 0.14
): Promise<CompressedImageResult> {
  const originalBytes = file.size;

  const compressedFile = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    initialQuality: 0.82,
  });

  const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);

  if (dataUrl.length > 245000) {
    // Secondary pass if base64 string is still near schema boundary
    const tighterFile = await imageCompression(file, {
      maxSizeMB: 0.08,
      maxWidthOrHeight: 900,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.72,
    });
    const tighterDataUrl = await imageCompression.getDataUrlFromFile(tighterFile);
    return {
      dataUrl: tighterDataUrl,
      compressedBytes: tighterFile.size,
      originalBytes,
      mimeType: tighterFile.type || 'image/jpeg',
      fileName: file.name,
    };
  }

  return {
    dataUrl,
    compressedBytes: compressedFile.size,
    originalBytes,
    mimeType: compressedFile.type || file.type || 'image/jpeg',
    fileName: file.name,
  };
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
