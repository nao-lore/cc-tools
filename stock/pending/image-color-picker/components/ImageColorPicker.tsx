"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface ColorSample {
  id: number;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  x: number;
  y: number;
}

interface LiveColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function toHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function getPixelColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): LiveColor {
  const d = ctx.getImageData(x, y, 1, 1).data;
  const r = d[0];
  const g = d[1];
  const b = d[2];
  return {
    hex: toHex(r, g, b),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
  };
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
      className="text-xs px-2 py-0.5 rounded bg-surface border border-border hover:bg-muted/10 text-muted hover:text-foreground transition-colors font-mono"
    >
      {copied ? "Copied!" : text}
    </button>
  );
}

const MAGNIFIER_RADIUS = 60;
const MAGNIFIER_ZOOM = 6;
const SAMPLE_SIZE = 11; // odd number, pixels captured per side for magnifier

export default function ImageColorPicker() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [liveColor, setLiveColor] = useState<LiveColor | null>(null);
  const [lockedColor, setLockedColor] = useState<LiveColor | null>(null);
  const [samples, setSamples] = useState<ColorSample[]>([]);
  const [sampleCounter, setSampleCounter] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const loadImageFile = useCallback((file: File) => {
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
      imgRef.current = img;
      setImageLoaded(true);
      setIsLocked(false);
      setLiveColor(null);
      setLockedColor(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      loadImageFile(file);
    },
    [loadImageFile]
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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const drawMagnifier = useCallback(
    (canvasX: number, canvasY: number) => {
      const srcCanvas = canvasRef.current;
      const magCanvas = magCanvasRef.current;
      if (!srcCanvas || !magCanvas) return;
      const srcCtx = srcCanvas.getContext("2d");
      const magCtx = magCanvas.getContext("2d");
      if (!srcCtx || !magCtx) return;

      const size = MAGNIFIER_RADIUS * 2;
      magCanvas.width = size;
      magCanvas.height = size;

      // clip to circle
      magCtx.save();
      magCtx.beginPath();
      magCtx.arc(MAGNIFIER_RADIUS, MAGNIFIER_RADIUS, MAGNIFIER_RADIUS, 0, Math.PI * 2);
      magCtx.clip();

      // draw zoomed portion
      const halfSrc = MAGNIFIER_RADIUS / MAGNIFIER_ZOOM;
      magCtx.drawImage(
        srcCanvas,
        canvasX - halfSrc,
        canvasY - halfSrc,
        halfSrc * 2,
        halfSrc * 2,
        0,
        0,
        size,
        size
      );

      // crosshair
      magCtx.strokeStyle = "rgba(255,255,255,0.9)";
      magCtx.lineWidth = 1.5;
      magCtx.beginPath();
      magCtx.moveTo(MAGNIFIER_RADIUS, MAGNIFIER_RADIUS - 10);
      magCtx.lineTo(MAGNIFIER_RADIUS, MAGNIFIER_RADIUS + 10);
      magCtx.moveTo(MAGNIFIER_RADIUS - 10, MAGNIFIER_RADIUS);
      magCtx.lineTo(MAGNIFIER_RADIUS + 10, MAGNIFIER_RADIUS);
      magCtx.stroke();

      // center pixel highlight
      magCtx.strokeStyle = "rgba(255,255,255,0.6)";
      magCtx.lineWidth = 1;
      const pixelSize = MAGNIFIER_ZOOM;
      magCtx.strokeRect(
        MAGNIFIER_RADIUS - pixelSize / 2,
        MAGNIFIER_RADIUS - pixelSize / 2,
        pixelSize,
        pixelSize
      );

      // border
      magCtx.restore();
      magCtx.beginPath();
      magCtx.arc(MAGNIFIER_RADIUS, MAGNIFIER_RADIUS, MAGNIFIER_RADIUS - 1, 0, Math.PI * 2);
      magCtx.strokeStyle = "rgba(0,0,0,0.3)";
      magCtx.lineWidth = 2;
      magCtx.stroke();
    },
    []
  );

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
      return { x, y };
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageLoaded || isLocked) return;
      const coords = getCanvasCoords(e);
      if (!coords) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const color = getPixelColor(ctx, coords.x, coords.y);
      setLiveColor(color);

      const containerRect = containerRef.current?.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      if (containerRect) {
        setCursorPos({
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
        });
      }

      drawMagnifier(coords.x, coords.y);
    },
    [imageLoaded, isLocked, getCanvasCoords, drawMagnifier]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageLoaded) return;
      const coords = getCanvasCoords(e);
      if (!coords) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const color = getPixelColor(ctx, coords.x, coords.y);

      if (isLocked) {
        setIsLocked(false);
        setLiveColor(color);
      } else {
        setIsLocked(true);
        setLockedColor(color);
        setSamples((prev) => {
          const newSample: ColorSample = {
            id: sampleCounter,
            hex: color.hex,
            rgb: color.rgb,
            hsl: color.hsl,
            x: coords.x,
            y: coords.y,
          };
          const updated = [newSample, ...prev].slice(0, 12);
          return updated;
        });
        setSampleCounter((c) => c + 1);
      }
    },
    [imageLoaded, isLocked, getCanvasCoords, sampleCounter]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isLocked) {
      setLiveColor(null);
    }
  }, [isLocked]);

  const displayColor = isLocked ? lockedColor : liveColor;

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!imageLoaded && (
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
              <p className="text-foreground font-medium">Drop an image here</p>
              <p className="text-muted text-sm mt-1">or click to browse — PNG, JPG, GIF, WebP</p>
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
      )}

      {/* Canvas + magnifier area */}
      {imageLoaded && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {isLocked
                ? "Click again to unlock and keep picking"
                : "Move cursor to pick · click to lock a sample"}
            </p>
            <button
              onClick={() => {
                setImageLoaded(false);
                setLiveColor(null);
                setLockedColor(null);
                setIsLocked(false);
                imgRef.current = null;
              }}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Load new image
            </button>
          </div>

          <div
            ref={containerRef}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ cursor: imageLoaded ? "crosshair" : "default" }}
          >
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl border border-border object-contain max-h-[500px]"
              style={{ display: "block" }}
            />

            {/* Magnifier */}
            {displayColor && (
              <div
                style={{
                  position: "absolute",
                  left: cursorPos.x + 20,
                  top: cursorPos.y - MAGNIFIER_RADIUS,
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <canvas
                  ref={magCanvasRef}
                  width={MAGNIFIER_RADIUS * 2}
                  height={MAGNIFIER_RADIUS * 2}
                  className="rounded-full shadow-lg"
                  style={{ display: "block" }}
                />
                {/* Color preview pill under magnifier */}
                <div
                  className="mt-1 rounded-lg shadow text-xs font-mono px-2 py-1 text-center"
                  style={{
                    background: displayColor.hex,
                    color:
                      displayColor.hsl.l > 55 ? "#000" : "#fff",
                    minWidth: MAGNIFIER_RADIUS * 2,
                  }}
                >
                  {displayColor.hex}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live color display */}
      {displayColor && (
        <div className="rounded-xl border border-border bg-surface/50 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div
            className="w-16 h-16 rounded-lg border border-border flex-shrink-0 shadow-sm"
            style={{ background: displayColor.hex }}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-medium uppercase tracking-wide w-8">HEX</span>
              <CopyButton text={displayColor.hex} />
              {isLocked && (
                <span className="text-xs text-accent font-medium ml-auto">Locked</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-medium uppercase tracking-wide w-8">RGB</span>
              <CopyButton text={`rgb(${displayColor.rgb.r}, ${displayColor.rgb.g}, ${displayColor.rgb.b})`} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-medium uppercase tracking-wide w-8">HSL</span>
              <CopyButton text={`hsl(${displayColor.hsl.h}, ${displayColor.hsl.s}%, ${displayColor.hsl.l}%)`} />
            </div>
          </div>
        </div>
      )}

      {/* Samples swatches */}
      {samples.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Saved Samples ({samples.length})
            </h2>
            <button
              onClick={() => setSamples([])}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {samples.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-border overflow-hidden bg-surface/50"
              >
                <div
                  className="h-14"
                  style={{ background: s.hex }}
                />
                <div className="p-2 space-y-1">
                  <CopyButton text={s.hex} />
                  <p className="text-[10px] text-muted font-mono">
                    rgb({s.rgb.r},{s.rgb.g},{s.rgb.b})
                  </p>
                  <p className="text-[10px] text-muted font-mono">
                    hsl({s.hsl.h},{s.hsl.s}%,{s.hsl.l}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
