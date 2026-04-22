"use client";

import { useState, useRef, useCallback } from "react";

interface FileInfo {
  name: string;
  size: string;
  type: string;
  width: number;
  height: number;
}

interface ExifData {
  // Camera
  make?: string;
  model?: string;
  orientation?: string;
  // Exposure
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
  // GPS
  gpsLatitude?: string;
  gpsLongitude?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readUint16(view: DataView, offset: number, littleEndian: boolean): number {
  return view.getUint16(offset, littleEndian);
}

function readUint32(view: DataView, offset: number, littleEndian: boolean): number {
  return view.getUint32(offset, littleEndian);
}

function readAsciiString(view: DataView, offset: number, length: number): string {
  let str = "";
  for (let i = 0; i < length - 1; i++) {
    const c = view.getUint8(offset + i);
    if (c === 0) break;
    str += String.fromCharCode(c);
  }
  return str.trim();
}

function readRational(view: DataView, offset: number, littleEndian: boolean): number {
  const num = readUint32(view, offset, littleEndian);
  const den = readUint32(view, offset + 4, littleEndian);
  return den !== 0 ? num / den : 0;
}

function parseGpsCoord(view: DataView, offset: number, littleEndian: boolean): string {
  const deg = readRational(view, offset, littleEndian);
  const min = readRational(view, offset + 8, littleEndian);
  const sec = readRational(view, offset + 16, littleEndian);
  return `${deg}° ${min}' ${sec.toFixed(2)}"`;
}

const ORIENTATION_LABELS: Record<number, string> = {
  1: "Normal",
  2: "Flipped horizontal",
  3: "Rotated 180°",
  4: "Flipped vertical",
  5: "Rotated 90° CW + flipped",
  6: "Rotated 90° CW",
  7: "Rotated 90° CCW + flipped",
  8: "Rotated 90° CCW",
};

function parseExif(buffer: ArrayBuffer): ExifData {
  const data: ExifData = {};
  const view = new DataView(buffer);

  // Check JPEG SOI marker
  if (view.getUint16(0) !== 0xffd8) return data;

  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    offset += 2;

    if (marker === 0xffe1) {
      // APP1 marker
      const segmentLength = view.getUint16(offset, false);
      offset += 2;

      // Check for "Exif\0\0"
      const exifHeader =
        view.getUint8(offset) === 0x45 &&
        view.getUint8(offset + 1) === 0x78 &&
        view.getUint8(offset + 2) === 0x69 &&
        view.getUint8(offset + 3) === 0x66 &&
        view.getUint8(offset + 4) === 0x00 &&
        view.getUint8(offset + 5) === 0x00;

      if (!exifHeader) {
        offset += segmentLength - 2;
        continue;
      }

      const tiffStart = offset + 6;

      // Byte order
      const byteOrder = view.getUint16(tiffStart, false);
      const littleEndian = byteOrder === 0x4949; // "II" = little endian, "MM" = big endian

      // IFD0 offset
      const ifd0Offset = tiffStart + readUint32(view, tiffStart + 4, littleEndian);
      const ifd0Count = readUint16(view, ifd0Offset, littleEndian);

      let exifIfdOffset = 0;
      let gpsIfdOffset = 0;

      for (let i = 0; i < ifd0Count; i++) {
        const entryOffset = ifd0Offset + 2 + i * 12;
        const tag = readUint16(view, entryOffset, littleEndian);
        const type = readUint16(view, entryOffset + 2, littleEndian);
        const count = readUint32(view, entryOffset + 4, littleEndian);
        const valueOffset = entryOffset + 8;

        switch (tag) {
          case 0x010f: // Make
            {
              const strOffset = count > 4 ? tiffStart + readUint32(view, valueOffset, littleEndian) : valueOffset;
              data.make = readAsciiString(view, strOffset, count);
            }
            break;
          case 0x0110: // Model
            {
              const strOffset = count > 4 ? tiffStart + readUint32(view, valueOffset, littleEndian) : valueOffset;
              data.model = readAsciiString(view, strOffset, count);
            }
            break;
          case 0x0112: // Orientation
            data.orientation = ORIENTATION_LABELS[readUint16(view, valueOffset, littleEndian)] ?? "Unknown";
            break;
          case 0x0132: // DateTime
            {
              const strOffset = count > 4 ? tiffStart + readUint32(view, valueOffset, littleEndian) : valueOffset;
              data.dateTime = readAsciiString(view, strOffset, count);
            }
            break;
          case 0x8769: // ExifIFD pointer
            exifIfdOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
            break;
          case 0x8825: // GPS IFD pointer
            gpsIfdOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
            break;
        }
      }

      // Parse ExifIFD
      if (exifIfdOffset > 0) {
        const exifCount = readUint16(view, exifIfdOffset, littleEndian);
        for (let i = 0; i < exifCount; i++) {
          const entryOffset = exifIfdOffset + 2 + i * 12;
          const tag = readUint16(view, entryOffset, littleEndian);
          const valueOffset = entryOffset + 8;

          switch (tag) {
            case 0x829a: // ExposureTime
              {
                const dataOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
                const num = readUint32(view, dataOffset, littleEndian);
                const den = readUint32(view, dataOffset + 4, littleEndian);
                data.exposureTime = den > 1 ? `1/${Math.round(den / num)}s` : `${num}s`;
              }
              break;
            case 0x829d: // FNumber
              {
                const dataOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
                const val = readRational(view, dataOffset, littleEndian);
                data.fNumber = `f/${val.toFixed(1)}`;
              }
              break;
            case 0x8827: // ISO
              data.iso = String(readUint16(view, valueOffset, littleEndian));
              break;
            case 0x920a: // FocalLength
              {
                const dataOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
                const val = readRational(view, dataOffset, littleEndian);
                data.focalLength = `${val.toFixed(0)}mm`;
              }
              break;
            case 0xa002: // PixelXDimension (handled via canvas)
              break;
            case 0xa003: // PixelYDimension
              break;
          }
        }
      }

      // Parse GPS IFD
      if (gpsIfdOffset > 0) {
        const gpsCount = readUint16(view, gpsIfdOffset, littleEndian);
        let latRef = "N";
        let lonRef = "E";
        let latOffset = 0;
        let lonOffset = 0;

        for (let i = 0; i < gpsCount; i++) {
          const entryOffset = gpsIfdOffset + 2 + i * 12;
          const tag = readUint16(view, entryOffset, littleEndian);
          const valueOffset = entryOffset + 8;

          switch (tag) {
            case 0x0001: // GPSLatitudeRef
              latRef = String.fromCharCode(view.getUint8(valueOffset));
              break;
            case 0x0002: // GPSLatitude
              latOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
              break;
            case 0x0003: // GPSLongitudeRef
              lonRef = String.fromCharCode(view.getUint8(valueOffset));
              break;
            case 0x0004: // GPSLongitude
              lonOffset = tiffStart + readUint32(view, valueOffset, littleEndian);
              break;
          }
        }

        if (latOffset > 0) {
          data.gpsLatitude = `${parseGpsCoord(view, latOffset, littleEndian)} ${latRef}`;
        }
        if (lonOffset > 0) {
          data.gpsLongitude = `${parseGpsCoord(view, lonOffset, littleEndian)} ${lonRef}`;
        }
      }

      break;
    } else if ((marker & 0xff00) === 0xff00) {
      // Skip other markers
      const segLen = view.getUint16(offset, false);
      offset += segLen;
    } else {
      break;
    }
  }

