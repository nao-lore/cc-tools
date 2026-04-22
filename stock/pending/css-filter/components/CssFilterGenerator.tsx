"use client";

import { useState, useCallback, useMemo } from "react";

interface FilterValues {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  hueRotate: number;
  invert: number;
  opacity: number;
  saturate: number;
  sepia: number;
}

const DEFAULTS: FilterValues = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hueRotate: 0,
  invert: 0,
  opacity: 100,
  saturate: 100,
  sepia: 0,
};

const PRESETS: { name: string; values: FilterValues }[] = [
  {
    name: "Vintage",
    values: { blur: 0, brightness: 110, contrast: 85, grayscale: 10, hueRotate: 10, invert: 0, opacity: 100, saturate: 70, sepia: 40 },
  },
  {
    name: "Noir",
    values: { blur: 0, brightness: 90, contrast: 120, grayscale: 100, hueRotate: 0, invert: 0, opacity: 100, saturate: 0, sepia: 0 },
  },
  {
    name: "Warm",
    values: { blur: 0, brightness: 105, contrast: 95, grayscale: 0, hueRotate: 15, invert: 0, opacity: 100, saturate: 130, sepia: 20 },
  },
  {
    name: "Cool",
    values: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 200, invert: 0, opacity: 100, saturate: 120, sepia: 0 },
  },
  {
    name: "Dramatic",
    values: { blur: 0, brightness: 85, contrast: 160, grayscale: 20, hueRotate: 0, invert: 0, opacity: 100, saturate: 140, sepia: 10 },
  },
];

const SLIDERS: {
  key: keyof FilterValues;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  { key: "blur", label: "Blur", min: 0, max: 20, step: 0.5, unit: "px" },
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1, unit: "%" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, unit: "%" },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 1, unit: "%" },
  { key: "hueRotate", label: "Hue Rotate", min: 0, max: 360, step: 1, unit: "deg" },
  { key: "invert", label: "Invert", min: 0, max: 100, step: 1, unit: "%" },
  { key: "opacity", label: "Opacity", min: 0, max: 100, step: 1, unit: "%" },
  { key: "saturate", label: "Saturate", min: 0, max: 200, step: 1, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 1, unit: "%" },
];

function buildFilterString(v: FilterValues): string {
  const parts: string[] = [];
  if (v.blur !== 0) parts.push(`blur(${v.blur}px)`);
  if (v.brightness !== 100) parts.push(`brightness(${v.brightness}%)`);
  if (v.contrast !== 100) parts.push(`contrast(${v.contrast}%)`);
  if (v.grayscale !== 0) parts.push(`grayscale(${v.grayscale}%)`);
  if (v.hueRotate !== 0) parts.push(`hue-rotate(${v.hueRotate}deg)`);
  if (v.invert !== 0) parts.push(`invert(${v.invert}%)`);
  if (v.opacity !== 100) parts.push(`opacity(${v.opacity}%)`);
  if (v.saturate !== 100) parts.push(`saturate(${v.saturate}%)`);
  if (v.sepia !== 0) parts.push(`sepia(${v.sepia}%)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

const SAMPLE_GRADIENT =
  "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fda085 100%)";

export default function CssFilterGenerator() {
  const [values, setValues] = useState<FilterValues>(DEFAULTS);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const filterString = useMemo(() => buildFilterString(values), [values]);

  const cssOutput = useMemo(() => {
    if (filterString === "none") return "filter: none;";
    return `filter: ${filterString};`;
  }, [filterString]);

  const updateValue = useCallback((key: keyof FilterValues, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setValues(preset.values);
    setActivePreset(preset.name);
  }, []);

  const resetAll = useCallback(() => {
    setValues(DEFAULTS);
    setActivePreset(null);
  }, []);

  const copyCSS = useCallback(async () => {
    await navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssOutput]);

  const showImage = imageUrl.trim() !== "" && !imageError;

  return (
    <div className="space-y-8">
      {/* Live Preview */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">Preview</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageError(false);
              }}
              className="w-56 sm:w-72 px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div
          className="w-full rounded-xl overflow-hidden flex items-center justify-center"
          style={{ height: "clamp(200px, 35vh, 360px)" }}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Preview"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              style={{ filter: filterString }}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: SAMPLE_GRADIENT, filter: filterString }}
            />
          )}
        </div>
        {imageError && (
          <p className="text-xs text-red-400">Could not load image. Using gradient placeholder.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                  activePreset === preset.name
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-muted border-border hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {preset.name}
              </button>
            ))}
            <button
              onClick={resetAll}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Slider Controls */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
            {SLIDERS.map(({ key, label, min, max, step, unit }) => {
              const val = values[key];
              const isDefault =
                key === "brightness" || key === "contrast" || key === "saturate" || key === "opacity"
                  ? val === 100
                  : val === 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-muted">
                      {label}
                    </label>
                    <span
                      className={`text-sm font-mono tabular-nums ${
                        isDefault ? "text-muted" : "text-accent"
                      }`}
                    >
                      {val}{unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => updateValue(key, Number(e.target.value))}
                    className="w-full"
                    aria-label={`${label} slider`}
                  />
                </div>
              );
            })}
          </div>

          {/* CSS Output */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">CSS Output</h3>
              <button
                onClick={copyCSS}
                className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {copied ? "Copied!" : "Copy CSS"}
              </button>
            </div>
            <pre className="text-sm font-mono bg-background rounded-lg p-3 overflow-x-auto text-foreground border border-border whitespace-pre-wrap break-all">
              {cssOutput}
            </pre>
          </div>
        </div>

        {/* Preset Thumbnails Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted">Preset Preview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`group flex items-center gap-3 p-2 rounded-lg border transition-all ${
                  activePreset === preset.name
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50 bg-surface hover:bg-surface-hover"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-md shrink-0 border border-border overflow-hidden"
                  style={{
                    background: SAMPLE_GRADIENT,
                    filter: buildFilterString(preset.values),
                  }}
                />
                <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
