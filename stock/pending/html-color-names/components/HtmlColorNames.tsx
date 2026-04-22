"use client";

import { useState, useMemo } from "react";
import {
  CSS_COLORS,
  hexToRgb,
  getHueCategory,
  type HueCategory,
} from "../lib/css-colors";

const HUE_FILTERS: { value: HueCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "brown", label: "Brown" },
  { value: "gray", label: "Gray" },
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
];

const HUE_DOT_COLORS: Record<HueCategory, string> = {
  all: "#888",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  brown: "#92400e",
  gray: "#9ca3af",
  white: "#e5e7eb",
  black: "#1f2937",
};

function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  // Perceived brightness
  return 0.299 * r + 0.587 * g + 0.114 * b > 180;
}

type CopyMode = "name" | "hex" | "rgb";

export default function HtmlColorNames() {
  const [search, setSearch] = useState("");
  const [hue, setHue] = useState<HueCategory>("all");
  const [sort, setSort] = useState<"alpha" | "hue">("alpha");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copyMode, setCopyMode] = useState<CopyMode>("name");

  const filtered = useMemo(() => {
    let list = CSS_COLORS.filter((c) => {
      const matchSearch = c.name.includes(search.toLowerCase().trim());
      const matchHue = hue === "all" || getHueCategory(c.hex) === hue;
      return matchSearch && matchHue;
    });

    if (sort === "alpha") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by hue order then luminance
      const hueOrder: HueCategory[] = [
        "red", "orange", "yellow", "green", "blue", "purple",
        "brown", "gray", "white", "black",
      ];
      list = [...list].sort((a, b) => {
        const ha = hueOrder.indexOf(getHueCategory(a.hex));
        const hb = hueOrder.indexOf(getHueCategory(b.hex));
        if (ha !== hb) return ha - hb;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [search, hue, sort]);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function getValueToCopy(hex: string, name: string, mode: CopyMode): string {
    if (mode === "name") return name;
    if (mode === "hex") return hex;
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const selected = CSS_COLORS.find((c) => c.name === selectedColor) ?? null;
  const selectedRgb = selected ? hexToRgb(selected.hex) : null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search color names..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "alpha" | "hue")}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="alpha">A–Z</option>
          <option value="hue">By Hue</option>
        </select>
      </div>

      {/* Hue filter pills */}
      <div className="flex flex-wrap gap-2">
        {HUE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setHue(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              hue === f.value
                ? "bg-accent text-white border-accent"
                : "bg-surface text-muted border-border hover:border-accent/50 hover:text-foreground"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full inline-block border border-black/10"
              style={{ background: HUE_DOT_COLORS[f.value] }}
            />
            {f.label}
          </button>
        ))}
      </div>

      {/* Selected color detail panel */}
      {selected && selectedRgb && (
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ background: selected.hex }}
        >
          <div
            className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isLightColor(selected.hex) ? "text-gray-900" : "text-white"
            }`}
          >
            <div>
              <div className="text-2xl font-bold mb-1">{selected.name}</div>
              <div className="text-sm opacity-80 font-mono">{selected.hex} &nbsp;|&nbsp; rgb({selectedRgb.r}, {selectedRgb.g}, {selectedRgb.b})</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["name", "hex", "rgb"] as CopyMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    const val = getValueToCopy(selected.hex, selected.name, mode);
                    copyText(val, `detail-${mode}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    isLightColor(selected.hex)
                      ? "bg-white/70 border-black/20 hover:bg-white/90 text-gray-900"
                      : "bg-black/30 border-white/20 hover:bg-black/50 text-white"
                  } ${copied === `detail-${mode}` ? "opacity-60" : ""}`}
                >
                  {copied === `detail-${mode}` ? "Copied!" : `Copy ${mode === "rgb" ? "RGB" : mode}`}
                </button>
              ))}
              <button
                onClick={() => setSelectedColor(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  isLightColor(selected.hex)
                    ? "bg-white/70 border-black/20 hover:bg-white/90 text-gray-900"
                    : "bg-black/30 border-white/20 hover:bg-black/50 text-white"
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy mode selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Click swatch to copy:</span>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["name", "hex", "rgb"] as CopyMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setCopyMode(m)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                copyMode === m
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              {m === "rgb" ? "RGB" : m}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted">
          {filtered.length} color{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted py-16">No colors match your search.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((color) => {
            const rgb = hexToRgb(color.hex);
            const light = isLightColor(color.hex);
            const copyKey = color.name;
            const isCopied = copied === copyKey;
            const isSelected = selectedColor === color.name;

            return (
              <div
                key={color.name}
                className={`group rounded-xl overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-lg ${
                  isSelected ? "border-accent shadow-lg scale-105" : "border-transparent hover:border-accent/40"
                }`}
                onClick={() => {
                  setSelectedColor(isSelected ? null : color.name);
                  const val = getValueToCopy(color.hex, color.name, copyMode);
                  copyText(val, copyKey);
                }}
                title={`${color.name} • ${color.hex} • rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
              >
                {/* Swatch */}
                <div
                  className="h-20 w-full flex items-center justify-center"
                  style={{ background: color.hex }}
                >
                  {isCopied && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        light ? "bg-black/20 text-gray-900" : "bg-white/20 text-white"
                      }`}
                    >
                      Copied!
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="bg-surface px-2 py-1.5">
                  <div className="text-xs font-medium text-foreground truncate">{color.name}</div>
                  <div className="text-xs text-muted font-mono">{color.hex}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
