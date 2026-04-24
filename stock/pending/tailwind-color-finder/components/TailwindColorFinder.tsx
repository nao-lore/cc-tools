"use client";

import { useState, useMemo, useCallback } from "react";
import { TAILWIND_COLORS, TAILWIND_PALETTE, type TailwindColor } from "../lib/tailwind-colors";

// --- Color math ---

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 3) return null;
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB -> linear
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  // linear RGB -> XYZ (D65)
  const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const Z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

  // XYZ -> Lab
  const xn = 0.95047,
    yn = 1.0,
    zn = 1.08883;
  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

  const fx = f(X / xn);
  const fy = f(Y / yn);
  const fz = f(Z / zn);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;
  const [l1, a1, b1] = rgbToLab(...rgb1);
  const [l2, a2, b2] = rgbToLab(...rgb2);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

// --- Helpers ---

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const [r, g, b] = rgb;
  return 0.299 * r + 0.587 * g + 0.114 * b > 128;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// --- Sub-components ---

interface MatchCardProps {
  rank: number;
  color: TailwindColor;
  distance: number;
  copied: boolean;
  onCopy: (text: string) => void;
}

function MatchCard({ rank, color, distance, copied, onCopy }: MatchCardProps) {
  const textColor = isLight(color.hex) ? "#111827" : "#f9fafb";
  const className = `bg-${color.class}`;

  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
      <span className="text-xs font-mono text-muted w-4 shrink-0">{rank}</span>

      {/* Swatch */}
      <div
        className="w-10 h-10 rounded-lg shrink-0 border border-border/50"
        style={{ backgroundColor: color.hex }}
        title={color.hex}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground font-mono truncate">
          {color.class}
        </p>
        <p className="text-xs text-muted font-mono">{color.hex.toUpperCase()}</p>
      </div>

      {/* Distance */}
      <div className="text-right shrink-0">
        <p className="text-xs text-muted">ΔE</p>
        <p className="text-sm font-mono text-foreground">{distance.toFixed(1)}</p>
      </div>

      {/* Copy button */}
      <button
        onClick={() => onCopy(color.class)}
        className="shrink-0 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-xs font-mono text-muted hover:text-foreground transition-colors"
        title={`Copy ${color.class}`}
      >
        {copied ? "✓" : "copy"}
      </button>

      {/* Tailwind class usage badge */}
      <div
        className="hidden sm:flex shrink-0 items-center px-2 py-1 rounded-md text-xs font-mono"
        style={{ backgroundColor: color.hex, color: textColor }}
      >
        {className}
      </div>
    </div>
  );
}

// --- Main component ---

const DEFAULT_HEX = "#3b82f6";

export default function TailwindColorFinder() {
  const [hex, setHex] = useState(DEFAULT_HEX);
  const [hexInput, setHexInput] = useState(DEFAULT_HEX.replace("#", ""));
  const [copied, setCopied] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const validHex = useMemo(() => {
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    return hexToRgb(normalized) ? normalized : null;
  }, [hex]);

  const topMatches = useMemo(() => {
    if (!validHex) return [];
    return TAILWIND_COLORS.map((c) => ({
      color: c,
      distance: deltaE(validHex, c.hex),
    }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [validHex]);

  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setHex(v);
      setHexInput(v.replace("#", ""));
    },
    []
  );

  const handleHexInput = useCallback(
    (raw: string) => {
      setHexInput(raw);
      const normalized = `#${raw}`;
      if (hexToRgb(normalized)) {
        setHex(normalized);
      }
    },
    []
  );

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const filteredPalette = useMemo(() => {
    if (!searchQuery.trim()) return TAILWIND_PALETTE;
    const q = searchQuery.toLowerCase();
    return TAILWIND_PALETTE.filter((group) =>
      group.name.includes(q) ||
      group.shades.some((s) => s.hex.toLowerCase().includes(q) || s.class.includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Input section */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Pick a color
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Color picker */}
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl border-2 border-border overflow-hidden cursor-pointer shadow-sm"
              style={{ backgroundColor: validHex ?? "#ffffff" }}
            >
              <input
                type="color"
                value={validHex ?? "#ffffff"}
                onChange={handlePickerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Color picker"
              />
            </div>
          </div>

          {/* Hex input */}
          <div className="flex-1 w-full">
            <label className="text-xs font-medium text-muted block mb-1.5">Hex value</label>
            <div className="flex items-center bg-background border border-border rounded-xl px-4 py-3 gap-2 focus-within:border-accent transition-colors">
              <span className="text-muted font-mono text-lg">#</span>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
                maxLength={6}
                placeholder="3b82f6"
                className="flex-1 bg-transparent text-foreground text-lg font-mono uppercase focus:outline-none"
                aria-label="Hex color input"
                spellCheck={false}
              />
              {validHex && (
                <span className="text-xs font-mono text-muted">
                  rgb({hexToRgb(validHex)!.join(", ")})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 matches */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Top 5 closest Tailwind classes
        </h2>

        {validHex ? (
          <div className="space-y-2">
            {topMatches.map(({ color, distance }, i) => (
              <MatchCard
                key={color.class}
                rank={i + 1}
                color={color}
                distance={distance}
                copied={copied === color.class}
                onCopy={handleCopy}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-6 text-center text-muted text-sm">
            Enter a valid 6-digit hex color above
          </div>
        )}
      </div>

      {/* Delta-E legend */}
      <div className="bg-surface border border-border rounded-xl p-4 text-sm text-muted space-y-1">
        <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-2">
          ΔE distance guide (CIE76)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { range: "0–1", label: "Imperceptible" },
            { range: "1–2", label: "Very close" },
            { range: "2–10", label: "Visible" },
            { range: ">10", label: "Different" },
          ].map(({ range, label }) => (
            <div key={range} className="bg-background rounded-lg px-3 py-2">
              <span className="text-accent">{range}</span>{" "}
              <span className="text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>

      {/* Full palette browser */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Full palette browser</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search colors..."
            className="bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors w-full sm:w-48"
          />
        </div>

        <div className="space-y-4">
          {filteredPalette.map((group) => (
            <div key={group.name}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 capitalize">
                {group.name}
              </p>
              <div className="flex gap-1 flex-wrap">
                {group.shades.map((shade) => {
                  const textCol = isLight(shade.hex) ? "#111827" : "#f9fafb";
                  const isClosest =
                    validHex && topMatches.length > 0 && topMatches[0].color.class === shade.class;
                  return (
                    <button
                      key={shade.class}
                      onClick={() => {
                        setHex(shade.hex);
                        setHexInput(shade.hex.replace("#", ""));
                      }}
                      title={`${shade.class} — ${shade.hex}`}
                      className={`relative group w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 ${
                        isClosest ? "border-foreground ring-2 ring-accent ring-offset-1" : "border-transparent hover:border-border"
                      }`}
                      style={{ backgroundColor: shade.hex }}
                      aria-label={shade.class}
                    >
                      {/* Tooltip */}
                      <span
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg"
                        style={{ backgroundColor: shade.hex, color: textCol, border: "1px solid rgba(0,0,0,0.1)" }}
                      >
                        {shade.class}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Tailwind Color Finder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Find the closest Tailwind CSS color class to any hex value. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Tailwind Color Finder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Find the closest Tailwind CSS color class to any hex value. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Tailwind Color Finder",
  "description": "Find the closest Tailwind CSS color class to any hex value",
  "url": "https://tools.loresync.dev/tailwind-color-finder",
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
