"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Mode = "polygon" | "circle" | "ellipse" | "inset";

interface Point {
  x: number;
  y: number;
}

interface CircleShape {
  cx: number;
  cy: number;
  r: number;
}

interface EllipseShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface InsetShape {
  top: number;
  right: number;
  bottom: number;
  left: number;
  borderRadius: number;
}

const PRESETS: { name: string; mode: Mode; points?: Point[]; circle?: CircleShape; ellipse?: EllipseShape; inset?: InsetShape }[] = [
  {
    name: "Triangle",
    mode: "polygon",
    points: [{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
  },
  {
    name: "Pentagon",
    mode: "polygon",
    points: [
      { x: 50, y: 0 },
      { x: 100, y: 38 },
      { x: 81, y: 100 },
      { x: 19, y: 100 },
      { x: 0, y: 38 },
    ],
  },
  {
    name: "Hexagon",
    mode: "polygon",
    points: [
      { x: 25, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 50 },
      { x: 75, y: 100 },
      { x: 25, y: 100 },
      { x: 0, y: 50 },
    ],
  },
  {
    name: "Star",
    mode: "polygon",
    points: [
      { x: 50, y: 0 },
      { x: 61, y: 35 },
      { x: 98, y: 35 },
      { x: 68, y: 57 },
      { x: 79, y: 91 },
      { x: 50, y: 70 },
      { x: 21, y: 91 },
      { x: 32, y: 57 },
      { x: 2, y: 35 },
      { x: 39, y: 35 },
    ],
  },
  {
    name: "Arrow",
    mode: "polygon",
    points: [
      { x: 0, y: 30 },
      { x: 60, y: 30 },
      { x: 60, y: 0 },
      { x: 100, y: 50 },
      { x: 60, y: 100 },
      { x: 60, y: 70 },
      { x: 0, y: 70 },
    ],
  },
  {
    name: "Cross",
    mode: "polygon",
    points: [
      { x: 33, y: 0 },
      { x: 67, y: 0 },
      { x: 67, y: 33 },
      { x: 100, y: 33 },
      { x: 100, y: 67 },
      { x: 67, y: 67 },
      { x: 67, y: 100 },
      { x: 33, y: 100 },
      { x: 33, y: 67 },
      { x: 0, y: 67 },
      { x: 0, y: 33 },
      { x: 33, y: 33 },
    ],
  },
  {
    name: "Circle",
    mode: "circle",
    circle: { cx: 50, cy: 50, r: 50 },
  },
  {
    name: "Ellipse",
    mode: "ellipse",
    ellipse: { cx: 50, cy: 50, rx: 50, ry: 30 },
  },
  {
    name: "Inset",
    mode: "inset",
    inset: { top: 10, right: 10, bottom: 10, left: 10, borderRadius: 0 },
  },
];

const CANVAS_SIZE = 300;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function generateCSS(
  mode: Mode,
  points: Point[],
  circle: CircleShape,
  ellipse: EllipseShape,
  inset: InsetShape
): string {
  if (mode === "polygon") {
    if (points.length < 3) return "clip-path: none;";
    const coords = points.map((p) => `${p.x}% ${p.y}%`).join(", ");
    return `clip-path: polygon(${coords});`;
  }
  if (mode === "circle") {
    return `clip-path: circle(${circle.r}% at ${circle.cx}% ${circle.cy}%);`;
  }
  if (mode === "ellipse") {
    return `clip-path: ellipse(${ellipse.rx}% ${ellipse.ry}% at ${ellipse.cx}% ${ellipse.cy}%);`;
  }
  if (mode === "inset") {
    const r = inset.borderRadius > 0 ? ` round ${inset.borderRadius}px` : "";
    return `clip-path: inset(${inset.top}% ${inset.right}% ${inset.bottom}% ${inset.left}%${r});`;
  }
  return "clip-path: none;";
}

function generateInlineStyle(
  mode: Mode,
  points: Point[],
  circle: CircleShape,
  ellipse: EllipseShape,
  inset: InsetShape
): string {
  if (mode === "polygon") {
    if (points.length < 3) return "none";
    return `polygon(${points.map((p) => `${p.x}% ${p.y}%`).join(", ")})`;
  }
  if (mode === "circle") {
    return `circle(${circle.r}% at ${circle.cx}% ${circle.cy}%)`;
  }
  if (mode === "ellipse") {
    return `ellipse(${ellipse.rx}% ${ellipse.ry}% at ${ellipse.cx}% ${ellipse.cy}%)`;
  }
  if (mode === "inset") {
    const r = inset.borderRadius > 0 ? ` round ${inset.borderRadius}px` : "";
    return `inset(${inset.top}% ${inset.right}% ${inset.bottom}% ${inset.left}%${r})`;
  }
  return "none";
}

export default function ClipPathGenerator() {
  const [mode, setMode] = useState<Mode>("polygon");
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]);
  const [circle, setCircle] = useState<CircleShape>({ cx: 50, cy: 50, r: 50 });
  const [ellipse, setEllipse] = useState<EllipseShape>({ cx: 50, cy: 50, rx: 50, ry: 30 });
  const [inset, setInset] = useState<InsetShape>({ top: 10, right: 10, bottom: 10, left: 10, borderRadius: 0 });
  const [dragging, setDragging] = useState<number | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bgColor, setBgColor] = useState("#7c5cfc");
  const svgRef = useRef<SVGSVGElement>(null);

  const cssOutput = generateCSS(mode, points, circle, ellipse, inset);
  const clipPathValue = generateInlineStyle(mode, points, circle, ellipse, inset);

  const getSVGCoords = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    return { x: Math.round(x), y: Math.round(y) };
  }, []);

  const handleSVGClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (mode !== "polygon") return;
      if (dragging !== null) return;
      const coords = getSVGCoords(e);
      setPoints((prev) => [...prev, coords]);
    },
    [mode, dragging, getSVGCoords]
  );

  const handlePointMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setDragging(index);
    },
    []
  );

  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.stopPropagation();
      setDraggingHandle(handle);
    },
    []
  );

  const removePoint = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (dragging === null && draggingHandle === null) return;

    const onMove = (e: MouseEvent) => {
      const coords = getSVGCoords(e);
      if (dragging !== null) {
        setPoints((prev) =>
          prev.map((p, i) => (i === dragging ? coords : p))
        );
      } else if (draggingHandle !== null) {
        if (mode === "circle") {
          if (draggingHandle === "center") {
            setCircle((prev) => ({ ...prev, cx: coords.x, cy: coords.y }));
          } else if (draggingHandle === "radius") {
            setCircle((prev) => ({
              ...prev,
              r: clamp(
                Math.round(
                  Math.sqrt(
                    Math.pow(coords.x - prev.cx, 2) + Math.pow(coords.y - prev.cy, 2)
                  )
                ),
                1,
                100
              ),
            }));
          }
        } else if (mode === "ellipse") {
          if (draggingHandle === "center") {
            setEllipse((prev) => ({ ...prev, cx: coords.x, cy: coords.y }));
          } else if (draggingHandle === "rx") {
            setEllipse((prev) => ({
              ...prev,
              rx: clamp(Math.abs(coords.x - prev.cx), 1, 100),
            }));
          } else if (draggingHandle === "ry") {
            setEllipse((prev) => ({
              ...prev,
              ry: clamp(Math.abs(coords.y - prev.cy), 1, 100),
            }));
          }
        }
      }
    };

    const onUp = () => {
      setDragging(null);
      setDraggingHandle(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, draggingHandle, mode, getSVGCoords]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setMode(preset.mode);
    if (preset.points) setPoints(preset.points);
    if (preset.circle) setCircle(preset.circle);
    if (preset.ellipse) setEllipse(preset.ellipse);
    if (preset.inset) setInset(preset.inset);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cssOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const polygonPoints = points.map((p) => `${(p.x / 100) * CANVAS_SIZE},${(p.y / 100) * CANVAS_SIZE}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["polygon", "circle", "ellipse", "inset"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              mode === m
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wide">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canvas / Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {mode === "polygon"
                ? "Click to add points · Right-click to remove · Drag to move"
                : "Drag handles to adjust"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface overflow-hidden" style={{ aspectRatio: "1/1" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              className="w-full h-full cursor-crosshair select-none"
              onClick={handleSVGClick}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Grid */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" opacity="0.5" />
                </pattern>
              </defs>
              <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="url(#grid)" />

              {/* Shape outline */}
              {mode === "polygon" && points.length >= 3 && (
                <polygon
                  points={polygonPoints}
                  fill="rgba(124, 92, 252, 0.15)"
                  stroke="#7c5cfc"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}
              {mode === "circle" && (
                <ellipse
                  cx={(circle.cx / 100) * CANVAS_SIZE}
                  cy={(circle.cy / 100) * CANVAS_SIZE}
                  rx={(circle.r / 100) * CANVAS_SIZE}
                  ry={(circle.r / 100) * CANVAS_SIZE}
                  fill="rgba(124, 92, 252, 0.15)"
                  stroke="#7c5cfc"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}
              {mode === "ellipse" && (
                <ellipse
                  cx={(ellipse.cx / 100) * CANVAS_SIZE}
                  cy={(ellipse.cy / 100) * CANVAS_SIZE}
                  rx={(ellipse.rx / 100) * CANVAS_SIZE}
                  ry={(ellipse.ry / 100) * CANVAS_SIZE}
                  fill="rgba(124, 92, 252, 0.15)"
                  stroke="#7c5cfc"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}
              {mode === "inset" && (
                <rect
                  x={(inset.left / 100) * CANVAS_SIZE}
                  y={(inset.top / 100) * CANVAS_SIZE}
                  width={((100 - inset.left - inset.right) / 100) * CANVAS_SIZE}
                  height={((100 - inset.top - inset.bottom) / 100) * CANVAS_SIZE}
                  fill="rgba(124, 92, 252, 0.15)"
                  stroke="#7c5cfc"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  rx={inset.borderRadius}
                />
              )}

              {/* Polygon point handles */}
              {mode === "polygon" &&
                points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={(p.x / 100) * CANVAS_SIZE}
                      cy={(p.y / 100) * CANVAS_SIZE}
                      r={8}
                      fill="transparent"
                      className="cursor-move"
                      onMouseDown={(e) => handlePointMouseDown(e, i)}
                      onContextMenu={(e) => removePoint(e, i)}
                    />
                    <circle
                      cx={(p.x / 100) * CANVAS_SIZE}
                      cy={(p.y / 100) * CANVAS_SIZE}
                      r={5}
                      fill="white"
                      stroke="#7c5cfc"
                      strokeWidth="2"
                      className="cursor-move pointer-events-none"
                    />
                  </g>
                ))}

              {/* Circle handles */}
              {mode === "circle" && (
                <>
                  {/* Center */}
                  <circle
                    cx={(circle.cx / 100) * CANVAS_SIZE}
                    cy={(circle.cy / 100) * CANVAS_SIZE}
                    r={8}
                    fill="transparent"
                    className="cursor-move"
                    onMouseDown={(e) => handleHandleMouseDown(e, "center")}
                  />
                  <circle
                    cx={(circle.cx / 100) * CANVAS_SIZE}
                    cy={(circle.cy / 100) * CANVAS_SIZE}
                    r={5}
                    fill="#7c5cfc"
                    stroke="white"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                  {/* Radius handle */}
                  <line
                    x1={(circle.cx / 100) * CANVAS_SIZE}
                    y1={(circle.cy / 100) * CANVAS_SIZE}
                    x2={((circle.cx + circle.r) / 100) * CANVAS_SIZE}
                    y2={(circle.cy / 100) * CANVAS_SIZE}
                    stroke="#7c5cfc"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    className="pointer-events-none"
                  />
                  <circle
                    cx={((circle.cx + circle.r) / 100) * CANVAS_SIZE}
                    cy={(circle.cy / 100) * CANVAS_SIZE}
                    r={8}
                    fill="transparent"
                    className="cursor-ew-resize"
                    onMouseDown={(e) => handleHandleMouseDown(e, "radius")}
                  />
                  <circle
                    cx={((circle.cx + circle.r) / 100) * CANVAS_SIZE}
                    cy={(circle.cy / 100) * CANVAS_SIZE}
                    r={5}
                    fill="white"
                    stroke="#7c5cfc"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                </>
              )}

              {/* Ellipse handles */}
              {mode === "ellipse" && (
                <>
                  {/* Center */}
                  <circle
                    cx={(ellipse.cx / 100) * CANVAS_SIZE}
                    cy={(ellipse.cy / 100) * CANVAS_SIZE}
                    r={8}
                    fill="transparent"
                    className="cursor-move"
                    onMouseDown={(e) => handleHandleMouseDown(e, "center")}
                  />
                  <circle
                    cx={(ellipse.cx / 100) * CANVAS_SIZE}
                    cy={(ellipse.cy / 100) * CANVAS_SIZE}
                    r={5}
                    fill="#7c5cfc"
                    stroke="white"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                  {/* rx handle */}
                  <line
                    x1={(ellipse.cx / 100) * CANVAS_SIZE}
                    y1={(ellipse.cy / 100) * CANVAS_SIZE}
                    x2={((ellipse.cx + ellipse.rx) / 100) * CANVAS_SIZE}
                    y2={(ellipse.cy / 100) * CANVAS_SIZE}
                    stroke="#7c5cfc"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    className="pointer-events-none"
                  />
                  <circle
                    cx={((ellipse.cx + ellipse.rx) / 100) * CANVAS_SIZE}
                    cy={(ellipse.cy / 100) * CANVAS_SIZE}
                    r={8}
                    fill="transparent"
                    className="cursor-ew-resize"
                    onMouseDown={(e) => handleHandleMouseDown(e, "rx")}
                  />
                  <circle
                    cx={((ellipse.cx + ellipse.rx) / 100) * CANVAS_SIZE}
                    cy={(ellipse.cy / 100) * CANVAS_SIZE}
                    r={5}
                    fill="white"
                    stroke="#7c5cfc"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                  {/* ry handle */}
                  <line
                    x1={(ellipse.cx / 100) * CANVAS_SIZE}
                    y1={(ellipse.cy / 100) * CANVAS_SIZE}
                    x2={(ellipse.cx / 100) * CANVAS_SIZE}
                    y2={((ellipse.cy + ellipse.ry) / 100) * CANVAS_SIZE}
                    stroke="#7c5cfc"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    className="pointer-events-none"
                  />
                  <circle
                    cx={(ellipse.cx / 100) * CANVAS_SIZE}
                    cy={((ellipse.cy + ellipse.ry) / 100) * CANVAS_SIZE}
                    r={8}
                    fill="transparent"
                    className="cursor-ns-resize"
                    onMouseDown={(e) => handleHandleMouseDown(e, "ry")}
                  />
                  <circle
                    cx={(ellipse.cx / 100) * CANVAS_SIZE}
                    cy={((ellipse.cy + ellipse.ry) / 100) * CANVAS_SIZE}
                    r={5}
                    fill="white"
                    stroke="#7c5cfc"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Inset sliders */}
          {mode === "inset" && (
            <div className="space-y-3 p-4 rounded-xl border border-border bg-surface">
              {(["top", "right", "bottom", "left"] as const).map((side) => (
                <div key={side} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-12 capitalize">{side}</span>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={inset[side]}
                    onChange={(e) => setInset((prev) => ({ ...prev, [side]: Number(e.target.value) }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-xs text-foreground w-8 text-right">{inset[side]}%</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted w-12">Radius</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={inset.borderRadius}
                  onChange={(e) => setInset((prev) => ({ ...prev, borderRadius: Number(e.target.value) }))}
                  className="flex-1 accent-accent"
                />
                <span className="text-xs text-foreground w-8 text-right">{inset.borderRadius}px</span>
              </div>
            </div>
          )}
        </div>

        {/* Preview + Output */}
        <div className="space-y-4">
          {/* Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Live Preview</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6 flex items-center justify-center" style={{ minHeight: 200 }}>
              <div
                className="w-48 h-48 flex items-center justify-center text-white font-semibold text-sm"
                style={{
                  backgroundColor: bgColor,
                  clipPath: clipPathValue,
                  transition: "clip-path 0.1s ease",
                }}
              >
                Preview
              </div>
            </div>
          </div>

          {/* CSS Output */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">CSS Output</p>
            <div className="relative rounded-xl border border-border bg-surface">
              <pre className="p-4 text-sm font-mono text-accent overflow-x-auto whitespace-pre-wrap break-all pr-20">
                {cssOutput}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Point list for polygon */}
          {mode === "polygon" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Points ({points.length})</p>
                <button
                  onClick={() => setPoints([{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }])}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="rounded-xl border border-border bg-surface divide-y divide-border max-h-48 overflow-y-auto">
                {points.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <span className="text-xs text-muted w-4">{i + 1}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-muted">X</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.x}
                        onChange={(e) =>
                          setPoints((prev) =>
                            prev.map((pt, idx) =>
                              idx === i ? { ...pt, x: clamp(Number(e.target.value), 0, 100) } : pt
                            )
                          )
                        }
                        className="w-14 text-xs px-2 py-1 rounded border border-border bg-transparent text-foreground"
                      />
                      <span className="text-xs text-muted">Y</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.y}
                        onChange={(e) =>
                          setPoints((prev) =>
                            prev.map((pt, idx) =>
                              idx === i ? { ...pt, y: clamp(Number(e.target.value), 0, 100) } : pt
                            )
                          )
                        }
                        className="w-14 text-xs px-2 py-1 rounded border border-border bg-transparent text-foreground"
                      />
                    </div>
                    <button
                      onClick={() => setPoints((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted hover:text-red-500 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Circle / Ellipse numeric inputs */}
          {mode === "circle" && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              {(["cx", "cy", "r"] as const).map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-8">{key}</span>
                  <input
                    type="range"
                    min={key === "r" ? 1 : 0}
                    max={100}
                    value={circle[key]}
                    onChange={(e) => setCircle((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-xs text-foreground w-8 text-right">{circle[key]}%</span>
                </div>
              ))}
            </div>
          )}
          {mode === "ellipse" && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              {(["cx", "cy", "rx", "ry"] as const).map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-8">{key}</span>
                  <input
                    type="range"
                    min={key === "rx" || key === "ry" ? 1 : 0}
                    max={100}
                    value={ellipse[key]}
                    onChange={(e) => setEllipse((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-xs text-foreground w-8 text-right">{ellipse[key]}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
