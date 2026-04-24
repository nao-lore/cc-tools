"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type BaseStyle = "modern" | "normalize" | "bare";

interface Category {
  id: string;
  label: string;
  description: string;
  css: Record<BaseStyle, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_STYLES: { value: BaseStyle; label: string; description: string }[] = [
  {
    value: "modern",
    label: "Modern Reset",
    description: "Opinionated defaults for modern web apps. Removes browser inconsistencies and sets sensible baselines.",
  },
  {
    value: "normalize",
    label: "Normalize",
    description: "Preserves useful browser defaults while making styles consistent across browsers.",
  },
  {
    value: "bare",
    label: "Bare-bones",
    description: "Minimal reset. Only strips the most egregious browser defaults. Add your own styles on top.",
  },
];

const CATEGORIES: Category[] = [
  {
    id: "box-model",
    label: "Box Model",
    description:
      "Sets box-sizing: border-box on everything so padding and borders are included in element widths. Prevents the most common layout surprises in CSS.",
    css: {
      modern: `*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}`,
      normalize: `*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}`,
      bare: `* {\n  box-sizing: border-box;\n}`,
    },
  },
  {
    id: "typography",
    label: "Typography",
    description:
      "Resets font sizes, line heights, and enables font smoothing for crisp text rendering on macOS and iOS. Sets a consistent typographic baseline.",
    css: {
      modern: `html {\n  -webkit-text-size-adjust: 100%;\n  font-size: 16px;\n}\n\nbody {\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}`,
      normalize: `html {\n  -webkit-text-size-adjust: 100%;\n  font-size: 100%;\n}\n\nbody {\n  line-height: 1.5;\n}\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}`,
      bare: `body {\n  line-height: 1;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}`,
    },
  },
  {
    id: "lists",
    label: "Lists",
    description:
      "Removes default list styles (bullets, numbers, padding) from ul and ol elements. Useful when using lists for navigation or UI components rather than content.",
    css: {
      modern: `ul, ol {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}`,
      normalize: `ul, ol {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}`,
      bare: `ul, ol {\n  list-style: none;\n  padding: 0;\n}`,
    },
  },
  {
    id: "forms",
    label: "Forms",
    description:
      "Resets form element styles so inputs, buttons, and selects inherit font styles and remove OS-level appearance overrides. Makes cross-browser styling much easier.",
    css: {
      modern: `button,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: 100%;\n  font-weight: inherit;\n  line-height: inherit;\n  color: inherit;\n  margin: 0;\n  padding: 0;\n}\n\nbutton,\nselect {\n  text-transform: none;\n}\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button;\n  background-color: transparent;\n  background-image: none;\n  cursor: pointer;\n}`,
      normalize: `button,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: 100%;\n  line-height: 1.15;\n  margin: 0;\n}\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button;\n}`,
      bare: `button,\ninput,\nselect,\ntextarea {\n  font-family: inherit;\n  -webkit-appearance: none;\n  appearance: none;\n}`,
    },
  },
  {
    id: "media",
    label: "Media",
    description:
      "Makes images, videos, and other media elements responsive by default. Sets display: block to remove the descender gap below inline images.",
    css: {
      modern: `img,\nvideo,\nsvg,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block;\n  max-width: 100%;\n}\n\nimg,\nvideo {\n  height: auto;\n}`,
      normalize: `img {\n  display: block;\n  max-width: 100%;\n  height: auto;\n  border-style: none;\n}`,
      bare: `img,\nvideo {\n  max-width: 100%;\n  display: block;\n}`,
    },
  },
  {
    id: "tables",
    label: "Tables",
    description:
      "Collapses table borders and removes spacing between cells. Sets a consistent baseline so table styling behaves predictably across browsers.",
    css: {
      modern: `table {\n  border-collapse: collapse;\n  border-spacing: 0;\n  caption-side: bottom;\n}\n\nth {\n  font-weight: inherit;\n  text-align: inherit;\n}`,
      normalize: `table {\n  border-collapse: collapse;\n  border-spacing: 0;\n}`,
      bare: `table {\n  border-collapse: collapse;\n}`,
    },
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description:
      "Respects the user's reduced-motion preference to minimize animations and transitions. Adds a visible focus ring for keyboard navigation. Both are required for WCAG compliance.",
    css: {
      modern: `@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n\n:focus-visible {\n  outline: 2px solid currentColor;\n  outline-offset: 2px;\n}`,
      normalize: `@media (prefers-reduced-motion: reduce) {\n  * {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n\n:focus-visible {\n  outline: 2px solid currentColor;\n  outline-offset: 2px;\n}`,
      bare: `@media (prefers-reduced-motion: reduce) {\n  * {\n    animation: none !important;\n    transition: none !important;\n  }\n}`,
    },
  },
];

// ─── CSS Generation ────────────────────────────────────────────────────────────

function buildCss(base: BaseStyle, enabled: Set<string>): string {
  const preamble =
    base === "modern"
      ? `/* Modern CSS Reset — generated by CSS Reset Builder */\n/* https://css-reset-builder.vercel.app */\n`
      : base === "normalize"
      ? `/* Normalize-based CSS Reset — generated by CSS Reset Builder */\n/* https://css-reset-builder.vercel.app */\n`
      : `/* Bare-bones CSS Reset — generated by CSS Reset Builder */\n/* https://css-reset-builder.vercel.app */\n`;

  const blocks = CATEGORIES.filter((c) => enabled.has(c.id)).map(
    (c) => `/* ${c.label} */\n${c.css[base]}`
  );

  if (blocks.length === 0) return `${preamble}\n/* No categories selected. */`;
  return `${preamble}\n${blocks.join("\n\n")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CssResetBuilder() {
  const [base, setBase] = useState<BaseStyle>("modern");
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.id))
  );
  const [copied, setCopied] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const css = useMemo(() => buildCss(base, enabled), [base, enabled]);

  const toggleCategory = useCallback((id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [css]);

  const selectAll = useCallback(() => {
    setEnabled(new Set(CATEGORIES.map((c) => c.id)));
  }, []);

  const selectNone = useCallback(() => {
    setEnabled(new Set());
  }, []);

  const lineCount = css.split("\n").length;
  const byteCount = new TextEncoder().encode(css).length;

  return (
    <div className="space-y-6">
      {/* Base Style Selector */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Base Style
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BASE_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setBase(s.value)}
              className={`text-left p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                base === s.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`block text-sm font-semibold mb-1 ${
                  base === s.value ? "text-blue-700" : "text-slate-700"
                }`}
              >
                {s.label}
              </span>
              <span className="block text-xs text-slate-500 leading-relaxed">
                {s.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Category Toggles */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Categories
          </h2>
          <div className="flex gap-3 text-xs text-slate-400">
            <button
              onClick={selectAll}
              className="hover:text-slate-700 transition-colors cursor-pointer underline underline-offset-2"
            >
              Select all
            </button>
            <button
              onClick={selectNone}
              className="hover:text-slate-700 transition-colors cursor-pointer underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const isEnabled = enabled.has(cat.id);
            const isInfoOpen = expandedInfo === cat.id;

            return (
              <div
                key={cat.id}
                className={`rounded-xl border transition-colors ${
                  isEnabled
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Toggle */}
                  <button
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer mt-0.5 ${
                      isEnabled ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isEnabled ? "text-blue-700" : "text-slate-500"
                        }`}
                      >
                        {cat.label}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedInfo(isInfoOpen ? null : cat.id)
                        }
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex-shrink-0"
                        title="Show explanation"
                      >
                        <InfoIcon />
                      </button>
                    </div>

                    {isInfoOpen && (
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-lg px-3 py-2">
                        {cat.description}
                      </p>
                    )}

                    {/* CSS preview when enabled */}
                    {isEnabled && (
                      <pre className="mt-2 text-xs font-mono text-slate-500 bg-slate-50 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap">
                        {cat.css[base]}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Output Panel */}
      <section className="bg-slate-900 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Generated CSS
            </h2>
            <span className="text-xs text-slate-500">
              {lineCount} lines · {byteCount} bytes
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-600"
          >
            {copied ? (
              <>
                <CheckIcon /> Copied!
              </>
            ) : (
              <>
                <CopyIcon /> Copy CSS
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-sm text-green-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96 overflow-y-auto">
          {css}
        </pre>
      </section>

      {/* Reference Table */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Category Reference
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">
                  What it does
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">
                  Key properties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CATEGORIES.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-blue-700 align-top">
                    {cat.label}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">
                    {cat.description}
                  </td>
                  <td className="px-4 py-3 text-xs align-top">
                    <span className="font-mono text-slate-500">
                      {REFERENCE_KEYS[cat.id]}
                    </span>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Reset Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate a modern CSS reset tailored to your needs. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Reset Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate a modern CSS reset tailored to your needs. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}

// ─── Reference Keys ───────────────────────────────────────────────────────────

const REFERENCE_KEYS: Record<string, string> = {
  "box-model": "box-sizing: border-box",
  typography: "-webkit-font-smoothing, line-height",
  lists: "list-style: none, padding: 0",
  forms: "appearance: none, font: inherit",
  media: "max-width: 100%, display: block",
  tables: "border-collapse: collapse",
  accessibility: "prefers-reduced-motion, :focus-visible",
};

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

function InfoIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </svg>
  );
}
