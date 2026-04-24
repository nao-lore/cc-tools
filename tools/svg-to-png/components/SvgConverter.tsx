"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type ScalePreset = "1x" | "2x" | "3x" | "4x" | "custom";

interface SvgItem {
  id: string;
  name: string;
  svgContent: string;
  pngDataUrl: string | null;
  error: string | null;
}

function sanitizeSvg(raw: string): string {
  let svg = raw.trim();
  // Strip XML declaration if present
  svg = svg.replace(/<\?xml[^?]*\?>\s*/i, "");
  // Strip DOCTYPE if present
  svg = svg.replace(/<!DOCTYPE[^>]*>\s*/i, "");
  return svg;
}

function getSvgDimensions(
  svgContent: string
): { width: number; height: number } | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) return null;

  let width = parseFloat(svgEl.getAttribute("width") || "0");
  let height = parseFloat(svgEl.getAttribute("height") || "0");

  if ((!width || !height) && svgEl.getAttribute("viewBox")) {
    const vb = svgEl.getAttribute("viewBox")!.split(/[\s,]+/).map(Number);
    if (vb.length === 4) {
      width = width || vb[2];
      height = height || vb[3];
    }
  }

  if (!width || !height) {
    width = width || 300;
    height = height || 150;
  }

  return { width, height };
}

function ensureSvgDimensions(svgContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) return svgContent;

  const dims = getSvgDimensions(svgContent);
  if (!dims) return svgContent;

  if (!svgEl.getAttribute("width")) {
    svgEl.setAttribute("width", String(dims.width));
  }
  if (!svgEl.getAttribute("height")) {
    svgEl.setAttribute("height", String(dims.height));
  }

  // Ensure xmlns
  if (!svgEl.getAttribute("xmlns")) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  return new XMLSerializer().serializeToString(svgEl);
}

