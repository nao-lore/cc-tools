"use client";

import { useState, useCallback, useMemo } from "react";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = "linear" | "radial";

interface RadialPosition {
  x: number;
  y: number;
}

const PRESETS: { name: string; type: GradientType; angle: number; radialPosition: RadialPosition; stops: Omit<ColorStop, "id">[] }[] = [
  { name: "Sunset", type: "linear", angle: 135, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#ff6b6b", position: 0 }, { color: "#feca57", position: 100 }] },
  { name: "Ocean", type: "linear", angle: 180, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#0052d4", position: 0 }, { color: "#4364f7", position: 50 }, { color: "#6fb1fc", position: 100 }] },
  { name: "Aurora", type: "linear", angle: 135, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#00c9ff", position: 0 }, { color: "#92fe9d", position: 100 }] },
  { name: "Berry", type: "linear", angle: 90, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#8e2de2", position: 0 }, { color: "#4a00e0", position: 100 }] },
  { name: "Fire", type: "linear", angle: 45, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#f12711", position: 0 }, { color: "#f5af19", position: 100 }] },
  { name: "Emerald", type: "linear", angle: 160, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#11998e", position: 0 }, { color: "#38ef7d", position: 100 }] },
  { name: "Lavender", type: "radial", angle: 0, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#e8ceff", position: 0 }, { color: "#a78bfa", position: 50 }, { color: "#7c3aed", position: 100 }] },
  { name: "Midnight", type: "linear", angle: 200, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#0f0c29", position: 0 }, { color: "#302b63", position: 50 }, { color: "#24243e", position: 100 }] },
  { name: "Peach", type: "linear", angle: 120, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#ffecd2", position: 0 }, { color: "#fcb69f", position: 100 }] },
  { name: "Neon", type: "linear", angle: 90, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#00f260", position: 0 }, { color: "#0575e6", position: 100 }] },
  { name: "Cosmos", type: "radial", angle: 0, radialPosition: { x: 30, y: 30 }, stops: [{ color: "#ff00cc", position: 0 }, { color: "#333399", position: 100 }] },
  { name: "Frost", type: "linear", angle: 135, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#e0eafc", position: 0 }, { color: "#cfdef3", position: 100 }] },
  { name: "Mango", type: "linear", angle: 90, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#ffe259", position: 0 }, { color: "#ffa751", position: 100 }] },
  { name: "Royal", type: "linear", angle: 135, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#141e30", position: 0 }, { color: "#243b55", position: 100 }] },
  { name: "Candy", type: "linear", angle: 45, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#ff6a88", position: 0 }, { color: "#ff99ac", position: 50 }, { color: "#fcb0b3", position: 100 }] },
  { name: "Spotlight", type: "radial", angle: 0, radialPosition: { x: 50, y: 50 }, stops: [{ color: "#ffffff", position: 0 }, { color: "#6a11cb", position: 50 }, { color: "#2575fc", position: 100 }] },
];

let nextId = 3;
function genId() {
  return `stop-${nextId++}`;
}

function randomHex() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

export default function GradientGenerator() {
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [radialPosition, setRadialPosition] = useState<RadialPosition>({ x: 50, y: 50 });
  const [stops, setStops] = useState<ColorStop[]>([
    { id: "stop-1", color: "#7c5cfc", position: 0 },
    { id: "stop-2", color: "#ff6b9d", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);
  const [copiedTailwind, setCopiedTailwind] = useState(false);

  const cssGradient = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    }
    return `radial-gradient(circle at ${radialPosition.x}% ${radialPosition.y}%, ${stopsStr})`;
  }, [stops, gradientType, angle, radialPosition]);

  const cssCode = `background: ${cssGradient};`;

  const tailwindOutput = useMemo(() => {
    if (gradientType === "radial") {
      return "/* Radial gradients require custom CSS — Tailwind does not support them natively. Use the CSS output above. */";
    }
    const dirMap: Record<number, string> = {
      0: "to-t", 45: "to-tr", 90: "to-r", 135: "to-br",
      180: "to-b", 225: "to-bl", 270: "to-l", 315: "to-tl",
    };
    const dir = dirMap[angle];
    if (!dir || stops.length < 2 || stops.length > 3) {
      return `/* For angle ${angle}deg or ${stops.length} stops, use arbitrary values:\n   bg-[linear-gradient(${angle}deg,${stops.map((s) => s.color + "_" + s.position + "%").join(",")})] */`;
    }
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const fromColor = sorted[0].color;
    const toColor = sorted[sorted.length - 1].color;
    if (stops.length === 2) {
      return `bg-gradient-${dir} from-[${fromColor}] to-[${toColor}]`;
    }
    const viaColor = sorted[1].color;
    return `bg-gradient-${dir} from-[${fromColor}] via-[${viaColor}] to-[${toColor}]`;
  }, [stops, gradientType, angle]);

  const updateStop = useCallback((id: string, field: "color" | "position", value: string | number) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);

  const addStop = useCallback(() => {
    if (stops.length >= 8) return;
    const newPos = Math.round(100 / (stops.length + 1));
    setStops((prev) => [...prev, { id: genId(), color: randomHex(), position: newPos }]);
  }, [stops.length]);

  const removeStop = useCallback((id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  }, [stops.length]);

  const copyCSS = useCallback(async () => {
    await navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const copyTailwind = useCallback(async () => {
    await navigator.clipboard.writeText(tailwindOutput);
    setCopiedTailwind(true);
    setTimeout(() => setCopiedTailwind(false), 2000);
  }, [tailwindOutput]);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setRadialPosition(preset.radialPosition);
    setStops(preset.stops.map((s, i) => ({ ...s, id: genId() + "-" + i })));
  }, []);

  const randomGradient = useCallback(() => {
    const type: GradientType = Math.random() > 0.3 ? "linear" : "radial";
    const numStops = Math.floor(Math.random() * 3) + 2;
    const newStops: ColorStop[] = [];
    for (let i = 0; i < numStops; i++) {
      newStops.push({
        id: genId(),
        color: randomHex(),
        position: Math.round((i / (numStops - 1)) * 100),
      });
    }
    setGradientType(type);
    setAngle(Math.floor(Math.random() * 360));
    setRadialPosition({ x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) });
    setStops(newStops);
  }, []);

  return (
    <div className="space-y-8">
      {/* Live Preview */}
      <div
        className="w-full rounded-2xl border border-border shadow-2xl"
        style={{ background: cssGradient, height: "clamp(200px, 40vh, 400px)" }}
        aria-label="Gradient preview"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type Toggle + Random */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setGradientType("linear")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${gradientType === "linear" ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"}`}
              >
                Linear
              </button>
              <button
                onClick={() => setGradientType("radial")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${gradientType === "radial" ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-hover"}`}
              >
                Radial
              </button>
            </div>
            <button
              onClick={randomGradient}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              Random
            </button>
          </div>

          {/* Direction Controls */}
          {gradientType === "linear" ? (
            <div className="bg-surface rounded-xl border border-border p-4">
              <label className="block text-sm font-medium text-muted mb-2">
                Angle: {angle}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Center X: {radialPosition.x}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={radialPosition.x}
                  onChange={(e) => setRadialPosition((p) => ({ ...p, x: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Center Y: {radialPosition.y}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={radialPosition.y}
                  onChange={(e) => setRadialPosition((p) => ({ ...p, y: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">
                Color Stops ({stops.length}/8)
              </h3>
              <button
                onClick={addStop}
                disabled={stops.length >= 8}
                className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                + Add Stop
              </button>
            </div>
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-3">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                  className="w-10 h-10 rounded-lg shrink-0"
                  aria-label={`Color for stop at ${stop.position}%`}
                />
                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateStop(stop.id, "color", v);
                  }}
                  className="w-24 px-2 py-1.5 text-sm font-mono bg-background border border-border rounded-md text-foreground"
                  aria-label="Hex color value"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => updateStop(stop.id, "position", Number(e.target.value))}
                  className="flex-1"
                  aria-label={`Position for color ${stop.color}`}
                />
                <span className="text-xs text-muted w-10 text-right font-mono">
                  {stop.position}%
                </span>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="p-1 text-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove color stop"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* CSS Output */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">CSS Output</h3>
              <button
                onClick={copyCSS}
                className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {copied ? "Copied!" : "Copy CSS"}
              </button>
            </div>
            <pre className="text-sm font-mono bg-background rounded-lg p-3 overflow-x-auto text-foreground border border-border">
              {cssCode}
            </pre>
          </div>

          {/* Tailwind Output */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">Tailwind CSS</h3>
              <button
                onClick={copyTailwind}
                className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {copiedTailwind ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-sm font-mono bg-background rounded-lg p-3 overflow-x-auto text-foreground border border-border whitespace-pre-wrap">
              {tailwindOutput}
            </pre>
          </div>
        </div>

        {/* Presets Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted">Presets</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {PRESETS.map((preset) => {
              const sortedStops = [...preset.stops].sort((a, b) => a.position - b.position);
              const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");
              const bg =
                preset.type === "linear"
                  ? `linear-gradient(${preset.angle}deg, ${stopsStr})`
                  : `radial-gradient(circle at ${preset.radialPosition.x}% ${preset.radialPosition.y}%, ${stopsStr})`;
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="group flex items-center gap-3 p-2 rounded-lg border border-border hover:border-accent/50 bg-surface hover:bg-surface-hover transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-md shrink-0 border border-border"
                    style={{ background: bg }}
                  />
                  <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
