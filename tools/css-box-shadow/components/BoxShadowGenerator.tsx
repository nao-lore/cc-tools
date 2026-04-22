"use client";

import { useState, useCallback, useId } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

interface Preset {
  name: string;
  shadows: Omit<ShadowLayer, "id">[];
}

const PRESETS: Preset[] = [
  {
    name: "Subtle",
    shadows: [
      { offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Medium",
    shadows: [
      { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1, inset: false },
      { offsetX: 0, offsetY: 2, blur: 4, spread: -2, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Heavy",
    shadows: [
      { offsetX: 0, offsetY: 10, blur: 15, spread: -3, color: "#000000", opacity: 0.1, inset: false },
      { offsetX: 0, offsetY: 4, blur: 6, spread: -4, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Card",
    shadows: [
      { offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.12, inset: false },
      { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: "#000000", opacity: 0.24, inset: false },
    ],
  },
  {
    name: "Button",
    shadows: [
      { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.15, inset: false },
    ],
  },
  {
    name: "Dropdown",
    shadows: [
      { offsetX: 0, offsetY: 10, blur: 30, spread: 0, color: "#000000", opacity: 0.12, inset: false },
      { offsetX: 0, offsetY: 4, blur: 10, spread: 0, color: "#000000", opacity: 0.06, inset: false },
    ],
  },
  {
    name: "Floating",
    shadows: [
      { offsetX: 0, offsetY: 20, blur: 40, spread: -5, color: "#000000", opacity: 0.15, inset: false },
    ],
  },
  {
    name: "Sharp",
    shadows: [
      { offsetX: 4, offsetY: 4, blur: 0, spread: 0, color: "#000000", opacity: 1, inset: false },
    ],
  },
  {
    name: "Glow",
    shadows: [
      { offsetX: 0, offsetY: 0, blur: 20, spread: 2, color: "#3b82f6", opacity: 0.5, inset: false },
    ],
  },
  {
    name: "Inset Soft",
    shadows: [
      { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.15, inset: true },
    ],
  },
  {
    name: "Layered",
    shadows: [
      { offsetX: 0, offsetY: 1, blur: 1, spread: 0, color: "#000000", opacity: 0.08, inset: false },
      { offsetX: 0, offsetY: 2, blur: 2, spread: 0, color: "#000000", opacity: 0.06, inset: false },
      { offsetX: 0, offsetY: 4, blur: 4, spread: 0, color: "#000000", opacity: 0.04, inset: false },
      { offsetX: 0, offsetY: 8, blur: 8, spread: 0, color: "#000000", opacity: 0.03, inset: false },
    ],
  },
  {
    name: "Neumorphism",
    shadows: [
      { offsetX: 6, offsetY: 6, blur: 12, spread: 0, color: "#000000", opacity: 0.15, inset: false },
      { offsetX: -6, offsetY: -6, blur: 12, spread: 0, color: "#ffffff", opacity: 0.8, inset: false },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function shadowToCSS(shadow: ShadowLayer): string {
  const { r, g, b } = hexToRgb(shadow.color);
  const parts: string[] = [];
  if (shadow.inset) parts.push("inset");
  parts.push(`${shadow.offsetX}px`);
  parts.push(`${shadow.offsetY}px`);
  parts.push(`${shadow.blur}px`);
  parts.push(`${shadow.spread}px`);
  parts.push(`rgba(${r}, ${g}, ${b}, ${shadow.opacity})`);
  return parts.join(" ");
}

function generateCSS(shadows: ShadowLayer[]): string {
  if (shadows.length === 0) return "box-shadow: none;";
  return `box-shadow: ${shadows.map(shadowToCSS).join(",\n             ")};`;
}

function generateInlineStyle(shadows: ShadowLayer[]): string {
  if (shadows.length === 0) return "none";
  return shadows.map(shadowToCSS).join(", ");
}

let layerCounter = 0;
function createId(): string {
  return `layer-${++layerCounter}-${Date.now()}`;
}

function createDefaultLayer(): ShadowLayer {
  return {
    id: createId(),
    offsetX: 0,
    offsetY: 4,
    blur: 10,
    spread: 0,
    color: "#000000",
    opacity: 0.2,
    inset: false,
  };
}

// ─── Slider Row Component ────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const inputId = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={inputId} className="w-10 text-xs text-gray-500 shrink-0">
        {label}
      </label>
      <input
        type="range"
        id={inputId}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 min-w-0"
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        className="w-16 px-2 py-1 text-sm text-center border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

// ─── Shadow Layer Controls ───────────────────────────────────────────────────

function ShadowLayerControls({
  shadow,
  index,
  total,
  onUpdate,
  onRemove,
}: {
  shadow: ShadowLayer;
  index: number;
  total: number;
  onUpdate: (id: string, updates: Partial<ShadowLayer>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Shadow {index + 1}
        </span>
        {total > 1 && (
          <button
            onClick={() => onRemove(shadow.id)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            aria-label={`Remove shadow ${index + 1}`}
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        <SliderRow label="X" value={shadow.offsetX} min={-100} max={100} onChange={(v) => onUpdate(shadow.id, { offsetX: v })} />
        <SliderRow label="Y" value={shadow.offsetY} min={-100} max={100} onChange={(v) => onUpdate(shadow.id, { offsetY: v })} />
        <SliderRow label="Blur" value={shadow.blur} min={0} max={200} onChange={(v) => onUpdate(shadow.id, { blur: v })} />
        <SliderRow label="Sprd" value={shadow.spread} min={-100} max={100} onChange={(v) => onUpdate(shadow.id, { spread: v })} />

        <div className="flex items-center gap-3">
          <label className="w-10 text-xs text-gray-500 shrink-0">Color</label>
          <input
            type="color"
            value={shadow.color}
            onChange={(e) => onUpdate(shadow.id, { color: e.target.value })}
            className="w-8 h-8 shrink-0"
          />
          <input
            type="text"
            value={shadow.color}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                onUpdate(shadow.id, { color: e.target.value });
              }
            }}
            className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-10 text-xs text-gray-500 shrink-0">Opac</label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(shadow.opacity * 100)}
            onChange={(e) => onUpdate(shadow.id, { opacity: Number(e.target.value) / 100 })}
            className="flex-1 min-w-0"
          />
          <span className="w-16 text-sm text-center text-gray-600">
            {Math.round(shadow.opacity * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onUpdate(shadow.id, { inset: !shadow.inset })}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
              shadow.inset
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Inset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([createDefaultLayer()]);
  const [bgColor, setBgColor] = useState("#f0f0f0");
  const [copied, setCopied] = useState(false);

  const updateShadow = useCallback((id: string, updates: Partial<ShadowLayer>) => {
    setShadows((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const removeShadow = useCallback((id: string) => {
    setShadows((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addShadow = useCallback(() => {
    setShadows((prev) => [...prev, createDefaultLayer()]);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setShadows(preset.shadows.map((s) => ({ ...s, id: createId() })));
  }, []);

  const cssOutput = generateCSS(shadows);
  const inlineStyle = generateInlineStyle(shadows);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = cssOutput;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cssOutput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* Left: Controls */}
      <div className="space-y-4 order-2 lg:order-1">
        {/* Presets */}
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Presets</h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md border border-gray-200 transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Shadow layers */}
        <div className="space-y-3">
          {shadows.map((shadow, i) => (
            <ShadowLayerControls
              key={shadow.id}
              shadow={shadow}
              index={i}
              total={shadows.length}
              onUpdate={updateShadow}
              onRemove={removeShadow}
            />
          ))}
        </div>

        <button
          onClick={addShadow}
          className="w-full py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
        >
          + Add Shadow Layer
        </button>

        {/* Background color */}
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 font-medium">Preview Background</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8"
            />
            <span className="text-sm text-gray-500 font-mono">{bgColor}</span>
          </div>
        </div>
      </div>

      {/* Right: Preview + Output */}
      <div className="space-y-4 order-1 lg:order-2">
        {/* Live Preview */}
        <div
          className="rounded-xl border border-gray-200 p-8 sm:p-12 flex items-center justify-center min-h-[300px] sm:min-h-[400px] transition-colors"
          style={{ backgroundColor: bgColor }}
        >
          <div
            className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-2xl transition-shadow duration-150"
            style={{ boxShadow: inlineStyle }}
          />
        </div>

        {/* CSS Output */}
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-mono">CSS</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              {copied ? "Copied!" : "Copy CSS"}
            </button>
          </div>
          <pre className="p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {cssOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
