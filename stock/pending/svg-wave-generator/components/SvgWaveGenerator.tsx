"use client";

import { useState, useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WaveType = "sine" | "sharp" | "layered";

interface LayerConfig {
  color: string;
  opacity: number;
}

interface WaveConfig {
  amplitude: number;
  frequency: number;
  layers: number;
  waveType: WaveType;
  layerConfigs: LayerConfig[];
  bgColor: string;
  flipVertical: boolean;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Wave path generation
// ---------------------------------------------------------------------------

function generateWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  waveType: WaveType,
  layerIndex: number,
  totalLayers: number
): string {
  const points = 200;
  const phaseShift = (layerIndex / totalLayers) * Math.PI * 0.6;
  const verticalOffset = height * 0.45 + (layerIndex / Math.max(totalLayers - 1, 1)) * height * 0.15;

  let d = `M 0 ${height} `;
  d += `L 0 ${verticalOffset} `;

  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const t = (i / points) * Math.PI * 2 * frequency + phaseShift;

    let y: number;
    if (waveType === "sine") {
      y = verticalOffset + Math.sin(t) * amplitude;
    } else if (waveType === "sharp") {
      // Triangle wave
      const normalized = ((t % (Math.PI * 2)) / (Math.PI * 2));
      y = verticalOffset + (normalized < 0.5
        ? (normalized * 4 - 1) * amplitude
        : (3 - normalized * 4) * amplitude);
    } else {
      // Layered: combine two sine waves
      y = verticalOffset
        + Math.sin(t) * amplitude * 0.7
        + Math.sin(t * 2.3 + 0.5) * amplitude * 0.3;
    }

    if (i === 0) {
      d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    } else {
      d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    }
  }

  d += `L ${width} ${height} Z`;
  return d;
}

function generateSmoothWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  waveType: WaveType,
  layerIndex: number,
  totalLayers: number
): string {
  const segments = 60;
  const phaseShift = (layerIndex / totalLayers) * Math.PI * 0.6;
  const verticalOffset = height * 0.45 + (layerIndex / Math.max(totalLayers - 1, 1)) * height * 0.15;

  const getY = (t: number): number => {
    if (waveType === "sine") {
      return verticalOffset + Math.sin(t) * amplitude;
    } else if (waveType === "sharp") {
      const normalized = ((t % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
      return verticalOffset + (normalized < 0.5
        ? (normalized * 4 - 1) * amplitude
        : (3 - normalized * 4) * amplitude);
    } else {
      return verticalOffset
        + Math.sin(t) * amplitude * 0.7
        + Math.sin(t * 2.3 + 0.5) * amplitude * 0.3;
    }
  };

  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const t = (i / segments) * Math.PI * 2 * frequency + phaseShift;
    pts.push({ x, y: getY(t) });
  }

  // Build cubic bezier path for smooth curves
  let d = `M 0 ${height} L 0 ${pts[0].y.toFixed(2)} `;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    d += `C ${cpx.toFixed(2)} ${p0.y.toFixed(2)}, ${cpx.toFixed(2)} ${p1.y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `;
  }
  d += `L ${width} ${height} Z`;
  return d;
}

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------

function buildSvg(config: WaveConfig): string {
  const { width, height, amplitude, frequency, layers, waveType, layerConfigs, flipVertical } = config;
  const transform = flipVertical ? `scale(1,-1) translate(0,-${height})` : undefined;

  const paths = Array.from({ length: layers }, (_, i) => {
    const cfg = layerConfigs[i] ?? { color: "#6366f1", opacity: 1 };
    const d = waveType === "sharp"
      ? generateWavePath(width, height, amplitude, frequency, waveType, i, layers)
      : generateSmoothWavePath(width, height, amplitude, frequency, waveType, i, layers);
    return `  <path d="${d}" fill="${cfg.color}" fill-opacity="${cfg.opacity}" />`;
  });

  const inner = paths.join("\n");
  const groupOpen = transform ? `<g transform="${transform}">` : "<g>";
  const groupClose = "</g>";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none">\n${groupOpen}\n${inner}\n${groupClose}\n</svg>`;
}

// ---------------------------------------------------------------------------
// CSS snippet builder
// ---------------------------------------------------------------------------

function buildCssSnippet(slug: string): string {
  return `.section-divider {
  position: relative;
  overflow: hidden;
}

.section-divider::after {
  content: "";
  display: block;
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 80px;
  background-image: url("data:image/svg+xml,<svg ...paste SVG here... />");
  background-size: cover;
  background-repeat: no-repeat;
}`;
}

// ---------------------------------------------------------------------------
// Default layer configs
// ---------------------------------------------------------------------------

const DEFAULT_LAYER_COLORS = ["#6366f1", "#818cf8", "#a5b4fc"];
const DEFAULT_LAYER_OPACITIES = [1, 0.7, 0.5];

