"use client";

import { useState, useCallback, useId } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

interface Preset {
  name: string;
  shadows: Omit<ShadowLayer, "id">[];
}

const PRESETS: Preset[] = [
  {
    name: "Neon Glow",
    shadows: [
      { offsetX: 0, offsetY: 0, blur: 4,  color: "#00ffff", opacity: 1 },
      { offsetX: 0, offsetY: 0, blur: 10, color: "#00ffff", opacity: 0.8 },
      { offsetX: 0, offsetY: 0, blur: 20, color: "#00aaff", opacity: 0.6 },
      { offsetX: 0, offsetY: 0, blur: 40, color: "#0066ff", opacity: 0.4 },
    ],
  },
  {
    name: "3D",
    shadows: [
      { offsetX: 1,  offsetY: 1,  blur: 0, color: "#888888", opacity: 1 },
      { offsetX: 2,  offsetY: 2,  blur: 0, color: "#777777", opacity: 1 },
      { offsetX: 3,  offsetY: 3,  blur: 0, color: "#666666", opacity: 1 },
      { offsetX: 4,  offsetY: 4,  blur: 0, color: "#555555", opacity: 1 },
      { offsetX: 5,  offsetY: 5,  blur: 0, color: "#444444", opacity: 1 },
    ],
  },
  {
    name: "Retro",
    shadows: [
      { offsetX: 3,  offsetY: 3,  blur: 0, color: "#ff6b35", opacity: 1 },
      { offsetX: 6,  offsetY: 6,  blur: 0, color: "#ffbe0b", opacity: 1 },
    ],
  },
  {
    name: "Emboss",
    shadows: [
      { offsetX: -1, offsetY: -1, blur: 1, color: "#ffffff", opacity: 0.9 },
      { offsetX:  1, offsetY:  1, blur: 1, color: "#000000", opacity: 0.3 },
    ],
  },
  {
    name: "Fire",
    shadows: [
      { offsetX: 0, offsetY: -2, blur: 4,  color: "#ff4500", opacity: 1   },
      { offsetX: 0, offsetY: -4, blur: 8,  color: "#ff8c00", opacity: 0.9 },
      { offsetX: 0, offsetY: -8, blur: 16, color: "#ffd700", opacity: 0.7 },
      { offsetX: 0, offsetY:-12, blur: 24, color: "#ffff00", opacity: 0.4 },
    ],
  },
  {
    name: "Subtle",
    shadows: [
      { offsetX: 1, offsetY: 1, blur: 2, color: "#000000", opacity: 0.2 },
    ],
  },
  {
    name: "Sharp",
    shadows: [
      { offsetX: 2, offsetY: 2, blur: 0, color: "#000000", opacity: 1 },
    ],
  },
  {
    name: "Outline",
    shadows: [
      { offsetX: -1, offsetY: -1, blur: 0, color: "#000000", opacity: 1 },
      { offsetX:  1, offsetY: -1, blur: 0, color: "#000000", opacity: 1 },
      { offsetX: -1, offsetY:  1, blur: 0, color: "#000000", opacity: 1 },
      { offsetX:  1, offsetY:  1, blur: 0, color: "#000000", opacity: 1 },
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
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px rgba(${r}, ${g}, ${b}, ${shadow.opacity})`;
}

function generateCSS(shadows: ShadowLayer[]): string {
  if (shadows.length === 0) return "text-shadow: none;";
  return `text-shadow: ${shadows.map(shadowToCSS).join(",\n             ")};`;
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
    offsetX: 2,
    offsetY: 2,
    blur: 4,
    color: "#000000",
    opacity: 0.3,
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
        <SliderRow label="X" value={shadow.offsetX} min={-50} max={50} onChange={(v) => onUpdate(shadow.id, { offsetX: v })} />
        <SliderRow label="Y" value={shadow.offsetY} min={-50} max={50} onChange={(v) => onUpdate(shadow.id, { offsetY: v })} />
        <SliderRow label="Blur" value={shadow.blur} min={0} max={50} onChange={(v) => onUpdate(shadow.id, { blur: v })} />

        <div className="flex items-center gap-3">
          <label className="w-10 text-xs text-gray-500 shrink-0">Color</label>
          <input
            type="color"
            value={shadow.color}
            onChange={(e) => onUpdate(shadow.id, { color: e.target.value })}
            className="w-8 h-8 shrink-0 cursor-pointer"
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
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TextShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([createDefaultLayer()]);
  const [previewText, setPreviewText] = useState("Hello World");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#1a1a1a");
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

        {/* Preview settings */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">Preview Settings</h2>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 shrink-0 w-20">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
            <span className="text-sm text-gray-500 font-mono">{textColor}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 shrink-0 w-20">Background</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
            <span className="text-sm text-gray-500 font-mono">{bgColor}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 shrink-0 w-20">Font Size</label>
            <input
              type="range"
              min={16}
              max={120}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 min-w-0"
            />
            <span className="w-16 text-sm text-center text-gray-600">{fontSize}px</span>
          </div>
        </div>
      </div>

      {/* Right: Preview + Output */}
      <div className="space-y-4 order-1 lg:order-2">
        {/* Text input */}
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview Text</label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type your text here..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Live Preview */}
        <div
          className="rounded-xl border border-gray-200 p-8 sm:p-12 flex items-center justify-center min-h-[200px] sm:min-h-[280px] transition-colors overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          <p
            className="font-bold text-center leading-tight break-words max-w-full"
            style={{
              textShadow: inlineStyle,
              fontSize: `${fontSize}px`,
              color: textColor,
            }}
          >
            {previewText || "Hello World"}
          </p>
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
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Text Shadow tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Create CSS text-shadow effects with a visual editor. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Text Shadow tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Create CSS text-shadow effects with a visual editor. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSS Text Shadow",
  "description": "Create CSS text-shadow effects with a visual editor",
  "url": "https://tools.loresync.dev/css-text-shadow",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
