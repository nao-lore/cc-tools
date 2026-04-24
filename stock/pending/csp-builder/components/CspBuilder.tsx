"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DirectiveState {
  enabled: boolean;
  sources: string[];
}

type DirectiveMap = Record<string, DirectiveState>;

// ─── Constants ────────────────────────────────────────────────────────────────

interface DirectiveInfo {
  name: string;
  description: string;
  defaultSources: string[];
  allowsNone: boolean;
}

const DIRECTIVES: DirectiveInfo[] = [
  {
    name: "default-src",
    description: "Fallback for all fetch directives not explicitly set. Acts as a catch-all for scripts, styles, images, etc.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "script-src",
    description: "Controls which scripts the browser may execute. Overrides default-src for scripts.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "style-src",
    description: "Controls which stylesheets can be applied. Overrides default-src for styles.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "img-src",
    description: "Specifies valid sources for images and favicons.",
    defaultSources: ["'self'", "data:"],
    allowsNone: true,
  },
  {
    name: "font-src",
    description: "Specifies valid sources for fonts loaded via @font-face.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "connect-src",
    description: "Restricts URLs that can be loaded using XMLHttpRequest, fetch, WebSocket, etc.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "media-src",
    description: "Specifies valid sources for loading media (audio and video elements).",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "frame-src",
    description: "Specifies valid sources for frames and iframes. Overrides child-src for frames.",
    defaultSources: ["'none'"],
    allowsNone: true,
  },
  {
    name: "object-src",
    description: "Specifies valid sources for <object>, <embed>, and <applet> elements.",
    defaultSources: ["'none'"],
    allowsNone: true,
  },
  {
    name: "base-uri",
    description: "Restricts URLs that can be used in a document's <base> element. Does not fall back to default-src.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "form-action",
    description: "Restricts the URLs which can be used as the action of HTML form elements. Does not fall back to default-src.",
    defaultSources: ["'self'"],
    allowsNone: true,
  },
  {
    name: "frame-ancestors",
    description: "Specifies parents that may embed this page (replaces X-Frame-Options). Cannot use 'unsafe-inline' or 'unsafe-eval'.",
    defaultSources: ["'none'"],
    allowsNone: true,
  },
];

const PRESET_SOURCES = [
  { label: "'self'",          value: "'self'",          warning: false },
  { label: "'unsafe-inline'", value: "'unsafe-inline'", warning: true  },
  { label: "'unsafe-eval'",   value: "'unsafe-eval'",   warning: true  },
  { label: "'none'",          value: "'none'",          warning: false },
  { label: "'strict-dynamic'",value: "'strict-dynamic'",warning: false },
  { label: "https:",          value: "https:",          warning: false },
  { label: "data:",           value: "data:",           warning: false },
];

// Directives where frame-ancestors rules apply (no unsafe-* keywords)
const FRAME_ANCESTORS_DIRECTIVES = new Set(["frame-ancestors"]);

// Sources that trigger security warnings
const UNSAFE_SOURCES = new Set(["'unsafe-inline'", "'unsafe-eval'"]);

// ─── Initial State ────────────────────────────────────────────────────────────

function buildInitialState(): DirectiveMap {
  const state: DirectiveMap = {};
  for (const d of DIRECTIVES) {
    state[d.name] = {
      enabled: d.name === "default-src",
      sources: [...d.defaultSources],
    };
  }
  return state;
}

// ─── CSP Logic ────────────────────────────────────────────────────────────────

function buildCspString(directives: DirectiveMap): string {
  const parts: string[] = [];
  for (const d of DIRECTIVES) {
    const state = directives[d.name];
    if (!state.enabled) continue;
    if (state.sources.length === 0) {
      parts.push(d.name);
    } else {
      parts.push(`${d.name} ${state.sources.join(" ")}`);
    }
  }
  return parts.join("; ");
}

