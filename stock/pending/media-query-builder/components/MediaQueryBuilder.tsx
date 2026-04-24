"use client";

import { useState, useCallback, useMemo } from "react";

type LogicalOp = "and" | "or";

type ConditionType =
  | "min-width"
  | "max-width"
  | "min-height"
  | "max-height"
  | "orientation"
  | "prefers-color-scheme"
  | "prefers-reduced-motion"
  | "hover"
  | "pointer";

interface Condition {
  id: number;
  type: ConditionType;
  value: string;
}

interface Device {
  name: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait";
  hover: "hover" | "none";
  pointer: "coarse" | "fine" | "none";
  prefersColorScheme: "light" | "dark";
  prefersReducedMotion: "no-preference" | "reduce";
}

const DEVICES: Device[] = [
  { name: "Mobile", width: 375, height: 667, orientation: "portrait", hover: "none", pointer: "coarse", prefersColorScheme: "light", prefersReducedMotion: "no-preference" },
  { name: "Tablet", width: 768, height: 1024, orientation: "portrait", hover: "none", pointer: "coarse", prefersColorScheme: "light", prefersReducedMotion: "no-preference" },
  { name: "Laptop", width: 1280, height: 800, orientation: "landscape", hover: "hover", pointer: "fine", prefersColorScheme: "light", prefersReducedMotion: "no-preference" },
  { name: "Desktop", width: 1920, height: 1080, orientation: "landscape", hover: "hover", pointer: "fine", prefersColorScheme: "light", prefersReducedMotion: "no-preference" },
];

const DEVICE_ICONS: Record<string, string> = {
  Mobile: "📱",
  Tablet: "📟",
  Laptop: "💻",
  Desktop: "🖥️",
};

const TAILWIND_PRESETS: { name: string; conditions: Omit<Condition, "id">[] }[] = [
  { name: "sm", conditions: [{ type: "min-width", value: "640" }] },
  { name: "md", conditions: [{ type: "min-width", value: "768" }] },
  { name: "lg", conditions: [{ type: "min-width", value: "1024" }] },
  { name: "xl", conditions: [{ type: "min-width", value: "1280" }] },
  { name: "2xl", conditions: [{ type: "min-width", value: "1536" }] },
];

const CONDITION_CONFIGS: Record<
  ConditionType,
  { label: string; inputType: "number" | "select"; options?: string[]; unit?: string; placeholder?: string }
> = {
  "min-width": { label: "Min Width", inputType: "number", unit: "px", placeholder: "768" },
  "max-width": { label: "Max Width", inputType: "number", unit: "px", placeholder: "1279" },
  "min-height": { label: "Min Height", inputType: "number", unit: "px", placeholder: "600" },
  "max-height": { label: "Max Height", inputType: "number", unit: "px", placeholder: "900" },
  orientation: { label: "Orientation", inputType: "select", options: ["portrait", "landscape"] },
  "prefers-color-scheme": { label: "Color Scheme", inputType: "select", options: ["light", "dark"] },
  "prefers-reduced-motion": { label: "Reduced Motion", inputType: "select", options: ["no-preference", "reduce"] },
  hover: { label: "Hover", inputType: "select", options: ["hover", "none"] },
  pointer: { label: "Pointer", inputType: "select", options: ["none", "coarse", "fine"] },
};

const DEFAULT_VALUES: Record<ConditionType, string> = {
  "min-width": "768",
  "max-width": "1279",
  "min-height": "600",
  "max-height": "900",
  orientation: "portrait",
  "prefers-color-scheme": "light",
  "prefers-reduced-motion": "no-preference",
  hover: "hover",
  pointer: "coarse",
};

function buildConditionString(c: Condition): string {
  const cfg = CONDITION_CONFIGS[c.type];
  if (cfg.inputType === "number") {
    return `(${c.type}: ${c.value}${cfg.unit ?? ""})`;
  }
  return `(${c.type}: ${c.value})`;
}

function buildMediaQuery(conditions: Condition[], op: LogicalOp): string {
  if (conditions.length === 0) return "@media screen { }";
  const separator = op === "and" ? " and " : ",\n       ";
  const parts = conditions.map(buildConditionString);
  return `@media ${parts.join(separator)} {\n  /* your styles here */\n}`;
}

function conditionMatchesDevice(c: Condition, device: Device): boolean {
  switch (c.type) {
    case "min-width":
      return device.width >= Number(c.value);
    case "max-width":
      return device.width <= Number(c.value);
    case "min-height":
      return device.height >= Number(c.value);
    case "max-height":
      return device.height <= Number(c.value);
    case "orientation":
      return device.orientation === c.value;
    case "prefers-color-scheme":
      return device.prefersColorScheme === c.value;
    case "prefers-reduced-motion":
      return device.prefersReducedMotion === c.value;
    case "hover":
      return device.hover === c.value;
    case "pointer":
      return device.pointer === c.value;
    default:
      return false;
  }
}

function deviceMatchesQuery(conditions: Condition[], op: LogicalOp, device: Device): boolean {
  if (conditions.length === 0) return false;
  if (op === "and") return conditions.every((c) => conditionMatchesDevice(c, device));
  return conditions.some((c) => conditionMatchesDevice(c, device));
}

let nextId = 1;

