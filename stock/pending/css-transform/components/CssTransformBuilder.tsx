"use client";

import { useState, useCallback, useMemo } from "react";

interface TransformValues {
  translateX: number;
  translateY: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  perspectiveEnabled: boolean;
}

const DEFAULTS: TransformValues = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  perspective: 800,
  perspectiveEnabled: false,
};

const SLIDERS: {
  key: keyof Omit<TransformValues, "perspectiveEnabled">;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultVal: number;
}[] = [
  { key: "translateX", label: "Translate X", min: -200, max: 200, step: 1, unit: "px", defaultVal: 0 },
  { key: "translateY", label: "Translate Y", min: -200, max: 200, step: 1, unit: "px", defaultVal: 0 },
  { key: "rotate", label: "Rotate", min: 0, max: 360, step: 1, unit: "deg", defaultVal: 0 },
  { key: "scaleX", label: "Scale X", min: 0, max: 3, step: 0.01, unit: "", defaultVal: 1 },
  { key: "scaleY", label: "Scale Y", min: 0, max: 3, step: 0.01, unit: "", defaultVal: 1 },
  { key: "skewX", label: "Skew X", min: -45, max: 45, step: 1, unit: "deg", defaultVal: 0 },
  { key: "skewY", label: "Skew Y", min: -45, max: 45, step: 1, unit: "deg", defaultVal: 0 },
];

