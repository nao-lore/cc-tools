"use client";

import { useState, useCallback, useMemo, useRef } from "react";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface ImageInfo {
  width: number;
  height: number;
  size: number;
  name: string;
  dataUrl: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(format: OutputFormat): string {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/png") return "png";
  return "webp";
}

export default function CanvasImageEditor() {
  const [original, setOriginal] = useState<ImageInfo | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [aspectLocked, setAspectLocked] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputDataUrl, setOutputDataUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspectRatio = useRef<number>(1);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        aspectRatio.current = img.width / img.height;
        setOriginal({
          width: img.width,
          height: img.height,
          size: file.size,
          name: file.name,
          dataUrl,
        });
        setWidth(String(img.width));
        setHeight(String(img.height));
        setOutputDataUrl(null);
        setOutputSize(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setWidth(val);
      if (aspectLocked && val !== "") {
        const w = parseInt(val, 10);
        if (!isNaN(w) && w > 0) {
          setHeight(String(Math.round(w / aspectRatio.current)));
        }
      }
    },
    [aspectLocked]
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setHeight(val);
      if (aspectLocked && val !== "") {
        const h = parseInt(val, 10);
        if (!isNaN(h) && h > 0) {
          setWidth(String(Math.round(h * aspectRatio.current)));
        }
      }
    },
    [aspectLocked]
  );

  const canProcess = useMemo(() => {
    if (!original) return false;
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    return !isNaN(w) && !isNaN(h) && w > 0 && h > 0 && w <= 16384 && h <= 16384;
  }, [original, width, height]);

  const handleProcess = useCallback(() => {
    if (!original || !canProcess) return;
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const q = format === "image/png" ? undefined : quality;
      const dataUrl = canvas.toDataURL(format, q);
      setOutputDataUrl(dataUrl);

      // Estimate file size from base64
      const base64 = dataUrl.split(",")[1];
      const byteSize = Math.round((base64.length * 3) / 4);
      setOutputSize(byteSize);
    };
    img.src = original.dataUrl;
  }, [original, canProcess, width, height, format, quality]);

  const handleDownload = useCallback(() => {
    if (!outputDataUrl || !original) return;
    const ext = getExtension(format);
    const baseName = original.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = outputDataUrl;
    a.download = `${baseName}_resized.${ext}`;
    a.click();
  }, [outputDataUrl, original, format]);

  return (
    <div className="space-y-8">
      {/* Upload area */}
      <div
        className={`bg-surface rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          isDragging ? "border-accent bg-accent/5" : "border-border"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Upload image"
      >
        <svg
          className="w-10 h-10 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm font-medium text-muted">
          {isDragging ? "Drop image here" : "Drag & drop an image, or click to browse"}
        </p>
        <p className="text-xs text-muted">JPEG, PNG, WebP, GIF, BMP supported</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          aria-hidden="true"
        />
      </div>

      {/* Info + controls */}
      {original && (
        <>
          {/* Original info */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-medium text-muted mb-3">Original</h3>
            <div className="flex flex-wrap gap-4 text-sm text-foreground">
              <span>
                <span className="text-muted">File: </span>
                {original.name}
              </span>
              <span>
                <span className="text-muted">Dimensions: </span>
                {original.width} × {original.height}px
              </span>
              <span>
                <span className="text-muted">Size: </span>
                {formatBytes(original.size)}
              </span>
            </div>
          </div>

          {/* Resize controls */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            <h3 className="text-sm font-medium text-muted">Output Settings</h3>

            {/* Width / height */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted" htmlFor="img-width">
                  Width (px)
                </label>
                <input
                  id="img-width"
                  type="number"
                  min={1}
                  max={16384}
                  value={width}
                  onChange={handleWidthChange}
                  className="w-28 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Lock toggle */}
              <button
                onClick={() => setAspectLocked((v) => !v)}
                title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                className={`mt-5 p-2 rounded-lg border transition-colors ${
                  aspectLocked
                    ? "bg-accent text-white border-accent"
                    : "bg-background border-border text-muted hover:border-accent"
                }`}
                aria-pressed={aspectLocked}
                aria-label="Toggle aspect ratio lock"
              >
                {aspectLocked ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted" htmlFor="img-height">
                  Height (px)
                </label>
                <input
                  id="img-height"
                  type="number"
                  min={1}
                  max={16384}
                  value={height}
                  onChange={handleHeightChange}
                  className="w-28 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Format */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted" htmlFor="img-format">
                Output Format
              </label>
              <select
                id="img-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className="w-44 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>

            {/* Quality slider — JPEG / WebP only */}
            {format !== "image/png" && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted" htmlFor="img-quality">
                    Quality
                  </label>
                  <span className="text-sm text-foreground font-mono">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  id="img-quality"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>Smaller file</span>
                  <span>Best quality</span>
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!canProcess}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Resize Image
            </button>
          </div>

          {/* Output result */}
          {outputDataUrl && (
            <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
              <h3 className="text-sm font-medium text-muted">Result</h3>

              {/* Size comparison */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-muted mb-0.5">Original</p>
                  <p className="text-foreground font-medium">
                    {original.width} × {original.height}px
                  </p>
                  <p className="text-foreground">{formatBytes(original.size)}</p>
                </div>
                <div className="flex items-center text-muted">→</div>
                <div>
                  <p className="text-muted mb-0.5">Output</p>
                  <p className="text-foreground font-medium">
                    {width} × {height}px
                  </p>
                  {outputSize !== null && (
                    <p className="text-foreground">{formatBytes(outputSize)}</p>
                  )}
                </div>
                {outputSize !== null && (
                  <div className="flex items-end">
                    <span
                      className={`text-sm font-medium ${
                        outputSize < original.size ? "text-green-500" : "text-muted"
                      }`}
                    >
                      {outputSize < original.size
                        ? `−${Math.round((1 - outputSize / original.size) * 100)}%`
                        : `+${Math.round((outputSize / original.size - 1) * 100)}%`}
                    </span>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outputDataUrl}
                  alt="Resized preview"
                  className="max-w-full max-h-64 object-contain rounded"
                />
              </div>

              <button
                onClick={handleDownload}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                Download {getExtension(format).toUpperCase()}
              </button>
            </div>
          )}
        </>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Canvas Image Resizer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Resize and convert images client-side using HTML Canvas. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Canvas Image Resizer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Resize and convert images client-side using HTML Canvas. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
