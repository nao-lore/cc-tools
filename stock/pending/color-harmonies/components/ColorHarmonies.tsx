"use client";

import { useState, useCallback } from "react";

// ── Color math helpers ────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = s / 100;
  const ll = l / 100;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + hh / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

// ── Harmony generators ────────────────────────────────────────────────────────

interface Harmony {
  label: string;
  colors: string[];
}

function generateHarmonies(hex: string): Harmony[] {
  const [h, s, l] = hexToHsl(hex);
  return [
    {
      label: "Complementary",
      colors: [hex, hslToHex(h + 180, s, l)],
    },
    {
      label: "Analogous",
      colors: [
        hslToHex(h - 30, s, l),
        hex,
        hslToHex(h + 30, s, l),
      ],
    },
    {
      label: "Triadic",
      colors: [hex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)],
    },
    {
      label: "Split-Complementary",
      colors: [hex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)],
    },
    {
      label: "Tetradic",
      colors: [
        hex,
        hslToHex(h + 90, s, l),
        hslToHex(h + 180, s, l),
        hslToHex(h + 270, s, l),
      ],
    },
  ];
}

// ── SVG Color Wheel ───────────────────────────────────────────────────────────

function ColorWheel({
  baseHex,
  harmonies,
}: {
  baseHex: string;
  harmonies: Harmony[];
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 88;
  const innerR = 55;
  const dotR = 7;

  // Build rainbow ring via conic-gradient approximated with SVG sectors
  const sectors: { path: string; color: string }[] = [];
  const steps = 60;
  for (let i = 0; i < steps; i++) {
    const startAngle = (i / steps) * 360;
    const endAngle = ((i + 1) / steps) * 360;
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1o = cx + outerR * Math.cos(toRad(startAngle));
    const y1o = cy + outerR * Math.sin(toRad(startAngle));
    const x2o = cx + outerR * Math.cos(toRad(endAngle));
    const y2o = cy + outerR * Math.sin(toRad(endAngle));
    const x1i = cx + innerR * Math.cos(toRad(startAngle));
    const y1i = cy + innerR * Math.sin(toRad(startAngle));
    const x2i = cx + innerR * Math.cos(toRad(endAngle));
    const y2i = cy + innerR * Math.sin(toRad(endAngle));
    sectors.push({
      path: `M ${x1i} ${y1i} L ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 0 0 ${x1i} ${y1i} Z`,
      color: `hsl(${startAngle}, 80%, 55%)`,
    });
  }

  // Dot positions: angle from hue, placed at mid-radius
  const midR = (outerR + innerR) / 2;
  const allColors = harmonies.flatMap((h) => h.colors);
  const uniqueColors = [...new Set(allColors)];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Color wheel showing harmony positions"
    >
      {sectors.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} />
      ))}
      {/* White center */}
      <circle cx={cx} cy={cy} r={innerR - 1} fill="white" />
      {/* Harmony dots */}
      {uniqueColors.map((hex, i) => {
        const [h] = hexToHsl(hex);
        const angle = (h - 90) * (Math.PI / 180);
        const x = cx + midR * Math.cos(angle);
        const y = cy + midR * Math.sin(angle);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={dotR + 2} fill="white" />
            <circle cx={x} cy={y} r={dotR} fill={hex} stroke="white" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

// ── Swatch ────────────────────────────────────────────────────────────────────

function Swatch({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [hex]);

  return (
    <button
      onClick={handleClick}
      title={`Copy ${hex}`}
      className="flex flex-col items-center gap-1 group focus:outline-none"
    >
      <div
        className="w-14 h-14 rounded-lg shadow-sm border border-gray-200 transition-transform group-hover:scale-105 group-focus:scale-105"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-mono text-gray-600 group-hover:text-gray-900">
        {copied ? "Copied!" : hex}
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ColorHarmonies() {
  const [baseHex, setBaseHex] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [exportMsg, setExportMsg] = useState("");

  const harmonies = generateHarmonies(baseHex);

  function handleHexInput(value: string) {
    setHexInput(value);
    const normalized = value.startsWith("#") ? value : `#${value}`;
    if (isValidHex(normalized)) {
      setBaseHex(normalized);
    }
  }

  function handlePickerChange(value: string) {
    setBaseHex(value);
    setHexInput(value);
  }

  function exportCSS() {
    const lines: string[] = [":root {", `  --color-base: ${baseHex};`];
    harmonies.forEach((h) => {
      const label = h.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      h.colors.forEach((hex, i) => {
        lines.push(`  --color-${label}-${i + 1}: ${hex};`);
      });
    });
    lines.push("}");
    const blob = new Blob([lines.join("\n")], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-harmonies.css";
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("CSS exported");
    setTimeout(() => setExportMsg(""), 2000);
  }

  function exportJSON() {
    const data: Record<string, string[]> = { base: [baseHex] };
    harmonies.forEach((h) => {
      const key = h.label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      data[key] = h.colors;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-harmonies.json";
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("JSON exported");
    setTimeout(() => setExportMsg(""), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Picker + hex input */}
          <div className="flex items-center gap-4">
            <div>
              <label
                htmlFor="color-picker"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                Base Color
              </label>
              <input
                id="color-picker"
                type="color"
                value={baseHex}
                onChange={(e) => handlePickerChange(e.target.value)}
                className="w-14 h-14 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="hex-input"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                Hex Code
              </label>
              <input
                id="hex-input"
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                maxLength={7}
                spellCheck={false}
                className="w-28 px-3 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Color wheel */}
          <div className="flex-1 flex justify-center sm:justify-end">
            <ColorWheel baseHex={baseHex} harmonies={harmonies} />
          </div>
        </div>

        {/* Export buttons */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={exportCSS}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Export CSS
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Export JSON
          </button>
          {exportMsg && (
            <span className="text-sm text-green-600 font-medium">{exportMsg}</span>
          )}
        </div>
      </div>

      {/* Harmony cards */}
      <div className="grid gap-4">
        {harmonies.map((harmony) => (
          <div
            key={harmony.label}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {harmony.label}
              <span className="ml-2 text-xs font-normal text-gray-400">
                {harmony.colors.length} color{harmony.colors.length > 1 ? "s" : ""}
              </span>
            </h2>
            <div className="flex flex-wrap gap-4">
              {harmony.colors.map((hex) => (
                <Swatch key={hex} hex={hex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Color Harmonies Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate complementary, triadic, and analogous color schemes. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Color Harmonies Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate complementary, triadic, and analogous color schemes. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
