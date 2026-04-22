"use client";

import { useState, useMemo } from "react";

const PRESETS = [
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "1:1", w: 1, h: 1 },
  { label: "3:2", w: 3, h: 2 },
  { label: "21:9", w: 21, h: 9 },
  { label: "9:16", w: 9, h: 16 },
];

const POSITIONS = [
  { label: "Center", value: "center" },
  { label: "Top-Left", value: "top-left" },
  { label: "Top-Right", value: "top-right" },
  { label: "Bottom-Left", value: "bottom-left" },
  { label: "Bottom-Right", value: "bottom-right" },
];

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface CropResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

function calcCrop(
  origW: number,
  origH: number,
  ratioW: number,
  ratioH: number,
  position: Position
): CropResult | null {
  if (origW <= 0 || origH <= 0 || ratioW <= 0 || ratioH <= 0) return null;

  const targetRatio = ratioW / ratioH;
  const origRatio = origW / origH;

  let cropW: number;
  let cropH: number;

  if (origRatio > targetRatio) {
    // original is wider — crop width
    cropH = origH;
    cropW = Math.round(origH * targetRatio);
  } else {
    // original is taller — crop height
    cropW = origW;
    cropH = Math.round(origW / targetRatio);
  }

  let x = 0;
  let y = 0;

  switch (position) {
    case "center":
      x = Math.round((origW - cropW) / 2);
      y = Math.round((origH - cropH) / 2);
      break;
    case "top-left":
      x = 0;
      y = 0;
      break;
    case "top-right":
      x = origW - cropW;
      y = 0;
      break;
    case "bottom-left":
      x = 0;
      y = origH - cropH;
      break;
    case "bottom-right":
      x = origW - cropW;
      y = origH - cropH;
      break;
  }

  return { x, y, width: cropW, height: cropH };
}

function CropPreview({
  origW,
  origH,
  crop,
}: {
  origW: number;
  origH: number;
  crop: CropResult;
}) {
  const MAX = 320;
  const scale = Math.min(MAX / origW, MAX / origH, 1);
  const dispW = Math.round(origW * scale);
  const dispH = Math.round(origH * scale);
  const cropX = Math.round(crop.x * scale);
  const cropY = Math.round(crop.y * scale);
  const cropW = Math.round(crop.width * scale);
  const cropH = Math.round(crop.height * scale);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted font-medium">Visual Preview</p>
      <div
        className="relative border border-border rounded bg-surface"
        style={{ width: dispW, height: dispH }}
      >
        {/* dimmed overlay for the full original */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 opacity-60 rounded" />

        {/* grid lines on dimmed area */}
        <div
          className="absolute inset-0 rounded"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 15px,rgba(0,0,0,0.05) 15px,rgba(0,0,0,0.05) 16px),repeating-linear-gradient(90deg,transparent,transparent 15px,rgba(0,0,0,0.05) 15px,rgba(0,0,0,0.05) 16px)",
          }}
        />

        {/* crop area highlight */}
        <div
          className="absolute border-2 border-accent bg-accent/20"
          style={{
            left: cropX,
            top: cropY,
            width: cropW,
            height: cropH,
          }}
        >
          {/* rule-of-thirds lines inside crop */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(124,92,252,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,92,252,0.2) 1px, transparent 1px)",
              backgroundSize: "33.33% 33.33%",
            }}
          />
        </div>

        {/* corner indicators */}
        {[
          { l: cropX, t: cropY },
          { l: cropX + cropW - 8, t: cropY },
          { l: cropX, t: cropY + cropH - 8 },
          { l: cropX + cropW - 8, t: cropY + cropH - 8 },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-sm"
            style={{ left: pos.l, top: pos.t }}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        {origW} × {origH} px original · crop area highlighted
      </p>
    </div>
  );
}

