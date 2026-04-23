"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

interface KeyframeStop {
  id: string;
  percent: number;
  opacity: number;
  translateX: number;
  scale: number;
  rotate: number;
  backgroundColor: string;
}

type TimingFunction =
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "linear"
  | "cubic-bezier(0.34,1.56,0.64,1)";

// ── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function buildTransform(stop: KeyframeStop): string {
  const parts: string[] = [];
  if (stop.translateX !== 0) parts.push(`translateX(${stop.translateX}px)`);
  if (stop.scale !== 1) parts.push(`scale(${stop.scale})`);
  if (stop.rotate !== 0) parts.push(`rotate(${stop.rotate}deg)`);
  return parts.length ? parts.join(" ") : "none";
}

function stopToCSS(stop: KeyframeStop, animName: string): string {
  const transform = buildTransform(stop);
  const lines: string[] = [`  ${stop.percent}% {`];
  lines.push(`    opacity: ${stop.opacity};`);
  if (transform !== "none") lines.push(`    transform: ${transform};`);
  lines.push(`    background-color: ${stop.backgroundColor};`);
  lines.push(`  }`);
  return lines.join("\n");
}

function generateCSS(
  stops: KeyframeStop[],
  animName: string,
  duration: number,
  timing: TimingFunction,
  iteration: string
): string {
  const sorted = [...stops].sort((a, b) => a.percent - b.percent);
  const keyframeLines = sorted.map((s) => stopToCSS(s, animName)).join("\n");
  const keyframes = `@keyframes ${animName} {\n${keyframeLines}\n}`;
  const shorthand = `.animated {\n  animation: ${animName} ${duration}s ${timing} ${iteration};\n}`;
  return `${keyframes}\n\n${shorthand}`;
}

// ── Default stops ────────────────────────────────────────────────────────────

