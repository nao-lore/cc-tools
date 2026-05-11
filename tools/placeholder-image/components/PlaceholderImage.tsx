"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Format = "png" | "jpeg" | "webp";

type Preset = {
  label: string;
  width: number;
  height: number;
  text: string;
  bg: string;
  fg: string;
};

const PRESETS: Preset[] = [
  { label: "OG image", width: 1200, height: 630, text: "1200 x 630", bg: "#0f172a", fg: "#ffffff" },
  { label: "Hero", width: 1920, height: 1080, text: "Hero image", bg: "#eff6ff", fg: "#1e3a8a" },
  { label: "Card", width: 800, height: 450, text: "Card image", bg: "#f8fafc", fg: "#334155" },
  { label: "Avatar", width: 512, height: 512, text: "Avatar", bg: "#ecfeff", fg: "#155e75" },
  { label: "Banner", width: 728, height: 90, text: "728 x 90", bg: "#fef3c7", fg: "#92400e" },
  { label: "Thumbnail", width: 300, height: 200, text: "300 x 200", bg: "#f1f5f9", fg: "#475569" },
];

const FORMATS: Format[] = ["png", "jpeg", "webp"];
const HEX_RE = /^#[0-9a-f]{6}$/i;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parsePositive(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function mimeFor(format: Format) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

function fileExtension(format: Format) {
  return format === "jpeg" ? "jpg" : format;
}

