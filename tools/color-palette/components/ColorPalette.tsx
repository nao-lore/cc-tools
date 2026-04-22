"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorSwatch {
  hsl: HSL;
  locked: boolean;
}

type HarmonyMode =
  | "random"
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "monochromatic";

type ExportFormat = "css" | "hex" | "tailwind" | "json";

// ─── Color Utilities ─────────────────────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(c1: HSL, c2: HSL): number {
  const [r1, g1, b1] = hslToRgb(c1.h, c1.s, c1.l);
  const [r2, g2, b2] = hslToRgb(c2.h, c2.s, c2.l);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function textColorForBg(hsl: HSL): string {
  const [r, g, b] = hslToRgb(hsl.h, hsl.s, hsl.l);
  const lum = relativeLuminance(r, g, b);
  return lum > 0.179 ? "#000000" : "#ffffff";
}

// ─── Harmony Generators ──────────────────────────────────────────────────────

function randomHSL(): HSL {
  return {
    h: Math.floor(Math.random() * 360),
    s: 40 + Math.floor(Math.random() * 50),
    l: 30 + Math.floor(Math.random() * 45),
  };
}

function generateHarmony(mode: HarmonyMode, locked: boolean[]): HSL[] {
  if (mode === "random") {
    return Array.from({ length: 5 }, (_, i) =>
      locked[i] ? null! : randomHSL()
    );
  }

  const base = randomHSL();

  const harmonies: Record<Exclude<HarmonyMode, "random">, () => HSL[]> = {
    complementary: () => {
      const comp = (base.h + 180) % 360;
      return [
        base,
        { h: base.h, s: base.s - 10, l: base.l + 15 },
        { h: (base.h + 90) % 360, s: base.s, l: base.l },
        { h: comp, s: base.s - 10, l: base.l + 15 },
        { h: comp, s: base.s, l: base.l },
      ];
    },
    analogous: () =>
      [-30, -15, 0, 15, 30].map((offset) => ({
        h: (base.h + offset + 360) % 360,
        s: base.s + Math.floor(Math.random() * 10) - 5,
        l: base.l + Math.floor(Math.random() * 10) - 5,
      })),
    triadic: () => {
      const h2 = (base.h + 120) % 360;
      const h3 = (base.h + 240) % 360;
      return [
        base,
        { h: base.h, s: base.s, l: Math.min(base.l + 20, 80) },
        { h: h2, s: base.s, l: base.l },
        { h: h3, s: base.s, l: base.l },
        { h: h3, s: base.s, l: Math.min(base.l + 20, 80) },
      ];
    },
    "split-complementary": () => {
      const comp1 = (base.h + 150) % 360;
      const comp2 = (base.h + 210) % 360;
      return [
        base,
        { h: base.h, s: base.s, l: Math.min(base.l + 20, 80) },
        { h: comp1, s: base.s, l: base.l },
        { h: comp2, s: base.s, l: base.l },
        { h: comp2, s: base.s - 10, l: Math.min(base.l + 15, 80) },
      ];
    },
    monochromatic: () =>
      [0.3, 0.5, 0.65, 0.8, 0.95].map((factor) => ({
        h: base.h,
        s: Math.max(20, base.s - Math.floor(Math.random() * 15)),
        l: Math.round(factor * 80 + 10),
      })),
  };

  const colors = harmonies[mode]().map((c) => ({
    h: ((c.h % 360) + 360) % 360,
    s: Math.max(0, Math.min(100, c.s)),
    l: Math.max(0, Math.min(100, c.l)),
  }));

  return colors.map((c, i) => (locked[i] ? null! : c));
}

