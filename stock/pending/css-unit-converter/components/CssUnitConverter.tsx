"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Unit definitions and conversion logic
// ---------------------------------------------------------------------------

type UnitKey = "px" | "rem" | "em" | "vw" | "vh" | "vmin" | "vmax" | "pt" | "cm" | "mm" | "in";

interface Config {
  rootFontSize: number; // px
  viewportWidth: number; // px
  viewportHeight: number; // px
}

const UNITS: { key: UnitKey; label: string; description: string }[] = [
  { key: "px",   label: "px",   description: "Pixels (absolute)" },
  { key: "rem",  label: "rem",  description: "Root em (relative to root font size)" },
  { key: "em",   label: "em",   description: "Em (relative to root font size here)" },
  { key: "vw",   label: "vw",   description: "Viewport width %" },
  { key: "vh",   label: "vh",   description: "Viewport height %" },
  { key: "vmin", label: "vmin", description: "Viewport min (smaller of vw/vh)" },
  { key: "vmax", label: "vmax", description: "Viewport max (larger of vw/vh)" },
  { key: "pt",   label: "pt",   description: "Points (1pt = 1.333px)" },
  { key: "cm",   label: "cm",   description: "Centimeters" },
  { key: "mm",   label: "mm",   description: "Millimeters" },
  { key: "in",   label: "in",   description: "Inches" },
];

/** Convert any CSS unit value to pixels */
function toPx(value: number, unit: UnitKey, cfg: Config): number {
  const vmin = Math.min(cfg.viewportWidth, cfg.viewportHeight);
  const vmax = Math.max(cfg.viewportWidth, cfg.viewportHeight);
  switch (unit) {
    case "px":   return value;
    case "rem":  return value * cfg.rootFontSize;
    case "em":   return value * cfg.rootFontSize;
    case "vw":   return (value / 100) * cfg.viewportWidth;
    case "vh":   return (value / 100) * cfg.viewportHeight;
    case "vmin": return (value / 100) * vmin;
    case "vmax": return (value / 100) * vmax;
    case "pt":   return value * (96 / 72);
    case "cm":   return value * (96 / 2.54);
    case "mm":   return value * (96 / 25.4);
    case "in":   return value * 96;
  }
}

/** Convert pixels to any CSS unit */
function fromPx(px: number, unit: UnitKey, cfg: Config): number {
  const vmin = Math.min(cfg.viewportWidth, cfg.viewportHeight);
  const vmax = Math.max(cfg.viewportWidth, cfg.viewportHeight);
  switch (unit) {
    case "px":   return px;
    case "rem":  return px / cfg.rootFontSize;
    case "em":   return px / cfg.rootFontSize;
    case "vw":   return (px / cfg.viewportWidth) * 100;
    case "vh":   return (px / cfg.viewportHeight) * 100;
    case "vmin": return (px / vmin) * 100;
    case "vmax": return (px / vmax) * 100;
    case "pt":   return px / (96 / 72);
    case "cm":   return px / (96 / 2.54);
    case "mm":   return px / (96 / 25.4);
    case "in":   return px / 96;
  }
}

function convert(value: number, from: UnitKey, to: UnitKey, cfg: Config): number {
  const px = toPx(value, from, cfg);
  return fromPx(px, to, cfg);
}

