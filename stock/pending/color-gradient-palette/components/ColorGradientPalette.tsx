"use client";

import { useState, useCallback, useMemo } from "react";

// ── Color math helpers ──────────────────────────────────────────────────────

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

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(hn + 1 / 3) * 255),
    Math.round(hue2rgb(hn) * 255),
    Math.round(hue2rgb(hn - 1 / 3) * 255),
  ];
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

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

// ── Interpolation ───────────────────────────────────────────────────────────

type Mode = "rgb" | "hsl";

function interpolate(
  startHex: string,
  endHex: string,
  steps: number,
  mode: Mode
): string[] {
  const startRgb = hexToRgb(startHex);
  const endRgb = hexToRgb(endHex);
  if (!startRgb || !endRgb) return [];

  const result: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);

    if (mode === "rgb") {
      const r = startRgb[0] + (endRgb[0] - startRgb[0]) * t;
      const g = startRgb[1] + (endRgb[1] - startRgb[1]) * t;
      const b = startRgb[2] + (endRgb[2] - startRgb[2]) * t;
      result.push(rgbToHex(r, g, b));
    } else {
      const [sh, ss, sl] = rgbToHsl(...startRgb);
      const [eh, es, el] = rgbToHsl(...endRgb);
      // Shortest path around hue circle
      let dh = eh - sh;
      if (dh > 180) dh -= 360;
      if (dh < -180) dh += 360;
      const h = sh + dh * t;
      const s = ss + (es - ss) * t;
      const l = sl + (el - sl) * t;
      const [r, g, b] = hslToRgb(h, s, l);
      result.push(rgbToHex(r, g, b));
    }
  }

  return result;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ColorGradientPalette() {
  const [startHex, setStartHex] = useState("#7c5cfc");
  const [startInput, setStartInput] = useState("#7c5cfc");
  const [endHex, setEndHex] = useState("#f95b8c");
  const [endInput, setEndInput] = useState("#f95b8c");
  const [steps, setSteps] = useState(7);
  const [mode, setMode] = useState<Mode>("hsl");
  const [copied, setCopied] = useState<string | null>(null);
  const [exportTab, setExportTab] = useState<"css" | "tailwind">("css");

  const startValid = isValidHex(startHex);
  const endValid = isValidHex(endHex);
  const bothValid = startValid && endValid;

  const palette = useMemo(
    () => (bothValid ? interpolate(startHex, endHex, steps, mode) : []),
    [startHex, endHex, steps, mode, bothValid]
  );

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleStartInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.trim();
    if (!v.startsWith("#")) v = "#" + v;
    setStartInput(v);
    if (isValidHex(v)) setStartHex(v);
  }, []);

  const handleEndInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.trim();
    if (!v.startsWith("#")) v = "#" + v;
    setEndInput(v);
    if (isValidHex(v)) setEndHex(v);
  }, []);

  // CSS export
  const cssExport = useMemo(() => {
    if (!palette.length) return "";
    const lines = [":root {"];
    palette.forEach((hex, i) => {
      lines.push(`  --color-gradient-${i + 1}: ${hex};`);
    });
    lines.push("}");
    return lines.join("\n");
  }, [palette]);

  // Tailwind export
  const tailwindExport = useMemo(() => {
    if (!palette.length) return "";
    const inner = palette
      .map((hex, i) => `    ${(i + 1) * 100}: "${hex}"`)
      .join(",\n");
    return `colors: {\n  gradient: {\n${inner}\n  }\n}`;
  }, [palette]);

  const exportContent = exportTab === "css" ? cssExport : tailwindExport;

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-5">
        {/* Color pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted block">開始色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={startValid ? startHex : "#000000"}
                onChange={(e) => {
                  setStartHex(e.target.value);
                  setStartInput(e.target.value);
                }}
                className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
                aria-label="開始色ピッカー"
              />
              <input
                type="text"
                value={startInput}
                onChange={handleStartInput}
                maxLength={7}
                placeholder="#7c5cfc"
                className={`flex-1 px-3 py-2.5 text-sm font-mono bg-background border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors ${
                  isValidHex(startInput) ? "border-border" : "border-red-400"
                }`}
                aria-label="開始色 HEX"
              />
            </div>
          </div>

          {/* End */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted block">終了色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={endValid ? endHex : "#000000"}
                onChange={(e) => {
                  setEndHex(e.target.value);
                  setEndInput(e.target.value);
                }}
                className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
                aria-label="終了色ピッカー"
              />
              <input
                type="text"
                value={endInput}
                onChange={handleEndInput}
                maxLength={7}
                placeholder="#f95b8c"
                className={`flex-1 px-3 py-2.5 text-sm font-mono bg-background border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors ${
                  isValidHex(endInput) ? "border-border" : "border-red-400"
                }`}
                aria-label="終了色 HEX"
              />
            </div>
          </div>
        </div>

        {/* Step slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              分割数
            </label>
            <span className="text-sm font-mono text-foreground tabular-nums">{steps}色</span>
          </div>
          <input
            type="range"
            min={3}
            max={20}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full accent-accent"
            aria-label="分割数スライダー"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>3</span>
            <span>20</span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted block">補間モード</label>
          <div className="flex gap-2">
            {(["rgb", "hsl"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  mode === m
                    ? "bg-accent text-white border-accent"
                    : "bg-background text-muted border-border hover:text-foreground"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient preview bar */}
      {bothValid && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted">グラデーションプレビュー</h3>
          <div
            className="w-full h-10 rounded-xl border border-border"
            style={{
              background: `linear-gradient(to right, ${startHex}, ${endHex})`,
            }}
            aria-label="グラデーションプレビュー"
          />
        </div>
      )}

      {/* Palette swatches */}
      {palette.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">
            カラーパレット — クリックでHEXをコピー
          </h3>
          <div className="flex flex-wrap gap-2">
            {palette.map((hex, i) => {
              const label = `swatch-${i}`;
              const isCopied = copied === label;
              return (
                <button
                  key={i}
                  onClick={() => copyText(hex, label)}
                  title={`コピー: ${hex}`}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label={`${hex} をコピー`}
                >
                  <div
                    className="w-14 h-14 rounded-xl border border-border/50 transition-transform group-hover:scale-105 group-hover:shadow-md flex items-end justify-center pb-1"
                    style={{ backgroundColor: hex }}
                  >
                    {isCopied && (
                      <span
                        className="text-[9px] font-bold leading-none px-1 rounded"
                        style={{
                          color: getTextColor(hex),
                          background: "rgba(0,0,0,0.15)",
                        }}
                      >
                        コピー済
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted leading-none">
                    {hex}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Export panel */}
      {palette.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {(["css", "tailwind"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setExportTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  exportTab === tab
                    ? "text-foreground border-b-2 border-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab === "css" ? "CSS カスタムプロパティ" : "Tailwind Config"}
              </button>
            ))}
          </div>

          <div className="relative p-4">
            <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-64 leading-relaxed whitespace-pre">
              {exportContent}
            </pre>
            <button
              onClick={() => copyText(exportContent, "export")}
              className="absolute top-7 right-7 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied === "export" ? "コピー済!" : "コピー"}
            </button>
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