// ─── Copy helpers ────────────────────────────────────────────────────────────

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function LockIcon({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ColorPalette() {
  const [swatches, setSwatches] = useState<ColorSwatch[]>(() =>
    Array.from({ length: 5 }, () => ({ hsl: randomHSL(), locked: false }))
  );
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("random");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedExport, setCopiedExport] = useState<ExportFormat | null>(null);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(() => {
    setSwatches((prev) => {
      const locked = prev.map((s) => s.locked);
      const newColors = generateHarmony(harmonyMode, locked);
      return prev.map((s, i) =>
        s.locked ? s : { ...s, hsl: newColors[i] ?? randomHSL() }
      );
    });
  }, [harmonyMode]);

  // Spacebar to generate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generate]);

  const toggleLock = (index: number) => {
    setSwatches((prev) =>
      prev.map((s, i) => (i === index ? { ...s, locked: !s.locked } : s))
    );
  };

  const updateColor = (index: number, hsl: Partial<HSL>) => {
    setSwatches((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, hsl: { ...s.hsl, ...hsl } } : s
      )
    );
  };

  const handleCopyColor = async (index: number) => {
    const hex = hslToHex(
      swatches[index].hsl.h,
      swatches[index].hsl.s,
      swatches[index].hsl.l
    );
    await copyText(hex);
    setCopiedIndex(index);
    if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getExportString = (format: ExportFormat): string => {
    const hexes = swatches.map((s) =>
      hslToHex(s.hsl.h, s.hsl.s, s.hsl.l)
    );
    const names = ["primary", "secondary", "accent", "highlight", "muted"];

    switch (format) {
      case "css":
        return `:root {\n${hexes.map((h, i) => `  --color-${names[i]}: ${h};`).join("\n")}\n}`;
      case "hex":
        return `[${hexes.map((h) => `"${h}"`).join(", ")}]`;
      case "tailwind":
        return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${hexes.map((h, i) => `        "${names[i]}": "${h}",`).join("\n")}\n      },\n    },\n  },\n};`;
      case "json":
        return JSON.stringify(
          Object.fromEntries(hexes.map((h, i) => [names[i], h])),
          null,
          2
        );
    }
  };

  const handleExport = async (format: ExportFormat) => {
    await copyText(getExportString(format));
    setCopiedExport(format);
    setTimeout(() => setCopiedExport(null), 1500);
  };

  const harmonyModes: { value: HarmonyMode; label: string }[] = [
    { value: "random", label: "Random" },
    { value: "complementary", label: "Complementary" },
    { value: "analogous", label: "Analogous" },
    { value: "triadic", label: "Triadic" },
    { value: "split-complementary", label: "Split-Complementary" },
    { value: "monochromatic", label: "Monochromatic" },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <button
          onClick={generate}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm cursor-pointer"
        >
          Generate
          <span className="ml-2 text-gray-400 text-xs hidden sm:inline">
            Space
          </span>
        </button>
        <select
          value={harmonyMode}
          onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition-colors"
        >
          {harmonyModes.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Swatches */}
      <div className="flex rounded-xl overflow-hidden shadow-lg border border-gray-200 h-72 sm:h-80">
        {swatches.map((swatch, index) => {
          const hex = hslToHex(swatch.hsl.h, swatch.hsl.s, swatch.hsl.l);
          const rgb = hslToRgb(swatch.hsl.h, swatch.hsl.s, swatch.hsl.l);
          const textColor = textColorForBg(swatch.hsl);
          const isSelected = selectedIndex === index;

          return (
            <div
              key={index}
              className="flex-1 relative flex flex-col justify-end cursor-pointer transition-all duration-200"
              style={{ backgroundColor: hex }}
              onClick={() => handleCopyColor(index)}
            >
              {/* Lock button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(index);
                }}
                className="absolute top-3 left-1/2 -translate-x-1/2 p-1.5 rounded-full transition-colors cursor-pointer"
                style={{
                  color: textColor,
                  backgroundColor: swatch.locked
                    ? `${textColor}20`
                    : "transparent",
                }}
                title={swatch.locked ? "Unlock" : "Lock"}
              >
                <LockIcon locked={swatch.locked} />
              </button>

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(isSelected ? null : index);
                }}
                className="absolute top-10 left-1/2 -translate-x-1/2 p-1.5 rounded-full transition-colors cursor-pointer text-xs font-medium"
                style={{ color: textColor }}
                title="Adjust color"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>

              {/* Copied indicator */}
              {copiedIndex === index && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${textColor}20`,
                    color: textColor,
                  }}
                >
                  Copied!
                </div>
              )}

              {/* Color info */}
              <div className="p-3 space-y-0.5 text-center" style={{ color: textColor }}>
                <div className="font-mono text-sm font-bold uppercase tracking-wide">
                  {hex}
                </div>
                <div className="font-mono text-[10px] opacity-70">
                  rgb({rgb[0]}, {rgb[1]}, {rgb[2]})
                </div>
                <div className="font-mono text-[10px] opacity-70">
                  hsl({Math.round(swatch.hsl.h)}, {Math.round(swatch.hsl.s)}%,{" "}
                  {Math.round(swatch.hsl.l)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrast Checker */}
      <div className="flex justify-center gap-2 flex-wrap">
        {swatches.slice(0, -1).map((_, i) => {
          const ratio = contrastRatio(swatches[i].hsl, swatches[i + 1].hsl);
          const passAA = ratio >= 4.5;
          const passAAA = ratio >= 7;
          const hex1 = hslToHex(swatches[i].hsl.h, swatches[i].hsl.s, swatches[i].hsl.l);
          const hex2 = hslToHex(swatches[i + 1].hsl.h, swatches[i + 1].hsl.s, swatches[i + 1].hsl.l);

          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs"
            >
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: hex1 }}
                />
                <div
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: hex2 }}
                />
              </div>
              <span className="font-mono text-gray-600">
                {ratio.toFixed(1)}:1
              </span>
              <span
                className={`font-medium ${passAA ? "text-green-600" : "text-red-500"}`}
              >
                AA {passAA ? "Pass" : "Fail"}
              </span>
              <span
                className={`font-medium ${passAAA ? "text-green-600" : "text-red-500"}`}
              >
                AAA {passAAA ? "Pass" : "Fail"}
              </span>
            </div>
          );
        })}
      </div>

      {/* HSL Sliders */}
      {selectedIndex !== null && (
        <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Adjust Color {selectedIndex + 1}
            </h3>
            <button
              onClick={() => setSelectedIndex(null)}
              className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              &times;
            </button>
          </div>
          {(["h", "s", "l"] as const).map((prop) => {
            const labels = { h: "Hue", s: "Saturation", l: "Lightness" };
            const maxVal = prop === "h" ? 360 : 100;
            return (
              <div key={prop}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{labels[prop]}</span>
                  <span>
                    {Math.round(swatches[selectedIndex].hsl[prop])}
                    {prop === "h" ? "deg" : "%"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxVal}
                  value={swatches[selectedIndex].hsl[prop]}
                  onChange={(e) =>
                    updateColor(selectedIndex, {
                      [prop]: Number(e.target.value),
                    })
                  }
                  className="w-full accent-gray-900"
                />
              </div>
            );
          })}
          <div
            className="h-10 rounded-lg border border-gray-200"
            style={{
              backgroundColor: hslToHex(
                swatches[selectedIndex].hsl.h,
                swatches[selectedIndex].hsl.s,
                swatches[selectedIndex].hsl.l
              ),
            }}
          />
        </div>
      )}

      {/* Export */}
      <div className="flex flex-wrap justify-center gap-2">
        {(
          [
            { format: "css" as ExportFormat, label: "CSS Variables" },
            { format: "hex" as ExportFormat, label: "HEX Array" },
            { format: "tailwind" as ExportFormat, label: "Tailwind Config" },
            { format: "json" as ExportFormat, label: "JSON" },
          ] as const
        ).map(({ format, label }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {copiedExport === format ? <CheckIcon /> : <CopyIcon />}
            {copiedExport === format ? "Copied!" : label}
          </button>
        ))}
      </div>
    </div>
  );
}
