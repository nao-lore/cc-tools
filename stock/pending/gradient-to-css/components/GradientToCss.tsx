"use client";

import { useRef, useState, useCallback } from "react";

type AxisMode = "horizontal" | "vertical" | "custom";

interface ColorStop {
  hex: string;
  r: number;
  g: number;
  b: number;
  position: number; // 0–100
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function buildGradientDirection(mode: AxisMode, angle: number): string {
  if (mode === "horizontal") return "to right";
  if (mode === "vertical") return "to bottom";
  return `${angle}deg`;
}

function buildCss(stops: ColorStop[], mode: AxisMode, angle: number): string {
  const dir = buildGradientDirection(mode, angle);
  const stopsStr = stops
    .map((s) => `${s.hex} ${s.position}%`)
    .join(", ");
  return `background: linear-gradient(${dir}, ${stopsStr});`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-accent/10 text-muted hover:text-foreground transition-colors font-mono"
    >
      {copied ? "Copied!" : "Copy CSS"}
    </button>
  );
}

export default function GradientToCss() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [axisMode, setAxisMode] = useState<AxisMode>("horizontal");
  const [customAngle, setCustomAngle] = useState(45);
  const [stopCount, setStopCount] = useState(6);
  const [stops, setStops] = useState<ColorStop[]>([]);
  const [cssOutput, setCssOutput] = useState("");

  const sampleStops = useCallback(
    (mode: AxisMode, angle: number, count: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const newStops: ColorStop[] = [];

      for (let i = 0; i < count; i++) {
        const t = i / (count - 1); // 0..1
        let x: number;
        let y: number;

        if (mode === "horizontal") {
          x = Math.round(t * (w - 1));
          y = Math.round(h / 2);
        } else if (mode === "vertical") {
          x = Math.round(w / 2);
          y = Math.round(t * (h - 1));
        } else {
          // custom angle: sample along a line through the center at the given angle
          const rad = ((angle - 90) * Math.PI) / 180;
          const halfDiag = Math.sqrt(w * w + h * h) / 2;
          const startX = w / 2 - Math.cos(rad) * halfDiag;
          const startY = h / 2 - Math.sin(rad) * halfDiag;
          const endX = w / 2 + Math.cos(rad) * halfDiag;
          const endY = h / 2 + Math.sin(rad) * halfDiag;
          x = Math.round(startX + t * (endX - startX));
          y = Math.round(startY + t * (endY - startY));
          // clamp to canvas bounds
          x = Math.max(0, Math.min(w - 1, x));
          y = Math.max(0, Math.min(h - 1, y));
        }

        const d = ctx.getImageData(x, y, 1, 1).data;
        newStops.push({
          hex: toHex(d[0], d[1], d[2]),
          r: d[0],
          g: d[1],
          b: d[2],
          position: Math.round(t * 100),
        });
      }

      setStops(newStops);
      setCssOutput(buildCss(newStops, mode, angle));
    },
    []
  );

  const loadImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setImageLoaded(true);
        // sample with current settings
        sampleStops(axisMode, customAngle, stopCount);
      };
      img.src = url;
    },
    [axisMode, customAngle, stopCount, sampleStops]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadImageFile(file);
    },
    [loadImageFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadImageFile(file);
    },
    [loadImageFile]
  );

  const handleAxisChange = (mode: AxisMode) => {
    setAxisMode(mode);
    if (imageLoaded) sampleStops(mode, customAngle, stopCount);
  };

  const handleAngleChange = (angle: number) => {
    setCustomAngle(angle);
    if (imageLoaded && axisMode === "custom") sampleStops("custom", angle, stopCount);
  };

  const handleStopCountChange = (count: number) => {
    setStopCount(count);
    if (imageLoaded) sampleStops(axisMode, customAngle, count);
  };

  const gradientPreviewStyle =
    stops.length > 0
      ? {
          background: `linear-gradient(${buildGradientDirection(axisMode, customAngle)}, ${stops.map((s) => `${s.hex} ${s.position}%`).join(", ")})`,
        }
      : {};

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!imageLoaded ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/50"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-foreground font-medium">Drop a gradient image here</p>
              <p className="text-muted text-sm mt-1">or click to browse — PNG, JPG, WebP, GIF</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">Adjust settings below to resample the gradient.</p>
          <button
            onClick={() => {
              setImageLoaded(false);
              setStops([]);
              setCssOutput("");
            }}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Load new image
          </button>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Axis selector */}
        <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Sample Axis</p>
          <div className="flex gap-2">
            {(["horizontal", "vertical", "custom"] as AxisMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleAxisChange(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  axisMode === m
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-muted hover:text-foreground hover:border-accent/50"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          {axisMode === "custom" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted">Angle</label>
                <span className="text-xs font-mono text-foreground">{customAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={customAngle}
                onChange={(e) => handleAngleChange(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}
        </div>

        {/* Stop count */}
        <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Color Stops</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted">Number of stops</label>
              <span className="text-xs font-mono text-foreground">{stopCount}</span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              value={stopCount}
              onChange={(e) => handleStopCountChange(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>3</span>
              <span>20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {stops.length > 0 && (
        <div className="space-y-4">
          {/* Gradient preview */}
          <div
            className="h-20 rounded-xl border border-border shadow-sm"
            style={gradientPreviewStyle}
          />

          {/* Color swatches */}
          <div className="flex gap-1 rounded-xl overflow-hidden border border-border h-10">
            {stops.map((s, i) => (
              <div
                key={i}
                className="flex-1 relative group"
                style={{ background: s.hex }}
                title={`${s.hex} @ ${s.position}%`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    className="text-[9px] font-mono font-bold px-1 rounded"
                    style={{
                      color: luminance(s.r, s.g, s.b) > 0.5 ? "#000" : "#fff",
                    }}
                  >
                    {s.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stop list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stops.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-border overflow-hidden bg-surface/50"
              >
                <div className="h-10" style={{ background: s.hex }} />
                <div className="px-2 py-1.5 space-y-0.5">
                  <p className="text-[11px] font-mono font-medium text-foreground">{s.hex}</p>
                  <p className="text-[10px] text-muted font-mono">{s.position}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* CSS output */}
          <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">CSS</span>
              <CopyButton text={cssOutput} />
            </div>
            <pre className="px-4 py-3 text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
              {cssOutput}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
