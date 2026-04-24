"use client";

import { useState, useCallback } from "react";

// --- Types ---

type Direction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// --- Helpers ---

function generateBorderCSS(
  direction: Direction,
  width: number,
  height: number,
  color: string
): string {
  const hw = Math.round(width / 2);
  const hh = Math.round(height / 2);
  const transparent = "transparent";

  switch (direction) {
    case "up":
      return `.triangle {
  width: 0;
  height: 0;
  border-left: ${hw}px solid ${transparent};
  border-right: ${hw}px solid ${transparent};
  border-bottom: ${height}px solid ${color};
}`;
    case "down":
      return `.triangle {
  width: 0;
  height: 0;
  border-left: ${hw}px solid ${transparent};
  border-right: ${hw}px solid ${transparent};
  border-top: ${height}px solid ${color};
}`;
    case "left":
      return `.triangle {
  width: 0;
  height: 0;
  border-top: ${hh}px solid ${transparent};
  border-bottom: ${hh}px solid ${transparent};
  border-right: ${width}px solid ${color};
}`;
    case "right":
      return `.triangle {
  width: 0;
  height: 0;
  border-top: ${hh}px solid ${transparent};
  border-bottom: ${hh}px solid ${transparent};
  border-left: ${width}px solid ${color};
}`;
    case "top-left":
      return `.triangle {
  width: 0;
  height: 0;
  border-top: ${height}px solid ${color};
  border-right: ${width}px solid ${transparent};
}`;
    case "top-right":
      return `.triangle {
  width: 0;
  height: 0;
  border-top: ${height}px solid ${color};
  border-left: ${width}px solid ${transparent};
}`;
    case "bottom-left":
      return `.triangle {
  width: 0;
  height: 0;
  border-bottom: ${height}px solid ${color};
  border-right: ${width}px solid ${transparent};
}`;
    case "bottom-right":
      return `.triangle {
  width: 0;
  height: 0;
  border-bottom: ${height}px solid ${color};
  border-left: ${width}px solid ${transparent};
}`;
  }
}

function generateClipPathCSS(
  direction: Direction,
  width: number,
  height: number,
  color: string
): string {
  let polygon: string;

  switch (direction) {
    case "up":
      polygon = "polygon(50% 0%, 0% 100%, 100% 100%)";
      break;
    case "down":
      polygon = "polygon(0% 0%, 100% 0%, 50% 100%)";
      break;
    case "left":
      polygon = "polygon(100% 0%, 0% 50%, 100% 100%)";
      break;
    case "right":
      polygon = "polygon(0% 0%, 100% 50%, 0% 100%)";
      break;
    case "top-left":
      polygon = "polygon(0% 0%, 100% 0%, 0% 100%)";
      break;
    case "top-right":
      polygon = "polygon(0% 0%, 100% 0%, 100% 100%)";
      break;
    case "bottom-left":
      polygon = "polygon(0% 0%, 0% 100%, 100% 100%)";
      break;
    case "bottom-right":
      polygon = "polygon(100% 0%, 0% 100%, 100% 100%)";
      break;
  }

  return `.triangle {
  width: ${width}px;
  height: ${height}px;
  background-color: ${color};
  clip-path: ${polygon};
}`;
}

function getBorderStyle(
  direction: Direction,
  width: number,
  height: number,
  color: string
): React.CSSProperties {
  const hw = Math.round(width / 2);
  const hh = Math.round(height / 2);

  switch (direction) {
    case "up":
      return {
        width: 0,
        height: 0,
        borderLeft: `${hw}px solid transparent`,
        borderRight: `${hw}px solid transparent`,
        borderBottom: `${height}px solid ${color}`,
      };
    case "down":
      return {
        width: 0,
        height: 0,
        borderLeft: `${hw}px solid transparent`,
        borderRight: `${hw}px solid transparent`,
        borderTop: `${height}px solid ${color}`,
      };
    case "left":
      return {
        width: 0,
        height: 0,
        borderTop: `${hh}px solid transparent`,
        borderBottom: `${hh}px solid transparent`,
        borderRight: `${width}px solid ${color}`,
      };
    case "right":
      return {
        width: 0,
        height: 0,
        borderTop: `${hh}px solid transparent`,
        borderBottom: `${hh}px solid transparent`,
        borderLeft: `${width}px solid ${color}`,
      };
    case "top-left":
      return {
        width: 0,
        height: 0,
        borderTop: `${height}px solid ${color}`,
        borderRight: `${width}px solid transparent`,
      };
    case "top-right":
      return {
        width: 0,
        height: 0,
        borderTop: `${height}px solid ${color}`,
        borderLeft: `${width}px solid transparent`,
      };
    case "bottom-left":
      return {
        width: 0,
        height: 0,
        borderBottom: `${height}px solid ${color}`,
        borderRight: `${width}px solid transparent`,
      };
    case "bottom-right":
      return {
        width: 0,
        height: 0,
        borderBottom: `${height}px solid ${color}`,
        borderLeft: `${width}px solid transparent`,
      };
  }
}