async function convertSvgToPng(
  svgContent: string,
  scale: number,
  customWidth: number | null,
  customHeight: number | null,
  bgColor: string | null
): Promise<string> {
  const dims = getSvgDimensions(svgContent);
  if (!dims) throw new Error("Invalid SVG: could not parse dimensions");

  let targetWidth: number;
  let targetHeight: number;

  if (customWidth && customHeight) {
    targetWidth = customWidth;
    targetHeight = customHeight;
  } else if (customWidth) {
    targetWidth = customWidth;
    targetHeight = Math.round((customWidth / dims.width) * dims.height);
  } else if (customHeight) {
    targetHeight = customHeight;
    targetWidth = Math.round((customHeight / dims.height) * dims.width);
  } else {
    targetWidth = Math.round(dims.width * scale);
    targetHeight = Math.round(dims.height * scale);
  }

  const prepared = ensureSvgDimensions(svgContent);
  const blob = new Blob([prepared], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d")!;

      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (pngBlob) => {
          if (!pngBlob) {
            reject(new Error("Failed to generate PNG"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read PNG blob"));
          reader.readAsDataURL(pngBlob);
        },
        "image/png",
        1.0
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG as image"));
    };
    img.src = url;
  });
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function SvgConverter() {
  const [svgItems, setSvgItems] = useState<SvgItem[]>([]);
  const [svgCode, setSvgCode] = useState("");
  const [scalePreset, setScalePreset] = useState<ScalePreset>("2x");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [bgMode, setBgMode] = useState<"transparent" | "custom">("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dragOver, setDragOver] = useState(false);
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scaleMap: Record<string, number> = {
    "1x": 1,
    "2x": 2,
    "3x": 3,
    "4x": 4,
  };

  const getScale = () => scaleMap[scalePreset] || 1;
  const getCustomWidth = () =>
    scalePreset === "custom" && customWidth ? parseInt(customWidth) : null;
  const getCustomHeight = () =>
    scalePreset === "custom" && customHeight ? parseInt(customHeight) : null;
  const getBgColor = () => (bgMode === "custom" ? bgColor : null);

  const addSvgContent = useCallback(
    (name: string, content: string) => {
      const sanitized = sanitizeSvg(content);
      if (!sanitized.includes("<svg")) {
        setSvgItems((prev) => [
          ...prev,
          {
            id: generateId(),
            name,
            svgContent: sanitized,
            pngDataUrl: null,
            error: "Invalid SVG content",
          },
        ]);
        return;
      }
      setSvgItems((prev) => [
        ...prev,
        {
          id: generateId(),
          name,
          svgContent: sanitized,
          pngDataUrl: null,
          error: null,
        },
      ]);
    },
    []
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach((file) => {
        if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") return;
        const reader = new FileReader();
        reader.onload = () => {
          addSvgContent(file.name, reader.result as string);
        };
        reader.readAsText(file);
      });
    },
    [addSvgContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handlePasteCode = useCallback(() => {
    if (!svgCode.trim()) return;
    addSvgContent("pasted-svg.svg", svgCode);
    setSvgCode("");
  }, [svgCode, addSvgContent]);

  const convertAll = useCallback(async () => {
    setConverting(true);
    const updated = await Promise.all(
      svgItems.map(async (item) => {
        if (item.error) return item;
        try {
          const pngDataUrl = await convertSvgToPng(
            item.svgContent,
            getScale(),
            getCustomWidth(),
            getCustomHeight(),
            getBgColor()
          );
          return { ...item, pngDataUrl, error: null };
        } catch (err) {
          return {
            ...item,
            pngDataUrl: null,
            error: err instanceof Error ? err.message : "Conversion failed",
          };
        }
      })
    );
    setSvgItems(updated);
    setConverting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgItems, scalePreset, customWidth, customHeight, bgMode, bgColor]);

  // Auto-convert when items change or settings change
  useEffect(() => {
    if (svgItems.length > 0 && svgItems.some((i) => !i.error)) {
      convertAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scalePreset, customWidth, customHeight, bgMode, bgColor]);

  const handleConvertClick = () => {
    if (svgCode.trim()) {
      addSvgContent("pasted-svg.svg", svgCode);
      setSvgCode("");
    }
    // convertAll will be triggered by the effect if items exist
    if (svgItems.length > 0) {
      convertAll();
    }
  };

  const downloadPng = (item: SvgItem) => {
    if (!item.pngDataUrl) return;
    const a = document.createElement("a");
    a.href = item.pngDataUrl;
    a.download = item.name.replace(/\.svg$/i, "") + ".png";
    a.click();
  };

  const downloadAll = () => {
    svgItems.forEach((item) => {
      if (item.pngDataUrl) downloadPng(item);
    });
  };

  const removeItem = (id: string) => {
    setSvgItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    setSvgItems([]);
    setSvgCode("");
  };

  const hasPngs = svgItems.some((i) => i.pngDataUrl);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Input */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Input SVG</h2>

          {/* Drag & Drop Zone */}
          <div
            className={`drop-zone rounded-xl p-8 text-center cursor-pointer ${
              dragOver ? "drag-over" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-600 font-medium">
              Drop SVG files here or click to upload
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Supports multiple files for batch conversion
            </p>
          </div>

          {/* SVG Code Input */}
          <div>
            <label
              htmlFor="svg-code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Or paste SVG code
            </label>
            <textarea
              id="svg-code"
              className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
            />
            <button
              onClick={handlePasteCode}
              disabled={!svgCode.trim()}
              className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add SVG Code
            </button>
          </div>

          {/* Settings */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Export Settings
            </h3>

            {/* Scale */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Resolution
              </label>
              <div className="flex flex-wrap gap-2">
                {(["1x", "2x", "3x", "4x", "custom"] as ScalePreset[]).map(
                  (preset) => (
                    <button
                      key={preset}
                      onClick={() => setScalePreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        scalePreset === preset
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {preset === "custom" ? "Custom" : preset}
                    </button>
                  )
                )}
              </div>

              {scalePreset === "custom" && (
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="Auto"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="Auto"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Background
              </label>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setBgMode("transparent")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    bgMode === "transparent"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Transparent
                </button>
                <button
                  onClick={() => setBgMode("custom")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    bgMode === "custom"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Custom Color
                </button>
                {bgMode === "custom" && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvertClick}
            disabled={
              converting || (svgItems.length === 0 && !svgCode.trim())
            }
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {converting ? "Converting..." : "Convert to PNG"}
          </button>
        </div>

        {/* Right: Preview & Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
            {svgItems.length > 0 && (
              <div className="flex gap-2">
                {hasPngs && svgItems.length > 1 && (
                  <button
                    onClick={downloadAll}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Download All
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {svgItems.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <div className="text-5xl mb-3 opacity-30">🖼️</div>
              <p className="text-gray-400">
                Upload or paste SVG to see preview here
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {svgItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {item.name}
                    </span>
                    <div className="flex gap-2">
                      {item.pngDataUrl && (
                        <button
                          onClick={() => downloadPng(item)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Download PNG
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="px-2 py-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {item.error ? (
                    <div className="p-4 text-red-500 text-sm bg-red-50">
                      {item.error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-0">
                      {/* SVG Preview */}
                      <div className="p-3 border-r border-gray-200">
                        <p className="text-xs text-gray-400 mb-1">SVG</p>
                        <div
                          className="checkerboard rounded-lg p-2 flex items-center justify-center min-h-[120px]"
                          dangerouslySetInnerHTML={{
                            __html: item.svgContent,
                          }}
                          style={{ maxHeight: 200, overflow: "hidden" }}
                        />
                      </div>
                      {/* PNG Preview */}
                      <div className="p-3">
                        <p className="text-xs text-gray-400 mb-1">PNG</p>
                        <div className="checkerboard rounded-lg p-2 flex items-center justify-center min-h-[120px]">
                          {item.pngDataUrl ? (
                            <img
                              src={item.pngDataUrl}
                              alt={`Converted ${item.name}`}
                              className="max-w-full max-h-[180px] object-contain"
                            />
                          ) : (
                            <span className="text-gray-300 text-sm">
                              Click Convert
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AdSense Placeholder */}
      <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm mb-8">
        Advertisement
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "SVGをPNGに変換するメリットは？", a: "PNGはSVGに対応していないアプリケーションや印刷物で広く使えます。SNSへのアップロード、メール添付、古いブラウザ対応など、互換性が必要な場面でPNGが適しています。" },
            { q: "変換時の画質はどう決まりますか？", a: "スケール倍率（1x〜4x）で出力解像度を指定できます。高解像度ディスプレイ（Retina等）向けには2x以上を推奨します。SVGはベクター形式のため、拡大しても劣化しません。" },
            { q: "透過（アルファ）は保持されますか？", a: "PNG形式は透過に対応しているため、SVGの透過部分はそのままPNGに変換されます。JPEGに変換する場合は透過が失われ、背景色が設定されます。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "SVGをPNGに変換するメリットは？", "acceptedAnswer": { "@type": "Answer", "text": "PNGはSVGに対応していないアプリケーションや印刷物で広く使えます。互換性が必要な場面でPNGが適しています。" } },
              { "@type": "Question", "name": "変換時の画質はどう決まりますか？", "acceptedAnswer": { "@type": "Answer", "text": "スケール倍率（1x〜4x）で出力解像度を指定できます。高解像度ディスプレイ向けには2x以上を推奨します。" } },
              { "@type": "Question", "name": "透過（アルファ）は保持されますか？", "acceptedAnswer": { "@type": "Answer", "text": "PNG形式は透過に対応しているため、SVGの透過部分はそのままPNGに変換されます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/placeholder-image" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">プレースホルダー画像生成</a>
            <a href="/image-compressor" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">画像圧縮ツール</a>
          </div>
        </div>
      </div>
    </div>
  );
}
