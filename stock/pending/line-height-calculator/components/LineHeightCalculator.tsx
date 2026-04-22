"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---

type LineWidthMode = "chars" | "px";
type FontWeight = "300" | "400" | "500" | "700" | "900";

interface Result {
  unitless: number;
  px: number;
  rem: number;
  em: number;
}

interface Variant {
  label: string;
  value: number;
}

// --- Helpers ---

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate optimal line-height unitless value.
 *
 * Base: 1.5 (widely accepted default)
 * Larger fonts → tighter (display text feels more spaced)
 * Wider measures → slightly tighter (reader doesn't need as much leading)
 * Heavier weights → slightly tighter
 */
function calcLineHeight(
  fontSize: number,
  lineWidthChars: number,
  fontWeight: FontWeight
): number {
  // Start from 1.5 base
  let lh = 1.5;

  // Font size adjustment: scale down for larger fonts (18-72px range)
  // At 10px: +0.1, at 72px: -0.15
  const sizeNorm = (fontSize - 10) / (72 - 10); // 0–1
  lh -= sizeNorm * 0.25;

  // Measure adjustment: wider lines need slightly less leading
  // At 30 chars: +0.05, at 120 chars: -0.05
  const measureNorm = (lineWidthChars - 30) / (120 - 30); // 0–1
  lh -= measureNorm * 0.1;

  // Weight adjustment: heavier weight → slightly tighter
  const weightMap: Record<FontWeight, number> = {
    "300": 0.02,
    "400": 0,
    "500": -0.01,
    "700": -0.03,
    "900": -0.05,
  };
  lh += weightMap[fontWeight];

  return Math.round(clamp(lh, 1.1, 2.2) * 100) / 100;
}

function buildResult(lineHeight: number, fontSize: number): Result {
  const px = Math.round(lineHeight * fontSize * 10) / 10;
  const rem = Math.round((px / 16) * 100) / 100;
  const em = Math.round(lineHeight * 100) / 100; // same as unitless when expressed as em on same element
  return { unitless: lineHeight, px, rem, em };
}

// --- Sub-components ---

interface NumInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
  step?: number;
}

function NumInput({ label, value, min, max, onChange, unit = "px", step = 1 }: NumInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) onChange(clamp(parsed, min, max));
  };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          className="flex-1 bg-transparent text-foreground text-sm font-mono px-3 py-2 focus:outline-none w-20"
        />
        <span className="text-xs text-muted px-2 border-l border-border bg-surface/60 py-2 select-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
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
          {label}
        </>
      )}
    </button>
  );
}

// --- Main component ---

const FONT_WEIGHTS: { label: string; value: FontWeight }[] = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Bold (700)", value: "700" },
  { label: "Black (900)", value: "900" },
];

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. Good typography improves readability and creates a comfortable reading rhythm for the user. Line height directly affects how easy it is to track from one line to the next.";