function CoordRow({ label, value }: { label: string; value: number }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-mono text-muted w-16">{label}</span>
      <span className="text-lg font-mono font-semibold text-foreground">{value}</span>
      <button
        onClick={copy}
        className="text-xs px-2 py-1 rounded bg-surface border border-border hover:border-accent hover:text-accent transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function AspectCropCalculator() {
  const [origW, setOrigW] = useState<string>("1920");
  const [origH, setOrigH] = useState<string>("1080");
  const [selectedPreset, setSelectedPreset] = useState<string>("16:9");
  const [customW, setCustomW] = useState<string>("");
  const [customH, setCustomH] = useState<string>("");
  const [position, setPosition] = useState<Position>("center");
  const [allCopied, setAllCopied] = useState(false);

  const ratioW = useMemo(() => {
    if (selectedPreset === "custom") return parseFloat(customW) || 0;
    return PRESETS.find((p) => p.label === selectedPreset)?.w ?? 0;
  }, [selectedPreset, customW]);

  const ratioH = useMemo(() => {
    if (selectedPreset === "custom") return parseFloat(customH) || 0;
    return PRESETS.find((p) => p.label === selectedPreset)?.h ?? 0;
  }, [selectedPreset, customH]);

  const crop = useMemo(
    () =>
      calcCrop(
        parseInt(origW) || 0,
        parseInt(origH) || 0,
        ratioW,
        ratioH,
        position
      ),
    [origW, origH, ratioW, ratioH, position]
  );

  const copyAll = () => {
    if (!crop) return;
    const text = `x: ${crop.x}\ny: ${crop.y}\nwidth: ${crop.width}\nheight: ${crop.height}`;
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 1500);
  };

  const isValid = crop !== null && (parseInt(origW) > 0) && (parseInt(origH) > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT — inputs */}
      <div className="space-y-6">
        {/* Original dimensions */}
        <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Original Image Size
          </h2>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">Width (px)</label>
              <input
                type="number"
                min="1"
                value={origW}
                onChange={(e) => setOrigW(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-accent"
                placeholder="1920"
              />
            </div>
            <span className="text-muted mt-5">×</span>
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">Height (px)</label>
              <input
                type="number"
                min="1"
                value={origH}
                onChange={(e) => setOrigH(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-accent"
                placeholder="1080"
              />
            </div>
          </div>
        </div>

        {/* Target aspect ratio */}
        <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Target Aspect Ratio
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSelectedPreset(p.label)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${
                  selectedPreset === p.label
                    ? "bg-accent text-white border-accent"
                    : "border-border text-muted hover:border-accent hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedPreset("custom")}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedPreset === "custom"
                  ? "bg-accent text-white border-accent"
                  : "border-border text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>

          {selectedPreset === "custom" && (
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs text-muted mb-1">Ratio W</label>
                <input
                  type="number"
                  min="1"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-accent"
                  placeholder="16"
                />
              </div>
              <span className="text-muted mt-5">:</span>
              <div className="flex-1">
                <label className="block text-xs text-muted mb-1">Ratio H</label>
                <input
                  type="number"
                  min="1"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-accent"
                  placeholder="9"
                />
              </div>
            </div>
          )}
        </div>

        {/* Crop position */}
        <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Crop Position
          </h2>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPosition(p.value as Position)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  position === p.value
                    ? "bg-accent text-white border-accent"
                    : "border-border text-muted hover:border-accent hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — results */}
      <div className="space-y-6">
        {/* Preview */}
        {isValid && crop && (
          <div className="p-5 rounded-xl border border-border bg-surface flex justify-center">
            <CropPreview
              origW={parseInt(origW)}
              origH={parseInt(origH)}
              crop={crop}
            />
          </div>
        )}

        {/* Coordinates output */}
        <div className="p-5 rounded-xl border border-border bg-surface space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Crop Coordinates
            </h2>
            {isValid && (
              <button
                onClick={copyAll}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                {allCopied ? "Copied!" : "Copy All"}
              </button>
            )}
          </div>

          {!isValid ? (
            <p className="text-muted text-sm py-4 text-center">
              Enter valid dimensions and a target ratio to see results.
            </p>
          ) : crop ? (
            <div>
              <CoordRow label="x" value={crop.x} />
              <CoordRow label="y" value={crop.y} />
              <CoordRow label="width" value={crop.width} />
              <CoordRow label="height" value={crop.height} />

              <div className="mt-4 p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted font-mono leading-relaxed">
                  <span className="text-accent">// Sharp (Node.js)</span>
                  <br />
                  {`.extract(\{ left: ${crop.x}, top: ${crop.y}, width: ${crop.width}, height: ${crop.height} \})`}
                </p>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted font-mono leading-relaxed">
                  <span className="text-accent">// Canvas drawImage</span>
                  <br />
                  {`ctx.drawImage(img, ${crop.x}, ${crop.y}, ${crop.width}, ${crop.height}, 0, 0, ${crop.width}, ${crop.height})`}
                </p>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted font-mono leading-relaxed">
                  <span className="text-accent">// ImageMagick</span>
                  <br />
                  {`convert input.jpg -crop ${crop.width}x${crop.height}+${crop.x}+${crop.y} output.jpg`}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
