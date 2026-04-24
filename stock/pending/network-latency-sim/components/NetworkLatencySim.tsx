"use client";

import { useState, useCallback, useId } from "react";

type ResourceType = "HTML" | "CSS" | "JS" | "Image" | "Font";

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  sizeKB: number;
}

interface NetworkPreset {
  label: string;
  bandwidthKbps: number;
  latencyMs: number;
}

const PRESETS: Record<string, NetworkPreset> = {
  "2G":    { label: "2G",     bandwidthKbps: 50,      latencyMs: 500 },
  "3G":    { label: "3G",     bandwidthKbps: 1500,    latencyMs: 100 },
  "LTE":   { label: "LTE",    bandwidthKbps: 12000,   latencyMs: 30  },
  "Cable": { label: "Cable",  bandwidthKbps: 50000,   latencyMs: 10  },
  "Fiber": { label: "Fiber",  bandwidthKbps: 100000,  latencyMs: 5   },
};

const RESOURCE_TYPES: ResourceType[] = ["HTML", "CSS", "JS", "Image", "Font"];

const TYPE_COLORS: Record<ResourceType, string> = {
  HTML:  "bg-orange-400",
  CSS:   "bg-blue-400",
  JS:    "bg-yellow-400",
  Image: "bg-green-400",
  Font:  "bg-purple-400",
};

const TYPE_TEXT_COLORS: Record<ResourceType, string> = {
  HTML:  "text-orange-700",
  CSS:   "text-blue-700",
  JS:    "text-yellow-700",
  Image: "text-green-700",
  Font:  "text-purple-700",
};

