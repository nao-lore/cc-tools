"use client";

import { useState, useCallback, useId } from "react";

// --- Breakpoint data ---

interface Breakpoint {
  name: string;
  minWidth: number;
  color: string;
}

const FRAMEWORKS: Record<string, { label: string; breakpoints: Breakpoint[] }> = {
  bootstrap: {
    label: "Bootstrap 5",
    breakpoints: [
      { name: "xs", minWidth: 0, color: "#7952b3" },
      { name: "sm", minWidth: 576, color: "#5b8dee" },
      { name: "md", minWidth: 768, color: "#3db9d3" },
      { name: "lg", minWidth: 992, color: "#3dbb6a" },
      { name: "xl", minWidth: 1200, color: "#f6c23e" },
      { name: "xxl", minWidth: 1400, color: "#e74a3b" },
    ],
  },
  tailwind: {
    label: "Tailwind CSS",
    breakpoints: [
      { name: "base", minWidth: 0, color: "#06b6d4" },
      { name: "sm", minWidth: 640, color: "#3b82f6" },
      { name: "md", minWidth: 768, color: "#8b5cf6" },
      { name: "lg", minWidth: 1024, color: "#ec4899" },
      { name: "xl", minWidth: 1280, color: "#f59e0b" },
      { name: "2xl", minWidth: 1536, color: "#10b981" },
    ],
  },
  mui: {
    label: "Material UI",
    breakpoints: [
      { name: "xs", minWidth: 0, color: "#1976d2" },
      { name: "sm", minWidth: 600, color: "#42a5f5" },
      { name: "md", minWidth: 900, color: "#66bb6a" },
      { name: "lg", minWidth: 1200, color: "#ffa726" },
      { name: "xl", minWidth: 1536, color: "#ef5350" },
    ],
  },
};

const DEVICE_PRESETS = [
  { label: "iPhone", width: 390 },
  { label: "iPad", width: 768 },
  { label: "Laptop", width: 1280 },
  { label: "Desktop", width: 1920 },
];

const MAX_WIDTH = 2560;
const MIN_WIDTH = 320;

// --- Helpers ---

function getActiveBreakpoint(breakpoints: Breakpoint[], viewport: number): Breakpoint {
  let active = breakpoints[0];
  for (const bp of breakpoints) {
    if (viewport >= bp.minWidth) {
      active = bp;
    }
  }
  return active;
}

function mediaQuery(bp: Breakpoint): string {
  if (bp.minWidth === 0) return "/* applies to all widths */";
  return `@media (min-width: ${bp.minWidth}px)`;
}

// --- Sub-components ---

interface RulerBarProps {
  breakpoints: Breakpoint[];
  viewport: number;
  onViewportChange: (v: number) => void;
}

function RulerBar({ breakpoints, viewport, onViewportChange }: RulerBarProps) {
  const active = getActiveBreakpoint(breakpoints, viewport);

  return (
    <div className="space-y-3">
      {/* Ruler track */}
      <div className="relative h-12 rounded-xl overflow-hidden border border-border">
        {breakpoints.map((bp, i) => {
          const nextMin = breakpoints[i + 1]?.minWidth ?? MAX_WIDTH;
          const leftPct = (bp.minWidth / MAX_WIDTH) * 100;
          const widthPct = ((nextMin - bp.minWidth) / MAX_WIDTH) * 100;
          const isActive = bp.name === active.name;

          return (
            <div
              key={bp.name}
              className="absolute inset-y-0 flex items-center justify-center transition-opacity"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: bp.color,
                opacity: isActive ? 1 : 0.25,
              }}
            >
              <span
                className="text-white text-xs font-bold select-none truncate px-1"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
              >
                {bp.name}
              </span>
            </div>
          );
        })}

        {/* Viewport indicator */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{
            left: `${(viewport / MAX_WIDTH) * 100}%`,
            boxShadow: "0 0 6px 2px rgba(255,255,255,0.7)",
          }}
        />
      </div>

      {/* Slider */}
      <input
        type="range"
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        step={1}
        value={viewport}
        onChange={(e) => onViewportChange(Number(e.target.value))}
        className="w-full accent-violet-500 cursor-pointer"
        aria-label="Viewport width"
      />

      {/* Width labels */}
      <div className="flex justify-between text-xs text-muted font-mono">
        <span>{MIN_WIDTH}px</span>
        <span className="text-foreground font-semibold">{viewport}px</span>
        <span>{MAX_WIDTH}px</span>
      </div>
    </div>
  );
}

interface BreakpointTableProps {
  breakpoints: Breakpoint[];
  active: Breakpoint;
}

