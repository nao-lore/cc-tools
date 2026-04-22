"use client";

import { useState, useCallback } from "react";

// --- Constants ---

const BREAKPOINTS = [
  { label: "360", width: 360 },
  { label: "768", width: 768 },
  { label: "1024", width: 1024 },
  { label: "1280", width: 1280 },
  { label: "1440", width: 1440 },
  { label: "1920", width: 1920 },
];

const UNITS = ["vw", "vh", "vmin", "vmax"] as const;
type Unit = (typeof UNITS)[number];

// Aspect ratios assumed for vh/vmin/vmax calculations (width:height)
// We assume 16:9 for landscape, 9:16 for portrait (360px mobile)
function getViewportHeight(width: number): number {
  if (width <= 480) return Math.round((width * 16) / 9); // portrait mobile
  return Math.round((width * 9) / 16); // landscape
}

function calcPx(value: number, unit: Unit, vpWidth: number): number {
  const vpHeight = getViewportHeight(vpWidth);
  switch (unit) {
    case "vw":
      return (value / 100) * vpWidth;
    case "vh":
      return (value / 100) * vpHeight;
    case "vmin":
      return (value / 100) * Math.min(vpWidth, vpHeight);
    case "vmax":
      return (value / 100) * Math.max(vpWidth, vpHeight);
  }
}

function calcVw(targetPx: number, vpWidth: number): number {
  return (targetPx / vpWidth) * 100;
}

function formatPx(n: number): string {
  return Number.isInteger(n) ? `${n}px` : `${n.toFixed(1)}px`;
}

function formatVw(n: number): string {
  return `${n.toFixed(3).replace(/\.?0+$/, "")}`;
}

// Generate CSS clamp() suggestion
function generateClamp(value: number, unit: Unit): string {
  const minVp = BREAKPOINTS[0].width;
  const maxVp = BREAKPOINTS[BREAKPOINTS.length - 1].width;
  const minPx = calcPx(value, unit, minVp);
  const maxPx = calcPx(value, unit, maxVp);
  const minRem = (minPx / 16).toFixed(3).replace(/\.?0+$/, "");
  const maxRem = (maxPx / 16).toFixed(3).replace(/\.?0+$/, "");
  const fluid = `${value}${unit}`;
  return `clamp(${minRem}rem, ${fluid}, ${maxRem}rem)`;
}

// Relative bar width: proportion of max px value across all breakpoints
function getBarWidths(value: number, unit: Unit): number[] {
  const pxValues = BREAKPOINTS.map((bp) => calcPx(value, unit, bp.width));
  const max = Math.max(...pxValues);
  return pxValues.map((px) => (max > 0 ? (px / max) * 100 : 0));
}

// --- Sub-components ---

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 rounded text-xs font-medium border border-border text-muted hover:text-foreground hover:border-accent/50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// --- Forward Mode ---

