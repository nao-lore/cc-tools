"use client";

import { useState, useCallback, useMemo } from "react";

// --- Color math helpers ---

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 3 && clean.length !== 6) return null;
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

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function delinearize(c: number): number {
  return c <= 0.0031308
    ? c * 12.92
    : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// --- Color blindness simulation matrices ---
// Based on Viénot, Brettel & Mollon (1999) / Machado (2009) standard matrices.
// All matrices operate in linearized sRGB space.

type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

const MATRICES: Record<string, Matrix3x3> = {
  // Protanopia (no L-cone / red-blind)
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  // Deuteranopia (no M-cone / green-blind)
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.011820, 0.042940, 0.968881],
  ],
  // Tritanopia (no S-cone / blue-blind)
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.303900],
  ],
};

function applyMatrix(
  rgb: [number, number, number],
  m: Matrix3x3
): [number, number, number] {
  const [r, g, b] = rgb;
  return [
    m[0][0] * r + m[0][1] * g + m[0][2] * b,
    m[1][0] * r + m[1][1] * g + m[1][2] * b,
    m[2][0] * r + m[2][1] * g + m[2][2] * b,
  ];
}

function simulateColorBlindness(
  hex: string,
  type: string
): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Linearize
  const lin: [number, number, number] = [
    linearize(rgb[0]),
    linearize(rgb[1]),
    linearize(rgb[2]),
  ];

  let simLin: [number, number, number];

  if (type === "achromatopsia") {
    // Luminance-only (no hue perception at all)
    const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    simLin = [lum, lum, lum];
  } else if (type === "normal") {
    simLin = lin;
  } else {
    const m = MATRICES[type];
    if (!m) return hex;
    simLin = applyMatrix(lin, m);
  }

  // Delinearize back to sRGB
  const [r, g, b] = simLin.map(delinearize);
  return rgbToHex(r * 255, g * 255, b * 255);
}

// --- Types ---

type SimType = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

const SIM_TYPES: { key: SimType; label: string; sub: string }[] = [
  { key: "normal", label: "Normal", sub: "Full color vision" },
  { key: "protanopia", label: "Protanopia", sub: "Red-blind (L-cone)" },
  { key: "deuteranopia", label: "Deuteranopia", sub: "Green-blind (M-cone)" },
  { key: "tritanopia", label: "Tritanopia", sub: "Blue-blind (S-cone)" },
  { key: "achromatopsia", label: "Achromatopsia", sub: "Total color blindness" },
];

type InputMode = "single" | "palette";

const PALETTE_DEFAULTS = [
  "#e63946",
  "#2a9d8f",
  "#457b9d",
  "#f4a261",
  "#264653",
  "#a8dadc",
];

// --- Sub-components ---

interface HexInputProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

function HexInput({ value, onChange, label }: HexInputProps) {
  const [raw, setRaw] = useState(value.replace("#", ""));

  const handleText = (v: string) => {
    setRaw(v);
    const hex = "#" + v;
    if (hexToRgb(hex)) onChange(hex);
  };

  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setRaw(hex.replace("#", ""));
    onChange(hex);
  };

  // Keep raw in sync when value changes externally
  const displayRaw =
    raw.toLowerCase() === value.replace("#", "").toLowerCase()
      ? raw
      : value.replace("#", "");

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-xs text-muted w-16 shrink-0">{label}</span>
      )}
      <div className="relative shrink-0">
        <div
          className="w-9 h-9 rounded-lg border border-border overflow-hidden cursor-pointer"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={handlePicker}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center bg-background border border-border rounded-lg px-2 py-1.5 gap-1">
        <span className="text-muted text-xs font-mono">#</span>
        <input
          type="text"
          value={displayRaw.toUpperCase()}
          onChange={(e) => handleText(e.target.value)}
          maxLength={6}
          className="w-16 bg-transparent text-foreground text-xs font-mono uppercase focus:outline-none"
          placeholder="000000"
        />
      </div>
    </div>
  );
}

// --- Color row: one color × all sim types ---

interface ColorRowProps {
  hex: string;
  label?: string;
  showRemove?: boolean;
  onRemove?: () => void;
  onChange?: (hex: string) => void;
}

