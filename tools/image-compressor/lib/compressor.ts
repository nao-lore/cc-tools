export interface CompressOptions {
  quality: number; // 1-100
  format: "image/jpeg" | "image/png" | "image/webp";
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  fileName: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function calcDimensions(
  origW: number,
  origH: number,
  maxW?: number,
  maxH?: number
): { width: number; height: number } {
  let w = origW;
  let h = origH;

  if (maxW && w > maxW) {
    h = Math.round(h * (maxW / w));
    w = maxW;
  }
  if (maxH && h > maxH) {
    w = Math.round(w * (maxH / h));
    h = maxH;
  }

  return { width: w, height: h };
}

function getOutputExtension(format: string): string {
  switch (format) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function getOutputFileName(originalName: string, format: string): string {
  const baseName = originalName.replace(/\.[^.]+$/, "");
  const ext = getOutputExtension(format);
  return `${baseName}-compressed.${ext}`;
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<CompressResult> {
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const { width, height } = calcDimensions(
    img.naturalWidth,
    img.naturalHeight,
    options.maxWidth,
    options.maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.drawImage(img, 0, 0, width, height);

  const quality = options.quality / 100;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Compression failed"));
      },
      options.format,
      options.format === "image/png" ? undefined : quality
    );
  });

  const url = URL.createObjectURL(blob);
  const originalSize = file.size;
  const compressedSize = blob.size;
  const reductionPercent =
    originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return {
    blob,
    url,
    width,
    height,
    originalSize,
    compressedSize,
    reductionPercent,
    fileName: getOutputFileName(file.name, options.format),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
