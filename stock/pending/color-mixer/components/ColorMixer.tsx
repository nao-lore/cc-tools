"use client";

import { useState, useCallback, useMemo } from "react";

interface ColorRow {
  id: number;
  hex: string;
  weight: number;
}

let nextId = 3;

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
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function blendColors(rows: ColorRow[]): [number, number, number] | null {
  const valid = rows.filter((r) => hexToRgb(r.hex) !== null && r.weight > 0);
  if (valid.length === 0) return null;
  const totalWeight = valid.reduce((s, r) => s + r.weight, 0);
  let rr = 0, gg = 0, bb = 0;
  for (const row of valid) {
    const rgb = hexToRgb(row.hex)!;
    const w = row.weight / totalWeight;
    rr += rgb[0] * w;
    gg += rgb[1] * w;
    bb += rgb[2] * w;
  }
  return [Math.round(rr), Math.round(gg), Math.round(bb)];
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export default function ColorMixer() {
  const [rows, setRows] = useState<ColorRow[]>([
    { id: 1, hex: "#7c5cfc", weight: 50 },
    { id: 2, hex: "#f5576c", weight: 50 },
  ]);
  const [copied, setCopied] = useState<string | null>(null);

  const blended = useMemo(() => blendColors(rows), [rows]);

  const blendedHex = useMemo(() => {
    if (!blended) return null;
    return rgbToHex(blended[0], blended[1], blended[2]);
  }, [blended]);

  const blendedRgb = useMemo(() => {
    if (!blended) return null;
    return `rgb(${blended[0]}, ${blended[1]}, ${blended[2]})`;
  }, [blended]);

  const blendedHsl = useMemo(() => {
    if (!blended) return null;
    const [h, s, l] = rgbToHsl(blended[0], blended[1], blended[2]);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }, [blended]);

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const updateHex = useCallback((id: number, raw: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hex: raw } : r))
    );
  }, []);

  const updateWeight = useCallback((id: number, weight: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, weight } : r))
    );
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { id: nextId++, hex: "#4ade80", weight: 50 },
    ]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Color rows */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-muted">Colors</h3>
          <button
            onClick={addRow}
            className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            + Add Color
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const valid = isValidHex(row.hex);
            return (
              <div key={row.id} className="flex items-center gap-3">
                {/* Color picker */}
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={valid ? row.hex : "#000000"}
                    onChange={(e) => updateHex(row.id, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    aria-label="Color picker"
                  />
                </div>

                {/* Hex input */}
                <input
                  type="text"
                  value={row.hex}
                  onChange={(e) => {
                    let v = e.target.value.trim();
                    if (!v.startsWith("#")) v = "#" + v;
                    updateHex(row.id, v);
                  }}
                  maxLength={7}
                  className={`w-28 px-3 py-2 text-sm font-mono bg-background border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors ${
                    valid ? "border-border" : "border-red-400"
                  }`}
                  aria-label="Hex color value"
                />

                {/* Weight slider */}
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={row.weight}
                    onChange={(e) => updateWeight(row.id, Number(e.target.value))}
                    className="flex-1"
                    aria-label="Color weight"
                  />
                  <span className="text-sm font-mono tabular-nums text-muted w-8 text-right">
                    {row.weight}
                  </span>
                </div>

                {/* Color preview swatch */}
                <div
                  className="w-8 h-8 rounded-md border border-border shrink-0"
                  style={{ backgroundColor: valid ? row.hex : "transparent" }}
                />

                {/* Remove button */}
                <button
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 2}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  aria-label="Remove color"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Color Mixer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Mix two or more colors and preview the result. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Color Mixer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Mix two or more colors and preview the result. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      {/* Blended result */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Large swatch */}
        <div
          className="w-full transition-colors duration-200"
          style={{
            height: "clamp(160px, 28vh, 280px)",
            backgroundColor: blendedHex ?? "#e5e7eb",
          }}
        />

        {/* Output values */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">Blended Result</h3>

          {blendedHex && blendedRgb && blendedHsl ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "HEX", value: blendedHex },
                { label: "RGB", value: blendedRgb },
                { label: "HSL", value: blendedHsl },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => copyText(value, label)}
                  className="flex items-center justify-between px-3 py-2.5 bg-background border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all group text-left"
                  aria-label={`Copy ${label} value`}
                >
                  <div>
                    <p className="text-xs font-medium text-muted mb-0.5">{label}</p>
                    <p className="text-sm font-mono text-foreground">{value}</p>
                  </div>
                  <span className="text-xs text-muted group-hover:text-accent transition-colors shrink-0 ml-2">
                    {copied === label ? "Copied!" : "Copy"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Add valid hex colors above to see the blended result.</p>
          )}
        </div>
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
  "name": "Color Mixer",
  "description": "Mix two or more colors and preview the result",
  "url": "https://tools.loresync.dev/color-mixer",
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
