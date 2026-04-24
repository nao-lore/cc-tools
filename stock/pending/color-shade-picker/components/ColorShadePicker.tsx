"use client";

import { useState, useCallback, useMemo } from "react";

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

function mixWithWhite(rgb: [number, number, number], amount: number): string {
  // amount: 0.1 (10% tint) to 1.0 (100% white)
  const r = rgb[0] + (255 - rgb[0]) * amount;
  const g = rgb[1] + (255 - rgb[1]) * amount;
  const b = rgb[2] + (255 - rgb[2]) * amount;
  return rgbToHex(r, g, b);
}

function mixWithBlack(rgb: [number, number, number], amount: number): string {
  // amount: 0.1 (10% shade) to 1.0 (100% black)
  const r = rgb[0] * (1 - amount);
  const g = rgb[1] * (1 - amount);
  const b = rgb[2] * (1 - amount);
  return rgbToHex(r, g, b);
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

const TAILWIND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export default function ColorShadePicker() {
  const [hex, setHex] = useState("#7c5cfc");
  const [hexInput, setHexInput] = useState("#7c5cfc");
  const [activeTab, setActiveTab] = useState<"css" | "tailwind">("css");
  const [copied, setCopied] = useState<string | null>(null);

  const valid = isValidHex(hex);
  const rgb = useMemo(() => (valid ? hexToRgb(hex) : null), [hex, valid]);

  // 10 tints: 10% to 100% white
  const tints = useMemo(() => {
    if (!rgb) return [];
    return Array.from({ length: 10 }, (_, i) => {
      const amount = (i + 1) / 10;
      return { pct: (i + 1) * 10, hex: mixWithWhite(rgb, amount) };
    });
  }, [rgb]);

  // 10 shades: 10% to 100% black
  const shades = useMemo(() => {
    if (!rgb) return [];
    return Array.from({ length: 10 }, (_, i) => {
      const amount = (i + 1) / 10;
      return { pct: (i + 1) * 10, hex: mixWithBlack(rgb, amount) };
    });
  }, [rgb]);

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      setHexInput(v);
      if (isValidHex(v)) setHex(v);
    },
    []
  );

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHex(e.target.value);
      setHexInput(e.target.value);
    },
    []
  );

  // CSS custom properties export
  const cssExport = useMemo(() => {
    if (!valid) return "";
    const lines: string[] = [":root {", `  --color-base: ${hex};`];
    tints.forEach(({ pct, hex: h }) => {
      lines.push(`  --color-tint-${pct}: ${h};`);
    });
    shades.forEach(({ pct, hex: h }) => {
      lines.push(`  --color-shade-${pct}: ${h};`);
    });
    lines.push("}");
    return lines.join("\n");
  }, [hex, tints, shades, valid]);

  // Tailwind JSON export — maps to 50-900 scale
  // tints 10%-90% → 50,100,200,300,400; base → 500; shades 10%-90% → 600,700,800,900
  const tailwindExport = useMemo(() => {
    if (!valid || tints.length === 0 || shades.length === 0) return "";
    const palette: Record<string, string> = {
      "50": tints[8].hex,   // 90% tint (near white)
      "100": tints[7].hex,  // 80% tint
      "200": tints[5].hex,  // 60% tint
      "300": tints[3].hex,  // 40% tint
      "400": tints[1].hex,  // 20% tint
      "500": hex,           // base
      "600": shades[1].hex, // 20% shade
      "700": shades[3].hex, // 40% shade
      "800": shades[5].hex, // 60% shade
      "900": shades[7].hex, // 80% shade
    };
    const inner = TAILWIND_STEPS.map(
      (step) => `    ${step}: "${palette[step]}"`
    ).join(",\n");
    return `colors: {\n  primary: {\n${inner}\n  }\n}`;
  }, [hex, tints, shades, valid]);

  const exportContent = activeTab === "css" ? cssExport : tailwindExport;

  return (
    <div className="space-y-8">
      {/* Input row */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">Base Color</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={valid ? hex : "#000000"}
            onChange={handleColorPickerChange}
            className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
            aria-label="Color picker"
          />
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            maxLength={7}
            placeholder="#7c5cfc"
            className={`w-32 px-3 py-2.5 text-sm font-mono bg-background border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors ${
              isValidHex(hexInput) ? "border-border" : "border-red-400"
            }`}
            aria-label="Hex color value"
          />
          {valid && (
            <div
              className="flex-1 h-12 rounded-lg border border-border transition-colors duration-200"
              style={{ backgroundColor: hex }}
            />
          )}
        </div>
      </div>

      {/* Tints strip */}
      {valid && tints.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">
            Tints — mixed toward white
          </h3>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tints.map(({ pct, hex: h }) => (
              <button
                key={pct}
                onClick={() => copyText(h, `tint-${pct}`)}
                title={`Copy ${h}`}
                className="flex flex-col items-center gap-1.5 group shrink-0"
                aria-label={`Copy tint ${pct}% hex ${h}`}
              >
                <div
                  className="w-16 h-16 rounded-lg border border-border/50 transition-transform group-hover:scale-105 group-hover:shadow-md"
                  style={{ backgroundColor: h }}
                />
                <span
                  className="text-[10px] font-mono leading-none"
                  style={{ color: "#6b7280" }}
                >
                  {copied === `tint-${pct}` ? "Copied!" : h}
                </span>
                <span className="text-[10px] text-muted leading-none">
                  {pct}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shades strip */}
      {valid && shades.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">
            Shades — mixed toward black
          </h3>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {shades.map(({ pct, hex: h }) => (
              <button
                key={pct}
                onClick={() => copyText(h, `shade-${pct}`)}
                title={`Copy ${h}`}
                className="flex flex-col items-center gap-1.5 group shrink-0"
                aria-label={`Copy shade ${pct}% hex ${h}`}
              >
                <div
                  className="w-16 h-16 rounded-lg border border-border/50 transition-transform group-hover:scale-105 group-hover:shadow-md"
                  style={{ backgroundColor: h }}
                />
                <span
                  className="text-[10px] font-mono leading-none"
                  style={{ color: "#6b7280" }}
                >
                  {copied === `shade-${pct}` ? "Copied!" : h}
                </span>
                <span className="text-[10px] text-muted leading-none">
                  {pct}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Export panel */}
      {valid && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {(["css", "tailwind"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-foreground border-b-2 border-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab === "css" ? "CSS Custom Properties" : "Tailwind Colors"}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative p-4">
            <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-72 leading-relaxed whitespace-pre">
              {exportContent}
            </pre>
            <button
              onClick={() => copyText(exportContent, "export")}
              className="absolute top-7 right-7 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied === "export" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Color Shade Picker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate 10-step tint and shade scale for any color. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Color Shade Picker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate 10-step tint and shade scale for any color. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
