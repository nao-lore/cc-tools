"use client";

import { useState, useRef, useCallback } from "react";

interface ImageInfo {
  name: string;
  size: string;
  mimeType: string;
  format: string;
  width: number | null;
  height: number | null;
  hasAlpha: boolean | null;
  colorDepth: string | null;
  bitDepth: number | null;
  preview: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readU16BE(view: DataView, offset: number): number {
  return view.getUint16(offset, false);
}

function readU32BE(view: DataView, offset: number): number {
  return view.getUint32(offset, false);
}

function detectFormat(buf: Uint8Array): string {
  // JPEG: FF D8
  if (buf[0] === 0xff && buf[1] === 0xd8) return "JPEG";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "PNG";
  // WebP: RIFF????WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "WebP";
  // GIF: GIF87a or GIF89a
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "GIF";
  // AVIF: ftyp box with avif/avis brand
  if (
    buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 &&
    buf[8] === 0x61 && buf[9] === 0x76 && buf[10] === 0x69
  ) return "AVIF";
  // BMP: BM
  if (buf[0] === 0x42 && buf[1] === 0x4d) return "BMP";
  return "Unknown";
}

interface HeaderDetails {
  width: number | null;
  height: number | null;
  hasAlpha: boolean | null;
  colorDepth: string | null;
  bitDepth: number | null;
}

function parseHeaderDetails(buf: Uint8Array, format: string): HeaderDetails {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const none: HeaderDetails = { width: null, height: null, hasAlpha: null, colorDepth: null, bitDepth: null };

  if (format === "PNG") {
    // IHDR chunk starts at offset 16
    if (buf.length < 29) return none;
    const width = readU32BE(view, 16);
    const height = readU32BE(view, 20);
    const bitDepth = buf[24];
    const colorType = buf[25];
    // Color types: 0=Grayscale, 2=RGB, 3=Indexed, 4=Grayscale+Alpha, 6=RGBA
    const colorTypeMap: Record<number, string> = {
      0: "Grayscale",
      2: "RGB",
      3: "Indexed (palette)",
      4: "Grayscale + Alpha",
      6: "RGBA",
    };
    const hasAlpha = colorType === 4 || colorType === 6;
    return {
      width,
      height,
      hasAlpha,
      colorDepth: colorTypeMap[colorType] ?? `Type ${colorType}`,
      bitDepth,
    };
  }

  if (format === "WebP") {
    // Check VP8 variants at offset 12
    if (buf.length < 30) return none;
    const chunk = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    let width: number | null = null;
    let height: number | null = null;
    let hasAlpha: boolean | null = null;

    if (chunk === "VP8 ") {
      // Lossy: width/height at bytes 26-29 (14-bit values)
      if (buf.length >= 30) {
        width = (buf[26] | ((buf[27] & 0x3f) << 8)) + 1;
        height = (buf[28] | ((buf[29] & 0x3f) << 8)) + 1;
        hasAlpha = false;
      }
    } else if (chunk === "VP8L") {
      // Lossless: 4 bytes at offset 21, bit-packed
      if (buf.length >= 25) {
        const bits =
          buf[21] | (buf[22] << 8) | (buf[23] << 16) | (buf[24] << 24);
        width = (bits & 0x3fff) + 1;
        height = ((bits >> 14) & 0x3fff) + 1;
        hasAlpha = ((bits >> 28) & 1) === 1;
      }
    } else if (chunk === "VP8X") {
      // Extended: flags at offset 20, canvas width/height at 24+
      if (buf.length >= 30) {
        const flags = buf[20];
        hasAlpha = (flags & 0x10) !== 0;
        width = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
        height = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;
      }
    }
    return { width, height, hasAlpha, colorDepth: "YCbCr (lossy) / RGB (lossless)", bitDepth: 8 };
  }

  if (format === "GIF") {
    // Logical screen descriptor: width at 6, height at 8 (LE)
    if (buf.length < 10) return none;
    const width = buf[6] | (buf[7] << 8);
    const height = buf[8] | (buf[9] << 8);
    const packed = buf[10];
    const colorTableSize = packed & 0x07;
    const depth = colorTableSize + 1; // bits per primary color
    return {
      width,
      height,
      hasAlpha: true, // GIF supports transparency via color index
      colorDepth: "Indexed (palette)",
      bitDepth: depth,
    };
  }

  if (format === "JPEG") {
    // Scan for SOF0/SOF2 markers
    let offset = 2;
    while (offset < buf.length - 8) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      const segLen = readU16BE(view, offset + 2);
      // SOF0 (0xC0) baseline, SOF1 (0xC1) extended, SOF2 (0xC2) progressive
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        const bitDepth = buf[offset + 4];
        const height = readU16BE(view, offset + 5);
        const width = readU16BE(view, offset + 7);
        const components = buf[offset + 9];
        const colorDepth = components === 1 ? "Grayscale" : components === 3 ? "YCbCr" : `${components} channels`;
        return { width, height, hasAlpha: false, colorDepth, bitDepth };
      }
      offset += 2 + segLen;
    }
    return none;
  }

  if (format === "BMP") {
    if (buf.length < 30) return none;
    const width = view.getInt32(18, true);
    const height = Math.abs(view.getInt32(22, true));
    const bitDepth = view.getUint16(28, true);
    const colorDepth = bitDepth <= 8 ? "Indexed" : bitDepth === 24 ? "RGB" : bitDepth === 32 ? "RGBA" : `${bitDepth}-bit`;
    return { width, height, hasAlpha: bitDepth === 32, colorDepth, bitDepth };
  }

  return none;
}

