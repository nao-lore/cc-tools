"use client";

import { useState, useCallback } from "react";

// --- Types ---

type LoaderType = "Spinner" | "Dots" | "Bars" | "Pulse" | "Skeleton";

// --- CSS generators ---

function generateSpinnerCSS(color: string, size: number, speed: number): string {
  const border = Math.max(2, Math.round(size * 0.1));
  return `.loader {
  width: ${size}px;
  height: ${size}px;
  border: ${border}px solid ${color}33;
  border-top-color: ${color};
  border-radius: 50%;
  animation: spin ${speed}s linear infinite;
  will-change: transform;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}`;
}

function generateDotsCSS(color: string, size: number, speed: number): string {
  const dot = Math.max(6, Math.round(size * 0.2));
  const gap = Math.max(4, Math.round(dot * 0.6));
  return `.loader {
  display: flex;
  gap: ${gap}px;
  align-items: center;
}

.loader span {
  width: ${dot}px;
  height: ${dot}px;
  background-color: ${color};
  border-radius: 50%;
  animation: bounce ${speed}s ease-in-out infinite;
  will-change: transform;
}

.loader span:nth-child(1) { animation-delay: 0s; }
.loader span:nth-child(2) { animation-delay: ${(speed / 3).toFixed(2)}s; }
.loader span:nth-child(3) { animation-delay: ${((speed / 3) * 2).toFixed(2)}s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40%           { transform: scale(1);   opacity: 1; }
}`;
}

function generateBarsCSS(color: string, size: number, speed: number): string {
  const barW = Math.max(4, Math.round(size * 0.12));
  const barH = Math.max(16, Math.round(size * 0.6));
  const gap = Math.max(3, Math.round(barW * 0.6));
  return `.loader {
  display: flex;
  gap: ${gap}px;
  align-items: flex-end;
  height: ${size}px;
}

.loader span {
  width: ${barW}px;
  height: ${barH}px;
  background-color: ${color};
  border-radius: ${Math.round(barW / 2)}px;
  animation: bar ${speed}s ease-in-out infinite;
  will-change: transform;
}

.loader span:nth-child(1) { animation-delay: 0s; }
.loader span:nth-child(2) { animation-delay: ${(speed / 4).toFixed(2)}s; }
.loader span:nth-child(3) { animation-delay: ${((speed / 4) * 2).toFixed(2)}s; }
.loader span:nth-child(4) { animation-delay: ${((speed / 4) * 3).toFixed(2)}s; }

@keyframes bar {
  0%, 100% { transform: scaleY(0.4); }
  50%       { transform: scaleY(1); }
}`;
}

function generatePulseCSS(color: string, size: number, speed: number): string {
  return `.loader {
  width: ${size}px;
  height: ${size}px;
  background-color: ${color};
  border-radius: 50%;
  animation: pulse ${speed}s ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.6; }
  50%       { transform: scale(1.2); opacity: 1; }
}`;
}

function generateSkeletonCSS(color: string, size: number, speed: number): string {
  const lineH = Math.max(10, Math.round(size * 0.15));
  const radius = Math.round(lineH / 2);
  // lighten color for skeleton base
  return `.loader {
  display: flex;
  flex-direction: column;
  gap: ${Math.round(lineH * 0.6)}px;
  width: ${size * 2}px;
}

.loader .sk-line {
  height: ${lineH}px;
  border-radius: ${radius}px;
  background: linear-gradient(
    90deg,
    ${color}22 25%,
    ${color}55 50%,
    ${color}22 75%
  );
  background-size: 200% 100%;
  animation: shimmer ${speed}s linear infinite;
  will-change: background-position;
}

.loader .sk-line:nth-child(1) { width: 100%; }
.loader .sk-line:nth-child(2) { width: 80%; }
.loader .sk-line:nth-child(3) { width: 60%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`;
}

const GENERATORS: Record<LoaderType, (c: string, s: number, sp: number) => string> = {
  Spinner: generateSpinnerCSS,
  Dots: generateDotsCSS,
  Bars: generateBarsCSS,
  Pulse: generatePulseCSS,
  Skeleton: generateSkeletonCSS,
};

// --- Inline style preview builders ---