const DEFAULT_STOPS: KeyframeStop[] = [
  {
    id: uid(),
    percent: 0,
    opacity: 0,
    translateX: -40,
    scale: 0.8,
    rotate: 0,
    backgroundColor: "#7c5cfc",
  },
  {
    id: uid(),
    percent: 50,
    opacity: 1,
    translateX: 0,
    scale: 1.1,
    rotate: 5,
    backgroundColor: "#f95b8c",
  },
  {
    id: uid(),
    percent: 100,
    opacity: 1,
    translateX: 0,
    scale: 1,
    rotate: 0,
    backgroundColor: "#7c5cfc",
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit = "",
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-mono text-foreground tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CssKeyframeGenerator() {
  const [stops, setStops] = useState<KeyframeStop[]>(DEFAULT_STOPS);
  const [animName, setAnimName] = useState("myAnimation");
  const [duration, setDuration] = useState(1.5);
  const [timing, setTiming] = useState<TimingFunction>("ease-in-out");
  const [iteration, setIteration] = useState("infinite");
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // ── Derived CSS ────────────────────────────────────────────────────────────

  const cssOutput = generateCSS(stops, animName, duration, timing, iteration);

  // ── Inject live preview style ──────────────────────────────────────────────

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.setAttribute("data-ckgen", "1");
      document.head.appendChild(el);
      styleRef.current = el;
    }
    const sorted = [...stops].sort((a, b) => a.percent - b.percent);
    const keyframeLines = sorted.map((s) => stopToCSS(s, animName)).join("\n");
    styleRef.current.textContent = `
      @keyframes ${animName} {
${keyframeLines}
      }
      .ckgen-preview-box {
        animation: ${animName} ${duration}s ${timing} ${iteration};
        width: 72px;
        height: 72px;
        border-radius: 12px;
      }
    `;
  }, [stops, animName, duration, timing, iteration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      styleRef.current?.remove();
    };
  }, []);

  // ── Stop management ────────────────────────────────────────────────────────

  const addStop = useCallback(() => {
    setStops((prev) => {
      const sorted = [...prev].sort((a, b) => a.percent - b.percent);
      // Insert midpoint between last two stops, or at 50 if only one
      let pct = 50;
      if (sorted.length >= 2) {
        const last = sorted[sorted.length - 1];
        const second = sorted[sorted.length - 2];
        pct = Math.round((last.percent + second.percent) / 2);
      }
      // Avoid duplicate percent
      const used = new Set(prev.map((s) => s.percent));
      while (used.has(pct) && pct < 99) pct++;
      return [
        ...prev,
        {
          id: uid(),
          percent: pct,
          opacity: 1,
          translateX: 0,
          scale: 1,
          rotate: 0,
          backgroundColor: "#a78bfa",
        },
      ];
    });
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const updateStop = useCallback(
    (id: string, patch: Partial<KeyframeStop>) => {
      setStops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
    },
    []
  );

  // ── Copy ──────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssOutput]);

  // ── Restart preview ────────────────────────────────────────────────────────

  const restartPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  const sortedStops = [...stops].sort((a, b) => a.percent - b.percent);

  return (
    <div className="space-y-6">
      {/* Animation settings */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Animation Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs text-muted block">Animation Name</label>
            <input
              type="text"
              value={animName}
              onChange={(e) =>
                setAnimName(e.target.value.replace(/\s/g, "") || "myAnimation")
              }
              className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              placeholder="myAnimation"
            />
          </div>

          {/* Timing function */}
          <div className="space-y-1">
            <label className="text-xs text-muted block">Timing Function</label>
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value as TimingFunction)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
            >
              <option value="ease">ease</option>
              <option value="ease-in">ease-in</option>
              <option value="ease-out">ease-out</option>
              <option value="ease-in-out">ease-in-out</option>
              <option value="linear">linear</option>
              <option value="cubic-bezier(0.34,1.56,0.64,1)">
                spring (cubic-bezier)
              </option>
            </select>
          </div>

          {/* Iteration */}
          <div className="space-y-1">
            <label className="text-xs text-muted block">Iteration Count</label>
            <select
              value={iteration}
              onChange={(e) => setIteration(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
            >
              <option value="infinite">infinite</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted">Duration</label>
              <span className="text-xs font-mono text-foreground tabular-nums">
                {duration}s
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>0.1s</span>
              <span>5s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe stops */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Keyframe Stops ({stops.length})
          </h2>
          <button
            onClick={addStop}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
          >
            + Add Stop
          </button>
        </div>

        <div className="space-y-4">
          {sortedStops.map((stop) => (
            <div
              key={stop.id}
              className="bg-background rounded-xl border border-border p-4 space-y-3"
            >
              {/* Header row */}
              <div className="flex items-center gap-3">
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-muted block">Position (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={stop.percent}
                    onChange={(e) =>
                      updateStop(stop.id, {
                        percent: Math.min(100, Math.max(0, Number(e.target.value))),
                      })
                    }
                    className="w-24 px-3 py-1.5 text-sm font-mono bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Color picker */}
                <div className="space-y-1">
                  <label className="text-xs text-muted block">Background</label>
                  <input
                    type="color"
                    value={stop.backgroundColor}
                    onChange={(e) =>
                      updateStop(stop.id, { backgroundColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    aria-label="Background color"
                  />
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="mt-4 px-2 py-1 text-xs text-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove stop"
                >
                  ✕
                </button>
              </div>

              {/* Property sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SliderRow
                  label="Opacity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={stop.opacity}
                  onChange={(v) => updateStop(stop.id, { opacity: v })}
                />
                <SliderRow
                  label="translateX"
                  min={-200}
                  max={200}
                  step={1}
                  value={stop.translateX}
                  onChange={(v) => updateStop(stop.id, { translateX: v })}
                  unit="px"
                />
                <SliderRow
                  label="Scale"
                  min={0}
                  max={3}
                  step={0.01}
                  value={stop.scale}
                  onChange={(v) => updateStop(stop.id, { scale: v })}
                />
                <SliderRow
                  label="Rotate"
                  min={-360}
                  max={360}
                  step={1}
                  value={stop.rotate}
                  onChange={(v) => updateStop(stop.id, { rotate: v })}
                  unit="deg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Live Preview</h2>
          <button
            onClick={restartPreview}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
          >
            Restart
          </button>
        </div>
        <div className="flex items-center justify-center h-40 bg-background rounded-xl border border-border">
          <div key={previewKey} className="ckgen-preview-box" />
        </div>
        <p className="text-xs text-muted text-center">
          Element with class <code className="font-mono">.animated</code> gets the animation applied
        </p>
      </div>

      {/* CSS Output */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">CSS Output</h2>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="p-4">
          <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-72 leading-relaxed whitespace-pre">
            {cssOutput}
          </pre>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