// --- Direction button config ---

const DIRECTIONS: { key: Direction; label: string; icon: string }[] = [
  { key: "up", label: "Up", icon: "▲" },
  { key: "down", label: "Down", icon: "▼" },
  { key: "left", label: "Left", icon: "◀" },
  { key: "right", label: "Right", icon: "▶" },
  { key: "top-left", label: "Top Left", icon: "◤" },
  { key: "top-right", label: "Top Right", icon: "◥" },
  { key: "bottom-left", label: "Bottom Left", icon: "◣" },
  { key: "bottom-right", label: "Bottom Right", icon: "◢" },
];

// --- Copy button ---

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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        copied
          ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
          : "bg-background border-border text-muted hover:text-foreground hover:border-accent/50"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// --- Main component ---

export default function CssTriangleGenerator() {
  const [direction, setDirection] = useState<Direction>("up");
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [color, setColor] = useState("#6366f1");

  const clampDim = (v: number) => Math.max(10, Math.min(400, v));

  const borderCSS = generateBorderCSS(direction, width, height, color);
  const clipPathCSS = generateClipPathCSS(direction, width, height, color);
  const previewStyle = getBorderStyle(direction, width, height, color);

  return (
    <div className="space-y-6">
      {/* Direction selector */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-medium text-muted">Direction</h2>
        <div className="grid grid-cols-4 gap-2">
          {DIRECTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setDirection(key)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium border transition-colors ${
                direction === key
                  ? "bg-accent text-white border-accent"
                  : "bg-background border-border text-muted hover:text-foreground hover:border-accent/50"
              }`}
              aria-pressed={direction === key}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size and color controls */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-medium text-muted">Size & Color</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Width */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Width (px)</label>
            <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2 gap-1">
              <input
                type="number"
                min={10}
                max={400}
                value={width}
                onChange={(e) => setWidth(clampDim(Number(e.target.value)))}
                className="flex-1 bg-transparent text-foreground text-sm font-mono focus:outline-none w-full"
                aria-label="Width in pixels"
              />
              <span className="text-muted text-xs font-mono">px</span>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Height (px)</label>
            <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2 gap-1">
              <input
                type="number"
                min={10}
                max={400}
                value={height}
                onChange={(e) => setHeight(clampDim(Number(e.target.value)))}
                className="flex-1 bg-transparent text-foreground text-sm font-mono focus:outline-none w-full"
                aria-label="Height in pixels"
              />
              <span className="text-muted text-xs font-mono">px</span>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">Color</label>
            <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2 gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
                aria-label="Triangle color"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 bg-transparent text-foreground text-sm font-mono focus:outline-none w-full"
                aria-label="Color hex value"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-medium text-muted">Live Preview</h2>
        <div className="flex items-center justify-center bg-background rounded-xl border border-border min-h-48 p-8">
          <div style={previewStyle} />
        </div>
      </div>

      {/* Code outputs */}
      <div className="space-y-4">
        {/* Border trick */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <span className="text-sm font-medium text-foreground">Border Trick</span>
              <span className="ml-2 text-xs text-muted">Classic CSS method</span>
            </div>
            <CopyButton text={borderCSS} />
          </div>
          <pre className="px-4 py-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed whitespace-pre">
            {borderCSS}
          </pre>
        </div>

        {/* Clip-path */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <span className="text-sm font-medium text-foreground">Clip-path Polygon</span>
              <span className="ml-2 text-xs text-muted">Modern CSS method</span>
            </div>
            <CopyButton text={clipPathCSS} />
          </div>
          <pre className="px-4 py-4 text-xs font-mono text-foreground overflow-x-auto leading-relaxed whitespace-pre">
            {clipPathCSS}
          </pre>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Triangle Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate CSS-only triangles using the border trick. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Triangle Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate CSS-only triangles using the border trick. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
