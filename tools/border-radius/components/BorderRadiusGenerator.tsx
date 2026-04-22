"use client";

import { useState, useCallback, useMemo } from "react";

type Unit = "px" | "%" | "em";

interface CornerValues {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

interface EllipticalValues {
  tlH: number; tlV: number;
  trH: number; trV: number;
  brH: number; brV: number;
  blH: number; blV: number;
}

interface Preset {
  name: string;
  label: string;
  values: CornerValues;
  elliptical?: EllipticalValues;
  unit?: Unit;
}

const PRESETS: Preset[] = [
  { name: "rounded", label: "Rounded", values: { tl: 8, tr: 8, br: 8, bl: 8 } },
  { name: "pill", label: "Pill", values: { tl: 100, tr: 100, br: 100, bl: 100 }, unit: "px" },
  { name: "circle", label: "Circle", values: { tl: 50, tr: 50, br: 50, bl: 50 }, unit: "%" },
  { name: "blob", label: "Blob", values: { tl: 60, tr: 40, br: 60, bl: 40 }, elliptical: { tlH: 60, tlV: 40, trH: 40, trV: 60, brH: 60, brV: 40, blH: 40, blV: 60 }, unit: "%" },
  { name: "leaf", label: "Leaf", values: { tl: 0, tr: 100, br: 0, bl: 100 }, unit: "px" },
  { name: "egg", label: "Egg", values: { tl: 50, tr: 50, br: 50, bl: 50 }, elliptical: { tlH: 50, tlV: 60, trH: 50, trV: 60, brH: 50, brV: 40, blH: 50, blV: 40 }, unit: "%" },
  { name: "drop", label: "Drop", values: { tl: 0, tr: 50, br: 50, bl: 50 }, unit: "%" },
  { name: "ticket", label: "Ticket", values: { tl: 12, tr: 12, br: 12, bl: 12 } },
];

export default function BorderRadiusGenerator() {
  const [corners, setCorners] = useState<CornerValues>({ tl: 16, tr: 16, br: 16, bl: 16 });
  const [elliptical, setElliptical] = useState<EllipticalValues>({
    tlH: 16, tlV: 16, trH: 16, trV: 16, brH: 16, brV: 16, blH: 16, blV: 16,
  });
  const [linked, setLinked] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const [unit, setUnit] = useState<Unit>("px");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [borderColor, setBorderColor] = useState("#1d4ed8");
  const [borderWidth, setBorderWidth] = useState(2);
  const [boxSize, setBoxSize] = useState(200);
  const [copied, setCopied] = useState(false);

  const handleCornerChange = useCallback((corner: keyof CornerValues, value: number) => {
    if (linked) {
      setCorners({ tl: value, tr: value, br: value, bl: value });
      setElliptical({
        tlH: value, tlV: value, trH: value, trV: value,
        brH: value, brV: value, blH: value, blV: value,
      });
    } else {
      setCorners(prev => ({ ...prev, [corner]: value }));
      const hKey = `${corner}H` as keyof EllipticalValues;
      const vKey = `${corner}V` as keyof EllipticalValues;
      setElliptical(prev => ({ ...prev, [hKey]: value, [vKey]: value }));
    }
  }, [linked]);

  const handleEllipticalChange = useCallback((key: keyof EllipticalValues, value: number) => {
    setElliptical(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    if (preset.unit) setUnit(preset.unit);
    setCorners(preset.values);
    if (preset.elliptical) {
      setElliptical(preset.elliptical);
      setAdvanced(true);
    } else {
      setElliptical({
        tlH: preset.values.tl, tlV: preset.values.tl,
        trH: preset.values.tr, trV: preset.values.tr,
        brH: preset.values.br, brV: preset.values.br,
        blH: preset.values.bl, blV: preset.values.bl,
      });
    }
    setLinked(preset.values.tl === preset.values.tr && preset.values.tr === preset.values.br && preset.values.br === preset.values.bl && !preset.elliptical);
  }, []);

  const maxVal = unit === "%" ? 50 : unit === "em" ? 20 : 200;

  const cssValue = useMemo(() => {
    const u = unit;
    if (advanced) {
      const { tlH, tlV, trH, trV, brH, brV, blH, blV } = elliptical;
      const hSame = tlH === trH && trH === brH && brH === blH;
      const vSame = tlV === trV && trV === brV && brV === blV;
      if (hSame && vSame && tlH === tlV) {
        return `${tlH}${u}`;
      }
      return `${tlH}${u} ${trH}${u} ${brH}${u} ${blH}${u} / ${tlV}${u} ${trV}${u} ${brV}${u} ${blV}${u}`;
    }
    const { tl, tr, br, bl } = corners;
    if (tl === tr && tr === br && br === bl) return `${tl}${u}`;
    if (tl === br && tr === bl) return `${tl}${u} ${tr}${u}`;
    if (tr === bl) return `${tl}${u} ${tr}${u} ${br}${u}`;
    return `${tl}${u} ${tr}${u} ${br}${u} ${bl}${u}`;
  }, [corners, elliptical, unit, advanced]);

  const cssLine = `border-radius: ${cssValue};`;

  const previewStyle = useMemo(() => {
    const u = unit;
    const br = advanced
      ? `${elliptical.tlH}${u} ${elliptical.trH}${u} ${elliptical.brH}${u} ${elliptical.blH}${u} / ${elliptical.tlV}${u} ${elliptical.trV}${u} ${elliptical.brV}${u} ${elliptical.blV}${u}`
      : `${corners.tl}${u} ${corners.tr}${u} ${corners.br}${u} ${corners.bl}${u}`;
    return {
      width: boxSize,
      height: boxSize,
      borderRadius: br,
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: borderWidth,
      borderStyle: "solid" as const,
      transition: "border-radius 0.2s ease, width 0.2s ease, height 0.2s ease",
    };
  }, [corners, elliptical, unit, advanced, bgColor, borderColor, borderWidth, boxSize]);

  const copyCSS = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = cssLine;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [cssLine]);

  const cornerLabels: { key: keyof CornerValues; label: string; hKey: keyof EllipticalValues; vKey: keyof EllipticalValues }[] = [
    { key: "tl", label: "Top Left", hKey: "tlH", vKey: "tlV" },
    { key: "tr", label: "Top Right", hKey: "trH", vKey: "trV" },
    { key: "br", label: "Bottom Right", hKey: "brH", vKey: "brV" },
    { key: "bl", label: "Bottom Left", hKey: "blH", vKey: "blV" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Link toggle */}
        <button
          onClick={() => setLinked(!linked)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            linked
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {linked ? (
              <>
                <path d="M6.5 9.5L9.5 6.5" />
                <path d="M4.5 8.5L3 10a2.12 2.12 0 003 3l1.5-1.5" />
                <path d="M11.5 7.5L13 6a2.12 2.12 0 00-3-3L8.5 4.5" />
              </>
            ) : (
              <>
                <path d="M4.5 8.5L3 10a2.12 2.12 0 003 3l1.5-1.5" />
                <path d="M11.5 7.5L13 6a2.12 2.12 0 00-3-3L8.5 4.5" />
                <path d="M2 14L14 2" strokeOpacity="0.4" />
              </>
            )}
          </svg>
          {linked ? "Linked" : "Unlinked"}
        </button>

        {/* Advanced toggle */}
        <button
          onClick={() => setAdvanced(!advanced)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            advanced
              ? "bg-purple-50 border-purple-200 text-purple-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="8" cy="8" rx="6" ry="4" />
          </svg>
          Elliptical
        </button>

        {/* Unit toggle */}
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {(["px", "%", "em"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                unit === u
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Preview + Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-8" style={{ minHeight: 320 }}>
          <div style={previewStyle} />
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {cornerLabels.map(({ key, label, hKey, vKey }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {!advanced && (
                  <span className="text-sm text-gray-500 font-mono tabular-nums w-16 text-right">
                    {corners[key]}{unit}
                  </span>
                )}
              </div>
              {advanced ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5">H</span>
                    <input
                      type="range"
                      min={0}
                      max={maxVal}
                      value={elliptical[hKey]}
                      onChange={(e) => handleEllipticalChange(hKey, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 font-mono tabular-nums w-16 text-right">
                      {elliptical[hKey]}{unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5">V</span>
                    <input
                      type="range"
                      min={0}
                      max={maxVal}
                      value={elliptical[vKey]}
                      onChange={(e) => handleEllipticalChange(vKey, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 font-mono tabular-nums w-16 text-right">
                      {elliptical[vKey]}{unit}
                    </span>
                  </div>
                </div>
              ) : (
                <input
                  type="range"
                  min={0}
                  max={maxVal}
                  value={corners[key]}
                  onChange={(e) => handleCornerChange(key, Number(e.target.value))}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Generated CSS</span>
          <button
            onClick={copyCSS}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 checkmark-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy CSS
              </>
            )}
          </button>
        </div>
        <code className="block text-sm font-mono text-gray-800 bg-white rounded-lg border border-gray-200 px-4 py-3">
          {cssLine}
        </code>
      </div>

      {/* Presets */}
      <div>
        <span className="text-sm font-medium text-gray-500 mb-3 block">Presets</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const u = preset.unit || "px";
            const pBr = preset.elliptical
              ? `${preset.elliptical.tlH}${u} ${preset.elliptical.trH}${u} ${preset.elliptical.brH}${u} ${preset.elliptical.blH}${u} / ${preset.elliptical.tlV}${u} ${preset.elliptical.trV}${u} ${preset.elliptical.brV}${u} ${preset.elliptical.blV}${u}`
              : `${preset.values.tl}${u} ${preset.values.tr}${u} ${preset.values.br}${u} ${preset.values.bl}${u}`;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-10 h-10 bg-blue-500 transition-all"
                  style={{ borderRadius: pBr }}
                />
                <span className="text-xs text-gray-500 group-hover:text-gray-700">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Customization */}
      <details className="group">
        <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
          Preview Customization
        </summary>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-500">{bgColor}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-500">{borderColor}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Border Width</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={20}
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-mono text-gray-500 w-8">{borderWidth}px</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Box Size</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={80}
                max={360}
                value={boxSize}
                onChange={(e) => setBoxSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-mono text-gray-500 w-10">{boxSize}px</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