function ForwardMode({ unit }: { unit: Unit }) {
  const [value, setValue] = useState("5");
  const numVal = parseFloat(value) || 0;
  const clamp = generateClamp(numVal, unit);
  const barWidths = getBarWidths(numVal, unit);

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted whitespace-nowrap">
          Enter value
        </label>
        <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2 gap-1 w-36">
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 bg-transparent text-foreground text-sm font-mono focus:outline-none w-full"
            aria-label={`${unit} value`}
          />
          <span className="text-accent text-xs font-mono font-semibold">{unit}</span>
        </div>
      </div>

      {/* Table + bars */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Viewport</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted hidden sm:table-cell">
                Height (assumed)
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">px</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">rem</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted w-32 hidden md:table-cell">
                Relative size
              </th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINTS.map((bp, i) => {
              const px = calcPx(numVal, unit, bp.width);
              const rem = (px / 16).toFixed(3).replace(/\.?0+$/, "");
              const vpH = getViewportHeight(bp.width);
              return (
                <tr
                  key={bp.width}
                  className={i < BREAKPOINTS.length - 1 ? "border-b border-border" : ""}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {bp.width}px
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted hidden sm:table-cell">
                    {vpH}px
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">
                    {formatPx(px)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {rem}rem
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-background rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-gradient-to-r from-[#7c5cfc] to-[#ff6b9d] rounded-full transition-all duration-300"
                          style={{ width: `${barWidths[i]}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted font-mono w-8 text-right">
                        {Math.round(barWidths[i])}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* clamp() suggestion */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted">CSS clamp() suggestion</p>
          <CopyButton text={clamp} />
        </div>
        <code className="text-sm font-mono text-accent break-all">{clamp}</code>
        <p className="text-xs text-muted mt-2">
          Fluid from {formatPx(calcPx(numVal, unit, BREAKPOINTS[0].width))} at{" "}
          {BREAKPOINTS[0].width}px to {formatPx(calcPx(numVal, unit, BREAKPOINTS[BREAKPOINTS.length - 1].width))} at{" "}
          {BREAKPOINTS[BREAKPOINTS.length - 1].width}px.
        </p>
      </div>
    </div>
  );
}

// --- Reverse Mode ---

function ReverseMode({ unit }: { unit: Unit }) {
  const [targetPx, setTargetPx] = useState("24");
  const numPx = parseFloat(targetPx) || 0;

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-muted whitespace-nowrap">
          Target size
        </label>
        <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2 gap-1 w-36">
          <input
            type="number"
            min={0}
            step={1}
            value={targetPx}
            onChange={(e) => setTargetPx(e.target.value)}
            className="flex-1 bg-transparent text-foreground text-sm font-mono focus:outline-none w-full"
            aria-label="Target pixel size"
          />
          <span className="text-accent text-xs font-mono font-semibold">px</span>
        </div>
        <span className="text-muted text-sm">
          → required <span className="font-mono text-accent">{unit}</span> per viewport
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Viewport</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">
                Required {unit}
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">CSS value</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted">Copy</th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINTS.map((bp, i) => {
              const vpH = getViewportHeight(bp.width);
              let divisor = bp.width;
              if (unit === "vh") divisor = vpH;
              else if (unit === "vmin") divisor = Math.min(bp.width, vpH);
              else if (unit === "vmax") divisor = Math.max(bp.width, vpH);

              const vwVal = (numPx / divisor) * 100;
              const cssVal = `${formatVw(vwVal)}${unit}`;

              return (
                <tr
                  key={bp.width}
                  className={i < BREAKPOINTS.length - 1 ? "border-b border-border" : ""}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {bp.width}px
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">
                    {formatVw(vwVal)}{unit}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-accent">
                    {cssVal}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CopyButton text={cssVal} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* clamp suggestion based on min/max breakpoints */}
      {numPx > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted">
              CSS clamp() — fluid {numPx}px across all viewports
            </p>
            <CopyButton
              text={`clamp(${(numPx / 16).toFixed(3).replace(/\.?0+$/, "")}rem, ${formatVw(calcVw(numPx, BREAKPOINTS[2].width))}vw, ${(numPx / 16).toFixed(3).replace(/\.?0+$/, "")}rem)`}
            />
          </div>
          <code className="text-sm font-mono text-accent break-all">
            {`clamp(${((numPx * 0.75) / 16).toFixed(3).replace(/\.?0+$/, "")}rem, ${formatVw(calcVw(numPx, BREAKPOINTS[2].width))}vw, ${((numPx * 1.25) / 16).toFixed(3).replace(/\.?0+$/, "")}rem)`}
          </code>
          <p className="text-xs text-muted mt-2">
            Targets {numPx}px at {BREAKPOINTS[2].width}px viewport with ±25% fluid range.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Main component ---

type Mode = "forward" | "reverse";

export default function ViewportUnitCalc() {
  const [mode, setMode] = useState<Mode>("forward");
  const [unit, setUnit] = useState<Unit>("vw");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Mode toggle */}
          <div className="flex-1">
            <p className="text-xs font-medium text-muted mb-2">Mode</p>
            <div className="flex gap-1 bg-background rounded-xl border border-border p-1">
              {(["forward", "reverse"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m
                      ? "bg-surface text-foreground shadow-sm border border-border"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {m === "forward" ? "Forward (vw → px)" : "Reverse (px → vw)"}
                </button>
              ))}
            </div>
          </div>

          {/* Unit selector */}
          <div className="shrink-0">
            <p className="text-xs font-medium text-muted mb-2">Unit</p>
            <div className="flex gap-1 bg-background rounded-xl border border-border p-1">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-lg text-sm font-mono font-medium transition-colors ${
                    unit === u
                      ? "bg-gradient-to-r from-[#7c5cfc] to-[#ff6b9d] text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unit description */}
        <div className="text-xs text-muted bg-background/60 rounded-lg px-3 py-2 border border-border">
          {unit === "vw" && "1vw = 1% of the viewport width. Scales horizontally with the screen."}
          {unit === "vh" && "1vh = 1% of the viewport height. Heights assumed 16:9 (landscape) or 9:16 (≤480px portrait)."}
          {unit === "vmin" && "1vmin = 1% of the smaller viewport dimension (width or height)."}
          {unit === "vmax" && "1vmax = 1% of the larger viewport dimension (width or height)."}
        </div>
      </div>

      {/* Mode content */}
      {mode === "forward" ? (
        <ForwardMode unit={unit} />
      ) : (
        <ReverseMode unit={unit} />
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
