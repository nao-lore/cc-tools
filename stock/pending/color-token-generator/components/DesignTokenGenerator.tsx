"use client";

import { useState, useMemo, useCallback, useId } from "react";

// ---------------------------------------------------------------------------
// Color math helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 3 && clean.length !== 6) return null;
  const full =
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Mix `color` with white (tint) or black (shade). ratio 0 = color, 1 = white/black */
function mixWithWhite(rgb: [number, number, number], ratio: number): string {
  const [r, g, b] = rgb;
  return rgbToHex(r + (255 - r) * ratio, g + (255 - g) * ratio, b + (255 - b) * ratio);
}

function mixWithBlack(rgb: [number, number, number], ratio: number): string {
  const [r, g, b] = rgb;
  return rgbToHex(r * (1 - ratio), g * (1 - ratio), b * (1 - ratio));
}

/**
 * Generate a 9-step scale (100–900) where:
 *   100 = heavy tint, 500 = base, 900 = heavy shade
 */
function generateScale(hex: string): Record<string, string> {
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  return {
    "100": mixWithWhite(rgb, 0.8),
    "200": mixWithWhite(rgb, 0.6),
    "300": mixWithWhite(rgb, 0.4),
    "400": mixWithWhite(rgb, 0.2),
    "500": hex.toLowerCase(),
    "600": mixWithBlack(rgb, 0.2),
    "700": mixWithBlack(rgb, 0.4),
    "800": mixWithBlack(rgb, 0.6),
    "900": mixWithBlack(rgb, 0.8),
  };
}

// 5-step subset for display swatches: 100, 300, 500, 700, 900
const SWATCH_STEPS = ["100", "300", "500", "700", "900"] as const;

// ---------------------------------------------------------------------------
// Token codegen
// ---------------------------------------------------------------------------