  return data;
}

function MetaTable({ rows }: { rows: [string, string | undefined][] }) {
  const visible = rows.filter(([, v]) => v !== undefined && v !== "");
  if (visible.length === 0) return null;
  return (
    <table className="w-full text-sm">
      <tbody>
        {visible.map(([label, value]) => (
          <tr key={label} className="border-b border-gray-100 last:border-0">
            <td className="py-2 pr-4 text-gray-500 font-medium w-36 align-top">{label}</td>
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

export default function ImageMetadataViewer() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    setExif(null);
    setFileInfo(null);
    setPreview(null);
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const blob = new Blob([buffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        setFileInfo({
          name: file.name,
          size: formatBytes(file.size),
          type: file.type || "Unknown",
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        const parsedExif = parseExif(buffer);
        setExif(parsedExif);
        setPreview(url);
        setIsLoading(false);
      };

      img.onerror = () => {
        setError("Could not load image. Make sure the file is a valid image.");
        setIsLoading(false);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    };

    reader.onerror = () => {
      setError("Failed to read file.");
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      processFile(file);
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

  const hasCamera = exif && (exif.make || exif.model || exif.orientation);
  const hasExposure = exif && (exif.exposureTime || exif.fNumber || exif.iso || exif.focalLength || exif.dateTime);
  const hasGps = exif && (exif.gpsLatitude || exif.gpsLongitude);
  const hasAnyExif = hasCamera || hasExposure || hasGps;

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
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-base font-medium text-gray-700">Drop an image here or click to browse</p>
            <p className="text-sm text-gray-500 mt-1">JPEG, PNG, WebP, HEIC — EXIF data parsed from JPEG</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-6 text-gray-500 text-sm">Reading metadata...</div>
      )}

      {/* Results */}
      {fileInfo && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-1">
            {preview && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full object-contain max-h-64 bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="lg:col-span-2 space-y-4">
            <Section title="File Info">
              <MetaTable
                rows={[
                  ["Name", fileInfo.name],
                  ["Size", fileInfo.size],
                  ["Type", fileInfo.type],
                  ["Dimensions", `${fileInfo.width} × ${fileInfo.height} px`],
                ]}
              />
            </Section>

            {hasCamera && (
              <Section title="Camera">
                <MetaTable
                  rows={[
                    ["Make", exif.make],
                    ["Model", exif.model],
                    ["Orientation", exif.orientation],
                  ]}
                />
              </Section>
            )}

            {hasExposure && (
              <Section title="Exposure">
                <MetaTable
                  rows={[
                    ["Date / Time", exif.dateTime],
                    ["Exposure Time", exif.exposureTime],
                    ["Aperture", exif.fNumber],
                    ["ISO", exif.iso],
                    ["Focal Length", exif.focalLength],
                  ]}
                />
              </Section>
            )}

            {hasGps && (
              <Section title="GPS">
                <MetaTable
                  rows={[
                    ["Latitude", exif.gpsLatitude],
                    ["Longitude", exif.gpsLongitude],
                  ]}
                />
                {exif.gpsLatitude && exif.gpsLongitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      exif.gpsLatitude + " " + exif.gpsLongitude
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Google Maps →
                  </a>
                )}
              </Section>
            )}

            {exif && !hasAnyExif && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-800 text-sm">
                No EXIF metadata found. This image may not contain EXIF data, or it may have been stripped (common with PNGs and images shared via social media).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
