"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ── Color conversion utils ────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
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

function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) =>
    Math.round((ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255);
  return [f(0), f(8), f(4)];
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getTextColor(hex: string): string {
  return getLuminance(hex) > 0.3 ? "#1a1a1a" : "#ffffff";
}

// ── Nearest Tailwind color ────────────────────────────────────────────────────

// Representative hex values for Tailwind CSS v3 palette (named colors, 500 step)
const TAILWIND_PALETTE: [string, string][] = [
  ["slate-50", "#f8fafc"], ["slate-100", "#f1f5f9"], ["slate-200", "#e2e8f0"],
  ["slate-300", "#cbd5e1"], ["slate-400", "#94a3b8"], ["slate-500", "#64748b"],
  ["slate-600", "#475569"], ["slate-700", "#334155"], ["slate-800", "#1e293b"],
  ["slate-900", "#0f172a"],
  ["gray-50", "#f9fafb"], ["gray-100", "#f3f4f6"], ["gray-200", "#e5e7eb"],
  ["gray-300", "#d1d5db"], ["gray-400", "#9ca3af"], ["gray-500", "#6b7280"],
  ["gray-600", "#4b5563"], ["gray-700", "#374151"], ["gray-800", "#1f2937"],
  ["gray-900", "#111827"],
  ["zinc-500", "#71717a"], ["neutral-500", "#737373"], ["stone-500", "#78716c"],
  ["red-50", "#fef2f2"], ["red-100", "#fee2e2"], ["red-200", "#fecaca"],
  ["red-300", "#fca5a5"], ["red-400", "#f87171"], ["red-500", "#ef4444"],
  ["red-600", "#dc2626"], ["red-700", "#b91c1c"], ["red-800", "#991b1b"],
  ["red-900", "#7f1d1d"],
  ["orange-400", "#fb923c"], ["orange-500", "#f97316"], ["orange-600", "#ea580c"],
  ["amber-400", "#fbbf24"], ["amber-500", "#f59e0b"], ["amber-600", "#d97706"],
  ["yellow-400", "#facc15"], ["yellow-500", "#eab308"], ["yellow-600", "#ca8a04"],
  ["lime-400", "#a3e635"], ["lime-500", "#84cc16"], ["lime-600", "#65a30d"],
  ["green-50", "#f0fdf4"], ["green-100", "#dcfce7"], ["green-200", "#bbf7d0"],
  ["green-400", "#4ade80"], ["green-500", "#22c55e"], ["green-600", "#16a34a"],
  ["green-700", "#15803d"], ["green-800", "#166534"], ["green-900", "#14532d"],
  ["emerald-500", "#10b981"], ["teal-500", "#14b8a6"], ["cyan-500", "#06b6d4"],
  ["sky-400", "#38bdf8"], ["sky-500", "#0ea5e9"], ["sky-600", "#0284c7"],
  ["blue-50", "#eff6ff"], ["blue-100", "#dbeafe"], ["blue-200", "#bfdbfe"],
  ["blue-400", "#60a5fa"], ["blue-500", "#3b82f6"], ["blue-600", "#2563eb"],
  ["blue-700", "#1d4ed8"], ["blue-800", "#1e40af"], ["blue-900", "#1e3a8a"],
  ["indigo-400", "#818cf8"], ["indigo-500", "#6366f1"], ["indigo-600", "#4f46e5"],
  ["violet-400", "#a78bfa"], ["violet-500", "#8b5cf6"], ["violet-600", "#7c3aed"],
  ["purple-400", "#c084fc"], ["purple-500", "#a855f7"], ["purple-600", "#9333ea"],
  ["fuchsia-500", "#d946ef"], ["pink-400", "#f472b6"], ["pink-500", "#ec4899"],
  ["rose-400", "#fb7185"], ["rose-500", "#f43f5e"], ["rose-600", "#e11d48"],
  ["white", "#ffffff"], ["black", "#000000"],
];

function nearestTailwind(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "N/A";
  let best = "";
  let bestDist = Infinity;
  for (const [name, tw] of TAILWIND_PALETTE) {
    const trgb = hexToRgb(tw);
    if (!trgb) continue;
    const d =
      (rgb[0] - trgb[0]) ** 2 +
      (rgb[1] - trgb[1]) ** 2 +
      (rgb[2] - trgb[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  hex: string;
  timestamp: number;
}

const STORAGE_KEY = "color-picker-history";
const MAX_HISTORY = 20;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ColorPickerHistory() {
  const [hex, setHex] = useState("#7c5cfc");
  const [hexInput, setHexInput] = useState("#7c5cfc");
  const [rInput, setRInput] = useState("124");
  const [gInput, setGInput] = useState("92");
  const [bInput, setBInput] = useState("252");
  const [hInput, setHInput] = useState("255");
  const [sInput, setSInput] = useState("96");
  const [lInput, setLInput] = useState("67");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Sync all inputs when hex changes from the color wheel
  const syncFromHex = useCallback((h: string) => {
    if (!isValidHex(h)) return;
    const rgb = hexToRgb(h);
    if (!rgb) return;
    const [r, g, b] = rgb;
    const [hh, s, l] = rgbToHsl(r, g, b);
    setRInput(String(r));
    setGInput(String(g));
    setBInput(String(b));
    setHInput(String(hh));
    setSInput(String(s));
    setLInput(String(l));
    setHexInput(h);
  }, []);

  // Initialize sync on mount
  useEffect(() => {
    syncFromHex(hex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const addToHistory = useCallback(
    (h: string) => {
      if (!isValidHex(h)) return;
      setHistory((prev) => {
        const filtered = prev.filter((e) => e.hex !== h);
        const next = [
          { hex: h, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY);
        saveHistory(next);
        return next;
      });
    },
    []
  );

  // ── Input handlers ──────────────────────────────────────────────────────────

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setHex(v);
      syncFromHex(v);
    },
    [syncFromHex]
  );

  const handleColorPickerCommit = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addToHistory(e.target.value);
    },
    [addToHistory]
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      setHexInput(v);
      if (isValidHex(v)) {
        setHex(v);
        syncFromHex(v);
        addToHistory(v);
      }
    },
    [syncFromHex, addToHistory]
  );

  const handleRgbInput = useCallback(
    (channel: "r" | "g" | "b", value: string) => {
      const setters = { r: setRInput, g: setGInput, b: setBInput };
      setters[channel](value);
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 255) return;
      const rgb = hexToRgb(hex) ?? [0, 0, 0];
      const updated: [number, number, number] = [...rgb] as [number, number, number];
      updated[{ r: 0, g: 1, b: 2 }[channel]] = num;
      const newHex = rgbToHex(...updated);
      setHex(newHex);
      setHexInput(newHex);
      const [hh, s, l] = rgbToHsl(...updated);
      setHInput(String(hh));
      setSInput(String(s));
      setLInput(String(l));
      addToHistory(newHex);
    },
    [hex, addToHistory]
  );

  const handleHslInput = useCallback(
    (channel: "h" | "s" | "l", value: string) => {
      const setters = { h: setHInput, s: setSInput, l: setLInput };
      setters[channel](value);
      const num = parseInt(value);
      const max = channel === "h" ? 360 : 100;
      if (isNaN(num) || num < 0 || num > max) return;
      const hh = channel === "h" ? num : parseInt(hInput);
      const s = channel === "s" ? num : parseInt(sInput);
      const l = channel === "l" ? num : parseInt(lInput);
      if (isNaN(hh) || isNaN(s) || isNaN(l)) return;
      const [r, g, b] = hslToRgb(hh, s, l);
      const newHex = rgbToHex(r, g, b);
      setHex(newHex);
      setHexInput(newHex);
      setRInput(String(r));
      setGInput(String(g));
      setBInput(String(b));
      addToHistory(newHex);
    },
    [hInput, sInput, lInput, addToHistory]
  );

  // ── Derived values for copy buttons ────────────────────────────────────────

  const valid = isValidHex(hex);
  const rgb = valid ? hexToRgb(hex) : null;
  const hsl = rgb ? rgbToHsl(...rgb) : null;
  const twClass = valid ? nearestTailwind(hex) : "N/A";

  const rgbStr = rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : "";
  const hslStr = hsl ? `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` : "";

  // ── History import/export ──────────────────────────────────────────────────

  const exportHistory = useCallback(() => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-history.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const importHistory = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string) as HistoryEntry[];
          if (!Array.isArray(parsed)) return;
          const valid = parsed.filter(
            (entry) =>
              typeof entry.hex === "string" &&
              isValidHex(entry.hex) &&
              typeof entry.timestamp === "number"
          );
          const merged = [
            ...valid,
            ...history.filter((h) => !valid.some((v) => v.hex === h.hex)),
          ].slice(0, MAX_HISTORY);
          setHistory(merged);
          saveHistory(merged);
        } catch {
          // invalid JSON — ignore
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [history]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Color picker + hex input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-medium text-muted">Pick a Color</h3>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={valid ? hex : "#000000"}
            onChange={handleColorPickerChange}
            onBlur={handleColorPickerCommit}
            className="w-14 h-14 rounded-xl border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
            aria-label="Color picker"
          />
          {valid && (
            <div
              className="flex-1 h-14 rounded-xl border border-border transition-colors duration-150"
              style={{ backgroundColor: hex }}
            />
          )}
        </div>

        {/* Hex input */}
        <div>
          <label className="block text-xs text-muted mb-1">Hex</label>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInput}
            maxLength={7}
            placeholder="#7c5cfc"
            className={`w-40 px-3 py-2 text-sm font-mono bg-background border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors ${
              isValidHex(hexInput) ? "border-border" : "border-red-400"
            }`}
            aria-label="Hex color value"
          />
        </div>

        {/* RGB inputs */}
        <div>
          <label className="block text-xs text-muted mb-1">RGB</label>
          <div className="flex gap-2">
            {(
              [
                { label: "R", value: rInput, ch: "r" as const, max: 255 },
                { label: "G", value: gInput, ch: "g" as const, max: 255 },
                { label: "B", value: bInput, ch: "b" as const, max: 255 },
              ] as const
            ).map(({ label, value, ch }) => (
              <div key={ch} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted">{label}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={value}
                  onChange={(e) => handleRgbInput(ch, e.target.value)}
                  className="w-16 px-2 py-1.5 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent text-center"
                  aria-label={`${label} channel`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* HSL inputs */}
        <div>
          <label className="block text-xs text-muted mb-1">HSL</label>
          <div className="flex gap-2">
            {(
              [
                { label: "H", value: hInput, ch: "h" as const, max: 360, unit: "°" },
                { label: "S", value: sInput, ch: "s" as const, max: 100, unit: "%" },
                { label: "L", value: lInput, ch: "l" as const, max: 100, unit: "%" },
              ] as const
            ).map(({ label, value, ch, unit }) => (
              <div key={ch} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted">
                  {label}
                  {unit}
                </span>
                <input
                  type="number"
                  min={0}
                  max={ch === "h" ? 360 : 100}
                  value={value}
                  onChange={(e) => handleHslInput(ch, e.target.value)}
                  className="w-16 px-2 py-1.5 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent text-center"
                  aria-label={`${label} channel`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy formats */}
      {valid && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">Copy Format</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Hex", value: hex },
              { label: "rgb()", value: rgbStr },
              { label: "hsl()", value: hslStr },
              { label: `tw: ${twClass}`, value: twClass },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => copyText(value, label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-colors"
                aria-label={`Copy ${label}`}
              >
                <span className="font-mono truncate max-w-[180px]">
                  {copied === label ? "Copied!" : value}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">
            History{" "}
            <span className="font-normal">({history.length}/{MAX_HISTORY})</span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-2.5 py-1 text-xs rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              Import
            </button>
            <button
              onClick={exportHistory}
              disabled={history.length === 0}
              className="px-2.5 py-1 text-xs rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export
            </button>
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="px-2.5 py-1 text-xs rounded-lg border border-border text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={importHistory}
          className="hidden"
          aria-label="Import history JSON"
        />

        {history.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">
            No colors yet — pick one above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {history.map((entry) => {
              const entryRgb = hexToRgb(entry.hex);
              const entryHsl = entryRgb ? rgbToHsl(...entryRgb) : null;
              const textCol = getTextColor(entry.hex);
              return (
                <button
                  key={entry.hex + entry.timestamp}
                  onClick={() => {
                    setHex(entry.hex);
                    syncFromHex(entry.hex);
                  }}
                  title={`${entry.hex} — click to select`}
                  className="group relative flex flex-col items-center gap-1"
                  aria-label={`Select ${entry.hex}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl border border-border/50 transition-transform group-hover:scale-110 group-hover:shadow-md flex items-end justify-center pb-1"
                    style={{ backgroundColor: entry.hex }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyText(entry.hex, `hist-${entry.hex}`);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold px-1 rounded"
                      style={{ color: textCol, backgroundColor: "rgba(0,0,0,0.25)" }}
                      aria-label={`Copy ${entry.hex}`}
                    >
                      Copy
                    </button>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Color Picker with History tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Pick colors with a full-featured picker and persistent history. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Color Picker with History tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Pick colors with a full-featured picker and persistent history. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                  <span className="text-[10px] font-mono text-muted leading-none">
                    {copied === `hist-${entry.hex}` ? "Copied!" : entry.hex}
                  </span>
                  {entryHsl && (
                    <span className="text-[9px] text-muted/60 leading-none">
                      {entryHsl[0]}° {entryHsl[1]}% {entryHsl[2]}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Picker with History",
  "description": "Pick colors with a full-featured picker and persistent history",
  "url": "https://tools.loresync.dev/color-picker-history",
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