export default function MediaQueryBuilder() {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: nextId++, type: "min-width", value: "768" },
  ]);
  const [op, setOp] = useState<LogicalOp>("and");
  const [copied, setCopied] = useState(false);

  const mediaQuery = useMemo(() => buildMediaQuery(conditions, op), [conditions, op]);

  const addCondition = useCallback(() => {
    setConditions((prev) => [
      ...prev,
      { id: nextId++, type: "min-width", value: DEFAULT_VALUES["min-width"] },
    ]);
  }, []);

  const removeCondition = useCallback((id: number) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateConditionType = useCallback((id: number, type: ConditionType) => {
    setConditions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, type, value: DEFAULT_VALUES[type] } : c
      )
    );
  }, []);

  const updateConditionValue = useCallback((id: number, value: string) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value } : c))
    );
  }, []);

  const applyPreset = useCallback((preset: (typeof TAILWIND_PRESETS)[number]) => {
    setConditions(
      preset.conditions.map((c) => ({ ...c, id: nextId++ }))
    );
    setOp("and");
  }, []);

  const copyQuery = useCallback(async () => {
    await navigator.clipboard.writeText(mediaQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mediaQuery]);

  const deviceMatches = useMemo(
    () => DEVICES.map((d) => deviceMatchesQuery(conditions, op, d)),
    [conditions, op]
  );

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted font-medium">Tailwind:</span>
        {TAILWIND_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1 text-sm font-mono font-medium rounded-lg border border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Condition Builder */}
        <div className="lg:col-span-3 space-y-4">
          {/* Operator toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted font-medium">Combine with:</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["and", "or"] as LogicalOp[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setOp(o)}
                  className={`px-4 py-1.5 text-sm font-mono font-medium transition-colors ${
                    op === o
                      ? "bg-accent text-white"
                      : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            {conditions.map((condition, idx) => {
              const cfg = CONDITION_CONFIGS[condition.type];
              return (
                <div key={condition.id} className="space-y-2">
                  {idx > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs font-mono text-muted px-2">{op}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {/* Type select */}
                    <select
                      value={condition.type}
                      onChange={(e) =>
                        updateConditionType(condition.id, e.target.value as ConditionType)
                      }
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                    >
                      {(Object.keys(CONDITION_CONFIGS) as ConditionType[]).map((t) => (
                        <option key={t} value={t}>
                          {CONDITION_CONFIGS[t].label}
                        </option>
                      ))}
                    </select>

                    {/* Value input */}
                    {cfg.inputType === "number" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={condition.value}
                          onChange={(e) => updateConditionValue(condition.id, e.target.value)}
                          placeholder={cfg.placeholder}
                          className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent font-mono"
                        />
                        {cfg.unit && (
                          <span className="text-sm text-muted font-mono">{cfg.unit}</span>
                        )}
                      </div>
                    ) : (
                      <select
                        value={condition.value}
                        onChange={(e) => updateConditionValue(condition.id, e.target.value)}
                        className="w-40 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      >
                        {cfg.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Remove */}
                    <button
                      onClick={() => removeCondition(condition.id)}
                      disabled={conditions.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:text-red-400 hover:border-red-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Remove condition"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={addCondition}
              className="w-full py-2 text-sm font-medium rounded-lg border border-dashed border-border text-muted hover:border-accent hover:text-accent transition-colors"
            >
              + Add Condition
            </button>
          </div>

          {/* Generated Output */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">Generated @media Rule</h3>
              <button
                onClick={copyQuery}
                className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-sm font-mono bg-background rounded-lg p-3 overflow-x-auto text-foreground border border-border whitespace-pre-wrap break-all leading-relaxed">
              {mediaQuery}
            </pre>
          </div>
        </div>

        {/* Right: Device Preview */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-muted">Device Preview</h3>
          <p className="text-xs text-muted">
            Shows which common devices match your query (approximate screen sizes).
          </p>
          <div className="space-y-3">
            {DEVICES.map((device, idx) => {
              const matches = deviceMatches[idx];
              return (
                <div
                  key={device.name}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    matches
                      ? "border-green-400 bg-green-50/5"
                      : "border-border bg-surface opacity-60"
                  }`}
                >
                  <span className="text-2xl">{DEVICE_ICONS[device.name]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{device.name}</span>
                      {matches && (
                        <span className="text-xs font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                          Matches
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {device.width}×{device.height}px · {device.orientation}
                    </p>
                    <p className="text-xs text-muted font-mono">
                      hover: {device.hover} · pointer: {device.pointer}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      matches ? "bg-green-400" : "bg-border"
                    }`}
                  />
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Media Query Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build responsive CSS media queries with a visual editor. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Media Query Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build responsive CSS media queries with a visual editor. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
              );
            })}
          </div>

          {/* Quick reference */}
          <div className="bg-surface rounded-xl border border-border p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wide">
              Tailwind Breakpoints
            </h4>
            <div className="space-y-1">
              {[
                { name: "sm", px: 640 },
                { name: "md", px: 768 },
                { name: "lg", px: 1024 },
                { name: "xl", px: 1280 },
                { name: "2xl", px: 1536 },
              ].map((bp) => (
                <div key={bp.name} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-accent">{bp.name}</span>
                  <span className="text-xs font-mono text-muted">{bp.px}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Media Query Builder",
  "description": "Build responsive CSS media queries with a visual editor",
  "url": "https://tools.loresync.dev/media-query-builder",
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