function inferMime(format: string, file: File): string {
  if (file.type) return file.type;
  const map: Record<string, string> = {
    JPEG: "image/jpeg",
    PNG: "image/png",
    WebP: "image/webp",
    GIF: "image/gif",
    AVIF: "image/avif",
    BMP: "image/bmp",
  };
  return map[format] ?? "application/octet-stream";
}

function MetaTable({ rows }: { rows: [string, string | undefined | null][] }) {
  const visible = rows.filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (visible.length === 0) return null;
  return (
    <table className="w-full text-sm">
      <tbody>
        {visible.map(([label, value]) => (
          <tr key={label} className="border-b border-gray-100 last:border-0">
            <td className="py-2 pr-4 text-gray-500 font-medium w-40 align-top">{label}</td>
            <td className="py-2 text-gray-800 break-all">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

const FORMAT_BADGE: Record<string, string> = {
  JPEG: "bg-yellow-100 text-yellow-800",
  PNG: "bg-blue-100 text-blue-800",
  WebP: "bg-green-100 text-green-800",
  GIF: "bg-purple-100 text-purple-800",
  AVIF: "bg-pink-100 text-pink-800",
  BMP: "bg-gray-100 text-gray-800",
  Unknown: "bg-red-100 text-red-700",
};

export default function ImageFormatInfo() {
  const [items, setItems] = useState<ImageInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File): Promise<ImageInfo> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const buf = new Uint8Array(buffer);

        const format = detectFormat(buf);
        const details = parseHeaderDetails(buf, format);
        const mime = inferMime(format, file);

        // Get image dimensions via Image element if header parse failed
        const blob = new Blob([buffer], { type: mime });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          resolve({
            name: file.name,
            size: formatBytes(file.size),
            mimeType: mime,
            format,
            width: details.width ?? img.naturalWidth,
            height: details.height ?? img.naturalHeight,
            hasAlpha: details.hasAlpha,
            colorDepth: details.colorDepth,
            bitDepth: details.bitDepth,
            preview: url,
          });
        };

        img.onerror = () => {
          // Non-displayable (e.g. AVIF on unsupported browser) — still show info
          URL.revokeObjectURL(url);
          resolve({
            name: file.name,
            size: formatBytes(file.size),
            mimeType: mime,
            format,
            width: details.width,
            height: details.height,
            hasAlpha: details.hasAlpha,
            colorDepth: details.colorDepth,
            bitDepth: details.bitDepth,
            preview: "",
          });
        };

        img.src = url;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      setIsLoading(true);

      const imageFiles = Array.from(files).filter((f) => {
        const lower = f.name.toLowerCase();
        return (
          f.type.startsWith("image/") ||
          lower.endsWith(".webp") ||
          lower.endsWith(".avif") ||
          lower.endsWith(".bmp")
        );
      });

      if (imageFiles.length === 0) {
        setError("No supported image files found. Please upload JPEG, PNG, WebP, GIF, AVIF, or BMP files.");
        setIsLoading(false);
        return;
      }

      try {
        const results = await Promise.all(imageFiles.map(processFile));
        setItems((prev) => {
          const next = [...prev, ...results];
          setSelected(prev.length); // select first newly added
          return next;
        });
      } catch {
        setError("Failed to process one or more files.");
      }

      setIsLoading(false);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const current = items[selected] ?? null;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.webp,.avif,.bmp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-base font-medium text-gray-700">Drop images here or click to browse</p>
            <p className="text-sm text-gray-500 mt-1">JPEG · PNG · WebP · GIF · AVIF · BMP — multiple files supported</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-6 text-gray-500 text-sm">Analyzing file headers...</div>
      )}

      {/* File list (multiple) */}
      {items.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selected === i
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${FORMAT_BADGE[item.format] ?? FORMAT_BADGE.Unknown}`}
              >
                {item.format}
              </span>
              <span className="max-w-[160px] truncate">{item.name}</span>
            </button>
          ))}
          <button
            onClick={() => { setItems([]); setSelected(0); }}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Detail view */}
      {current && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {current.preview ? (
                <img
                  src={current.preview}
                  alt={current.name}
                  className="w-full object-contain max-h-64 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:16px_16px]"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                  Preview not available
                </div>
              )}
              <div className="px-4 py-2 flex items-center gap-2 border-t border-gray-100">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${FORMAT_BADGE[current.format] ?? FORMAT_BADGE.Unknown}`}
                >
                  {current.format}
                </span>
                <span className="text-xs text-gray-500 truncate">{current.name}</span>
              </div>
            </div>
          </div>

          {/* Info panels */}
          <div className="lg:col-span-2 space-y-4">
            <Section title="File Info">
              <MetaTable
                rows={[
                  ["File Name", current.name],
                  ["File Size", current.size],
                  ["MIME Type", current.mimeType],
                  ["Format", current.format === "Unknown" ? "Unknown (unrecognized header)" : current.format],
                ]}
              />
            </Section>

            <Section title="Image Properties">
              <MetaTable
                rows={[
                  [
                    "Dimensions",
                    current.width && current.height
                      ? `${current.width} × ${current.height} px`
                      : null,
                  ],
                  ["Color Space", current.colorDepth],
                  [
                    "Bit Depth",
                    current.bitDepth !== null ? `${current.bitDepth} bit` : null,
                  ],
                  [
                    "Transparency / Alpha",
                    current.hasAlpha === null
                      ? "Unknown"
                      : current.hasAlpha
                      ? "Yes"
                      : "No",
                  ],
                ]}
              />
            </Section>

            {current.format === "Unknown" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-800 text-sm">
                Format could not be detected from the file header. The file may be corrupted or in an unsupported format.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