interface ColorEntry {
  id: string;
  name: string;
  hex: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function generateCSS(colors: ColorEntry[], withScale: boolean): string {
  const lines: string[] = [":root {"];
  for (const c of colors) {
    const slug = slugify(c.name) || "color";
    if (!hexToRgb(c.hex)) continue;
    if (withScale) {
      const scale = generateScale(c.hex);
      for (const step of Object.keys(scale)) {
        lines.push(`  --color-${slug}-${step}: ${scale[step]};`);
      }
    } else {
      lines.push(`  --color-${slug}: ${c.hex.toLowerCase()};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

function generateSCSS(colors: ColorEntry[], withScale: boolean): string {
  const lines: string[] = [];
  for (const c of colors) {
    const slug = slugify(c.name) || "color";
    if (!hexToRgb(c.hex)) continue;
    if (withScale) {
      const scale = generateScale(c.hex);
      for (const step of Object.keys(scale)) {
        lines.push(`$color-${slug}-${step}: ${scale[step]};`);
      }
    } else {
      lines.push(`$color-${slug}: ${c.hex.toLowerCase()};`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

function generateJSON(colors: ColorEntry[], withScale: boolean): string {
  const tokens: Record<string, unknown> = {};
  for (const c of colors) {
    const slug = slugify(c.name) || "color";
    if (!hexToRgb(c.hex)) continue;
    if (withScale) {
      const scale = generateScale(c.hex);
      const scaleTokens: Record<string, unknown> = {};
      for (const [step, val] of Object.entries(scale)) {
        scaleTokens[step] = { value: val, type: "color" };
      }
      tokens[slug] = scaleTokens;
    } else {
      tokens[slug] = { value: c.hex.toLowerCase(), type: "color" };
    }
  }
  return JSON.stringify({ color: tokens }, null, 2);
}

// ---------------------------------------------------------------------------
// Small reusable UI
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        copied
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-hover"
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Color row
// ---------------------------------------------------------------------------

let _idCounter = 0;
function newId() {
  return `c${++_idCounter}`;
}

interface ColorRowProps {
  entry: ColorEntry;
  onChange: (id: string, field: "name" | "hex", value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  withScale: boolean;
}

function ColorRow({ entry, onChange, onRemove, canRemove, withScale }: ColorRowProps) {
  const scale = useMemo(
    () => (withScale && hexToRgb(entry.hex) ? generateScale(entry.hex) : null),
    [entry.hex, withScale]
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Color picker */}
        <div className="relative shrink-0 w-10 h-10 rounded-lg border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: entry.hex }}>
          <input
            type="color"
            value={hexToRgb(entry.hex) ? entry.hex : "#000000"}
            onChange={(e) => onChange(entry.id, "hex", e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Pick color"
          />
        </div>

        {/* Name input */}
        <input
          type="text"
          value={entry.name}
          onChange={(e) => onChange(entry.id, "name", e.target.value)}
          placeholder="Token name (e.g. primary)"
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />

        {/* Hex input */}
        <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 gap-1 w-32 shrink-0">
          <span className="text-muted text-sm font-mono">#</span>
          <input
            type="text"
            value={entry.hex.replace("#", "").toUpperCase()}
            onChange={(e) => {
              const val = "#" + e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
              onChange(entry.id, "hex", val);
            }}
            maxLength={6}
            className="flex-1 bg-transparent text-foreground text-sm font-mono uppercase focus:outline-none"
            placeholder="000000"
          />
        </div>

        {/* Remove */}
        {canRemove && (
          <button
            onClick={() => onRemove(entry.id)}
            className="shrink-0 p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Remove color"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Swatches */}
      {scale && (
        <div className="flex gap-1.5 flex-wrap">
          {SWATCH_STEPS.map((step) => (
            <div key={step} className="flex flex-col items-center gap-0.5">
              <div
                className="w-10 h-10 rounded-lg border border-black/10"
                style={{ backgroundColor: scale[step] }}
                title={`${slugify(entry.name) || "color"}-${step}: ${scale[step]}`}
              />
              <span className="text-[10px] text-muted font-mono">{step}</span>
            </div>
          ))}
          {/* Base swatch label */}
          <div className="flex flex-col items-center gap-0.5 ml-1">
            <div
              className="w-10 h-10 rounded-lg border-2 border-accent"
              style={{ backgroundColor: entry.hex }}
              title={`Base: ${entry.hex}`}
            />
            <span className="text-[10px] text-accent font-mono font-semibold">base</span>
          </div>
        </div>
      )}

      {/* No-scale swatch */}
      {!withScale && hexToRgb(entry.hex) && (
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg border border-black/10"
            style={{ backgroundColor: entry.hex }}
          />
          <span className="text-xs text-muted font-mono">{entry.hex.toLowerCase()}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Output panel
// ---------------------------------------------------------------------------

type OutputTab = "css" | "scss" | "json";

const TAB_LABELS: { id: OutputTab; label: string }[] = [
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "json", label: "JSON" },
];

interface OutputPanelProps {
  colors: ColorEntry[];
  withScale: boolean;
}

function OutputPanel({ colors, withScale }: OutputPanelProps) {
  const [tab, setTab] = useState<OutputTab>("css");

  const outputs = useMemo(
    () => ({
      css: generateCSS(colors, withScale),
      scss: generateSCSS(colors, withScale),
      json: generateJSON(colors, withScale),
    }),
    [colors, withScale]
  );

  const currentOutput = outputs[tab];

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border px-4 py-2 gap-1">
        {TAB_LABELS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto">
          <CopyButton text={currentOutput} />
        </div>
      </div>

      {/* Code */}
      <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto max-h-80 leading-relaxed whitespace-pre">
        {currentOutput || "// Add at least one color to generate tokens"}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const DEFAULT_COLORS: ColorEntry[] = [
  { id: newId(), name: "primary", hex: "#6366f1" },
  { id: newId(), name: "secondary", hex: "#ec4899" },
  { id: newId(), name: "neutral", hex: "#6b7280" },
];

export default function DesignTokenGenerator() {
  const [colors, setColors] = useState<ColorEntry[]>(DEFAULT_COLORS);
  const [withScale, setWithScale] = useState(true);

  const handleChange = useCallback(
    (id: string, field: "name" | "hex", value: string) => {
      setColors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const handleRemove = useCallback((id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    setColors((prev) => [
      ...prev,
      { id: newId(), name: "", hex: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0") },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={withScale}
              onChange={(e) => setWithScale(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-10 h-6 rounded-full transition-colors ${
                withScale ? "bg-accent" : "bg-border"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  withScale ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-foreground">
            Auto-generate tint/shade scale (100–900)
          </span>
        </label>

        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Color
        </button>
      </div>

      {/* Color rows */}
      <div className="space-y-3">
        {colors.map((c) => (
          <ColorRow
            key={c.id}
            entry={c}
            onChange={handleChange}
            onRemove={handleRemove}
            canRemove={colors.length > 1}
            withScale={withScale}
          />
        ))}
      </div>

      {/* Output */}
      <OutputPanel colors={colors} withScale={withScale} />

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
