"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Mode = "encode" | "decode";

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toUrlSafe = (b64: string) => b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const fromUrlSafe = (b64: string) => {
    let s = b64.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return s;
  };

  const convert = useCallback(
    (text: string, currentMode: Mode, currentUrlSafe: boolean) => {
      setError("");
      setImagePreview(null);

      if (!text.trim()) {
        setOutput("");
        return;
      }

      try {
        if (currentMode === "encode") {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(text);
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          let result = btoa(binary);
          if (currentUrlSafe) result = toUrlSafe(result);
          setOutput(result);
        } else {
          let b64 = text.trim();
          if (currentUrlSafe) b64 = fromUrlSafe(b64);
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const decoder = new TextDecoder("utf-8", { fatal: true });
          const result = decoder.decode(bytes);
          setOutput(result);

          // Check if decoded content looks like a data URI image
          if (result.startsWith("data:image/")) {
            setImagePreview(result);
          }
        }
      } catch {
        setError(
          currentMode === "encode"
            ? "Failed to encode input."
            : "Invalid Base64 string. Check your input."
        );
        setOutput("");
      }

      // Check if the raw input is a data URI for preview (in decode mode, check input directly)
      if (currentMode === "decode" && text.trim().startsWith("data:image/")) {
        setImagePreview(text.trim());
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => convert(value, mode, urlSafe), 150);
    },
    [mode, urlSafe, convert]
  );

  useEffect(() => {
    convert(input, mode, urlSafe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, urlSafe]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
    setFileName(null);
    setTimeout(() => convert(output, mode === "encode" ? "decode" : "encode", urlSafe), 0);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setMode("encode");
    const reader = new FileReader();

    if (file.type.startsWith("image/")) {
      // For images, read as data URI for preview, then also as base64
      const previewReader = new FileReader();
      previewReader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImagePreview(dataUri);
      };
      previewReader.readAsDataURL(file);
    }

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      let result = btoa(binary);
      if (urlSafe) result = toUrlSafe(result);
      setInput(`[File: ${file.name}]`);
      setOutput(result);
      setError("");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const inputLen = input.startsWith("[File:") ? 0 : new TextEncoder().encode(input).length;
  const outputLen = new TextEncoder().encode(output).length;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("encode")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-accent text-white"
                : "bg-panel-bg text-muted border border-panel-border hover:text-foreground"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-accent text-white"
                : "bg-panel-bg text-muted border border-panel-border hover:text-foreground"
            }`}
          >
            Decode
          </button>
          <button
            onClick={handleSwap}
            className="px-3 py-2 rounded-md text-sm bg-panel-bg text-muted border border-panel-border hover:text-foreground transition-colors"
            title="Swap input/output"
          >
            ⇄
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="accent-accent"
            />
            URL-safe
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-md text-sm bg-panel-bg text-muted border border-panel-border hover:text-foreground transition-colors"
          >
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input panel */}
        <div
          className={`flex flex-col rounded-lg border transition-colors ${
            isDragging ? "border-accent bg-accent/5" : "border-panel-border"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {mode === "encode" ? "Text Input" : "Base64 Input"}
            </span>
            <span className="text-xs text-muted font-mono">
              {inputLen > 0 ? `${inputLen.toLocaleString()} bytes` : ""}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Type or paste text to encode...\nOr drag & drop a file here"
                : "Paste Base64 string to decode..."
            }
            className="flex-1 min-h-[300px] lg:min-h-[400px] p-4 bg-panel-bg text-foreground font-mono text-sm resize-none placeholder:text-muted/50"
            spellCheck={false}
          />
          {fileName && (
            <div className="px-4 py-2 border-t border-panel-border text-xs text-muted">
              File: {fileName}
            </div>
          )}
        </div>

        {/* Output panel */}
        <div className="flex flex-col rounded-lg border border-panel-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {mode === "encode" ? "Base64 Output" : "Decoded Text"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted font-mono">
                {outputLen > 0 ? `${outputLen.toLocaleString()} bytes` : ""}
              </span>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  copied
                    ? "bg-success/20 text-success"
                    : "bg-panel-bg text-muted hover:text-foreground border border-panel-border disabled:opacity-30"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="flex-1 min-h-[300px] lg:min-h-[400px] p-4 bg-panel-bg text-foreground font-mono text-sm resize-none placeholder:text-muted/50"
          />
          {error && (
            <div className="px-4 py-2 border-t border-panel-border text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="mt-4 p-4 rounded-lg border border-panel-border bg-panel-bg">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Image Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Base64 decoded preview"
            className="max-w-full max-h-64 rounded border border-panel-border"
          />
        </div>
      )}
    </div>
  );
}