function defaultLayerConfigs(n: number): LayerConfig[] {
  return Array.from({ length: n }, (_, i) => ({
    color: DEFAULT_LAYER_COLORS[i] ?? "#6366f1",
    opacity: DEFAULT_LAYER_OPACITIES[i] ?? 0.5,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SvgWaveGenerator() {
  const [amplitude, setAmplitude] = useState(40);
  const [frequency, setFrequency] = useState(2);
  const [layers, setLayers] = useState(2);
  const [waveType, setWaveType] = useState<WaveType>("sine");
  const [layerConfigs, setLayerConfigs] = useState<LayerConfig[]>(defaultLayerConfigs(3));
  const [bgColor, setBgColor] = useState("#1e1b4b");
  const [flipVertical, setFlipVertical] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cssCopied, setCssCopied] = useState(false);

  const WIDTH = 1200;
  const HEIGHT = 160;

  const config: WaveConfig = {
    amplitude,
    frequency,
    layers,
    waveType,
    layerConfigs,
    bgColor,
    flipVertical,
    width: WIDTH,
    height: HEIGHT,
  };

  const svgString = useMemo(() => buildSvg(config), [
    amplitude, frequency, layers, waveType, layerConfigs, bgColor, flipVertical,
  ]);

  const cssSnippet = buildCssSnippet("section-divider");

  const handleCopySvg = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(svgString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [svgString]);

  const handleCopyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssSnippet);
      setCssCopied(true);
      setTimeout(() => setCssCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [cssSnippet]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wave-divider.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [svgString]);

  const handleLayerColor = (index: number, color: string) => {
    setLayerConfigs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], color };
      return next;
    });
  };

  const handleLayerOpacity = (index: number, opacity: number) => {
    setLayerConfigs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], opacity };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div
          className="relative w-full"
          style={{ backgroundColor: bgColor, minHeight: "200px" }}
        >
          <div className="px-6 py-8 text-center">
            <p className="text-white/60 text-sm">Section content above the wave</p>
          </div>
          <div
            className="w-full"
            style={{ lineHeight: 0 }}
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
        </div>
        <div className="bg-white px-6 py-4 text-center">
          <p className="text-gray-400 text-sm">Section below the wave divider</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Wave settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Wave Settings</h2>

          {/* Wave type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wave Type</label>
            <div className="flex gap-2">
              {(["sine", "sharp", "layered"] as WaveType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setWaveType(t)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    waveType === t
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {t === "sine" ? "Gentle Sine" : t === "sharp" ? "Sharp" : "Layered"}
                </button>
              ))}
            </div>
          </div>

          {/* Amplitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amplitude <span className="text-gray-400 font-normal">({amplitude}px)</span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>10</span><span>100</span>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency <span className="text-gray-400 font-normal">({frequency} cycles)</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>1</span><span>5</span>
            </div>
          </div>

          {/* Layers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layers <span className="text-gray-400 font-normal">({layers})</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setLayers(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    layers === n
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Flip vertical */}
          <div className="flex items-center gap-3">
            <button
              role="switch"
              aria-checked={flipVertical}
              onClick={() => setFlipVertical((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flipVertical ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  flipVertical ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">Flip Vertical</label>
          </div>
        </div>

        {/* Right: Color settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Colors</h2>

          {/* Background color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview Background</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
              />
              <span className="text-sm font-mono text-gray-500">{bgColor}</span>
            </div>
          </div>

          {/* Layer colors */}
          {Array.from({ length: layers }, (_, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layer {i + 1} Color &amp; Opacity
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={layerConfigs[i]?.color ?? DEFAULT_LAYER_COLORS[i]}
                  onChange={(e) => handleLayerColor(i, e.target.value)}
                  className="h-10 w-16 rounded border border-gray-200 cursor-pointer p-0.5"
                />
                <span className="text-sm font-mono text-gray-500 w-20">
                  {layerConfigs[i]?.color ?? DEFAULT_LAYER_COLORS[i]}
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={layerConfigs[i]?.opacity ?? DEFAULT_LAYER_OPACITIES[i]}
                  onChange={(e) => handleLayerOpacity(i, Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-xs text-gray-400 w-8 text-right">
                  {Math.round((layerConfigs[i]?.opacity ?? DEFAULT_LAYER_OPACITIES[i]) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output: SVG Code */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Inline SVG Code</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy SVG
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download SVG
            </button>
          </div>
        </div>
        <pre className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-all max-h-48">
          {svgString}
        </pre>
      </div>

      {/* Output: CSS Snippet */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">CSS Section Divider Usage</h2>
          <button
            onClick={handleCopyCss}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            {cssCopied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy CSS
              </>
            )}
          </button>
        </div>
        <pre className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">
          {cssSnippet}
        </pre>
        <p className="text-xs text-gray-500">
          Copy the SVG code above, URL-encode it, and replace <code className="bg-gray-100 px-1 rounded font-mono">...paste SVG here...</code> in the CSS snippet to use it as a background image.
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this SVG Wave Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate smooth wave SVG dividers for web pages. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this SVG Wave Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate smooth wave SVG dividers for web pages. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