function buildTransformString(v: TransformValues): string {
  const parts: string[] = [];
  if (v.perspectiveEnabled) parts.push(`perspective(${v.perspective}px)`);
  if (v.translateX !== 0 || v.translateY !== 0)
    parts.push(`translate(${v.translateX}px, ${v.translateY}px)`);
  if (v.rotate !== 0) parts.push(`rotate(${v.rotate}deg)`);
  if (v.scaleX !== 1 || v.scaleY !== 1) {
    if (v.scaleX === v.scaleY) {
      parts.push(`scale(${v.scaleX})`);
    } else {
      parts.push(`scaleX(${v.scaleX}) scaleY(${v.scaleY})`);
    }
  }
  if (v.skewX !== 0 || v.skewY !== 0)
    parts.push(`skew(${v.skewX}deg, ${v.skewY}deg)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

function formatVal(val: number, unit: string): string {
  if (unit === "") return val.toFixed(2);
  return `${val}${unit}`;
}

export default function CssTransformBuilder() {
  const [values, setValues] = useState<TransformValues>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const transformString = useMemo(() => buildTransformString(values), [values]);

  const cssOutput = useMemo(() => {
    if (transformString === "none") return "transform: none;";
    return `transform: ${transformString};`;
  }, [transformString]);

  const updateValue = useCallback(
    (key: keyof Omit<TransformValues, "perspectiveEnabled">, value: number) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const togglePerspective = useCallback(() => {
    setValues((prev) => ({ ...prev, perspectiveEnabled: !prev.perspectiveEnabled }));
  }, []);

  const resetAll = useCallback(() => {
    setValues(DEFAULTS);
  }, []);

  const copyCSS = useCallback(async () => {
    await navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssOutput]);

  const isDefault =
    values.translateX === 0 &&
    values.translateY === 0 &&
    values.rotate === 0 &&
    values.scaleX === 1 &&
    values.scaleY === 1 &&
    values.skewX === 0 &&
    values.skewY === 0 &&
    !values.perspectiveEnabled;

  return (
    <div className="space-y-8">
      {/* Live Preview */}
      <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">Live Preview</h3>
          {!isDefault && (
            <button
              onClick={resetAll}
              className="px-3 py-1 text-xs font-medium rounded-md border border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <div
          className="w-full rounded-xl flex items-center justify-center"
          style={{ minHeight: "240px", background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(124,92,252,0.05) 10px, rgba(124,92,252,0.05) 20px)" }}
        >
          <div
            className="w-32 h-32 rounded-xl flex items-center justify-center text-white text-sm font-semibold select-none"
            style={{
              background: "linear-gradient(135deg, #7c5cfc 0%, #ff6b9d 100%)",
              transform: transformString === "none" ? undefined : transformString,
              transition: "transform 0.1s ease",
            }}
          >
            Preview
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
            {SLIDERS.map(({ key, label, min, max, step, unit, defaultVal }) => {
              const val = values[key] as number;
              const changed = val !== defaultVal;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-muted">{label}</label>
                    <span
                      className={`text-sm font-mono tabular-nums ${
                        changed ? "text-accent" : "text-muted"
                      }`}
                    >
                      {formatVal(val, unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => updateValue(key, Number(e.target.value))}
                    className="w-full"
                    aria-label={`${label} slider`}
                  />
                </div>
              );
            })}

            {/* Perspective toggle */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    role="switch"
                    aria-checked={values.perspectiveEnabled}
                    onClick={togglePerspective}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      values.perspectiveEnabled ? "bg-accent" : "bg-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        values.perspectiveEnabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <label className="text-sm font-medium text-muted">
                    Perspective (3D)
                  </label>
                </div>
                {values.perspectiveEnabled && (
                  <span className="text-sm font-mono tabular-nums text-accent">
                    {values.perspective}px
                  </span>
                )}
              </div>
              {values.perspectiveEnabled && (
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={10}
                  value={values.perspective}
                  onChange={(e) => updateValue("perspective", Number(e.target.value))}
                  className="w-full"
                  aria-label="Perspective slider"
                />
              )}
            </div>
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
            <pre className="text-sm font-mono bg-background rounded-lg p-3 overflow-x-auto text-foreground border border-border whitespace-pre-wrap break-all">
              {cssOutput}
            </pre>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted">Current Values</h3>
          <div className="bg-surface rounded-xl border border-border p-4 space-y-2">
            {SLIDERS.map(({ key, label, unit, defaultVal }) => {
              const val = values[key] as number;
              const changed = val !== defaultVal;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-muted">{label}</span>
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      changed ? "text-accent font-semibold" : "text-muted"
                    }`}
                  >
                    {formatVal(val, unit)}
                  </span>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Transform Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visual builder for CSS transform functions. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Transform Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visual builder for CSS transform functions. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
              );
            })}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Perspective</span>
              <span
                className={`text-xs font-mono tabular-nums ${
                  values.perspectiveEnabled ? "text-accent font-semibold" : "text-muted"
                }`}
              >
                {values.perspectiveEnabled ? `${values.perspective}px` : "off"}
              </span>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 space-y-2">
            <h4 className="text-xs font-medium text-muted uppercase tracking-wide">Quick Presets</h4>
            {[
              {
                name: "Flip H",
                apply: () => setValues((p) => ({ ...p, scaleX: -1, scaleY: 1 })),
              },
              {
                name: "Flip V",
                apply: () => setValues((p) => ({ ...p, scaleX: 1, scaleY: -1 })),
              },
              {
                name: "Rotate 45°",
                apply: () => setValues((p) => ({ ...p, rotate: 45 })),
              },
              {
                name: "Rotate 90°",
                apply: () => setValues((p) => ({ ...p, rotate: 90 })),
              },
              {
                name: "Scale 2×",
                apply: () => setValues((p) => ({ ...p, scaleX: 2, scaleY: 2 })),
              },
              {
                name: "Skew 15°",
                apply: () => setValues((p) => ({ ...p, skewX: 15, skewY: 0 })),
              },
            ].map(({ name, apply }) => (
              <button
                key={name}
                onClick={apply}
                className="w-full text-left px-3 py-2 text-sm rounded-lg border border-border bg-background text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
              >
                {name}
              </button>
            ))}
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
  "name": "CSS Transform Builder",
  "description": "Visual builder for CSS transform functions",
  "url": "https://tools.loresync.dev/css-transform",
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
