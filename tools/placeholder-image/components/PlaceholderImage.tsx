"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const PRESETS = [
  { label: "Banner", width: 728, height: 90 },
  { label: "Thumbnail", width: 150, height: 150 },
  { label: "Social", width: 1200, height: 630 },
  { label: "Avatar", width: 100, height: 100 },
  { label: "Hero", width: 1920, height: 1080 },
  { label: "Mobile", width: 375, height: 667 },
];

const FORMATS = ["png", "jpeg", "webp"] as const;
type Format = (typeof FORMATS)[number];

export default function PlaceholderImage() {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [textColor, setTextColor] = useState("#666666");
  const [customText, setCustomText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [format, setFormat] = useState<Format>("png");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = customText || `${width}x${height}`;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, fontSize, displayText]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMimeType = (f: Format) => {
    if (f === "jpeg") return "image/jpeg";
    if (f === "webp") return "image/webp";
    return "image/png";
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL(getMimeType(format), 0.92);
    const link = document.createElement("a");
    link.download = `placeholder-${width}x${height}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyDataUri = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL(getMimeType(format), 0.92);
    await navigator.clipboard.writeText(dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    // Auto-adjust font size based on smaller dimension
    const minDim = Math.min(preset.width, preset.height);
    setFontSize(Math.max(12, Math.round(minDim / 6)));
  };

  // Constrain preview to fit in container
  const maxPreviewWidth = 640;
  const maxPreviewHeight = 400;
  const scale = Math.min(1, maxPreviewWidth / width, maxPreviewHeight / height);
  const previewWidth = Math.round(width * scale);
  const previewHeight = Math.round(height * scale);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {p.label}{" "}
              <span className="text-gray-400">
                {p.width}x{p.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (px)
          </label>
          <input
            type="number"
            min={1}
            max={4096}
            value={width}
            onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (px)
          </label>
          <input
            type="number"
            min={1}
            max={4096}
            value={height}
            onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Custom Text */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={`${width}x${height}`}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size (px)
          </label>
          <input
            type="number"
            min={8}
            max={200}
            value={fontSize}
            onChange={(e) => setFontSize(Math.max(8, Number(e.target.value)))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            style={{ width: previewWidth, height: previewHeight }}
            className="rounded"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          {width} x {height} px
          {scale < 1 && ` (preview scaled to ${Math.round(scale * 100)}%)`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Download {format.toUpperCase()}
        </button>
        <button
          onClick={handleCopyDataUri}
          className="px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          {copied ? "Copied!" : "Copy Data URI"}
        </button>
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "プレースホルダー画像とは何ですか？", a: "Web開発やデザインのモックアップ時に、実際の画像が用意できていない箇所に一時的に使う仮の画像です。サイズや色をカスタマイズでき、開発中のレイアウト確認に役立ちます。" },
            { q: "生成した画像はどのように使いますか？", a: "「ダウンロード」ボタンでPNG・JPEG・WebP形式で保存できます。また画像URLをコピーしてimgタグのsrc属性に貼り付けることも可能です。" },
            { q: "対応している画像フォーマットは何ですか？", a: "PNG・JPEG・WebPの3種類に対応しています。WebPは高圧縮・高品質な次世代フォーマットで、Webパフォーマンスの向上に適しています。" },
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
              { "@type": "Question", "name": "プレースホルダー画像とは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "Web開発やデザインのモックアップ時に、実際の画像が用意できていない箇所に一時的に使う仮の画像です。" } },
              { "@type": "Question", "name": "生成した画像はどのように使いますか？", "acceptedAnswer": { "@type": "Answer", "text": "ダウンロードボタンでPNG・JPEG・WebP形式で保存できます。また画像URLをコピーしてimgタグのsrc属性に貼り付けることも可能です。" } },
              { "@type": "Question", "name": "対応している画像フォーマットは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "PNG・JPEG・WebPの3種類に対応しています。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/og-image-preview" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">OGP画像プレビュー</a>
            <a href="/svg-to-png" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">SVG → PNG 変換</a>
          </div>
        </div>
      </div>
    </div>
  );
}