function getWarnings(directives: DirectiveMap): string[] {
  const warnings: string[] = [];
  for (const d of DIRECTIVES) {
    const state = directives[d.name];
    if (!state.enabled) continue;
    for (const src of state.sources) {
      if (UNSAFE_SOURCES.has(src)) {
        warnings.push(`'${d.name}' uses ${src} — this weakens XSS protection.`);
      }
    }
  }
  // Check that object-src is restricted
  const objSrc = directives["object-src"];
  if (
    !objSrc?.enabled ||
    (!objSrc.sources.includes("'none'") && objSrc.sources.length > 0)
  ) {
    warnings.push("Consider setting object-src 'none' to block plugin-based attacks.");
  }
  return warnings;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CspBuilder() {
  const [directives, setDirectives] = useState<DirectiveMap>(buildInitialState);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [outputMode, setOutputMode] = useState<"header" | "meta">("header");

  const cspString = buildCspString(directives);
  const warnings = getWarnings(directives);
  const metaTag = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;

  const toggleDirective = useCallback((name: string) => {
    setDirectives((prev) => ({
      ...prev,
      [name]: { ...prev[name], enabled: !prev[name].enabled },
    }));
  }, []);

  const toggleSource = useCallback((directive: string, source: string) => {
    setDirectives((prev) => {
      const current = prev[directive].sources;
      let next: string[];
      if (source === "'none'") {
        // 'none' is exclusive — if toggling on, clear all others
        if (current.includes("'none'")) {
          next = current.filter((s) => s !== "'none'");
        } else {
          next = ["'none'"];
        }
      } else {
        // If adding any real source, remove 'none'
        if (current.includes(source)) {
          next = current.filter((s) => s !== source);
        } else {
          next = [...current.filter((s) => s !== "'none'"), source];
        }
      }
      return { ...prev, [directive]: { ...prev[directive], sources: next } };
    });
  }, []);

  const addCustomSource = useCallback(
    (directive: string) => {
      const raw = (customInputs[directive] ?? "").trim();
      if (!raw) return;
      setDirectives((prev) => {
        const current = prev[directive].sources;
        if (current.includes(raw)) return prev;
        return {
          ...prev,
          [directive]: {
            ...prev[directive],
            sources: [...current.filter((s) => s !== "'none'"), raw],
          },
        };
      });
      setCustomInputs((prev) => ({ ...prev, [directive]: "" }));
    },
    [customInputs]
  );

  const removeSource = useCallback((directive: string, source: string) => {
    setDirectives((prev) => ({
      ...prev,
      [directive]: {
        ...prev[directive],
        sources: prev[directive].sources.filter((s) => s !== source),
      },
    }));
  }, []);

  const handleCopy = useCallback(
    (mode: "header" | "meta") => {
      const text = mode === "header" ? cspString : metaTag;
      navigator.clipboard.writeText(text);
      if (mode === "header") {
        setCopiedHeader(true);
        setTimeout(() => setCopiedHeader(false), 2000);
      } else {
        setCopiedMeta(true);
        setTimeout(() => setCopiedMeta(false), 2000);
      }
    },
    [cspString, metaTag]
  );

  const reset = useCallback(() => {
    setDirectives(buildInitialState());
    setCustomInputs({});
  }, []);

  return (
    <div className="space-y-6">
      {/* Output Panel */}
      <section className="bg-slate-900 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated Output</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
              <button
                onClick={() => setOutputMode("header")}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${outputMode === "header" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                HTTP Header
              </button>
              <button
                onClick={() => setOutputMode("meta")}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${outputMode === "meta" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                Meta Tag
              </button>
            </div>
            <button
              onClick={() => handleCopy(outputMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-600"
            >
              {(outputMode === "header" ? copiedHeader : copiedMeta) ? (
                <><CheckIcon /> Copied!</>
              ) : (
                <><CopyIcon /> Copy</>
              )}
            </button>
          </div>
        </div>

        {outputMode === "header" ? (
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-mono">Content-Security-Policy:</p>
            <p className="font-mono text-sm text-green-300 break-all leading-relaxed">
              {cspString || <span className="text-slate-500 italic">Enable at least one directive below.</span>}
            </p>
          </div>
        ) : (
          <p className="font-mono text-sm text-green-300 break-all leading-relaxed">
            {cspString ? metaTag : <span className="text-slate-500 italic">Enable at least one directive below.</span>}
          </p>
        )}
      </section>

      {/* Warnings */}
      {warnings.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <WarningIcon />
            <span className="text-sm font-semibold text-amber-800">Security Warnings</span>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-amber-700 pl-6">{w}</p>
          ))}
        </section>
      )}

      {/* Directives */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Directives</h2>
          <button
            onClick={reset}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer underline underline-offset-2"
          >
            Reset to defaults
          </button>
        </div>

        <div className="space-y-3">
          {DIRECTIVES.map((d) => {
            const state = directives[d.name];
            const isFrameAncestors = FRAME_ANCESTORS_DIRECTIVES.has(d.name);
            const availableSources = isFrameAncestors
              ? PRESET_SOURCES.filter((s) => !["'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'"].includes(s.value))
              : PRESET_SOURCES;

            return (
              <div
                key={d.name}
                className={`rounded-xl border transition-colors ${state.enabled ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white"}`}
              >
                {/* Header row */}
                <div className="flex items-start gap-3 p-4">
                  {/* Toggle */}
                  <button
                    role="switch"
                    aria-checked={state.enabled}
                    onClick={() => toggleDirective(d.name)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer mt-0.5 ${state.enabled ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${state.enabled ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-semibold ${state.enabled ? "text-blue-700" : "text-slate-500"}`}>
                        {d.name}
                      </span>
                      {/* Tooltip trigger */}
                      <button
                        onClick={() => setTooltipOpen(tooltipOpen === d.name ? null : d.name)}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex-shrink-0"
                        title="Show description"
                      >
                        <InfoIcon />
                      </button>
                    </div>

                    {/* Tooltip description */}
                    {tooltipOpen === d.name && (
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg px-3 py-2">
                        {d.description}
                      </p>
                    )}

                    {/* Sources UI */}
                    {state.enabled && (
                      <div className="mt-3 space-y-2">
                        {/* Preset chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {availableSources.map((src) => {
                            const active = state.sources.includes(src.value);
                            return (
                              <button
                                key={src.value}
                                onClick={() => toggleSource(d.name, src.value)}
                                className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors cursor-pointer ${
                                  active
                                    ? src.warning
                                      ? "bg-amber-500 text-white border-amber-500"
                                      : "bg-blue-600 text-white border-blue-600"
                                    : src.warning
                                    ? "bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                {src.label}
                                {src.warning && !active && (
                                  <span className="ml-1 text-amber-500">!</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Active source pills */}
                        {state.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {state.sources.map((src) => {
                              const isUnsafe = UNSAFE_SOURCES.has(src);
                              return (
                                <span
                                  key={src}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-mono ${
                                    isUnsafe
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {src}
                                  <button
                                    onClick={() => removeSource(d.name, src)}
                                    className="hover:text-red-600 transition-colors cursor-pointer leading-none"
                                    title={`Remove ${src}`}
                                  >
                                    <XSmallIcon />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Custom URL input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={customInputs[d.name] ?? ""}
                            onChange={(e) =>
                              setCustomInputs((prev) => ({ ...prev, [d.name]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addCustomSource(d.name);
                            }}
                            placeholder="https://example.com"
                            className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
                          />
                          <button
                            onClick={() => addCustomSource(d.name)}
                            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reference */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Directive Reference</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Directive</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Purpose</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Fallback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DIRECTIVES.map((d) => (
                <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top">{d.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">{d.description}</td>
                  <td className="px-4 py-3 text-xs align-top">
                    {["base-uri", "form-action", "frame-ancestors"].includes(d.name) ? (
                      <span className="text-slate-400 italic">None (standalone)</span>
                    ) : (
                      <span className="font-mono text-slate-500">default-src</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad placeholder */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Content Security Policy Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build Content-Security-Policy headers interactively. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Content Security Policy Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build Content-Security-Policy headers interactively. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