const TYPE_BG_LIGHT: Record<ResourceType, string> = {
  HTML:  "bg-orange-50",
  CSS:   "bg-blue-50",
  JS:    "bg-yellow-50",
  Image: "bg-green-50",
  Font:  "bg-purple-50",
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// Transfer time in ms for a given size and bandwidth
function transferMs(sizeKB: number, bandwidthKbps: number): number {
  const sizeKbits = sizeKB * 8;
  return (sizeKbits / bandwidthKbps) * 1000;
}

interface WaterfallEntry {
  resource: Resource;
  startMs: number;
  endMs: number;
  durationMs: number;
}

// Waterfall calculation:
// - HTML loads first (1 RTT latency + transfer)
// - After HTML finishes: CSS, JS, Font load in parallel (each: 1 RTT + transfer)
// - After CSS+JS+Font finish: Images load in parallel (each: 1 RTT + transfer)
function computeWaterfall(
  resources: Resource[],
  preset: NetworkPreset
): WaterfallEntry[] {
  const { bandwidthKbps, latencyMs } = preset;
  const entries: WaterfallEntry[] = [];

  const html = resources.filter((r) => r.type === "HTML");
  const render = resources.filter((r) => r.type === "CSS" || r.type === "JS" || r.type === "Font");
  const images = resources.filter((r) => r.type === "Image");

  let htmlEnd = 0;

  // HTML: sequential
  for (const r of html) {
    const start = htmlEnd;
    const duration = latencyMs + transferMs(r.sizeKB, bandwidthKbps);
    const end = start + duration;
    entries.push({ resource: r, startMs: start, endMs: end, durationMs: duration });
    htmlEnd = end;
  }

  // CSS/JS/Font: parallel after HTML
  let renderEnd = htmlEnd;
  for (const r of render) {
    const start = htmlEnd;
    const duration = latencyMs + transferMs(r.sizeKB, bandwidthKbps);
    const end = start + duration;
    entries.push({ resource: r, startMs: start, endMs: end, durationMs: duration });
    if (end > renderEnd) renderEnd = end;
  }

  // Images: parallel after render-blocking resources
  for (const r of images) {
    const start = renderEnd;
    const duration = latencyMs + transferMs(r.sizeKB, bandwidthKbps);
    const end = start + duration;
    entries.push({ resource: r, startMs: start, endMs: end, durationMs: duration });
  }

  return entries;
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

const DEFAULT_RESOURCES: Resource[] = [
  { id: generateId(), name: "index.html", type: "HTML", sizeKB: 15 },
  { id: generateId(), name: "styles.css", type: "CSS", sizeKB: 40 },
  { id: generateId(), name: "app.js", type: "JS", sizeKB: 120 },
  { id: generateId(), name: "hero.jpg", type: "Image", sizeKB: 200 },
  { id: generateId(), name: "font.woff2", type: "Font", sizeKB: 30 },
];

export default function NetworkLatencySim() {
  const [resources, setResources] = useState<Resource[]>(DEFAULT_RESOURCES);
  const [preset, setPreset] = useState<string>("3G");
  const [customBandwidth, setCustomBandwidth] = useState<number>(5000);
  const [customLatency, setCustomLatency] = useState<number>(50);

  // New resource form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ResourceType>("JS");
  const [newSize, setNewSize] = useState<string>("50");

  const activePreset: NetworkPreset =
    preset === "Custom"
      ? { label: "Custom", bandwidthKbps: customBandwidth, latencyMs: customLatency }
      : PRESETS[preset];

  const waterfall = computeWaterfall(resources, activePreset);
  const totalMs = waterfall.length > 0 ? Math.max(...waterfall.map((e) => e.endMs)) : 0;

  const addResource = useCallback(() => {
    const size = parseFloat(newSize);
    if (!newName.trim() || isNaN(size) || size <= 0) return;
    setResources((prev) => [
      ...prev,
      { id: generateId(), name: newName.trim(), type: newType, sizeKB: size },
    ]);
    setNewName("");
    setNewSize("50");
  }, [newName, newType, newSize]);

  const removeResource = useCallback((id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateResource = useCallback(
    (id: string, field: keyof Resource, value: string | number) => {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  // Bar width percentage relative to totalMs
  const barWidth = (entry: WaterfallEntry) =>
    totalMs > 0 ? ((entry.endMs - entry.startMs) / totalMs) * 100 : 0;
  const barLeft = (entry: WaterfallEntry) =>
    totalMs > 0 ? (entry.startMs / totalMs) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Network Preset */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Network Profile
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...Object.keys(PRESETS), "Custom"].map((key) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                preset === key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Preset info or custom inputs */}
        {preset !== "Custom" ? (
          <div className="flex gap-6 text-sm text-gray-600">
            <span>
              <span className="font-medium text-gray-800">Bandwidth:</span>{" "}
              {activePreset.bandwidthKbps >= 1000
                ? `${activePreset.bandwidthKbps / 1000} Mbps`
                : `${activePreset.bandwidthKbps} kbps`}
            </span>
            <span>
              <span className="font-medium text-gray-800">Latency (RTT):</span>{" "}
              {activePreset.latencyMs}ms
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Bandwidth (kbps)
              </label>
              <input
                type="number"
                min={1}
                value={customBandwidth}
                onChange={(e) => setCustomBandwidth(Number(e.target.value))}
                className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Latency / RTT (ms)
              </label>
              <input
                type="number"
                min={0}
                value={customLatency}
                onChange={(e) => setCustomLatency(Number(e.target.value))}
                className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Resources
        </h2>

        {/* Resource list */}
        <div className="space-y-2 mb-4">
          {resources.length === 0 && (
            <p className="text-sm text-gray-400 italic">No resources added yet.</p>
          )}
          {resources.map((r) => (
            <div
              key={r.id}
              className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-100 ${TYPE_BG_LIGHT[r.type]}`}
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${TYPE_TEXT_COLORS[r.type]} bg-white border border-current`}
              >
                {r.type}
              </span>
              <input
                value={r.name}
                onChange={(e) => updateResource(r.id, "name", e.target.value)}
                className="flex-1 min-w-[120px] border border-gray-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
              <select
                value={r.type}
                onChange={(e) =>
                  updateResource(r.id, "type", e.target.value as ResourceType)
                }
                className="border border-gray-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={r.sizeKB}
                  onChange={(e) =>
                    updateResource(r.id, "sizeKB", parseFloat(e.target.value) || 0)
                  }
                  className="w-20 border border-gray-200 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <span className="text-xs text-gray-500">KB</span>
              </div>
              <button
                onClick={() => removeResource(r.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Remove resource"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add resource form */}
        <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addResource()}
              placeholder="e.g. vendor.js"
              className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ResourceType)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Size (KB)</label>
            <input
              type="number"
              min={0.1}
              step={1}
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addResource()}
              className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={addResource}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Waterfall */}
      {waterfall.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Waterfall Chart
            </h2>
            <div className="text-right">
              <span className="text-xs text-gray-500">Total load time</span>
              <div className="text-2xl font-bold text-indigo-600">{formatMs(totalMs)}</div>
            </div>
          </div>

          {/* Timeline header */}
          <div className="mb-1 pl-44 flex justify-between text-xs text-gray-400">
            <span>0</span>
            <span>{formatMs(totalMs / 2)}</span>
            <span>{formatMs(totalMs)}</span>
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {waterfall.map((entry) => (
              <div key={entry.resource.id} className="flex items-center gap-2">
                {/* Label */}
                <div className="w-44 flex-shrink-0 flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${TYPE_TEXT_COLORS[entry.resource.type]} bg-gray-50 border border-current`}
                  >
                    {entry.resource.type}
                  </span>
                  <span className="text-xs text-gray-700 truncate" title={entry.resource.name}>
                    {entry.resource.name}
                  </span>
                </div>

                {/* Bar track */}
                <div className="flex-1 relative h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className={`absolute top-0 h-full rounded ${TYPE_COLORS[entry.resource.type]} opacity-80`}
                    style={{
                      left: `${barLeft(entry)}%`,
                      width: `${Math.max(barWidth(entry), 0.5)}%`,
                    }}
                  />
                </div>

                {/* Duration label */}
                <div className="w-16 flex-shrink-0 text-right text-xs text-gray-500 font-mono">
                  {formatMs(entry.durationMs)}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
            {RESOURCE_TYPES.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-sm ${TYPE_COLORS[t]}`} />
                <span className="text-xs text-gray-600">{t}</span>
              </div>
            ))}
          </div>

          {/* Load order note */}
          <p className="mt-3 text-xs text-gray-400">
            Load order: HTML first → CSS / JS / Font in parallel → Images in parallel after render-blocking resources finish.
          </p>
        </div>
      )}

      {/* Per-resource breakdown */}
      {waterfall.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Breakdown
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Resource</th>
                <th className="text-left pb-2 font-medium">Type</th>
                <th className="text-right pb-2 font-medium">Size</th>
                <th className="text-right pb-2 font-medium">Start</th>
                <th className="text-right pb-2 font-medium">End</th>
                <th className="text-right pb-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {waterfall.map((entry) => (
                <tr key={entry.resource.id} className="text-gray-700">
                  <td className="py-1.5 pr-2 font-mono text-xs">{entry.resource.name}</td>
                  <td className="py-1.5 pr-2">
                    <span className={`text-xs font-medium ${TYPE_TEXT_COLORS[entry.resource.type]}`}>
                      {entry.resource.type}
                    </span>
                  </td>
                  <td className="py-1.5 text-right text-xs">{entry.resource.sizeKB} KB</td>
                  <td className="py-1.5 text-right text-xs font-mono">{formatMs(entry.startMs)}</td>
                  <td className="py-1.5 text-right text-xs font-mono">{formatMs(entry.endMs)}</td>
                  <td className="py-1.5 text-right text-xs font-mono font-medium">{formatMs(entry.durationMs)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 font-semibold text-gray-800">
                <td colSpan={5} className="pt-2 text-xs">Total</td>
                <td className="pt-2 text-right text-xs font-mono text-indigo-600">{formatMs(totalMs)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Network Latency Simulator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Simulate slow network throttling to plan loading UX. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Network Latency Simulator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Simulate slow network throttling to plan loading UX. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
