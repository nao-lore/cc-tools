"use client";
import { useState, useMemo } from "react";

// Color vision deficiency simulation matrices
// Using standard Machado et al. 2009 simulation matrices
type SimMatrix = [number, number, number, number, number, number, number, number, number];

const CVD_TYPES: {
  id: string;
  name: string;
  description: string;
  prevalence: string;
  matrix: SimMatrix;
}[] = [
  {
    id: "normal",
    name: "Normal Vision",
    description: "Standard color vision",
    prevalence: "~92% of people",
    matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  },
  {
    id: "protanopia",
    name: "Protanopia",
    description: "Red-blind — cannot perceive red",
    prevalence: "~1% of males",
    matrix: [0.152, 1.053, -0.205, 0.115, 0.786, 0.099, -0.004, -0.048, 1.052],
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia",
    description: "Green-blind — cannot perceive green",
    prevalence: "~1% of males",
    matrix: [0.367, 0.861, -0.228, 0.280, 0.673, 0.047, -0.012, 0.043, 0.969],
  },
  {
    id: "tritanopia",
    name: "Tritanopia",
    description: "Blue-blind — cannot perceive blue",
    prevalence: "~0.01% of people",
    matrix: [1.256, -0.077, -0.179, -0.078, 0.931, 0.148, 0.005, 0.691, 0.304],
  },
  {
    id: "protanomaly",
    name: "Protanomaly",
    description: "Red-weak — reduced red sensitivity",
    prevalence: "~1% of males",
    matrix: [0.458, 0.679, -0.137, 0.168, 0.789, 0.043, 0.005, -0.031, 1.026],
  },
  {
    id: "deuteranomaly",
    name: "Deuteranomaly",
    description: "Green-weak — most common CVD",
    prevalence: "~5% of males",
    matrix: [0.547, 0.571, -0.118, 0.185, 0.727, 0.088, 0.004, 0.028, 0.968],
  },
  {
    id: "achromatopsia",
    name: "Achromatopsia",
    description: "Total color blindness — sees only grey",
    prevalence: "~0.003% of people",
    matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  },
];

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

function applyMatrix(rgb: [number, number, number], matrix: SimMatrix): [number, number, number] {
  const [r, g, b] = rgb.map((v) => v / 255);
  return [
    Math.round((matrix[0] * r + matrix[1] * g + matrix[2] * b) * 255),
    Math.round((matrix[3] * r + matrix[4] * g + matrix[5] * b) * 255),
    Math.round((matrix[6] * r + matrix[7] * g + matrix[8] * b) * 255),
  ];
}

function simulateColor(hex: string, matrix: SimMatrix): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const simRgb = applyMatrix(rgb, matrix);
  return rgbToHex(...simRgb);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWcagLevel(ratio: number): { level: string; color: string } {
  if (ratio >= 7) return { level: "AAA", color: "text-green-600" };
  if (ratio >= 4.5) return { level: "AA", color: "text-blue-600" };
  if (ratio >= 3) return { level: "AA Large", color: "text-yellow-600" };
  return { level: "Fail", color: "text-red-600" };
}

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. 色覚シミュレーション。";

const PRESET_COMBOS = [
  { label: "Black on White", fg: "#000000", bg: "#ffffff" },
  { label: "White on Blue", fg: "#ffffff", bg: "#0000ff" },
  { label: "Red on Green", fg: "#ff0000", bg: "#00aa00" },
  { label: "Purple on Orange", fg: "#6600cc", bg: "#ff8800" },
  { label: "Dark on Yellow", fg: "#333333", bg: "#ffff00" },
];