function ColorRow({ hex, label, showRemove, onRemove, onChange }: ColorRowProps) {
  const valid = hexToRgb(hex) !== null;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Header with input */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        {onChange ? (
          <HexInput value={hex} onChange={onChange} label={label} />
        ) : (
          <div className="flex items-center gap-2">
            {label && <span className="text-xs text-muted">{label}</span>}
            <div
              className="w-5 h-5 rounded border border-border"
              style={{ backgroundColor: hex }}
            />
            <span className="text-xs font-mono text-foreground">
              {hex.toUpperCase()}
            </span>
          </div>
        )}
        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="ml-2 p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Remove color"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Swatches grid */}
      {valid ? (
        <div className="grid grid-cols-5 divide-x divide-border">
          {SIM_TYPES.map((sim) => {
            const simHex = simulateColorBlindness(hex, sim.key);
            return (
              <div key={sim.key} className="flex flex-col">
                <div
                  className="h-16 w-full"
                  style={{ backgroundColor: simHex }}
                  title={simHex}
                />
                <div className="px-2 py-2 text-center">
                  <p className="text-xs font-medium text-foreground leading-tight">
                    {sim.label}
                  </p>
                  <p className="text-xs text-muted mt-0.5 leading-tight hidden sm:block">
                    {simHex.toUpperCase()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center text-muted text-sm">
          Enter a valid hex color
        </div>
      )}
    </div>
  );
}

// --- Legend row ---

function SimLegend() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <p className="text-xs font-medium text-muted mb-3">Vision Types</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SIM_TYPES.map((sim) => (
          <div key={sim.key} className="text-center">
            <p className="text-xs font-semibold text-foreground">{sim.label}</p>
            <p className="text-xs text-muted">{sim.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main component ---

export default function ColorBlindnessSim() {
  const [mode, setMode] = useState<InputMode>("single");

  // Single mode
  const [singleHex, setSingleHex] = useState("#e63946");

  // Palette mode
  const [palette, setPalette] = useState<string[]>(PALETTE_DEFAULTS);

  const addColor = useCallback(() => {
    if (palette.length >= 6) return;
    setPalette((prev) => [...prev, "#3d5a80"]);
  }, [palette.length]);

  const removeColor = useCallback((i: number) => {
    setPalette((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const updateColor = useCallback((i: number, hex: string) => {
    setPalette((prev) => prev.map((c, idx) => (idx === i ? hex : c)));
  }, []);

  // Single-mode simulated results for the info panel
  const singleSims = useMemo(
    () =>
      SIM_TYPES.map((sim) => ({
        ...sim,
        hex: simulateColorBlindness(singleHex, sim.key),
      })),
    [singleHex]
  );

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["single", "palette"] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              mode === m
                ? "bg-accent text-white border-accent"
                : "bg-surface border-border text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {m === "single" ? "Single Color" : "Palette (up to 6)"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <SimLegend />

      {mode === "single" ? (
        <div className="space-y-4">
          {/* Single color input */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <label className="text-sm font-medium text-foreground block mb-3">
              Enter a hex color
            </label>
            <HexInput value={singleHex} onChange={setSingleHex} />
          </div>

          {/* Simulation row */}
          <ColorRow hex={singleHex} />

          {/* Detail table */}
          {hexToRgb(singleHex) && (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">
                  Simulated Values
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted">
                        Vision Type
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted">
                        Description
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-muted">
                        Swatch
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted">
                        Hex
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {singleSims.map((sim, i) => (
                      <tr
                        key={sim.key}
                        className={
                          i < singleSims.length - 1
                            ? "border-b border-border"
                            : ""
                        }
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {sim.label}
                        </td>
                        <td className="px-4 py-3 text-muted">{sim.sub}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <div
                              className="w-8 h-8 rounded-lg border border-border"
                              style={{ backgroundColor: sim.hex }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {sim.hex.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Palette rows */}
          {palette.map((hex, i) => (
            <ColorRow
              key={i}
              hex={hex}
              label={`Color ${i + 1}`}
              showRemove={palette.length > 1}
              onRemove={() => removeColor(i)}
              onChange={(h) => updateColor(i, h)}
            />
          ))}

          {/* Add color button */}
          {palette.length < 6 && (
            <button
              onClick={addColor}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted hover:text-foreground hover:border-accent transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Color ({palette.length}/6)
            </button>
          )}
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Color Blindness Simulator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Simulate how colors appear with different types of color blindness. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Color Blindness Simulator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Simulate how colors appear with different types of color blindness. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Blindness Simulator",
  "description": "Simulate how colors appear with different types of color blindness",
  "url": "https://tools.loresync.dev/color-blindness-sim",
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