export default function PlaceholderImage() {
  const [width, setWidth] = useState("1200");
  const [height, setHeight] = useState("630");
  const [backgroundColor, setBackgroundColor] = useState("#0f172a");
  const [textColor, setTextColor] = useState("#ffffff");
  const [label, setLabel] = useState("1200 x 630");
  const [fontSize, setFontSize] = useState("64");
  const [cornerRadius, setCornerRadius] = useState("0");
  const [format, setFormat] = useState<Format>("png");
  const [copied, setCopied] = useState("");
  const [dataUri, setDataUri] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const numeric = useMemo(() => {
    const safeWidth = clamp(parsePositive(width, 1200), 1, 4096);
    const safeHeight = clamp(parsePositive(height, 630), 1, 4096);
    const safeFontSize = clamp(parsePositive(fontSize, 64), 8, 320);
    const safeCornerRadius = clamp(parsePositive(cornerRadius, 0), 0, Math.min(safeWidth, safeHeight) / 2);
    return { width: safeWidth, height: safeHeight, fontSize: safeFontSize, cornerRadius: safeCornerRadius };
  }, [cornerRadius, fontSize, height, width]);

  const error = useMemo(() => {
    if (!width || !height) return "Width and height are required.";
    if (numeric.width < 1 || numeric.height < 1) return "Dimensions must be at least 1px.";
    if (numeric.width > 4096 || numeric.height > 4096) return "Dimensions are limited to 4096px.";
    if (!HEX_RE.test(backgroundColor)) return "Background color must be a 6-digit hex code.";
    if (!HEX_RE.test(textColor)) return "Text color must be a 6-digit hex code.";
    if (label.length > 120) return "Text is limited to 120 characters.";
    return "";
  }, [backgroundColor, height, label, numeric.height, numeric.width, textColor, width]);

  const displayText = label.trim() || `${numeric.width} x ${numeric.height}`;
  const previewScale = Math.min(1, 720 / numeric.width, 420 / numeric.height);
  const previewWidth = Math.max(1, Math.round(numeric.width * previewScale));
  const previewHeight = Math.max(1, Math.round(numeric.height * previewScale));
  const dataUriSize = dataUri ? formatBytes(new Blob([dataUri]).size) : "-";
  const filename = `placeholder-${numeric.width}x${numeric.height}.${fileExtension(format)}`;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || error) {
      setDataUri("");
      return;
    }

    canvas.width = numeric.width;
    canvas.height = numeric.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, numeric.width, numeric.height);
    ctx.fillStyle = backgroundColor;
    if (numeric.cornerRadius > 0) {
      const radius = numeric.cornerRadius;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(numeric.width - radius, 0);
      ctx.quadraticCurveTo(numeric.width, 0, numeric.width, radius);
      ctx.lineTo(numeric.width, numeric.height - radius);
      ctx.quadraticCurveTo(numeric.width, numeric.height, numeric.width - radius, numeric.height);
      ctx.lineTo(radius, numeric.height);
      ctx.quadraticCurveTo(0, numeric.height, 0, numeric.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, numeric.width, numeric.height);
    }

    ctx.fillStyle = textColor;
    ctx.font = `700 ${numeric.fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxTextWidth = numeric.width * 0.82;
    const words = displayText.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxTextWidth || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = numeric.fontSize * 1.16;
    const startY = numeric.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.slice(0, 4).forEach((line, index) => {
      ctx.fillText(line, numeric.width / 2, startY + index * lineHeight);
    });

    setDataUri(canvas.toDataURL(mimeFor(format), 0.92));
  }, [backgroundColor, displayText, error, format, numeric, textColor]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  function updateDimension(setter: (value: string) => void, value: string) {
    setter(value.replace(/[^0-9]/g, ""));
    setCopied("");
  }

  function updateHex(setter: (value: string) => void, value: string) {
    setter(value.startsWith("#") ? value.slice(0, 7) : `#${value}`.slice(0, 7));
    setCopied("");
  }

  function applyPreset(preset: Preset) {
    setWidth(String(preset.width));
    setHeight(String(preset.height));
    setLabel(preset.text);
    setBackgroundColor(preset.bg);
    setTextColor(preset.fg);
    setFontSize(String(clamp(Math.round(Math.min(preset.width, preset.height) / 9), 18, 96)));
    setCornerRadius("0");
    setCopied("");
  }

  function reset() {
    applyPreset(PRESETS[0]);
    setFormat("png");
  }

  function downloadImage() {
    if (!dataUri) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUri;
    link.click();
  }

  async function copyDataUri() {
    if (!dataUri) return;
    await navigator.clipboard.writeText(dataUri);
    setCopied("data-uri");
    window.setTimeout(() => setCopied(""), 1600);
  }

  async function copyImgTag() {
    if (!dataUri) return;
    await navigator.clipboard.writeText(`<img src="${dataUri}" alt="${displayText}" width="${numeric.width}" height="${numeric.height}" />`);
    setCopied("img-tag");
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Image settings</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Generate local placeholder images for mockups, wireframes, cards, and Open Graph previews.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Examples / presets</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {preset.label} <span className="text-slate-400">{preset.width}x{preset.height}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberInput id="placeholder-width" label="Width" value={width} unit="px" onChange={(value) => updateDimension(setWidth, value)} />
            <NumberInput id="placeholder-height" label="Height" value={height} unit="px" onChange={(value) => updateDimension(setHeight, value)} />
            <ColorInput id="placeholder-bg" label="Background" value={backgroundColor} onColor={setBackgroundColor} onText={(value) => updateHex(setBackgroundColor, value)} />
            <ColorInput id="placeholder-fg" label="Text color" value={textColor} onColor={setTextColor} onText={(value) => updateHex(setTextColor, value)} />
            <div className="sm:col-span-2">
              <label htmlFor="placeholder-text" className="text-sm font-medium text-slate-700">
                Text
              </label>
              <input
                id="placeholder-text"
                type="text"
                value={label}
                onChange={(event) => {
                  setLabel(event.target.value);
                  setCopied("");
                }}
                maxLength={120}
                placeholder={`${numeric.width} x ${numeric.height}`}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <NumberInput id="placeholder-font" label="Font size" value={fontSize} unit="px" onChange={(value) => updateDimension(setFontSize, value)} />
            <NumberInput id="placeholder-radius" label="Corner radius" value={cornerRadius} unit="px" onChange={(value) => updateDimension(setCornerRadius, value)} />
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Format</p>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {FORMATS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFormat(item);
                    setCopied("");
                  }}
                  className={`rounded-lg px-2 py-2 text-sm font-semibold ${
                    format === item ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "Rendering happens in your browser with Canvas. No image data is uploaded."}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {numeric.width}x{numeric.height}px, {format.toUpperCase()}, {dataUriSize}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {previewScale < 1 ? `${Math.round(previewScale * 100)}% preview` : "Actual size"}
              </div>
            </div>
            <div className="mt-4 flex min-h-[320px] items-center justify-center overflow-auto rounded-xl border border-dashed border-slate-300 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-4">
              {error ? (
                <p className="text-center text-sm font-medium text-red-600">{error}</p>
              ) : (
                <canvas
                  ref={canvasRef}
                  style={{ width: previewWidth, height: previewHeight }}
                  className="max-w-full rounded shadow-sm"
                />
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1.35fr_1fr_1fr]">
            <Metric label="File name" value={filename} />
            <Metric label="Canvas size" value={`${numeric.width} x ${numeric.height}`} />
            <Metric label="Data URI size" value={dataUriSize} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadImage}
              disabled={!dataUri}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download {format.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={copyDataUri}
              disabled={!dataUri}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied === "data-uri" ? "Copied data URI" : "Copy data URI"}
            </button>
            <button
              type="button"
              onClick={copyImgTag}
              disabled={!dataUri}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied === "img-tag" ? "Copied img tag" : "Copy img tag"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberInput({
  id,
  label,
  value,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}

function ColorInput({
  id,
  label,
  value,
  onColor,
  onText,
}: {
  id: string;
  label: string;
  value: string;
  onColor: (value: string) => void;
  onText: (value: string) => void;
}) {
  const safeColor = HEX_RE.test(value) ? value : "#000000";
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="color"
          value={safeColor}
          onChange={(event) => onColor(event.target.value)}
          className="h-[50px] w-14 cursor-pointer border-0 bg-transparent p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onText(event.target.value)}
          className="min-w-0 flex-1 border-l border-slate-200 px-3 py-3 font-mono text-sm outline-none"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 overflow-x-auto whitespace-nowrap font-mono text-xs font-semibold text-slate-950 sm:text-sm">{value}</p>
    </div>
  );
}
