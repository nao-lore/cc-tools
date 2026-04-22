"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---

type ListStyleFormat =
  | "decimal"
  | "lower-alpha"
  | "upper-alpha"
  | "lower-roman"
  | "upper-roman"
  | "disc";

type Scope = "page" | "section";

interface CounterConfig {
  name: string;
  format: ListStyleFormat;
  scope: Scope;
}

// --- Helpers ---

const FORMAT_LABELS: Record<ListStyleFormat, string> = {
  decimal: "Decimal (1, 2, 3…)",
  "lower-alpha": "Lower Alpha (a, b, c…)",
  "upper-alpha": "Upper Alpha (A, B, C…)",
  "lower-roman": "Lower Roman (i, ii, iii…)",
  "upper-roman": "Upper Roman (I, II, III…)",
  disc: "Disc (•)",
};

function toRoman(n: number, upper: boolean): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return upper ? result.toUpperCase() : result;
}

function formatCounter(n: number, format: ListStyleFormat): string {
  if (format === "decimal") return String(n);
  if (format === "lower-alpha") return String.fromCharCode(96 + n);
  if (format === "upper-alpha") return String.fromCharCode(64 + n);
  if (format === "lower-roman") return toRoman(n, false);
  if (format === "upper-roman") return toRoman(n, true);
  if (format === "disc") return "•";
  return String(n);
}

function buildCss(config: CounterConfig): string {
  const { name, format, scope } = config;

  if (scope === "page") {
    return `/* Reset counter at the start */
body {
  counter-reset: ${name};
}

/* Increment on each target element */
h2 {
  counter-increment: ${name};
}

/* Display counter before content */
h2::before {
  content: counter(${name}, ${format}) ". ";
  font-weight: bold;
}`;
  }

  // section scope with nested counters
  return `/* Reset top-level counter at body */
body {
  counter-reset: ${name};
}

/* Reset nested counter per section */
section {
  counter-reset: ${name}-item;
}

/* Increment heading counter */
h2 {
  counter-increment: ${name};
}

/* Display heading number */
h2::before {
  content: counter(${name}, ${format}) ". ";
  font-weight: bold;
}

/* Increment nested item counter */
li {
  counter-increment: ${name}-item;
  list-style: none;
}

/* Display nested counter */
li::before {
  content: counter(${name}, ${format}) "." counter(${name}-item, ${format}) " ";
}`;
}

// --- Select component ---

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// --- Preview panel ---

interface PreviewProps {
  config: CounterConfig;
}

function PreviewPanel({ config }: PreviewProps) {
  const { name, format, scope } = config;

  // Generate inline style string for preview via CSS custom property trick
  // We render sample headings/lists and show counter labels inline via JS
  const sections = scope === "page" ? 1 : 3;
  const headings = scope === "page" ? 4 : 2;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border p-5 text-sm font-sans space-y-4">
      <p className="text-xs text-muted mb-2 font-mono">Preview</p>
      {Array.from({ length: sections }).map((_, si) => (
        <div key={si} className={scope === "section" ? "border-l-2 border-accent/30 pl-4" : ""}>
          {Array.from({ length: headings }).map((_, hi) => {
            const headingN = scope === "page" ? si * headings + hi + 1 : hi + 1;
            const prefix = formatCounter(headingN, format);
            return (
              <div key={hi} className="mb-2">
                <div className="font-semibold text-foreground">
                  <span className="text-accent">{prefix}. </span>
                  {scope === "section"
                    ? `Section ${si + 1} — Heading ${hi + 1}`
                    : `Heading ${headingN}`}
                </div>
                {scope === "section" && (
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {[1, 2, 3].map((item) => (
                      <li key={item} className="text-muted text-xs flex gap-1.5">
                        <span className="text-accent font-mono">
                          {prefix}.{formatCounter(item, format)}
                        </span>
                        <span>List item {item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {scope === "page" && (
        <ul className="mt-2 space-y-1 ml-2">
          {[1, 2, 3].map((item) => (
            <li key={item} className="text-muted text-xs flex gap-1.5">
              <span className="text-accent font-mono">{formatCounter(item, format)}</span>
              <span>List item {item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Main component ---

export default function CssCounterGenerator() {
  const [name, setName] = useState("section");
  const [format, setFormat] = useState<ListStyleFormat>("decimal");
  const [scope, setScope] = useState<Scope>("page");
  const [copied, setCopied] = useState(false);

  const config: CounterConfig = { name: name.trim() || "section", format, scope };

  const css = useMemo(() => buildCss(config), [config.name, config.format, config.scope]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [css]);

  const formatOptions = Object.entries(FORMAT_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const scopeOptions = [
    { value: "page", label: "Page — single counter for the whole document" },
    { value: "section", label: "Section — nested counters per section" },
  ];

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Counter Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Counter name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Counter Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s+/g, "-"))}
              placeholder="section"
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <p className="text-xs text-muted">Used in counter-reset / counter-increment</p>
          </div>

          <Select
            label="Number Format"
            value={format}
            options={formatOptions}
            onChange={(v) => setFormat(v as ListStyleFormat)}
          />

          <Select
            label="Scope"
            value={scope}
            options={scopeOptions}
            onChange={(v) => setScope(v as Scope)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Document Preview</h3>
          </div>
          <div className="p-4">
            <PreviewPanel config={config} />
          </div>
        </div>

        {/* CSS Output */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">CSS Output</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy CSS
                </>
              )}
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-96">
            <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">
              {css}
            </pre>
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