function BreakpointTable({ breakpoints, active }: BreakpointTableProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background/50">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Name</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted">Min-width</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted hidden sm:table-cell">Media Query</th>
            <th className="text-center px-4 py-2.5 text-xs font-medium text-muted">Active</th>
          </tr>
        </thead>
        <tbody>
          {breakpoints.map((bp, i) => {
            const isActive = bp.name === active.name;
            return (
              <tr
                key={bp.name}
                className={`${i < breakpoints.length - 1 ? "border-b border-border" : ""} ${isActive ? "bg-violet-50 dark:bg-violet-900/10" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: bp.color }}
                    />
                    <span className={`font-mono font-semibold ${isActive ? "text-foreground" : "text-muted"}`}>
                      {bp.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {bp.minWidth === 0 ? "0px" : `${bp.minWidth}px`}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-accent hidden sm:table-cell truncate max-w-xs">
                  {mediaQuery(bp)}
                </td>
                <td className="px-4 py-3 text-center">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Active
                    </span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Custom breakpoints editor ---

interface CustomBreakpoint {
  id: string;
  name: string;
  minWidth: number;
}

const CUSTOM_COLORS = [
  "#7c5cfc", "#ff6b9d", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899", "#14b8a6",
];

function CustomEditor({
  breakpoints,
  onChange,
}: {
  breakpoints: CustomBreakpoint[];
  onChange: (bps: CustomBreakpoint[]) => void;
}) {
  const uid = useId();

  const addRow = () => {
    const id = `${uid}-${Date.now()}`;
    onChange([...breakpoints, { id, name: "bp", minWidth: 0 }]);
  };

  const removeRow = (id: string) => {
    onChange(breakpoints.filter((b) => b.id !== id));
  };

  const updateRow = (id: string, field: "name" | "minWidth", value: string | number) => {
    onChange(
      breakpoints.map((b) =>
        b.id === id ? { ...b, [field]: field === "minWidth" ? Number(value) : value } : b
      )
    );
  };

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Custom Breakpoints</h3>
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add breakpoint
        </button>
      </div>

      {breakpoints.length === 0 ? (
        <div className="px-4 py-8 text-center text-muted text-sm">
          No breakpoints yet. Click "Add breakpoint" to start.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-2 text-xs font-medium text-muted">Name</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted">Min-width (px)</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {breakpoints.map((bp, i) => (
              <tr key={bp.id} className={i < breakpoints.length - 1 ? "border-b border-border" : ""}>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={bp.name}
                    onChange={(e) => updateRow(bp.id, "name", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="name"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    max={MAX_WIDTH}
                    value={bp.minWidth}
                    onChange={(e) => updateRow(bp.id, "minWidth", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => removeRow(bp.id)}
                    className="text-muted hover:text-red-500 transition-colors p-1 rounded"
                    aria-label="Remove breakpoint"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- Main component ---

type FrameworkKey = keyof typeof FRAMEWORKS | "custom";

const DEFAULT_CUSTOM: CustomBreakpoint[] = [
  { id: "c1", name: "mobile", minWidth: 0 },
  { id: "c2", name: "tablet", minWidth: 768 },
  { id: "c3", name: "desktop", minWidth: 1200 },
];

export default function BreakpointVisualizer() {
  const [activeTab, setActiveTab] = useState<FrameworkKey>("tailwind");
  const [viewport, setViewport] = useState(1280);
  const [viewportInput, setViewportInput] = useState("1280");
  const [customBps, setCustomBps] = useState<CustomBreakpoint[]>(DEFAULT_CUSTOM);

  const handleViewportChange = useCallback((v: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, v));
    setViewport(clamped);
    setViewportInput(String(clamped));
  }, []);

  const handleInputChange = (raw: string) => {
    setViewportInput(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      handleViewportChange(n);
    }
  };

  // Build breakpoints for current tab
  const currentBreakpoints: Breakpoint[] = activeTab === "custom"
    ? [...customBps]
        .sort((a, b) => a.minWidth - b.minWidth)
        .map((bp, i) => ({
          name: bp.name || `bp${i}`,
          minWidth: bp.minWidth,
          color: CUSTOM_COLORS[i % CUSTOM_COLORS.length],
        }))
    : FRAMEWORKS[activeTab].breakpoints;

  const activeBreakpoint = currentBreakpoints.length > 0
    ? getActiveBreakpoint(currentBreakpoints, viewport)
    : null;

  const tabs: { key: FrameworkKey; label: string }[] = [
    { key: "bootstrap", label: "Bootstrap 5" },
    { key: "tailwind", label: "Tailwind CSS" },
    { key: "mui", label: "Material UI" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6">
      {/* Viewport controls */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted mb-1">Viewport Width</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2 gap-1 w-36">
                <input
                  type="number"
                  min={MIN_WIDTH}
                  max={MAX_WIDTH}
                  value={viewportInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 bg-transparent text-foreground text-sm font-mono focus:outline-none w-full"
                  aria-label="Viewport width in pixels"
                />
                <span className="text-muted text-xs font-mono">px</span>
              </div>
              {activeBreakpoint && (
                <div className="flex items-center gap-2">
                  <span className="text-muted text-sm">Active:</span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: activeBreakpoint.color }}
                  >
                    {activeBreakpoint.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Device presets — Tailwind only as requested */}
          <div className="shrink-0">
            <p className="text-sm font-medium text-muted mb-1">Device Presets</p>
            <div className="flex flex-wrap gap-2">
              {DEVICE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleViewportChange(preset.width)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    viewport === preset.width
                      ? "bg-accent text-white border-accent"
                      : "bg-background border-border text-muted hover:text-foreground hover:border-accent/50"
                  }`}
                >
                  {preset.label}
                  <span className="ml-1 opacity-60">{preset.width}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentBreakpoints.length > 0 && (
          <RulerBar
            breakpoints={currentBreakpoints}
            viewport={viewport}
            onViewportChange={handleViewportChange}
          />
        )}
      </div>

      {/* Framework tabs */}
      <div>
        <div className="flex gap-1 bg-surface rounded-xl border border-border p-1 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "custom" ? (
          <div className="space-y-4">
            <CustomEditor breakpoints={customBps} onChange={setCustomBps} />
            {currentBreakpoints.length > 0 && activeBreakpoint && (
              <BreakpointTable breakpoints={currentBreakpoints} active={activeBreakpoint} />
            )}
          </div>
        ) : (
          activeBreakpoint && (
            <BreakpointTable breakpoints={currentBreakpoints} active={activeBreakpoint} />
          )
        )}
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Breakpoint Visualizer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visualize CSS breakpoints for popular frameworks. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Breakpoint Visualizer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visualize CSS breakpoints for popular frameworks. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Breakpoint Visualizer",
  "description": "Visualize CSS breakpoints for popular frameworks",
  "url": "https://tools.loresync.dev/breakpoint-visualizer",
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
