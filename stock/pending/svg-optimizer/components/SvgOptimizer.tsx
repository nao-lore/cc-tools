"use client";

import { useState, useCallback, useRef } from "react";

interface Options {
  removeComments: boolean;
  removeMetadata: boolean;
  removeEmptyAttrs: boolean;
  minifyWhitespace: boolean;
  removeXmlDeclaration: boolean;
  removeDoctype: boolean;
}

function optimizeSvg(input: string, options: Options): string {
  let result = input;

  // Remove XML declaration (<?xml ... ?>)
  if (options.removeXmlDeclaration) {
    result = result.replace(/<\?xml[^?]*\?>/gi, "");
  }

  // Remove DOCTYPE
  if (options.removeDoctype) {
    result = result.replace(/<!DOCTYPE[^>]*>/gi, "");
  }

  // Remove comments <!-- ... -->
  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, "");
  }

  // Remove metadata elements: <title>, <desc>, <metadata>
  if (options.removeMetadata) {
    result = result.replace(/<title[\s\S]*?<\/title>/gi, "");
    result = result.replace(/<desc[\s\S]*?<\/desc>/gi, "");
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  }

  // Remove empty attributes (attr="" or attr='')
  if (options.removeEmptyAttrs) {
    result = result.replace(/\s+[\w:-]+=(?:""|'')/g, "");
  }

  // Minify whitespace
  if (options.minifyWhitespace) {
    // Collapse whitespace between tags
    result = result.replace(/>\s+</g, "><");
    // Collapse multiple spaces within tags
    result = result.replace(/\s{2,}/g, " ");
    // Trim leading/trailing whitespace inside attribute values is risky — just trim the doc
    result = result.trim();
  } else {
    result = result.trim();
  }

  return result;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

const DEFAULT_OPTIONS: Options = {
  removeComments: true,
  removeMetadata: true,
  removeEmptyAttrs: true,
  minifyWhitespace: true,
  removeXmlDeclaration: true,
  removeDoctype: true,
};

const OPTION_LABELS: Record<keyof Options, string> = {
  removeComments: "Remove comments",
  removeMetadata: "Remove metadata (title/desc)",
  removeEmptyAttrs: "Remove empty attributes",
  minifyWhitespace: "Minify whitespace",
  removeXmlDeclaration: "Remove XML declaration",
  removeDoctype: "Remove doctype",
};

export default function SvgOptimizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"before" | "after">("after");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originalSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;
  const savings = originalSize > 0 && output ? originalSize - outputSize : 0;
  const savingsPercent =
    originalSize > 0 && output
      ? ((savings / originalSize) * 100).toFixed(1)
      : "0";

  const handleOptimize = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!trimmed.includes("<svg") && !trimmed.includes("<SVG")) {
      setError("Input does not appear to be valid SVG.");
      setOutput("");
      return;
    }

    setError("");
    const result = optimizeSvg(trimmed, options);
    setOutput(result);
  }, [input, options]);

  const handleToggleOption = useCallback((key: keyof Options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
        setError("Please upload an SVG file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setInput(text);
        setOutput("");
        setError("");
      };
      reader.readAsText(file);
      // Reset file input so the same file can be re-uploaded
      e.target.value = "";
    },
    []
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  }, []);

  const previewSrc = previewMode === "before" ? input : output;

  return (
    <div className="space-y-5">
      {/* Options toggles */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Optimization Options
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(DEFAULT_OPTIONS) as (keyof Options)[]).map((key) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => handleToggleOption(key)}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{OPTION_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleOptimize}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Optimize SVG
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? "Copied!" : "Copy Output"}
        </button>
        <button
          onClick={handleDownload}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Download
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Input SVG
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput("");
              setError("");
            }}
            placeholder="Paste your SVG code here, or upload a file..."
            spellCheck={false}
            className="w-full h-72 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Optimized SVG
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Optimized output will appear here..."
            spellCheck={false}
            className="w-full h-72 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      {output && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <span>
            Original: <strong>{formatBytes(originalSize)}</strong>
          </span>
          <span>
            Optimized: <strong>{formatBytes(outputSize)}</strong>
          </span>
          {savings > 0 && (
            <span className="text-green-700">
              Saved: <strong>{formatBytes(savings)}</strong> ({savingsPercent}%
              reduction)
            </span>
          )}
          {savings <= 0 && (
            <span className="text-gray-500">No size reduction with current options.</span>
          )}
        </div>
      )}

      {/* Live preview */}
      {(input || output) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Preview</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button
                onClick={() => setPreviewMode("before")}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  previewMode === "before"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setPreviewMode("after")}
                disabled={!output}
                className={`px-3 py-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  previewMode === "after"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                After
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center min-h-48">
            {previewSrc ? (
              <div
                className="max-w-full max-h-64 [&>svg]:max-w-full [&>svg]:max-h-64 [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: previewSrc }}
              />
            ) : (
              <p className="text-sm text-gray-400">No SVG to preview</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
