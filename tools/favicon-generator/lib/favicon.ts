export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512] as const;
export type FaviconSize = (typeof FAVICON_SIZES)[number];

export interface TextOptions {
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  bgColor: string;
}

export interface EmojiOptions {
  emoji: string;
  bgColor: string;
}

export interface ImageOptions {
  image: HTMLImageElement;
  bgColor: string;
}

function createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

function fillBackground(ctx: CanvasRenderingContext2D, size: number, color: string) {
  if (color === "transparent") {
    ctx.clearRect(0, 0, size, size);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
  }
}

export function generateTextFavicon(size: number, options: TextOptions): string {
  const [canvas, ctx] = createCanvas(size);
  fillBackground(ctx, size, options.bgColor);

  const scaledFontSize = (options.fontSize / 100) * size;
  ctx.font = `bold ${scaledFontSize}px ${options.fontFamily}`;
  ctx.fillStyle = options.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(options.text, size / 2, size / 2 + scaledFontSize * 0.05);

  return canvas.toDataURL("image/png");
}

export function generateEmojiFavicon(size: number, options: EmojiOptions): string {
  const [canvas, ctx] = createCanvas(size);
  fillBackground(ctx, size, options.bgColor);

  const emojiSize = size * 0.75;
  ctx.font = `${emojiSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(options.emoji, size / 2, size / 2 + emojiSize * 0.05);

  return canvas.toDataURL("image/png");
}

export function generateImageFavicon(size: number, options: ImageOptions): string {
  const [canvas, ctx] = createCanvas(size);
  fillBackground(ctx, size, options.bgColor);

  const img = options.image;
  const minDim = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - minDim) / 2;
  const sy = (img.naturalHeight - minDim) / 2;
  ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

  return canvas.toDataURL("image/png");
}

export function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)![1];
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

export function downloadDataURL(dataURL: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Build a minimal ICO file from PNG data URLs at 16, 32, 48 */
export function buildIco(pngDataURLs: { size: number; dataURL: string }[]): Blob {
  const pngBlobs = pngDataURLs.map(({ size, dataURL }) => {
    const blob = dataURLtoBlob(dataURL);
    return { size, blob };
  });

  // We need array buffers, so we'll build synchronously from the dataURLs
  const pngBuffers = pngDataURLs.map(({ size, dataURL }) => {
    const bstr = atob(dataURL.split(",")[1]);
    const arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      arr[i] = bstr.charCodeAt(i);
    }
    return { size, data: arr };
  });

  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  let offset = headerSize + dirSize;

  // ICO header: reserved(2) + type(2) + count(2)
  const totalSize = offset + pngBuffers.reduce((sum, b) => sum + b.data.length, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = ICO
  view.setUint16(4, numImages, true);

  // Directory entries
  for (let i = 0; i < numImages; i++) {
    const { size, data } = pngBuffers[i];
    const entryOffset = headerSize + i * dirEntrySize;
    view.setUint8(entryOffset, size < 256 ? size : 0); // width
    view.setUint8(entryOffset + 1, size < 256 ? size : 0); // height
    view.setUint8(entryOffset + 2, 0); // color palette
    view.setUint8(entryOffset + 3, 0); // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, data.length, true); // size of PNG data
    view.setUint32(entryOffset + 12, offset, true); // offset to PNG data
    offset += data.length;
  }

  // PNG data
  let writeOffset = headerSize + dirSize;
  const u8 = new Uint8Array(buffer);
  for (const { data } of pngBuffers) {
    u8.set(data, writeOffset);
    writeOffset += data.length;
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

export function generateMetaTags(baseUrl: string): string {
  return `<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="${baseUrl}/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="${baseUrl}/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="${baseUrl}/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="${baseUrl}/favicon-48x48.png">
<link rel="apple-touch-icon" sizes="180x180" href="${baseUrl}/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="${baseUrl}/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="${baseUrl}/android-chrome-512x512.png">`;
}