export default function ColorBlindnessSimText() {
  const [fgColor, setFgColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [customText, setCustomText] = useState(SAMPLE_TEXT);
  const [fontSize, setFontSize] = useState(18);
  const [selectedTypes, setSelectedTypes] = useState(new Set(CVD_TYPES.map((t) => t.id)));

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (id === "normal") return next; // always show normal
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const simulations = useMemo(() => {
    return CVD_TYPES.filter((t) => selectedTypes.has(t.id)).map((type) => {
      const simFg = simulateColor(fgColor, type.matrix);
      const simBg = simulateColor(bgColor, type.matrix);
      const ratio = getContrastRatio(simFg, simBg);
      const wcag = getWcagLevel(ratio);
      return { ...type, simFg, simBg, ratio, wcag };
    });
  }, [fgColor, bgColor, selectedTypes]);

  const normalRatio = getContrastRatio(fgColor, bgColor);
  const normalWcag = getWcagLevel(normalRatio);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Color & Text Settings</h2>

        {/* Color pickers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COMBOS.map((combo) => (
              <button
                key={combo.label}
                onClick={() => { setFgColor(combo.fg); setBgColor(combo.bg); }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-violet-300 transition-colors"
                style={{ color: combo.fg, backgroundColor: combo.bg }}
              >
                {combo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-1">Sample text</label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          />
        </div>

        {/* Font size */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600 shrink-0">Font size</label>
          <input
            type="range"
            min={12}
            max={36}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="flex-1 accent-violet-600"
          />
          <span className="text-sm font-medium text-gray-700 w-12">{fontSize}px</span>
        </div>

        {/* WCAG result for original */}
        <div className="mt-4 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
          <span className="text-xs text-gray-600">Original contrast ratio:</span>
          <span className="font-bold text-gray-800">{normalRatio.toFixed(2)}:1</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${normalWcag.color} bg-current/10`} style={{ backgroundColor: "currentColor" }}>
            <span className={normalWcag.color}>WCAG {normalWcag.level}</span>
          </span>
        </div>
      </div>

      {/* CVD type filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Color Vision Types to Simulate</p>
        <div className="flex flex-wrap gap-2">
          {CVD_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleType(type.id)}
              disabled={type.id === "normal"}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all disabled:cursor-default ${
                selectedTypes.has(type.id)
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation previews */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Simulation Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{sim.name}</p>
                    <p className="text-xs text-gray-500">{sim.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${sim.wcag.color}`}>WCAG {sim.wcag.level}</span>
                    <p className="text-xs text-gray-400">{sim.ratio.toFixed(2)}:1</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className="px-5 py-4 min-h-16 flex items-center"
                style={{ backgroundColor: sim.simBg, color: sim.simFg, fontSize: `${fontSize}px` }}
              >
                {customText || "Sample text"}
              </div>

              {/* Color swatches */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: sim.simFg }} />
                  <span className="text-xs font-mono text-gray-500">{sim.simFg}</span>
                </div>
                <span className="text-gray-300">on</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: sim.simBg }} />
                  <span className="text-xs font-mono text-gray-500">{sim.simBg}</span>
                </div>
                <span className="ml-auto text-xs text-gray-400">{sim.prevalence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WCAG reference */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">WCAG 2.1 Contrast Requirements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { level: "AA", ratio: "4.5:1", desc: "Normal text (min)", bg: "bg-blue-50", text: "text-blue-800" },
            { level: "AA Large", ratio: "3:1", desc: "Large text (18pt+ or 14pt bold)", bg: "bg-yellow-50", text: "text-yellow-800" },
            { level: "AAA", ratio: "7:1", desc: "Enhanced — highest accessibility", bg: "bg-green-50", text: "text-green-800" },
          ].map((w) => (
            <div key={w.level} className={`${w.bg} rounded-xl p-3`}>
              <p className={`font-bold text-sm ${w.text}`}>WCAG {w.level}</p>
              <p className={`font-mono text-lg font-bold ${w.text}`}>{w.ratio}</p>
              <p className="text-gray-600 mt-0.5">{w.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Simulation uses Machado et al. (2009) matrices. Results are approximations — actual perception varies by individual.
          Always test with real users when accessibility is critical.
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Color Blindness Text Simulator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Simulate text color appearance for different types of color vision deficiency. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Color Blindness Text Simulator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Simulate text color appearance for different types of color vision deficiency. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Blindness Text Simulator",
  "description": "Simulate text color appearance for different types of color vision deficiency",
  "url": "https://tools.loresync.dev/color-blindness-sim-text",
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