export default function LineHeightCalculator() {
  const [fontSize, setFontSize] = useState(16);
  const [lineWidthMode, setLineWidthMode] = useState<LineWidthMode>("chars");
  const [lineWidthChars, setLineWidthChars] = useState(66);
  const [lineWidthPx, setLineWidthPx] = useState(680);
  const [fontWeight, setFontWeight] = useState<FontWeight>("400");

  // Derive chars from px for the formula when in px mode
  const effectiveChars = useMemo(() => {
    if (lineWidthMode === "chars") return lineWidthChars;
    // Approximate: average char width ~ fontSize * 0.5
    const approxChars = lineWidthPx / (fontSize * 0.5);
    return clamp(Math.round(approxChars), 30, 120);
  }, [lineWidthMode, lineWidthChars, lineWidthPx, fontSize]);

  const containerWidth = useMemo(() => {
    if (lineWidthMode === "px") return lineWidthPx;
    // approx px from chars
    return Math.round(lineWidthChars * fontSize * 0.5);
  }, [lineWidthMode, lineWidthChars, lineWidthPx, fontSize]);

  const optimal = useMemo(
    () => calcLineHeight(fontSize, effectiveChars, fontWeight),
    [fontSize, effectiveChars, fontWeight]
  );

  const result = useMemo(() => buildResult(optimal, fontSize), [optimal, fontSize]);

  const variants: Variant[] = useMemo(
    () => [
      { label: "Tight", value: Math.round(clamp(optimal - 0.2, 1.1, 1.6) * 100) / 100 },
      { label: "Optimal", value: optimal },
      { label: "Loose", value: Math.round(clamp(optimal + 0.2, 1.4, 2.2) * 100) / 100 },
    ],
    [optimal]
  );

  const cssOutput = useMemo(() => {
    const w = lineWidthMode === "px" ? `${lineWidthPx}px` : `${lineWidthChars}ch`;
    return [
      `/* Optimal line-height for ${fontSize}px / ${fontWeight} weight */`,
      `p {`,
      `  font-size: ${fontSize}px; /* ${(fontSize / 16).toFixed(4).replace(/\.?0+$/, "")}rem */`,
      `  font-weight: ${fontWeight};`,
      `  line-height: ${result.unitless}; /* ${result.px}px | ${result.rem}rem */`,
      `  max-width: ${w};`,
      `}`,
    ].join("\n");
  }, [fontSize, fontWeight, result, lineWidthMode, lineWidthPx, lineWidthChars]);

  const [previewVariant, setPreviewVariant] = useState<number | null>(null);
  const previewLH = previewVariant !== null ? variants[previewVariant].value : optimal;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumInput
            label="Font Size"
            value={fontSize}
            min={10}
            max={72}
            onChange={setFontSize}
            unit="px"
          />

          {/* Line width mode toggle + input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted">Line Width</label>
              <div className="flex rounded-md overflow-hidden border border-border text-xs">
                <button
                  onClick={() => setLineWidthMode("chars")}
                  className={`px-2 py-0.5 transition-colors ${
                    lineWidthMode === "chars"
                      ? "bg-accent text-white"
                      : "bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  ch
                </button>
                <button
                  onClick={() => setLineWidthMode("px")}
                  className={`px-2 py-0.5 transition-colors ${
                    lineWidthMode === "px"
                      ? "bg-accent text-white"
                      : "bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  px
                </button>
              </div>
            </div>
            {lineWidthMode === "chars" ? (
              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={lineWidthChars}
                  min={30}
                  max={120}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setLineWidthChars(clamp(v, 30, 120));
                  }}
                  className="flex-1 bg-transparent text-foreground text-sm font-mono px-3 py-2 focus:outline-none w-20"
                />
                <span className="text-xs text-muted px-2 border-l border-border bg-surface/60 py-2 select-none">
                  ch
                </span>
              </div>
            ) : (
              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={lineWidthPx}
                  min={200}
                  max={1400}
                  step={10}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setLineWidthPx(clamp(v, 200, 1400));
                  }}
                  className="flex-1 bg-transparent text-foreground text-sm font-mono px-3 py-2 focus:outline-none w-20"
                />
                <span className="text-xs text-muted px-2 border-l border-border bg-surface/60 py-2 select-none">
                  px
                </span>
              </div>
            )}
          </div>

          {/* Font weight */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Font Weight</label>
            <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value as FontWeight)}
                className="flex-1 bg-transparent text-foreground text-sm px-3 py-2 focus:outline-none appearance-none cursor-pointer"
              >
                {FONT_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Optimal Line-Height</label>
            <div className="flex items-center gap-2 h-[38px]">
              <span className="text-3xl font-bold text-accent font-mono">{result.unitless}</span>
              <div className="text-xs text-muted leading-tight">
                <div>{result.px}px</div>
                <div>{result.rem}rem</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unitless", value: result.unitless.toString(), note: "recommended" },
          { label: "Pixels", value: `${result.px}px`, note: `at ${fontSize}px` },
          { label: "Rem", value: `${result.rem}rem`, note: "base 16px" },
          { label: "Em", value: `${result.em}em`, note: "relative to font" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1"
          >
            <span className="text-xs text-muted">{card.label}</span>
            <span className="text-xl font-bold font-mono text-foreground">{card.value}</span>
            <span className="text-xs text-muted/70">{card.note}</span>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Live Preview</h3>
          <span className="text-xs text-muted font-mono">line-height: {previewLH}</span>
        </div>
        <div className="p-6 overflow-x-auto">
          <p
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              lineHeight: previewLH,
              maxWidth: `${containerWidth}px`,
            }}
            className="text-foreground"
          >
            {SAMPLE_TEXT}
          </p>
        </div>
      </div>

      {/* Comparison panel */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Comparison</h3>
          <p className="text-xs text-muted mt-0.5">Hover a variant to preview it above</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {variants.map((v, i) => (
            <div
              key={v.label}
              onMouseEnter={() => setPreviewVariant(i)}
              onMouseLeave={() => setPreviewVariant(null)}
              className={`p-4 cursor-default transition-colors ${
                previewVariant === i ? "bg-accent/5" : "hover:bg-surface/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    v.label === "Optimal" ? "text-accent" : "text-muted"
                  }`}
                >
                  {v.label}
                </span>
                <span className="text-sm font-mono font-bold text-foreground">{v.value}</span>
              </div>
              <p
                style={{
                  fontSize: `${Math.min(fontSize, 14)}px`,
                  fontWeight: fontWeight,
                  lineHeight: v.value,
                  maxWidth: "100%",
                }}
                className="text-foreground/80 text-xs"
              >
                The quick brown fox jumps over the lazy dog. Good typography improves readability.
              </p>
              <div className="mt-2 text-xs text-muted font-mono">
                {Math.round(v.value * fontSize * 10) / 10}px /{" "}
                {Math.round((v.value * fontSize) / 16 * 100) / 100}rem
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">CSS Output</h3>
          <CopyButton text={cssOutput} label="Copy CSS" />
        </div>
        <div className="p-4 overflow-auto">
          <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">
            {cssOutput}
          </pre>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
