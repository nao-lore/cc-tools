"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

interface Preset {
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const PRESETS: Preset[] = [
  { label: "ease", x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  { label: "ease-in", x1: 0.42, y1: 0, x2: 1, y2: 1 },
  { label: "ease-out", x1: 0, y1: 0, x2: 0.58, y2: 1 },
  { label: "ease-in-out", x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  { label: "linear", x1: 0, y1: 0, x2: 1, y2: 1 },
  { label: "spring", x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
  { label: "bounce-out", x1: 0.34, y1: 1.56, x2: 0.84, y2: 1 },
  { label: "snap", x1: 0.9, y1: 0.1, x2: 1, y2: 0.2 },
];

// SVG canvas: 300x300, with 30px padding so curve area is 240x240
const SVG_SIZE = 300;
const PAD = 30;
const CURVE_SIZE = SVG_SIZE - PAD * 2;

// Map normalized [0,1] x to SVG x, normalized y to SVG y (flipped, allowing overflow)
function toSvgX(nx: number) {
  return PAD + nx * CURVE_SIZE;
}
function toSvgY(ny: number) {
  // y=0 is bottom, y=1 is top in CSS easing coords
  return PAD + (1 - ny) * CURVE_SIZE;
}
function fromSvgX(sx: number) {
  return Math.max(0, Math.min(1, (sx - PAD) / CURVE_SIZE));
}
function fromSvgY(sy: number) {
  return 1 - (sy - PAD) / CURVE_SIZE;
}

// Sample cubic-bezier curve at t using De Casteljau
function cubicBezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number
): [number, number] {
  const mt = 1 - t;
  const x =
    mt * mt * mt * p0[0] +
    3 * mt * mt * t * p1[0] +
    3 * mt * t * t * p2[0] +
    t * t * t * p3[0];
  const y =
    mt * mt * mt * p0[1] +
    3 * mt * mt * t * p1[1] +
    3 * mt * t * t * p2[1] +
    t * t * t * p3[1];
  return [x, y];
}

function buildCurvePath(x1: number, y1: number, x2: number, y2: number): string {
  const p0: [number, number] = [0, 0];
  const p1: [number, number] = [x1, y1];
  const p2: [number, number] = [x2, y2];
  const p3: [number, number] = [1, 1];

  const points: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [bx, by] = cubicBezierPoint(p0, p1, p2, p3, t);
    const sx = toSvgX(bx);
    const sy = toSvgY(by);
    points.push(i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`);
  }
  return points.join(" ");
}

function clampX(v: number) {
  return Math.max(0, Math.min(1, v));
}
function round4(v: number) {
  return Math.round(v * 10000) / 10000;
}

export default function CssEasingVisualizer() {
  const [x1, setX1] = useState(0.25);
  const [y1, setY1] = useState(0.1);
  const [x2, setX2] = useState(0.25);
  const [y2, setY2] = useState(1);
  const [duration, setDuration] = useState(0.8);
  const [copied, setCopied] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("ease");
  const [dragging, setDragging] = useState<"p1" | "p2" | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cubicBezierStr = useMemo(
    () =>
      `cubic-bezier(${round4(x1)}, ${round4(y1)}, ${round4(x2)}, ${round4(y2)})`,
    [x1, y1, x2, y2]
  );

  const curvePath = useMemo(
    () => buildCurvePath(x1, y1, x2, y2),
    [x1, y1, x2, y2]
  );

  // Dragging logic
  const getSvgCoords = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_SIZE / rect.width;
    const scaleY = SVG_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      const { x, y } = getSvgCoords(e);
      const nx = clampX(fromSvgX(x));
      const ny = round4(fromSvgY(y));
      if (dragging === "p1") {
        setX1(round4(nx));
        setY1(ny);
        setActivePreset("custom");
      } else {
        setX2(round4(nx));
        setY2(ny);
        setActivePreset("custom");
      }
    },
    [dragging, getSvgCoords]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const startDrag = useCallback(
    (point: "p1" | "p2") => (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(point);
    },
    []
  );

  // Animation preview
  const triggerAnimation = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    if (animRef.current) clearTimeout(animRef.current);
    animRef.current = setTimeout(
      () => setAnimating(false),
      duration * 1000 + 200
    );
  }, [animating, duration]);

  // Apply preset
  const applyPreset = useCallback((preset: Preset) => {
    setX1(preset.x1);
    setY1(preset.y1);
    setX2(preset.x2);
    setY2(preset.y2);
    setActivePreset(preset.label);
  }, []);

  const copyText = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleNumericInput = useCallback(
    (setter: (v: number) => void, clampFn?: (v: number) => number) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) {
          setter(clampFn ? clampFn(v) : v);
          setActivePreset("custom");
        }
      },
    []
  );

  // SVG control point positions
  const p1sx = toSvgX(x1);
  const p1sy = toSvgY(y1);
  const p2sx = toSvgX(x2);
  const p2sy = toSvgY(y2);
  const originSx = toSvgX(0);
  const originSy = toSvgY(0);
  const endSx = toSvgX(1);
  const endSy = toSvgY(1);

  return (
    <div className="space-y-6">
      {/* Header row: SVG canvas + numeric inputs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* SVG Canvas */}
        <div className="bg-surface rounded-2xl border border-border p-4 flex-shrink-0">
          <h3 className="text-sm font-medium text-muted mb-3">Curve Editor</h3>
          <svg
            ref={svgRef}
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="block select-none touch-none"
            style={{ cursor: dragging ? "grabbing" : "default" }}
          >
            {/* Grid */}
            <line
              x1={PAD} y1={PAD} x2={PAD} y2={PAD + CURVE_SIZE}
              stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
              className="text-foreground"
            />
            <line
              x1={PAD} y1={PAD + CURVE_SIZE} x2={PAD + CURVE_SIZE} y2={PAD + CURVE_SIZE}
              stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
              className="text-foreground"
            />
            {/* Diagonal guide */}
            <line
              x1={originSx} y1={originSy} x2={endSx} y2={endSy}
              stroke="currentColor" strokeOpacity={0.15} strokeWidth={1}
              strokeDasharray="4 4" className="text-foreground"
            />
            {/* Handle lines */}
            <line
              x1={originSx} y1={originSy} x2={p1sx} y2={p1sy}
              stroke="#7c5cfc" strokeOpacity={0.5} strokeWidth={1.5}
            />
            <line
              x1={endSx} y1={endSy} x2={p2sx} y2={p2sy}
              stroke="#7c5cfc" strokeOpacity={0.5} strokeWidth={1.5}
            />
            {/* Curve */}
            <path
              d={curvePath}
              fill="none"
              stroke="#7c5cfc"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Anchor points */}
            <circle cx={originSx} cy={originSy} r={4} fill="#7c5cfc" />
            <circle cx={endSx} cy={endSy} r={4} fill="#7c5cfc" />
            {/* Control point P1 */}
            <circle
              cx={p1sx}
              cy={p1sy}
              r={8}
              fill="#7c5cfc"
              fillOpacity={0.2}
              stroke="#7c5cfc"
              strokeWidth={2}
              style={{ cursor: "grab" }}
              onMouseDown={startDrag("p1")}
            />
            <circle cx={p1sx} cy={p1sy} r={3} fill="#7c5cfc" />
            {/* Control point P2 */}
            <circle
              cx={p2sx}
              cy={p2sy}
              r={8}
              fill="#ec4899"
              fillOpacity={0.2}
              stroke="#ec4899"
              strokeWidth={2}
              style={{ cursor: "grab" }}
              onMouseDown={startDrag("p2")}
            />
            <circle cx={p2sx} cy={p2sy} r={3} fill="#ec4899" />
            {/* Labels */}
            <text x={p1sx + 10} y={p1sy - 6} fontSize={10} fill="#7c5cfc" fontFamily="monospace">P1</text>
            <text x={p2sx + 10} y={p2sy - 6} fontSize={10} fill="#ec4899" fontFamily="monospace">P2</text>
          </svg>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          {/* Numeric inputs */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-medium text-muted mb-3">Control Points</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "x1", value: x1, setter: setX1, clamp: clampX },
                { label: "y1", value: y1, setter: setY1, clamp: undefined },
                { label: "x2", value: x2, setter: setX2, clamp: clampX },
                { label: "y2", value: y2, setter: setY2, clamp: undefined },
              ].map(({ label, value, setter, clamp }) => (
                <div key={label}>
                  <label className="block text-xs text-muted mb-1 font-mono">{label}</label>
                  <input
                    type="number"
                    step="0.01"
                    min={label.startsWith("x") ? 0 : -2}
                    max={label.startsWith("x") ? 1 : 2}
                    value={value}
                    onChange={handleNumericInput(setter, clamp)}
                    className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Duration slider */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted">Duration</h3>
              <span className="text-sm font-mono text-foreground">{duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </div>
      </div>

      {/* Preset library */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">Presets</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                activePreset === preset.label
                  ? "bg-accent text-white border-accent"
                  : "border-border text-muted hover:text-foreground hover:border-accent/50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation preview */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted">Preview</h3>
          <button
            onClick={triggerAnimation}
            disabled={animating}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 disabled:opacity-50 transition-colors"
          >
            {animating ? "Playing…" : "Play"}
          </button>
        </div>
        <div className="relative h-12 bg-background rounded-xl border border-border overflow-hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent"
            style={{
              left: animating ? "calc(100% - 2.5rem)" : "0.5rem",
              transition: animating
                ? `left ${duration}s ${cubicBezierStr}`
                : "none",
            }}
          />
        </div>
      </div>

      {/* Output: copy buttons */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted mb-1">Copy CSS</h3>
        {[
          {
            label: "cubic-bezier",
            key: "cb",
            value: cubicBezierStr,
          },
          {
            label: "transition",
            key: "tr",
            value: `transition: all ${duration.toFixed(1)}s ${cubicBezierStr};`,
          },
        ].map(({ label, key, value }) => (
          <div key={key} className="flex items-center gap-3">
            <pre className="flex-1 text-xs font-mono bg-background border border-border rounded-lg px-3 py-2 text-foreground overflow-x-auto whitespace-pre">
              {value}
            </pre>
            <button
              onClick={() => copyText(value, key)}
              className="shrink-0 px-3 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied === key ? "Copied!" : "Copy"}
            </button>
          </div>
        ))}
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Easing Visualizer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visualize and create CSS cubic-bezier easing curves. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Easing Visualizer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visualize and create CSS cubic-bezier easing curves. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
