"use client";

import { useState, useCallback, useEffect } from "react";

// ── Color conversion utils ────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

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
        clamp(Math.round(v), 0, 255)
          .toString(16)
          .padStart(2, "0")
      )
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
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) =>
    Math.round(
      (ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255
    );
  return [f(0), f(8), f(4)];
}

// HSV helpers
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function getLuminance(r: number, g: number, b: number): number {
  const [rn, gn, bn] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rn + 0.7152 * gn + 0.0722 * bn;
}

function getTextColor(r: number, g: number, b: number): string {
  return getLuminance(r, g, b) > 0.3 ? "#1a1a1a" : "#ffffff";
}

function alphaToHex(a: number): string {
  return Math.round(clamp(a, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
}

// ── CSS Named Colors (basic set) ──────────────────────────────────────────────

const CSS_NAMED: [string, string][] = [
  ["red", "#ff0000"], ["green", "#008000"], ["blue", "#0000ff"],
  ["white", "#ffffff"], ["black", "#000000"], ["yellow", "#ffff00"],
  ["cyan", "#00ffff"], ["magenta", "#ff00ff"], ["orange", "#ffa500"],
  ["purple", "#800080"], ["pink", "#ffc0cb"], ["brown", "#a52a2a"],
  ["gray", "#808080"], ["lime", "#00ff00"], ["navy", "#000080"],
  ["teal", "#008080"], ["maroon", "#800000"], ["olive", "#808000"],
  ["silver", "#c0c0c0"], ["coral", "#ff7f50"], ["salmon", "#fa8072"],
  ["gold", "#ffd700"], ["indigo", "#4b0082"], ["violet", "#ee82ee"],
  ["crimson", "#dc143c"], ["turquoise", "#40e0d0"], ["chocolate", "#d2691e"],
  ["tomato", "#ff6347"], ["orchid", "#da70d6"], ["plum", "#dda0dd"],
];

function nearestCssNamed(r: number, g: number, b: number): string {
  let best = "";
  let bestDist = Infinity;
  for (const [name, hex] of CSS_NAMED) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    const d =
      (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorState {
  hex: string;         // #rrggbb
  r: number;
  g: number;
  b: number;
  h: number;           // 0-360
  sl: number;          // HSL saturation 0-100
  l: number;           // 0-100
  sv: number;          // HSV saturation 0-100
  v: number;           // HSV value 0-100
  alpha: number;       // 0-1
}

function colorFromRgb(r: number, g: number, b: number, alpha: number): ColorState {
  const hex = rgbToHex(r, g, b);
  const [h, sl, l] = rgbToHsl(r, g, b);
  const [, sv, v] = rgbToHsv(r, g, b);
  return { hex, r, g, b, h, sl, l, sv, v, alpha };
}

const INITIAL_HEX = "#7c5cfc";
const INITIAL_RGB = hexToRgb(INITIAL_HEX)!;

// ── Component ─────────────────────────────────────────────────────────────────

export default function HtmlColorPicker() {
  const [color, setColor] = useState<ColorState>(() =>
    colorFromRgb(INITIAL_RGB[0], INITIAL_RGB[1], INITIAL_RGB[2], 1)
  );

  // Text input states (may be mid-edit / invalid)
  const [hexInput, setHexInput] = useState(INITIAL_HEX);
  const [rgbInput, setRgbInput] = useState(`${INITIAL_RGB[0]}, ${INITIAL_RGB[1]}, ${INITIAL_RGB[2]}`);
  const [hslInput, setHslInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Sync derived text inputs when color changes (except when they are driving the update)
  useEffect(() => {
    setHexInput(color.hex);
    setRgbInput(`${color.r}, ${color.g}, ${color.b}`);
    setHslInput(`${color.h}, ${color.sl}%, ${color.l}%`);
  }, [color]);

  const applyRgb = useCallback(
    (r: number, g: number, b: number, alpha?: number) => {
      setColor(colorFromRgb(r, g, b, alpha ?? color.alpha));
    },
    [color.alpha]
  );

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // ── Native color input ─────────────────────────────────────────────────────

  const handleNativeColor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (!isValidHex(v)) return;
      const [r, g, b] = hexToRgb(v)!;
      applyRgb(r, g, b);
    },
    [applyRgb]
  );

  // ── Slider handlers ────────────────────────────────────────────────────────

  const handleHSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = Number(e.target.value);
      const [r, g, b] = hslToRgb(h, color.sl, color.l);
      setColor(colorFromRgb(r, g, b, color.alpha));
    },
    [color.sl, color.l, color.alpha]
  );

  const handleSLSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sl = Number(e.target.value);
      const [r, g, b] = hslToRgb(color.h, sl, color.l);
      setColor(colorFromRgb(r, g, b, color.alpha));
    },
    [color.h, color.l, color.alpha]
  );

  const handleLSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const l = Number(e.target.value);
      const [r, g, b] = hslToRgb(color.h, color.sl, l);
      setColor(colorFromRgb(r, g, b, color.alpha));
    },
    [color.h, color.sl, color.alpha]
  );

  const handleAlphaSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const alpha = Number(e.target.value);
      setColor((prev) => ({ ...prev, alpha }));
    },
    []
  );

  // ── Text input handlers ────────────────────────────────────────────────────

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.trim();
      if (!v.startsWith("#")) v = "#" + v;
      setHexInput(v);
      if (isValidHex(v)) {
        const [r, g, b] = hexToRgb(v)!;
        applyRgb(r, g, b);
      }
    },
    [applyRgb]
  );

  const handleRgbInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setRgbInput(v);
      const parts = v.split(",").map((s) => parseInt(s.trim()));
      if (parts.length === 3 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
        applyRgb(parts[0], parts[1], parts[2]);
      }
    },
    [applyRgb]
  );

  const handleHslInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setHslInput(v);
      // Accept "h, s%, l%" or "h, s, l"
      const parts = v.split(",").map((s) => parseFloat(s.replace("%", "").trim()));
      if (
        parts.length === 3 &&
        parts.every((n) => !isNaN(n)) &&
        parts[0] >= 0 && parts[0] <= 360 &&
        parts[1] >= 0 && parts[1] <= 100 &&
        parts[2] >= 0 && parts[2] <= 100
      ) {
        const [r, g, b] = hslToRgb(parts[0], parts[1], parts[2]);
        applyRgb(r, g, b);
      }
    },
    [applyRgb]
  );

  // ── Derived output strings ─────────────────────────────────────────────────

  const { r, g, b, h, sl, l, sv, v, alpha, hex } = color;
  const aHex = alphaToHex(alpha);
  const hexFull = hex;
  const hexAlpha = `${hex}${aHex}`;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const rgbaStr = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  const hslStr = `hsl(${h}, ${sl}%, ${l}%)`;
  const hslaStr = `hsla(${h}, ${sl}%, ${l}%, ${alpha.toFixed(2)})`;
  const hsvStr = `hsv(${h}, ${sv}%, ${v}%)`;
  const cssNamed = nearestCssNamed(r, g, b);
  const textColor = getTextColor(r, g, b);

  // Checkerboard for alpha preview
  const checkerStyle: React.CSSProperties = {
    backgroundImage:
      "linear-gradient(45deg, #ccc 25%, transparent 25%), " +
      "linear-gradient(-45deg, #ccc 25%, transparent 25%), " +
      "linear-gradient(45deg, transparent 75%, #ccc 75%), " +
      "linear-gradient(-45deg, transparent 75%, #ccc 75%)",
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
  };

  const formats: { label: string; value: string }[] = [
    { label: "HEX", value: hexFull },
    { label: "HEX+A", value: hexAlpha },
    { label: "rgb()", value: rgbStr },
    { label: "rgba()", value: rgbaStr },
    { label: "hsl()", value: hslStr },
    { label: "hsla()", value: hslaStr },
    { label: "hsv()", value: hsvStr },
    { label: "CSS name", value: cssNamed },
  ];

  // Hue gradient for H slider track
  const hueGradient =
    "linear-gradient(to right, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))";

  return (
    <div className="space-y-6">
      {/* Color preview swatch */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Color Preview</h3>
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border">
          {/* Checkerboard under swatch for alpha visibility */}
          <div className="absolute inset-0" style={checkerStyle} />
          <div
            className="absolute inset-0 transition-colors duration-100"
            style={{ backgroundColor: `rgba(${r},${g},${b},${alpha})` }}
          />
          {/* Hex overlay text */}
          <div
            className="absolute inset-0 flex items-center justify-center font-mono text-xl font-bold tracking-widest select-none pointer-events-none"
            style={{ color: textColor, opacity: alpha < 0.2 ? 0 : 1 }}
          >
            {hexFull.toUpperCase()}
          </div>
        </div>

        {/* Native color input */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted shrink-0">Pick:</label>
          <input
            type="color"
            value={hex}
            onChange={handleNativeColor}
            className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
            aria-label="Native color picker"
          />
          <span className="text-xs text-muted font-mono">{hexFull}</span>
        </div>
      </div>

      {/* HSL + Alpha sliders */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-5">
        <h3 className="text-sm font-medium text-muted">HSL / Alpha Sliders</h3>

        {/* Hue */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>Hue</span>
            <span className="font-mono">{h}°</span>
          </div>
          <div
            className="relative h-4 rounded-full border border-border overflow-hidden"
            style={{ background: hueGradient }}
          >
            <input
              type="range"
              min={0}
              max={360}
              value={h}
              onChange={handleHSlider}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Hue"
            />
            <div
              className="absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-white border-2 border-gray-700 rounded-full pointer-events-none shadow"
              style={{ left: `${(h / 360) * 100}%` }}
            />
          </div>
        </div>

        {/* Saturation (HSL) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>Saturation</span>
            <span className="font-mono">{sl}%</span>
          </div>
          <div
            className="relative h-4 rounded-full border border-border overflow-hidden"
            style={{
              background: `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`,
            }}
          >
            <input
              type="range"
              min={0}
              max={100}
              value={sl}
              onChange={handleSLSlider}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Saturation"
            />
            <div
              className="absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-white border-2 border-gray-700 rounded-full pointer-events-none shadow"
              style={{ left: `${sl}%` }}
            />
          </div>
        </div>

        {/* Lightness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>Lightness</span>
            <span className="font-mono">{l}%</span>
          </div>
          <div
            className="relative h-4 rounded-full border border-border overflow-hidden"
            style={{
              background: `linear-gradient(to right, hsl(${h},${sl}%,0%), hsl(${h},${sl}%,50%), hsl(${h},${sl}%,100%))`,
            }}
          >
            <input
              type="range"
              min={0}
              max={100}
              value={l}
              onChange={handleLSlider}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Lightness"
            />
            <div
              className="absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-white border-2 border-gray-700 rounded-full pointer-events-none shadow"
              style={{ left: `${l}%` }}
            />
          </div>
        </div>

        {/* Alpha */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>Alpha</span>
            <span className="font-mono">{alpha.toFixed(2)}</span>
          </div>
          <div className="relative h-4 rounded-full border border-border overflow-hidden">
            <div className="absolute inset-0" style={checkerStyle} />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
              }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={alpha}
              onChange={handleAlphaSlider}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Alpha"
            />
            <div
              className="absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-white border-2 border-gray-700 rounded-full pointer-events-none shadow"
              style={{ left: `${alpha * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Manual text inputs */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-medium text-muted">Manual Input</h3>

        {/* HEX */}
        <div>
          <label className="block text-xs text-muted mb-1">HEX</label>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInput}
            maxLength={7}
            placeholder="#7c5cfc"
            className={`w-44 px-3 py-2 text-sm font-mono bg-background border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors ${
              isValidHex(hexInput) ? "border-border" : "border-red-400"
            }`}
            aria-label="Hex color input"
          />
        </div>

        {/* RGB */}
        <div>
          <label className="block text-xs text-muted mb-1">RGB (r, g, b)</label>
          <input
            type="text"
            value={rgbInput}
            onChange={handleRgbInput}
            placeholder="124, 92, 252"
            className="w-44 px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
            aria-label="RGB color input"
          />
        </div>

        {/* HSL */}
        <div>
          <label className="block text-xs text-muted mb-1">HSL (h, s%, l%)</label>
          <input
            type="text"
            value={hslInput}
            onChange={handleHslInput}
            placeholder="255, 96%, 67%"
            className="w-44 px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
            aria-label="HSL color input"
          />
        </div>
      </div>

      {/* Output formats + copy buttons */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Copy Format</h3>
        <div className="space-y-2">
          {formats.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="text-xs text-muted w-16 shrink-0">{label}</span>
              <span className="flex-1 text-sm font-mono text-foreground truncate">
                {value}
              </span>
              <button
                onClick={() => copyText(value, label)}
                className="shrink-0 px-2.5 py-1 text-xs rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
                aria-label={`Copy ${label}`}
              >
                {copied === label ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this HTML Color Code Picker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visual HSL/HSV color picker with all format outputs. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this HTML Color Code Picker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visual HSL/HSV color picker with all format outputs. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HTML Color Code Picker",
  "description": "Visual HSL/HSV color picker with all format outputs",
  "url": "https://tools.loresync.dev/html-color-picker",
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
