"use client";

import { useState, useCallback, useMemo } from "react";

// Tanner Helland's algorithm: converts color temperature (Kelvin) to RGB
function kelvinToRgb(kelvin: number): [number, number, number] {
  const temp = kelvin / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(Math.min(255, Math.max(0, v)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

function getLuminance(r: number, g: number, b: number): number {
  const [rr, gg, bb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
}

const REFERENCE_LABELS: { kelvin: number; label: string }[] = [
  { kelvin: 1000, label: "Candlelight" },
  { kelvin: 2700, label: "Warm White" },
  { kelvin: 4000, label: "Neutral" },
  { kelvin: 5500, label: "Daylight" },
  { kelvin: 6500, label: "Overcast" },
  { kelvin: 10000, label: "Blue Sky" },
];

const MIN_K = 1000;
const MAX_K = 10000;

export default function ColorTemperature() {
  const [kelvin, setKelvin] = useState(5500);
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = useMemo(() => kelvinToRgb(kelvin), [kelvin]);
  const hex = useMemo(() => rgbToHex(...rgb), [rgb]);
  const rgbString = useMemo(
    () => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    [rgb]
  );

  const textColor = useMemo(() => {
    const lum = getLuminance(...rgb);
    return lum > 0.35 ? "#1a1a1a" : "#ffffff";
  }, [rgb]);

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKelvin(Number(e.target.value));
    },
    []
  );

  // Build gradient stops for the full range
  const gradientStops = useMemo(() => {
    const stops = [1000, 1500, 2000, 2700, 3500, 4500, 5500, 6500, 8000, 10000];
    return stops
      .map((k) => {
        const [r, g, b] = kelvinToRgb(k);
        const pct = ((k - MIN_K) / (MAX_K - MIN_K)) * 100;
        return `rgb(${r},${g},${b}) ${pct.toFixed(1)}%`;
      })
      .join(", ");
  }, []);

  const sliderPct = ((kelvin - MIN_K) / (MAX_K - MIN_K)) * 100;

  return (
    <div className="space-y-6">
      {/* Color swatch preview */}
      <div
        className="w-full h-40 rounded-2xl border border-border flex flex-col items-center justify-center transition-colors duration-150"
        style={{ backgroundColor: hex }}
      >
        <span
          className="text-3xl font-bold font-mono tracking-tight"
          style={{ color: textColor }}
        >
          {kelvin}K
        </span>
        <span
          className="text-sm mt-1 opacity-80"
          style={{ color: textColor }}
        >
          {REFERENCE_LABELS.find((l) => l.kelvin === kelvin)?.label ?? ""}
        </span>
      </div>

      {/* Slider card */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">Color Temperature</h3>
          <span className="text-sm font-mono text-foreground">{kelvin}K</span>
        </div>

        {/* Gradient bar */}
        <div className="relative h-6 rounded-full overflow-hidden border border-border">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, ${gradientStops})`,
            }}
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-5 rounded-sm border-2 border-white shadow-md transition-[left] duration-75"
            style={{
              left: `calc(${sliderPct}% - 6px)`,
              backgroundColor: hex,
            }}
          />
        </div>

        <input
          type="range"
          min={MIN_K}
          max={MAX_K}
          step={100}
          value={kelvin}
          onChange={handleSlider}
          className="w-full accent-accent cursor-pointer"
          aria-label="Color temperature in Kelvin"
        />

        <div className="flex justify-between text-[11px] text-muted font-mono">
          <span>1000K</span>
          <span>5500K</span>
          <span>10000K</span>
        </div>
      </div>

      {/* Reference labels */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Reference Points</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {REFERENCE_LABELS.map(({ kelvin: k, label }) => {
            const [r, g, b] = kelvinToRgb(k);
            const h = rgbToHex(r, g, b);
            const tc = getLuminance(r, g, b) > 0.35 ? "#1a1a1a" : "#ffffff";
            const isActive = kelvin === k;
            return (
              <button
                key={k}
                onClick={() => setKelvin(k)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-accent ring-1 ring-accent"
                    : "border-border hover:border-accent/50"
                }`}
                aria-label={`Set to ${k}K — ${label}`}
              >
                <div
                  className="w-6 h-6 rounded-md shrink-0 border border-border/30"
                  style={{ backgroundColor: h }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-mono text-foreground leading-none">
                    {k}K
                  </div>
                  <div className="text-[10px] text-muted leading-none mt-0.5 truncate">
                    {label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Values with copy buttons */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Color Values</h3>
        <div className="space-y-2">
          {[
            { label: "HEX", value: hex, id: "hex" },
            { label: "RGB", value: rgbString, id: "rgb" },
          ].map(({ label, value, id }) => (
            <div
              key={id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 bg-background rounded-lg border border-border"
            >
              <span className="text-xs font-medium text-muted w-10 shrink-0">
                {label}
              </span>
              <span className="text-sm font-mono text-foreground flex-1 truncate">
                {value}
              </span>
              <button
                onClick={() => copyText(value, id)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors shrink-0"
                aria-label={`Copy ${label} value`}
              >
                {copied === id ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>

        {/* RGB channels */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { ch: "R", val: rgb[0], color: "#ef4444" },
            { ch: "G", val: rgb[1], color: "#22c55e" },
            { ch: "B", val: rgb[2], color: "#3b82f6" },
          ].map(({ ch, val, color }) => (
            <div
              key={ch}
              className="flex flex-col items-center gap-1 px-3 py-2 bg-background rounded-lg border border-border"
            >
              <span className="text-[10px] font-medium" style={{ color }}>
                {ch}
              </span>
              <span className="text-sm font-mono text-foreground">{val}</span>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{ width: `${(val / 255) * 100}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
