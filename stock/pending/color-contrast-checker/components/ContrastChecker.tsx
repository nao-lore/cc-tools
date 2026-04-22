"use client";

import { useState, useCallback, useMemo } from "react";

// --- WCAG luminance helpers ---

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 3 && clean.length !== 6) return null;
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatRatio(ratio: number): string {
  return ratio.toFixed(2) + ":1";
}

// --- WCAG pass/fail ---

interface WcagResults {
  normalAA: boolean;   // 4.5:1
  normalAAA: boolean;  // 7:1
  largeAA: boolean;    // 3:1
  largeAAA: boolean;   // 4.5:1
  uiAA: boolean;       // 3:1
}

function getWcagResults(ratio: number): WcagResults {
  return {
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
    uiAA: ratio >= 3,
  };
}

// --- Color picker with hex input ---

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const normalized = raw.startsWith("#") ? raw : "#" + raw;
    if (hexToRgb(normalized)) {
      onChange(normalized);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexInput(hex);
    onChange(hex);
  };

  // Sync hex input display when value changes externally (swap)
  const displayHex = hexInput.replace("#", "").toUpperCase() === value.replace("#", "").toUpperCase()
    ? hexInput
    : value;

  return (
    <div className="flex-1 space-y-2">
      <label className="text-sm font-medium text-muted">{label}</label>
      <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
        <div className="relative shrink-0">
          <div
            className="w-12 h-12 rounded-lg border border-border overflow-hidden cursor-pointer"
            style={{ backgroundColor: value }}
          >
            <input
              type="color"
              value={value}
              onChange={handlePickerChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label={`${label} color picker`}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 gap-1">
            <span className="text-muted text-sm font-mono">#</span>
            <input
              type="text"
              value={displayHex.replace("#", "")}
              onChange={(e) => handleHexChange("#" + e.target.value)}
              maxLength={6}
              className="flex-1 bg-transparent text-foreground text-sm font-mono uppercase focus:outline-none"
              aria-label={`${label} hex input`}
              placeholder="000000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Pass/Fail badge ---

function Badge({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        pass
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {pass ? (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      {pass ? "Pass" : "Fail"}
    </span>
  );
}

// --- Main component ---

const DEFAULT_FG = "#1a1a2e";
const DEFAULT_BG = "#ffffff";

export default function ContrastChecker() {
  const [fg, setFg] = useState(DEFAULT_FG);
  const [bg, setBg] = useState(DEFAULT_BG);

  const ratio = useMemo(() => {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;
    const l1 = relativeLuminance(fgRgb);
    const l2 = relativeLuminance(bgRgb);
    return contrastRatio(l1, l2);
  }, [fg, bg]);

  const wcag = useMemo(() => (ratio !== null ? getWcagResults(ratio) : null), [ratio]);

  const swapColors = useCallback(() => {
    setFg(bg);
    setBg(fg);
  }, [fg, bg]);

  const ratingLabel = useMemo(() => {
    if (ratio === null) return { text: "Invalid", color: "text-muted" };
    if (ratio >= 7) return { text: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (ratio >= 4.5) return { text: "Good", color: "text-green-600 dark:text-green-400" };
    if (ratio >= 3) return { text: "Marginal", color: "text-yellow-600 dark:text-yellow-400" };
    return { text: "Poor", color: "text-red-600 dark:text-red-400" };
  }, [ratio]);

  const wcagRows = wcag
    ? [
        { label: "Normal Text", level: "AA", pass: wcag.normalAA, req: "4.5:1" },
        { label: "Normal Text", level: "AAA", pass: wcag.normalAAA, req: "7:1" },
        { label: "Large Text", level: "AA", pass: wcag.largeAA, req: "3:1" },
        { label: "Large Text", level: "AAA", pass: wcag.largeAAA, req: "4.5:1" },
        { label: "UI Components", level: "AA", pass: wcag.uiAA, req: "3:1" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Color pickers */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <ColorInput label="Foreground (Text)" value={fg} onChange={setFg} />

        {/* Swap button */}
        <button
          onClick={swapColors}
          className="shrink-0 p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-foreground transition-colors self-center sm:self-end mb-0 sm:mb-3"
          aria-label="Swap colors"
          title="Swap foreground and background"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <ColorInput label="Background" value={bg} onChange={setBg} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contrast ratio + WCAG table */}
        <div className="space-y-4">
          {/* Ratio display */}
          <div className="bg-surface rounded-2xl border border-border p-6 text-center">
            <p className="text-sm font-medium text-muted mb-1">Contrast Ratio</p>
            <p className="text-6xl font-bold text-foreground tabular-nums leading-none mb-2">
              {ratio !== null ? ratio.toFixed(2) : "—"}
            </p>
            <p className="text-sm font-mono text-muted mb-3">
              {ratio !== null ? formatRatio(ratio) : ""}
            </p>
            <span className={`text-sm font-semibold ${ratingLabel.color}`}>
              {ratingLabel.text}
            </span>
          </div>

          {/* WCAG table */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">WCAG 2.1 Compliance</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted">Category</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-muted">Level</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-muted">Required</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-muted">Result</th>
                </tr>
              </thead>
              <tbody>
                {wcagRows.map((row, i) => (
                  <tr key={i} className={i < wcagRows.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-semibold text-accent">{row.level}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-muted">{row.req}</td>
                    <td className="px-4 py-3 text-center">
                      {wcag ? <Badge pass={row.pass} /> : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-4">
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Live Preview</h3>
            </div>
            <div
              className="p-6 space-y-4"
              style={{ backgroundColor: bg }}
            >
              {/* Normal text */}
              <div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: fg }}
                >
                  Normal text — The quick brown fox jumps over the lazy dog.
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: fg }}
                >
                  Small text — Pack my box with five dozen liquor jugs.
                </p>
              </div>

              {/* Large text */}
              <div>
                <p
                  className="text-2xl font-semibold"
                  style={{ color: fg }}
                >
                  Large Text Heading
                </p>
              </div>

              {/* UI elements */}
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                  style={{ color: fg, borderColor: fg }}
                >
                  Button
                </button>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ color: fg, borderColor: fg }}
                >
                  Badge
                </span>
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-mono border"
                  style={{ color: fg, borderColor: fg }}
                >
                  Code
                </span>
              </div>

              {/* Link */}
              <p className="text-sm" style={{ color: fg }}>
                Sample{" "}
                <span
                  className="underline font-medium"
                  style={{ color: fg }}
                >
                  hyperlink text
                </span>{" "}
                within a paragraph.
              </p>
            </div>
          </div>

          {/* Color info */}
          <div className="bg-surface rounded-2xl border border-border p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted mb-1">Foreground</p>
              <p className="font-mono text-foreground font-medium">{fg.toUpperCase()}</p>
              {hexToRgb(fg) && (
                <p className="text-xs text-muted font-mono mt-0.5">
                  rgb({hexToRgb(fg)!.join(", ")})
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Background</p>
              <p className="font-mono text-foreground font-medium">{bg.toUpperCase()}</p>
              {hexToRgb(bg) && (
                <p className="text-xs text-muted font-mono mt-0.5">
                  rgb({hexToRgb(bg)!.join(", ")})
                </p>
              )}
            </div>
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
