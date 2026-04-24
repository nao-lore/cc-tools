"use client";

import { useState, useMemo } from "react";

type Mode = "calculate" | "reverse";

const RATIO_PRESETS = [
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "21:9", w: 21, h: 9 },
  { label: "1:1", w: 1, h: 1 },
  { label: "9:16", w: 9, h: 16 },
];

const RESOLUTION_PRESETS = [
  { label: "720p", w: 1280, h: 720 },
  { label: "1080p", w: 1920, h: 1080 },
  { label: "4K", w: 3840, h: 2160 },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(w: number, h: number): { rw: number; rh: number } {
  if (w <= 0 || h <= 0) return { rw: 0, rh: 0 };
  const g = gcd(Math.round(w), Math.round(h));
  return { rw: Math.round(w) / g, rh: Math.round(h) / g };
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

export default function AspectRatioCalculator() {
  const [mode, setMode] = useState<Mode>("calculate");

  // Calculate mode: width + height → ratio
  const [calcWidth, setCalcWidth] = useState("");
  const [calcHeight, setCalcHeight] = useState("");

  // Reverse mode: ratio + one dimension → other
  const [revRatioW, setRevRatioW] = useState("16");
  const [revRatioH, setRevRatioH] = useState("9");
  const [revKnownDim, setRevKnownDim] = useState<"width" | "height">("width");
  const [revKnownVal, setRevKnownVal] = useState("");

  // Calculate mode result
  const calcResult = useMemo(() => {
    const w = parseFloat(calcWidth);
    const h = parseFloat(calcHeight);
    if (!w || !h || w <= 0 || h <= 0) return null;
    const { rw, rh } = simplifyRatio(w, h);
    return { rw, rh, decimal: (w / h).toFixed(4) };
  }, [calcWidth, calcHeight]);

  // Reverse mode result
  const revResult = useMemo(() => {
    const rw = parseFloat(revRatioW);
    const rh = parseFloat(revRatioH);
    const val = parseFloat(revKnownVal);
    if (!rw || !rh || rw <= 0 || rh <= 0 || !val || val <= 0) return null;
    if (revKnownDim === "width") {
      const height = Math.round((val * rh) / rw);
      return { width: Math.round(val), height };
    } else {
      const width = Math.round((val * rw) / rh);
      return { width, height: Math.round(val) };
    }
  }, [revRatioW, revRatioH, revKnownDim, revKnownVal]);

  // Preview rectangle dimensions (max 280px wide, 200px tall)
  const previewDims = useMemo(() => {
    let w: number, h: number;
    if (mode === "calculate" && calcResult) {
      w = calcResult.rw;
      h = calcResult.rh;
    } else if (mode === "reverse" && revResult) {
      w = revResult.width;
      h = revResult.height;
    } else {
      return null;
    }
    const maxW = 280;
    const maxH = 180;
    const scale = Math.min(maxW / w, maxH / h);
    return { width: Math.round(w * scale), height: Math.round(h * scale) };
  }, [mode, calcResult, revResult]);

  const activeRatio =
    mode === "calculate" && calcResult
      ? `${calcResult.rw}:${calcResult.rh}`
      : mode === "reverse" && revResult
      ? `${revRatioW}:${revRatioH}`
      : null;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex gap-2 mb-5">
          {(["calculate", "reverse"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === m
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted hover:border-primary/50"
              }`}
            >
              {m === "calculate" ? "Width & Height → Ratio" : "Ratio → Dimensions"}
            </button>
          ))}
        </div>

        {mode === "calculate" ? (
          <>
            {/* Resolution presets */}
            <div className="mb-4">
              <p className="text-xs text-muted mb-2">Resolution presets</p>
              <div className="flex flex-wrap gap-2">
                {RESOLUTION_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setCalcWidth(String(p.w));
                      setCalcHeight(String(p.h));
                    }}
                    className="px-3 py-1 text-xs rounded-md border border-border bg-accent hover:border-primary/50 transition-all font-mono"
                  >
                    {p.label} ({p.w}×{p.h})
                  </button>
                ))}
              </div>
            </div>

            {/* Width / Height inputs */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-muted mb-1">Width</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1920"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(e.target.value.replace(/[^0-9]/g, ""))}
                    className={inputClass}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">px</span>
                </div>
              </div>
              <div className="flex items-end pb-2.5 text-muted font-bold">×</div>
              <div className="flex-1">
                <label className="block text-xs text-muted mb-1">Height</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1080"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value.replace(/[^0-9]/g, ""))}
                    className={inputClass}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">px</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Ratio presets */}
            <div className="mb-4">
              <p className="text-xs text-muted mb-2">Ratio presets</p>
              <div className="flex flex-wrap gap-2">
                {RATIO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setRevRatioW(String(p.w));
                      setRevRatioH(String(p.h));
                    }}
                    className={`px-3 py-1 text-xs rounded-md border transition-all font-mono ${
                      revRatioW === String(p.w) && revRatioH === String(p.h)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-accent hover:border-primary/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio inputs */}
            <div className="flex gap-2 items-end mb-4">
              <div className="w-24">
                <label className="block text-xs text-muted mb-1">Ratio W</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={revRatioW}
                  onChange={(e) => setRevRatioW(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
                />
              </div>
              <div className="pb-2.5 text-muted font-bold text-lg">:</div>
              <div className="w-24">
                <label className="block text-xs text-muted mb-1">Ratio H</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={revRatioH}
                  onChange={(e) => setRevRatioH(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
                />
              </div>
            </div>

            {/* Known dimension toggle */}
            <div className="mb-4">
              <p className="text-xs text-muted mb-2">Known dimension</p>
              <div className="flex gap-2">
                {(["width", "height"] as const).map((dim) => (
                  <button
                    key={dim}
                    onClick={() => setRevKnownDim(dim)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      revKnownDim === dim
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted hover:border-primary/50"
                    }`}
                  >
                    {dim.charAt(0).toUpperCase() + dim.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Known value input */}
            <div>
              <label className="block text-xs text-muted mb-1">
                {revKnownDim === "width" ? "Width" : "Height"} (px)
              </label>
              <div className="relative max-w-[200px]">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1920"
                  value={revKnownVal}
                  onChange={(e) => setRevKnownVal(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">px</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Result card */}
      {mode === "calculate" && calcResult && (
        <div className="bg-card border-2 border-primary/30 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-sm mb-4">Result</h2>
          <div className="divide-y divide-border">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">Simplified ratio</span>
              <span className="text-2xl font-bold font-mono text-primary">
                {calcResult.rw}:{calcResult.rh}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">Decimal ratio</span>
              <span className="text-sm font-mono">{calcResult.decimal}</span>
            </div>
          </div>
        </div>
      )}

      {mode === "reverse" && revResult && (
        <div className="bg-card border-2 border-primary/30 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-sm mb-4">Result</h2>
          <div className="divide-y divide-border">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">Width</span>
              <span className="text-lg font-bold font-mono">{revResult.width} px</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">Height</span>
              <span className="text-lg font-bold font-mono">{revResult.height} px</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">Dimensions</span>
              <span className="text-sm font-mono">{revResult.width} × {revResult.height}</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual preview */}
      {previewDims && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">
            Visual Preview
            {activeRatio && (
              <span className="ml-2 text-xs text-muted font-normal">({activeRatio})</span>
            )}
          </h3>
          <div className="flex justify-center items-center min-h-[200px]">
            <div
              className="relative bg-primary/10 border-2 border-primary/40 rounded flex items-center justify-center"
              style={{ width: previewDims.width, height: previewDims.height }}
            >
              <span className="text-xs text-primary/60 font-mono select-none">
                {activeRatio}
              </span>
              {/* Corner marks */}
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/60 rounded-tl" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/60 rounded-tr" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/60 rounded-bl" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/60 rounded-br" />
            </div>
          </div>
        </div>
      )}

      {/* Common ratios reference */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">Common Aspect Ratios</h3>
        <div className="space-y-1">
          {[
            { ratio: "16:9", desc: "HD video, YouTube, most monitors" },
            { ratio: "4:3", desc: "Classic TV, older monitors" },
            { ratio: "21:9", desc: "Ultrawide monitors, cinema" },
            { ratio: "1:1", desc: "Square, Instagram posts" },
            { ratio: "9:16", desc: "Portrait video, Stories, Reels" },
            { ratio: "3:2", desc: "DSLR photos, 35mm film" },
            { ratio: "2:1", desc: "Univisium, some streaming content" },
          ].map(({ ratio, desc }) => (
            <div
              key={ratio}
              className="flex justify-between items-center px-3 py-2 rounded-lg text-sm hover:bg-accent transition-all"
            >
              <span className="font-mono font-bold text-primary">{ratio}</span>
              <span className="text-muted text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-[90px] bg-muted/30 border border-dashed border-border rounded-xl text-xs text-muted">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Aspect Ratio Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate and convert aspect ratios for video and image dimensions. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Aspect Ratio Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate and convert aspect ratios for video and image dimensions. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Aspect Ratio Calculator",
  "description": "Calculate and convert aspect ratios for video and image dimensions",
  "url": "https://tools.loresync.dev/aspect-ratio-calculator",
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