function formatResult(n: number): string {
  if (!isFinite(n)) return "—";
  // Up to 6 significant digits, strip trailing zeros
  const s = parseFloat(n.toPrecision(6)).toString();
  return s;
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title="Copy value"
      className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-700 transition-colors border border-gray-200 hover:border-indigo-300 shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CssUnitConverter() {
  // Config state
  const [rootFontSize, setRootFontSize] = useState<string>("16");
  const [viewportWidth, setViewportWidth] = useState<string>("1920");
  const [viewportHeight, setViewportHeight] = useState<string>("1080");
  const [showConfig, setShowConfig] = useState(false);

  // Converter state: track which field was last edited and its value
  const [activeUnit, setActiveUnit] = useState<UnitKey>("px");
  const [activeValue, setActiveValue] = useState<string>("");

  // Per-unit input values (what's shown in each field)
  const [inputValues, setInputValues] = useState<Record<UnitKey, string>>(
    Object.fromEntries(UNITS.map((u) => [u.key, ""])) as Record<UnitKey, string>
  );

  const cfg: Config = {
    rootFontSize: parseFloat(rootFontSize) || 16,
    viewportWidth: parseFloat(viewportWidth) || 1920,
    viewportHeight: parseFloat(viewportHeight) || 1080,
  };

  /** When a unit field changes, recompute all others */
  const handleUnitChange = useCallback(
    (unit: UnitKey, raw: string) => {
      setActiveUnit(unit);
      setActiveValue(raw);

      const num = parseFloat(raw);
      const newValues: Record<UnitKey, string> = {} as Record<UnitKey, string>;

      if (raw === "" || isNaN(num)) {
        // Clear all
        UNITS.forEach((u) => { newValues[u.key] = ""; });
        newValues[unit] = raw;
      } else {
        UNITS.forEach((u) => {
          if (u.key === unit) {
            newValues[u.key] = raw;
          } else {
            const result = convert(num, unit, u.key, cfg);
            newValues[u.key] = formatResult(result);
          }
        });
      }
      setInputValues(newValues);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cfg.rootFontSize, cfg.viewportWidth, cfg.viewportHeight]
  );

  /** When config changes, recompute from current active value */
  const recompute = useCallback(
    (newCfg: Config) => {
      const num = parseFloat(activeValue);
      if (activeValue === "" || isNaN(num)) return;
      const newValues: Record<UnitKey, string> = {} as Record<UnitKey, string>;
      UNITS.forEach((u) => {
        if (u.key === activeUnit) {
          newValues[u.key] = activeValue;
        } else {
          const result = convert(num, activeUnit, u.key, newCfg);
          newValues[u.key] = formatResult(result);
        }
      });
      setInputValues(newValues);
    },
    [activeUnit, activeValue]
  );

  const handleRootFontSizeChange = (v: string) => {
    setRootFontSize(v);
    recompute({ ...cfg, rootFontSize: parseFloat(v) || 16 });
  };

  const handleViewportWidthChange = (v: string) => {
    setViewportWidth(v);
    recompute({ ...cfg, viewportWidth: parseFloat(v) || 1920 });
  };

  const handleViewportHeightChange = (v: string) => {
    setViewportHeight(v);
    recompute({ ...cfg, viewportHeight: parseFloat(v) || 1080 });
  };

  const hasValue = UNITS.some((u) => inputValues[u.key] !== "");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Config panel toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Root: <span className="font-mono font-semibold text-gray-700">{rootFontSize}px</span>
          <span className="mx-2 text-gray-300">|</span>
          Viewport: <span className="font-mono font-semibold text-gray-700">{viewportWidth}×{viewportHeight}px</span>
        </p>
        <button
          onClick={() => setShowConfig((v) => !v)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
        >
          {showConfig ? "Hide Config" : "Config"}
        </button>
      </div>

      {/* Config fields */}
      {showConfig && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Root Font Size (px)</label>
              <input
                type="number"
                min="1"
                value={rootFontSize}
                onChange={(e) => handleRootFontSizeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">Used for rem and em</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Viewport Width (px)</label>
              <input
                type="number"
                min="1"
                value={viewportWidth}
                onChange={(e) => handleViewportWidthChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">Used for vw, vmin, vmax</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Viewport Height (px)</label>
              <input
                type="number"
                min="1"
                value={viewportHeight}
                onChange={(e) => handleViewportHeightChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">Used for vh, vmin, vmax</p>
            </div>
          </div>
        </div>
      )}

      {/* Converter card — all units simultaneously */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-5">
          Enter any value to convert all units
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {UNITS.map((unit) => (
            <div
              key={unit.key}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                activeUnit === unit.key && hasValue
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className="w-12 shrink-0">
                <span className="text-sm font-bold text-indigo-700">{unit.label}</span>
                <p className="text-xs text-gray-400 leading-tight mt-0.5 hidden sm:block" style={{ fontSize: "10px" }}>
                  {unit.description}
                </p>
              </div>
              <input
                type="number"
                value={inputValues[unit.key]}
                onChange={(e) => handleUnitChange(unit.key, e.target.value)}
                placeholder="0"
                className="flex-1 min-w-0 font-mono text-base bg-transparent outline-none text-gray-900 placeholder-gray-300"
              />
              {inputValues[unit.key] !== "" && (
                <CopyButton text={`${inputValues[unit.key]}${unit.key}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reference table */}
      {hasValue && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Reference Table — from {inputValues[activeUnit]}{activeUnit}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500 w-16">Unit</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Description</th>
                  <th className="text-right py-2 font-medium text-gray-500">Value</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {UNITS.map((unit) => {
                  const val = inputValues[unit.key];
                  const isActive = unit.key === activeUnit;
                  return (
                    <tr
                      key={unit.key}
                      className={isActive ? "bg-indigo-50" : "hover:bg-gray-50"}
                    >
                      <td className={`py-2.5 pr-4 font-bold font-mono ${isActive ? "text-indigo-700" : "text-gray-700"}`}>
                        {unit.label}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-500 text-xs">{unit.description}</td>
                      <td className={`py-2.5 text-right font-mono tabular-nums ${isActive ? "text-indigo-700 font-semibold" : "text-gray-800"}`}>
                        {val || "—"}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        {val && (
                          <CopyButton text={`${val}${unit.key}`} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick note about em vs rem */}
          <p className="mt-4 text-xs text-gray-400">
            Note: em and rem both use root font size ({rootFontSize}px) here. In real CSS, em compounds with parent context.
          </p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Unit Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert between px, rem, em, vw, vh, pt, and more. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Unit Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert between px, rem, em, vw, vh, pt, and more. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
