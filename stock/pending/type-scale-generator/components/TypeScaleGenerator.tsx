"use client";

import { useState, useMemo } from "react";

const RATIOS = [
  { label: "Minor Second", value: 1.067 },
  { label: "Major Second", value: 1.125 },
  { label: "Minor Third", value: 1.2 },
  { label: "Major Third", value: 1.25 },
  { label: "Perfect Fourth", value: 1.333 },
  { label: "Augmented Fourth", value: 1.414 },
  { label: "Perfect Fifth", value: 1.5 },
  { label: "Golden Ratio", value: 1.618 },
  { label: "Custom", value: 0 },
];

const STEPS = [-2, -1, 0, 1, 2, 3, 4, 5];

const STEP_NAMES = ["2xs", "xs", "sm", "base", "lg", "xl", "2xl", "3xl"];

type OutputTab = "css" | "tailwind" | "scss";

export default function TypeScaleGenerator() {
  const [baseSize, setBaseSize] = useState(16);
  const [selectedRatio, setSelectedRatio] = useState(1.333);
  const [customRatio, setCustomRatio] = useState("1.333");
  const [isCustom, setIsCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<OutputTab>("css");
  const [copied, setCopied] = useState(false);

  const ratio = isCustom ? parseFloat(customRatio) || 1.333 : selectedRatio;

  const scale = useMemo(() => {
    return STEPS.map((step, i) => {
      const size = baseSize * Math.pow(ratio, step);
      return {
        step,
        name: STEP_NAMES[i],
        px: Math.round(size * 100) / 100,
        rem: Math.round((size / 16) * 1000) / 1000,
      };
    });
  }, [baseSize, ratio]);

  const cssOutput = useMemo(() => {
    const lines = scale.map(
      (s) => `  --font-size-${s.name}: ${s.rem.toFixed(3)}rem; /* ${s.px.toFixed(2)}px */`
    );
    return `:root {\n${lines.join("\n")}\n}`;
  }, [scale]);

  const tailwindOutput = useMemo(() => {
    const lines = scale.map(
      (s) => `      '${s.name}': '${s.rem.toFixed(3)}rem', // ${s.px.toFixed(2)}px`
    );
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      fontSize: {\n${lines.join("\n")}\n      },\n    },\n  },\n};`;
  }, [scale]);

  const scssOutput = useMemo(() => {
    const lines = scale.map(
      (s) => `$font-size-${s.name}: ${s.rem.toFixed(3)}rem; // ${s.px.toFixed(2)}px`
    );
    return lines.join("\n");
  }, [scale]);

  const outputMap: Record<OutputTab, string> = {
    css: cssOutput,
    tailwind: tailwindOutput,
    scss: scssOutput,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputMap[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleRatioChange = (value: number, label: string) => {
    if (label === "Custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setSelectedRatio(value);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls */}
      <div className="bg-panel rounded-lg border border-panel-border p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Base size */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Base Font Size
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={8}
                max={32}
                value={baseSize}
                onChange={(e) => setBaseSize(Number(e.target.value) || 16)}
                className="w-24 px-3 py-2 rounded-md border border-panel-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-sm text-muted">px</span>
              <input
                type="range"
                min={8}
                max={32}
                value={baseSize}
                onChange={(e) => setBaseSize(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
            </div>
          </div>

          {/* Scale ratio */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Scale Ratio
            </label>
            <div className="flex flex-col gap-2">
              <select
                value={isCustom ? 0 : selectedRatio}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const opt = RATIOS.find((r) => r.value === val);
                  handleRatioChange(val, opt?.label ?? "");
                }}
                className="w-full px-3 py-2 rounded-md border border-panel-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {RATIOS.map((r) => (
                  <option key={r.label} value={r.value}>
                    {r.label}{r.value > 0 ? ` (${r.value})` : ""}
                  </option>
                ))}
              </select>
              {isCustom && (
                <input
                  type="number"
                  step="0.001"
                  min="1.001"
                  max="3"
                  value={customRatio}
                  onChange={(e) => setCustomRatio(e.target.value)}
                  placeholder="e.g. 1.25"
                  className="w-full px-3 py-2 rounded-md border border-panel-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-panel rounded-lg border border-panel-border overflow-hidden">
        <div className="px-5 py-3 border-b border-panel-border">
          <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
            Preview — ratio {ratio.toFixed(3)}
          </h2>
        </div>
        <div className="p-5 space-y-3 overflow-x-auto">
          {[...scale].reverse().map((s) => (
            <div key={s.step} className="flex items-baseline gap-4 min-w-0">
              <div className="w-14 shrink-0 text-right">
                <span className="text-xs text-muted font-mono">{s.name}</span>
              </div>
              <div className="w-20 shrink-0 text-right">
                <span className="text-xs text-muted font-mono">{s.px.toFixed(1)}px</span>
              </div>
              <div
                className="text-foreground font-medium leading-tight truncate"
                style={{ fontSize: `${s.px}px` }}
              >
                The quick brown fox
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output tabs */}
      <div className="bg-panel rounded-lg border border-panel-border overflow-hidden">
        <div className="flex items-center justify-between border-b border-panel-border px-2">
          <div className="flex">
            {(["css", "tailwind", "scss"] as OutputTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "text-foreground border-b-2 border-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab === "css" && "CSS Custom Properties"}
                {tab === "tailwind" && "Tailwind Config"}
                {tab === "scss" && "SCSS Variables"}
              </button>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs rounded-md bg-accent text-white hover:bg-accent/80 transition-colors mr-2"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="p-5 text-xs font-mono text-foreground overflow-x-auto whitespace-pre leading-relaxed">
          {outputMap[activeTab]}
        </pre>
      </div>
    </div>
  );
}