function SpinnerPreview({ color, size, speed }: { color: string; size: number; speed: number }) {
  const border = Math.max(2, Math.round(size * 0.1));
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${border}px solid ${color}33`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: `cc-spin ${speed}s linear infinite`,
      }}
    />
  );
}

function DotsPreview({ color, size, speed }: { color: string; size: number; speed: number }) {
  const dot = Math.max(6, Math.round(size * 0.2));
  const gap = Math.max(4, Math.round(dot * 0.6));
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: dot,
            height: dot,
            backgroundColor: color,
            borderRadius: "50%",
            animation: `cc-bounce ${speed}s ease-in-out ${(i * speed) / 3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function BarsPreview({ color, size, speed }: { color: string; size: number; speed: number }) {
  const barW = Math.max(4, Math.round(size * 0.12));
  const barH = Math.max(16, Math.round(size * 0.6));
  const gap = Math.max(3, Math.round(barW * 0.6));
  return (
    <div style={{ display: "flex", gap, alignItems: "flex-end", height: size }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: barW,
            height: barH,
            backgroundColor: color,
            borderRadius: Math.round(barW / 2),
            animation: `cc-bar ${speed}s ease-in-out ${(i * speed) / 4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function PulsePreview({ color, size, speed }: { color: string; size: number; speed: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
        animation: `cc-pulse ${speed}s ease-in-out infinite`,
      }}
    />
  );
}

function SkeletonPreview({ color, size, speed }: { color: string; size: number; speed: number }) {
  const lineH = Math.max(10, Math.round(size * 0.15));
  const radius = Math.round(lineH / 2);
  const widths = ["100%", "80%", "60%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: Math.round(lineH * 0.6), width: size * 2 }}>
      {widths.map((w, i) => (
        <div
          key={i}
          style={{
            height: lineH,
            width: w,
            borderRadius: radius,
            background: `linear-gradient(90deg, ${color}22 25%, ${color}55 50%, ${color}22 75%)`,
            backgroundSize: "200% 100%",
            animation: `cc-shimmer ${speed}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

// --- Keyframes injected once into the page ---

const KEYFRAMES = `
@keyframes cc-spin {
  to { transform: rotate(360deg); }
}
@keyframes cc-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40%           { transform: scale(1);   opacity: 1; }
}
@keyframes cc-bar {
  0%, 100% { transform: scaleY(0.4); }
  50%       { transform: scaleY(1); }
}
@keyframes cc-pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.6; }
  50%       { transform: scale(1.2); opacity: 1; }
}
@keyframes cc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// --- Main component ---

const LOADER_TYPES: LoaderType[] = ["Spinner", "Dots", "Bars", "Pulse", "Skeleton"];

export default function CssLoaderGenerator() {
  const [type, setType] = useState<LoaderType>("Spinner");
  const [color, setColor] = useState("#7c5cfc");
  const [size, setSize] = useState(48);
  const [speed, setSpeed] = useState(1);
  const [darkBg, setDarkBg] = useState(false);
  const [copied, setCopied] = useState(false);

  const css = GENERATORS[type](color, size, speed);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [css]);

  const PreviewMap: Record<LoaderType, JSX.Element> = {
    Spinner: <SpinnerPreview color={color} size={size} speed={speed} />,
    Dots: <DotsPreview color={color} size={size} speed={speed} />,
    Bars: <BarsPreview color={color} size={size} speed={speed} />,
    Pulse: <PulsePreview color={color} size={size} speed={speed} />,
    Skeleton: <SkeletonPreview color={color} size={size} speed={speed} />,
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-6 h-fit">
          {/* Type tabs */}
          <div>
            <label className="text-xs font-medium text-muted mb-2 block">Loader Type</label>
            <div className="flex flex-wrap gap-2">
              {LOADER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-accent text-white"
                      : "bg-background border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-muted mb-2 block">Color</label>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer opacity-0"
                />
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: color }} />
              </div>
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v);
                }}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-muted">Size</label>
              <span className="text-xs text-foreground font-mono">{size}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-[#7c5cfc]"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>20px</span>
              <span>100px</span>
            </div>
          </div>

          {/* Speed */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-muted">Speed</label>
              <span className="text-xs text-foreground font-mono">{speed.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[#7c5cfc]"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0.5s (fast)</span>
              <span>3s (slow)</span>
            </div>
          </div>

          {/* Background toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted">Dark background</label>
            <button
              onClick={() => setDarkBg((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                darkBg ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  darkBg ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right column: preview + output */}
        <div className="space-y-4">
          {/* Live preview */}
          <div
            className="rounded-xl border border-border flex items-center justify-center transition-colors"
            style={{
              backgroundColor: darkBg ? "#1a1a2e" : "#f8f8fc",
              minHeight: 200,
            }}
          >
            {PreviewMap[type]}
          </div>

          {/* CSS output */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted">CSS Output</span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  copied
                    ? "bg-green-500/15 text-green-600"
                    : "bg-accent/10 text-accent hover:bg-accent/20"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="5" width="9" height="9" rx="1.5" />
                      <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" />
                    </svg>
                    Copy CSS
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto whitespace-pre leading-relaxed">
              {css}
            </pre>
          </div>

          {/* HTML hint */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted">HTML</span>
            </div>
            <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto whitespace-pre leading-relaxed">
              {type === "Dots"
                ? `<div class="loader" role="status" aria-label="Loading">\n  <span></span>\n  <span></span>\n  <span></span>\n</div>`
                : type === "Bars"
                ? `<div class="loader" role="status" aria-label="Loading">\n  <span></span>\n  <span></span>\n  <span></span>\n  <span></span>\n</div>`
                : type === "Skeleton"
                ? `<div class="loader" role="status" aria-label="Loading">\n  <div class="sk-line"></div>\n  <div class="sk-line"></div>\n  <div class="sk-line"></div>\n</div>`
                : `<div class="loader" role="status" aria-label="Loading"></div>`}
            </pre>
          </div>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Loader Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate pure CSS loading spinners and skeleton animations. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Loader Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate pure CSS loading spinners and skeleton animations. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSS Loader Generator",
  "description": "Generate pure CSS loading spinners and skeleton animations",
  "url": "https://tools.loresync.dev/css-loader-generator",
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
      </>
  );
}
