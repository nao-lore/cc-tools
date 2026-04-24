"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ScanResult {
  id: string;
  text: string;
  timestamp: Date;
  imageDataUrl?: string;
}

interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getImageFormat(dataUrl: string): string {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
  if (dataUrl.startsWith("data:image/gif")) return "GIF";
  if (dataUrl.startsWith("data:image/webp")) return "WebP";
  if (dataUrl.startsWith("data:image/bmp")) return "BMP";
  return "Unknown";
}

function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

// Attempt QR decode using BarcodeDetector API (available in Chrome/Edge)
async function tryBarcodeDetector(
  canvas: HTMLCanvasElement
): Promise<string | null> {
  const BarcodeDetectorAPI = (
    window as Window & {
      BarcodeDetector?: new (opts: {
        formats: string[];
      }) => {
        detect: (src: HTMLCanvasElement) => Promise<Array<{ rawValue: string }>>;
      };
    }
  ).BarcodeDetector;

  if (!BarcodeDetectorAPI) return null;

  try {
    const detector = new BarcodeDetectorAPI({ formats: ["qr_code"] });
    const results = await detector.detect(canvas);
    if (results.length > 0) return results[0].rawValue;
  } catch {
    // BarcodeDetector not supported or failed
  }
  return null;
}

export default function QrReader() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState<boolean | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const BarcodeDetectorAPI = (
      window as Window & { BarcodeDetector?: unknown }
    ).BarcodeDetector;
    setHasBarcodeDetector(!!BarcodeDetectorAPI);
  }, []);

  const processImage = useCallback(
    async (dataUrl: string, fileSizeBytes?: number) => {
      setResult(null);
      setError(null);
      setIsDecoding(true);
      setImageSrc(dataUrl);

      const img = new Image();
      img.onload = async () => {
        // Set image info
        setImageInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: getImageFormat(dataUrl),
          size: fileSizeBytes ? formatBytes(fileSizeBytes) : "unknown",
        });

        // Draw to canvas
        const canvas = canvasRef.current;
        if (!canvas) {
          setIsDecoding(false);
          return;
        }
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsDecoding(false);
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Try BarcodeDetector first
        const decoded = await tryBarcodeDetector(canvas);
        if (decoded) {
          setResult(decoded);
          setHistory((prev) => [
            {
              id: Date.now().toString(),
              text: decoded,
              timestamp: new Date(),
              imageDataUrl: dataUrl,
            },
            ...prev.slice(0, 9),
          ]);
          setIsDecoding(false);
          return;
        }

        // BarcodeDetector not available or found nothing — show analysis fallback
        setError(
          hasBarcodeDetector === false
            ? "QR decoding requires a browser with BarcodeDetector API support (Chrome 83+, Edge 83+). This browser does not support it. Try opening in Chrome."
            : "No QR code detected in the image. Make sure the QR code is clearly visible, well-lit, and not too small."
        );
        setIsDecoding(false);
      };

      img.onerror = () => {
        setError("Failed to load image. Please try a different file.");
        setIsDecoding(false);
      };

      img.src = dataUrl;
    },
    [hasBarcodeDetector]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPEG, WebP, etc.).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        processImage(dataUrl, file.size);
      };
      reader.readAsDataURL(file);
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          return;
        }
      }
    },
    [handleFile]
  );

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          return;
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [handleFile]);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setImageSrc(null);
    setImageInfo(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleHistoryCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleHistoryClear = () => setHistory([]);

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      {/* Canvas (hidden, used for decoding) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16h16M4 8h16"
            />
          </svg>
          <div>
            <p className="text-base font-medium text-gray-700">
              Drop image here, click to browse, or paste from clipboard
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPEG, WebP, GIF, BMP supported
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm font-mono">
              Ctrl+V
            </kbd>
            <span>to paste screenshot directly</span>
          </div>
        </div>
      </div>

      {/* Image preview + result */}
      {imageSrc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image preview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">
                Uploaded Image
              </span>
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Uploaded QR code"
                className="w-full h-auto max-h-64 object-contain rounded"
              />
              {imageInfo && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-400">Format</span>
                    <p className="font-medium text-gray-700">{imageInfo.format}</p>
                  </div>
                  <div className="bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-400">Size</span>
                    <p className="font-medium text-gray-700">{imageInfo.size}</p>
                  </div>
                  <div className="bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-400">Width</span>
                    <p className="font-medium text-gray-700">
                      {imageInfo.width}px
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-400">Height</span>
                    <p className="font-medium text-gray-700">
                      {imageInfo.height}px
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result panel */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">
                Decoded Result
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3 min-h-[200px]">
              {isDecoding && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <svg
                    className="w-8 h-8 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span className="text-sm">Decoding QR code...</span>
                </div>
              )}

              {!isDecoding && result && (
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Decoded
                    </span>
                    {isUrl(result) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        URL
                      </span>
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 break-all text-sm text-gray-800 font-mono border border-gray-100">
                    {result}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy Text
                        </>
                      )}
                    </button>
                    {isUrl(result) && (
                      <a
                        href={result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Open
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!isDecoding && error && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-sm text-amber-800">{error}</p>
                  </div>
                  {imageInfo && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="font-medium text-gray-600">Image Analysis:</p>
                      <p>
                        {imageInfo.width} x {imageInfo.height}px &middot;{" "}
                        {imageInfo.format} &middot; {imageInfo.size}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!isDecoding && !result && !error && (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  Waiting for image...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              Scan History ({history.length})
            </span>
            <button
              onClick={handleHistoryClear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {item.imageDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageDataUrl}
                    alt=""
                    className="w-10 h-10 object-contain rounded border border-gray-100 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-800 truncate">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => handleHistoryCopy(item.text)}
                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Browser support note */}
      {hasBarcodeDetector === false && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <strong>Browser Support:</strong> QR code decoding uses the
          BarcodeDetector API, which is available in Chrome 83+ and Edge 83+.
          Your current browser does not support this API. For best results,
          please use Google Chrome or Microsoft Edge.
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this QR Code Reader tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Read and decode QR codes from images. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this QR Code Reader tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Read and decode QR codes from images. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
