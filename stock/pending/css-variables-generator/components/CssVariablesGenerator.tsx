"use client";

import { useState, useCallback, useMemo } from "react";

// ── Color math ────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hn = h / 360;
  const r = Math.round(hue2rgb(p, q, hn + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hn) * 255);
  const b = Math.round(hue2rgb(p, q, hn - 1 / 3) * 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Tailwind-like lightness stops for steps 50–950
const LIGHTNESS_STOPS: Record<number, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.86,
  300: 0.74,
  400: 0.60,
  500: 0.50,
  600: 0.40,
  700: 0.30,
  800: 0.20,
  950: 0.10,
};
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 950];

function generateScale(hex: string): Record<number, string> {
  const rgb = hexToRgb(hex);
  if (!rgb) return {};
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const scale: Record<number, string> = {};
  for (const step of STEPS) {
    scale[step] = hslToHex(h, Math.min(s, 0.9), LIGHTNESS_STOPS[step]);
  }
  return scale;
}

function hexToRgbStr(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "0 0 0";
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

// ── CSS generation ─────────────────────────────────────────────────────────────

interface ThemeTokens {
  scale: Record<number, string>;
  semantic: {
    primary: string;
    primaryFg: string;
    secondary: string;
    secondaryFg: string;
    accent: string;
    accentFg: string;
    surface: string;
    surfaceFg: string;
    text: string;
    textMuted: string;
    border: string;
  };
  darkSemantic: {
    primary: string;
    primaryFg: string;
    secondary: string;
    secondaryFg: string;
    accent: string;
    accentFg: string;
    surface: string;
    surfaceFg: string;
    text: string;
    textMuted: string;
    border: string;
  };
}

function buildTokens(hex: string): ThemeTokens {
  const scale = generateScale(hex);
  return {
    scale,
    semantic: {
      primary: scale[500] ?? hex,
      primaryFg: scale[50] ?? "#ffffff",
      secondary: scale[100] ?? hex,
      secondaryFg: scale[700] ?? "#000000",
      accent: scale[400] ?? hex,
      accentFg: scale[50] ?? "#ffffff",
      surface: scale[50] ?? "#f9fafb",
      surfaceFg: scale[900] ?? "#111827",
      text: scale[900] ?? "#111827",
      textMuted: scale[500] ?? "#6b7280",
      border: scale[200] ?? "#e5e7eb",
    },
    darkSemantic: {
      primary: scale[400] ?? hex,
      primaryFg: scale[950] ?? "#030712",
      secondary: scale[800] ?? hex,
      secondaryFg: scale[200] ?? "#e5e7eb",
      accent: scale[300] ?? hex,
      accentFg: scale[950] ?? "#030712",
      surface: scale[950] ?? "#030712",
      surfaceFg: scale[100] ?? "#f3f4f6",
      text: scale[100] ?? "#f3f4f6",
      textMuted: scale[400] ?? "#9ca3af",
      border: scale[800] ?? "#1f2937",
    },
  };
}

function generateCSS(tokens: ThemeTokens): string {
  const { scale, semantic, darkSemantic } = tokens;

  const lines: string[] = [":root {", "  /* Tint/Shade Scale */"];
  for (const step of STEPS) {
    lines.push(`  --color-${step}: ${scale[step] ?? ""};`);
  }
  lines.push("");
  lines.push("  /* Semantic Tokens — Light Mode */");
  lines.push(`  --color-primary: ${semantic.primary};`);
  lines.push(`  --color-primary-fg: ${semantic.primaryFg};`);
  lines.push(`  --color-secondary: ${semantic.secondary};`);
  lines.push(`  --color-secondary-fg: ${semantic.secondaryFg};`);
  lines.push(`  --color-accent: ${semantic.accent};`);
  lines.push(`  --color-accent-fg: ${semantic.accentFg};`);
  lines.push(`  --color-surface: ${semantic.surface};`);
  lines.push(`  --color-surface-fg: ${semantic.surfaceFg};`);
  lines.push(`  --color-text: ${semantic.text};`);
  lines.push(`  --color-text-muted: ${semantic.textMuted};`);
  lines.push(`  --color-border: ${semantic.border};`);
  lines.push("}");
  lines.push("");
  lines.push("@media (prefers-color-scheme: dark) {");
  lines.push("  :root {");
  lines.push("    /* Semantic Tokens — Dark Mode Overrides */");
  lines.push(`    --color-primary: ${darkSemantic.primary};`);
  lines.push(`    --color-primary-fg: ${darkSemantic.primaryFg};`);
  lines.push(`    --color-secondary: ${darkSemantic.secondary};`);
  lines.push(`    --color-secondary-fg: ${darkSemantic.secondaryFg};`);
  lines.push(`    --color-accent: ${darkSemantic.accent};`);
  lines.push(`    --color-accent-fg: ${darkSemantic.accentFg};`);
  lines.push(`    --color-surface: ${darkSemantic.surface};`);
  lines.push(`    --color-surface-fg: ${darkSemantic.surfaceFg};`);
  lines.push(`    --color-text: ${darkSemantic.text};`);
  lines.push(`    --color-text-muted: ${darkSemantic.textMuted};`);
  lines.push(`    --color-border: ${darkSemantic.border};`);
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

// ── Component ──────────────────────────────────────────────────────────────────

const DEFAULT_HEX = "#6366f1";

export default function CssVariablesGenerator() {
  const [brandHex, setBrandHex] = useState(DEFAULT_HEX);
  const [hexInput, setHexInput] = useState(DEFAULT_HEX);
  const [darkPreview, setDarkPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const tokens = useMemo(() => buildTokens(brandHex), [brandHex]);
  const cssOutput = useMemo(() => generateCSS(tokens), [tokens]);

  const sem = darkPreview ? tokens.darkSemantic : tokens.semantic;

  const applyHex = useCallback((raw: string) => {
    const val = raw.startsWith("#") ? raw : `#${raw}`;
    setBrandHex(val);
    setHexInput(val);
  }, []);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setHexInput(val);
      const normalized = val.startsWith("#") ? val : `#${val}`;
      if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
        setBrandHex(normalized);
      }
    },
    []
  );

  const handleColorPicker = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyHex(e.target.value);
    },
    [applyHex]
  );

  const copyCSS = useCallback(async () => {
    await navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssOutput]);

  const PRESETS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9"];

  return (
    <div className="space-y-8">
      {/* Color picker row */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-medium text-muted">Brand Color</h3>
        <div className="flex flex-wrap items-center gap-4">
          <label className="relative cursor-pointer">
            <span
              className="block w-12 h-12 rounded-xl border border-border shadow-sm"
              style={{ backgroundColor: brandHex }}
            />
            <input
              type="color"
              value={brandHex}
              onChange={handleColorPicker}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="Pick brand color"
            />
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted font-mono">#</span>
            <input
              type="text"
              value={hexInput.replace("#", "")}
              onChange={handleHexChange}
              maxLength={6}
              placeholder="6366f1"
              className="w-28 px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              aria-label="Hex color value"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => applyHex(p)}
                title={p}
                className={`w-7 h-7 rounded-lg border-2 transition-all ${
                  brandHex.toLowerCase() === p.toLowerCase()
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: p }}
                aria-label={`Use ${p}`}
              />
            ))}
          </div>
        </div>

        {/* Scale swatches */}
        <div className="space-y-2">
          <p className="text-xs text-muted font-medium">Scale (50–950)</p>
          <div className="flex gap-1 flex-wrap">
            {STEPS.map((step) => {
              const color = tokens.scale[step] ?? "#000";
              return (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-black/10"
                    style={{ backgroundColor: color }}
                    title={`${step}: ${color}`}
                  />
                  <span className="text-[10px] text-muted tabular-nums">{step}</span>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Variables Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate CSS custom properties theme from a brand color. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Variables Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate CSS custom properties theme from a brand color. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-medium text-muted">Live Preview</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Light</span>
            <button
              role="switch"
              aria-checked={darkPreview}
              onClick={() => setDarkPreview((d) => !d)}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${
                darkPreview ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  darkPreview ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-muted">Dark</span>
          </div>
        </div>

        {/* Sample UI */}
        <div
          className="rounded-xl border p-5 space-y-4 transition-colors"
          style={{
            backgroundColor: sem.surface,
            borderColor: sem.border,
            color: sem.text,
          }}
        >
          {/* Card */}
          <div
            className="rounded-lg border p-4 space-y-3"
            style={{ borderColor: sem.border, backgroundColor: sem.surface }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: sem.primary, color: sem.primaryFg }}
              >
                A
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: sem.text }}>
                  Card Title
                </p>
                <p className="text-xs" style={{ color: sem.textMuted }}>
                  Supporting text goes here
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: sem.text }}>
              This is a sample card showing how your theme looks in practice. The
              colors adapt to your brand automatically.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-4 py-1.5 text-sm font-medium rounded-lg"
                style={{ backgroundColor: sem.primary, color: sem.primaryFg }}
              >
                Primary
              </button>
              <button
                className="px-4 py-1.5 text-sm font-medium rounded-lg border"
                style={{
                  backgroundColor: sem.secondary,
                  color: sem.secondaryFg,
                  borderColor: sem.border,
                }}
              >
                Secondary
              </button>
              <button
                className="px-4 py-1.5 text-sm font-medium rounded-lg"
                style={{ backgroundColor: sem.accent, color: sem.accentFg }}
              >
                Accent
              </button>
            </div>
          </div>

          {/* Badge row */}
          <div className="flex flex-wrap gap-2">
            {["Design", "CSS", "Tokens"].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: sem.secondary, color: sem.secondaryFg }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Input field sample */}
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: sem.border, backgroundColor: sem.surface }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sem.textMuted }}
            />
            <span className="text-sm" style={{ color: sem.textMuted }}>
              Search…
            </span>
          </div>
        </div>
      </div>

      {/* Semantic tokens table */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <h3 className="text-sm font-medium text-muted">Semantic Tokens</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(sem) as [string, string][]).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background"
            >
              <div
                className="w-6 h-6 rounded border border-black/10 shrink-0"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs font-mono text-muted flex-1 truncate">
                --color-{key.replace(/([A-Z])/g, "-$1").toLowerCase()}
              </span>
              <span className="text-xs font-mono text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">CSS Output</h3>
          <button
            onClick={copyCSS}
            className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            {copied ? "Copied!" : "Copy CSS"}
          </button>
        </div>
        <pre className="text-xs font-mono bg-background rounded-lg p-4 overflow-x-auto text-foreground border border-border whitespace-pre leading-relaxed max-h-96">
          {cssOutput}
        </pre>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
