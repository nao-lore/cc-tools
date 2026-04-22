"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type OutputFormat = "raw" | "datauri" | "css" | "html";

interface FileInfo {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function ImageToBase64() {
  const [base64, setBase64] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeFormat, setActiveFormat] = useState<OutputFormat>("datauri");
  const [copiedFormat, setCopiedFormat] = useState<OutputFormat | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reverseInput, setReverseInput] = useState("");
  const [reversePreview, setReversePreview] = useState("");
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ];

  const processFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith(".ico")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDataUri(result);
      const b64 = result.split(",")[1] || "";
      setBase64(b64);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setFileInfo({
          name: file.name,
          type: file.type || "image/x-icon",
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setPreviewUrl(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const getOutput = (format: OutputFormat): string => {
    if (!base64) return "";
    switch (format) {
      case "raw":
        return base64;
      case "datauri":
        return dataUri;
      case "css":
        return `background-image: url(${dataUri});`;
      case "html":
        return `<img src="${dataUri}" alt="${fileInfo?.name || "image"}" />`;
    }
  };

  const copyToClipboard = async (format: OutputFormat) => {
    const text = getOutput(format);
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleReverseInput = (value: string) => {
    setReverseInput(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setReversePreview("");
      return;
    }
    // Try to detect format
    if (trimmed.startsWith("data:image")) {
      setReversePreview(trimmed);
    } else if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 20) {
      // Try as raw base64 - guess PNG first
      setReversePreview(`data:image/png;base64,${trimmed.replace(/\s/g, "")}`);
    } else {
      setReversePreview("");
    }
  };

  const reset = () => {
    setBase64("");
    setDataUri("");
    setFileInfo(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const base64Size = base64 ? new Blob([base64]).size : 0;

  const formatLabels: Record<OutputFormat, string> = {
    raw: "Raw Base64",
    datauri: "Data URI",
    css: "CSS background-image",
    html: "HTML <img> tag",
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("encode")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "encode"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Image → Base64
        </button>
        <button
          onClick={() => setActiveTab("decode")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "decode"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Base64 → Image
        </button>
      </div>

      {activeTab === "encode" && (
        <>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-gray-900 bg-gray-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.ico"
              onChange={handleFileChange}
              className="hidden"
            />
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-gray-600 font-medium">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-sm text-gray-400 mt-1">
              PNG, JPG, GIF, SVG, WebP, ICO
            </p>
          </div>

          {/* Results */}
          {base64 && fileInfo && (
            <div className="space-y-6">
              {/* Preview + Info */}
              <div className="flex flex-col sm:flex-row gap-6 border border-gray-200 rounded-lg p-4">
                {/* Preview */}
                <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-2 sm:w-48 sm:h-48">
                  <img
                    src={previewUrl}
                    alt={fileInfo.name}
                    className="max-w-full max-h-44 object-contain"
                  />
                </div>

                {/* File Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {fileInfo.name}
                    </h3>
                    <button
                      onClick={reset}
                      className="text-sm text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="text-gray-900">{fileInfo.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Dimensions:</span>{" "}
                      <span className="text-gray-900">
                        {fileInfo.width} x {fileInfo.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Original size:</span>{" "}
                      <span className="text-gray-900">
                        {formatBytes(fileInfo.size)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Base64 size:</span>{" "}
                      <span className="text-gray-900">
                        {formatBytes(base64Size)}
                      </span>
                    </div>
                  </div>
                  {/* Size comparison bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Size comparison</span>
                      <span>
                        +
                        {(
                          ((base64Size - fileInfo.size) / fileInfo.size) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full"
                        style={{
                          width: `${Math.min(
                            (fileInfo.size / base64Size) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Original</span>
                      <span>Base64</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Format Tabs */}
              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(
                    Object.entries(formatLabels) as [OutputFormat, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveFormat(key)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeFormat === key
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Output */}
                <div className="relative">
                  <textarea
                    readOnly
                    value={getOutput(activeFormat)}
                    className="w-full h-40 p-3 border border-gray-200 rounded-lg font-mono text-xs text-gray-800 bg-gray-50 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                  <button
                    onClick={() => copyToClipboard(activeFormat)}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    {copiedFormat === activeFormat ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Copy All Formats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  Object.entries(formatLabels) as [OutputFormat, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => copyToClipboard(key)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    {copiedFormat === key ? "Copied!" : `Copy ${label}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "decode" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Base64 string or Data URI
            </label>
            <textarea
              value={reverseInput}
              onChange={(e) => handleReverseInput(e.target.value)}
              placeholder="Paste a Base64 string or data:image/...;base64,... URI here"
              className="w-full h-40 p-3 border border-gray-200 rounded-lg font-mono text-xs text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>

          {reversePreview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Preview
              </h3>
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={reversePreview}
                  alt="Decoded preview"
                  className="max-w-full max-h-64 object-contain"
                  onError={() => setReversePreview("")}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
