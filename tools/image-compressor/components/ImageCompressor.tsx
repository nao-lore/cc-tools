"use client";

import { useState, useCallback, useRef } from "react";
import {
  compressImage,
  formatBytes,
  type CompressOptions,
  type CompressResult,
} from "../lib/compressor";

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  result?: CompressResult;
  status: "pending" | "compressing" | "done" | "error";
  error?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<CompressOptions["format"]>("image/webp");
  const [maxWidth, setMaxWidth] = useState<string>("");
  const [maxHeight, setMaxHeight] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: ImageItem[] = Array.from(files)
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        originalUrl: URL.createObjectURL(file),
        status: "pending" as const,
      }));
    setImages((prev) => [...prev, ...newItems]);
    if (newItems.length > 0 && !selectedId) {
      setSelectedId(newItems[0].id);
    }
  }, [selectedId]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const compressAll = async () => {
    const opts: CompressOptions = {
      quality,
      format,
      maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
    };

    for (const img of images) {
      if (img.status === "done") continue;

      setImages((prev) =>
        prev.map((i) =>
          i.id === img.id ? { ...i, status: "compressing" } : i
        )
      );

      try {
        const result = await compressImage(img.file, opts);
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id ? { ...i, status: "done", result } : i
          )
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? {
                  ...i,
                  status: "error",
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : i
          )
        );
      }
    }
  };

  const downloadOne = (item: ImageItem) => {
    if (!item.result) return;
    const a = document.createElement("a");
    a.href = item.result.url;
    a.download = item.result.fileName;
    a.click();
  };

  const downloadAll = () => {
    images.forEach((img) => {
      if (img.result) downloadOne(img);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      if (selectedId === id) {
        setSelectedId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const clearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.result) URL.revokeObjectURL(img.result.url);
    });
    setImages([]);
    setSelectedId(null);
  };

  const selected = images.find((i) => i.id === selectedId);
  const doneCount = images.filter((i) => i.status === "done").length;
  const totalReduction =
    doneCount > 0
      ? images
          .filter((i) => i.result)
          .reduce((sum, i) => sum + (i.result!.originalSize - i.result!.compressedSize), 0)
      : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">
            Drop images here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, WebP — multiple files allowed
          </p>
        </div>
      </div>

      {/* Controls */}
      {images.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Quality Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>Smaller</span>
                <span>Higher</span>
              </div>
            </div>

            {/* Format Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) =>
                  setFormat(e.target.value as CompressOptions["format"])
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="image/webp">WebP</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>

            {/* Max Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Width (px)
              </label>
              <input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                placeholder="No limit"
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Height (px)
              </label>
              <input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                placeholder="No limit"
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={compressAll}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Compress All ({images.length})
            </button>
            {doneCount > 0 && (
              <button
                onClick={downloadAll}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Download All ({doneCount})
              </button>
            )}
            <button
              onClick={clearAll}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors ml-auto"
            >
              Clear All
            </button>
          </div>

          {/* Summary stats */}
          {doneCount > 0 && (
            <div className="flex gap-6 text-sm text-gray-600">
              <span>
                {doneCount} of {images.length} compressed
              </span>
              <span>Total saved: {formatBytes(totalReduction)}</span>
            </div>
          )}
        </div>
      )}

      {/* Image List + Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thumbnail List */}
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedId(img.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                  selectedId === img.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <img
                  src={img.originalUrl}
                  alt={img.file.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {img.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(img.file.size)}
                  </p>
                  {img.status === "compressing" && (
                    <p className="text-xs text-blue-600">Compressing...</p>
                  )}
                  {img.status === "done" && img.result && (
                    <p
                      className={`text-xs font-medium ${
                        img.result.reductionPercent > 0
                          ? "text-emerald-600"
                          : "text-orange-600"
                      }`}
                    >
                      {img.result.reductionPercent > 0 ? "-" : "+"}
                      {Math.abs(img.result.reductionPercent)}% →{" "}
                      {formatBytes(img.result.compressedSize)}
                    </p>
                  )}
                  {img.status === "error" && (
                    <p className="text-xs text-red-600">{img.error}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {img.result && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadOne(img);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {selected && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-medium text-gray-800 truncate">
                  {selected.file.name}
                </h3>

                {/* Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Original
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatBytes(selected.file.size)}
                      </span>
                    </div>
                    <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                      <img
                        src={selected.originalUrl}
                        alt="Original"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Compressed
                      </span>
                      {selected.result && (
                        <span className="text-xs text-gray-500">
                          {formatBytes(selected.result.compressedSize)}
                        </span>
                      )}
                    </div>
                    <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                      {selected.status === "compressing" && (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-sm">Compressing...</span>
                        </div>
                      )}
                      {selected.status === "done" && selected.result && (
                        <img
                          src={selected.result.url}
                          alt="Compressed"
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                      {selected.status === "pending" && (
                        <span className="text-sm text-gray-400">
                          Click &quot;Compress All&quot; to start
                        </span>
                      )}
                      {selected.status === "error" && (
                        <span className="text-sm text-red-500">
                          {selected.error}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Size comparison bar */}
                {selected.result && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatBytes(selected.result.originalSize)} →{" "}
                        {formatBytes(selected.result.compressedSize)}
                      </span>
                      <span
                        className={`font-semibold ${
                          selected.result.reductionPercent > 0
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }`}
                      >
                        {selected.result.reductionPercent > 0
                          ? `${selected.result.reductionPercent}% smaller`
                          : `${Math.abs(selected.result.reductionPercent)}% larger`}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selected.result.reductionPercent > 0
                            ? "bg-emerald-500"
                            : "bg-orange-500"
                        }`}
                        style={{
                          width: `${Math.max(
                            5,
                            100 - Math.abs(selected.result.reductionPercent)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadOne(selected)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
