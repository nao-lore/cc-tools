"use client";

import { useState, useCallback } from "react";

// --- Mapping: CSS property → Tailwind prefix ---

interface PropertyDef {
  label: string;
  prefix: string;
  cssProperty: string;
  placeholder: string;
  hint: string;
}

const PROPERTIES: PropertyDef[] = [
  { label: "Width", prefix: "w", cssProperty: "width", placeholder: "123px", hint: "e.g. 123px, 50%, 10rem" },
  { label: "Height", prefix: "h", cssProperty: "height", placeholder: "80px", hint: "e.g. 80px, 100vh" },
  { label: "Min Width", prefix: "min-w", cssProperty: "min-width", placeholder: "320px", hint: "e.g. 320px" },
  { label: "Max Width", prefix: "max-w", cssProperty: "max-width", placeholder: "1200px", hint: "e.g. 1200px, 80ch" },
  { label: "Min Height", prefix: "min-h", cssProperty: "min-height", placeholder: "200px", hint: "e.g. 200px" },
  { label: "Max Height", prefix: "max-h", cssProperty: "max-height", placeholder: "600px", hint: "e.g. 600px" },
  { label: "Padding", prefix: "p", cssProperty: "padding", placeholder: "12px", hint: "e.g. 12px (all sides)" },
  { label: "Padding X", prefix: "px", cssProperty: "padding-left / padding-right", placeholder: "16px", hint: "e.g. 16px" },
  { label: "Padding Y", prefix: "py", cssProperty: "padding-top / padding-bottom", placeholder: "8px", hint: "e.g. 8px" },
  { label: "Padding Top", prefix: "pt", cssProperty: "padding-top", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Padding Right", prefix: "pr", cssProperty: "padding-right", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Padding Bottom", prefix: "pb", cssProperty: "padding-bottom", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Padding Left", prefix: "pl", cssProperty: "padding-left", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Margin", prefix: "m", cssProperty: "margin", placeholder: "12px", hint: "e.g. 12px (all sides)" },
  { label: "Margin X", prefix: "mx", cssProperty: "margin-left / margin-right", placeholder: "auto", hint: "e.g. auto, 16px" },
  { label: "Margin Y", prefix: "my", cssProperty: "margin-top / margin-bottom", placeholder: "8px", hint: "e.g. 8px" },
  { label: "Margin Top", prefix: "mt", cssProperty: "margin-top", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Margin Right", prefix: "mr", cssProperty: "margin-right", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Margin Bottom", prefix: "mb", cssProperty: "margin-bottom", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Margin Left", prefix: "ml", cssProperty: "margin-left", placeholder: "4px", hint: "e.g. 4px" },
  { label: "Font Size", prefix: "text", cssProperty: "font-size", placeholder: "18px", hint: "e.g. 18px, 1.25rem" },
  { label: "Font Weight", prefix: "font", cssProperty: "font-weight", placeholder: "600", hint: "e.g. 600, 700" },
  { label: "Line Height", prefix: "leading", cssProperty: "line-height", placeholder: "1.8", hint: "e.g. 1.8, 28px" },
  { label: "Letter Spacing", prefix: "tracking", cssProperty: "letter-spacing", placeholder: "0.05em", hint: "e.g. 0.05em, 1px" },
  { label: "Color", prefix: "text", cssProperty: "color", placeholder: "#ff0000", hint: "e.g. #ff0000, rgb(255,0,0)" },
  { label: "Background Color", prefix: "bg", cssProperty: "background-color", placeholder: "#1a1a2e", hint: "e.g. #1a1a2e" },
  { label: "Background Size", prefix: "bg-size", cssProperty: "background-size", placeholder: "200px 100px", hint: "e.g. 200px 100px" },
  { label: "Border Radius", prefix: "rounded", cssProperty: "border-radius", placeholder: "8px", hint: "e.g. 8px, 50%" },
  { label: "Border Width", prefix: "border", cssProperty: "border-width", placeholder: "3px", hint: "e.g. 3px" },
  { label: "Border Color", prefix: "border", cssProperty: "border-color", placeholder: "#e2e8f0", hint: "e.g. #e2e8f0" },
  { label: "Gap", prefix: "gap", cssProperty: "gap", placeholder: "12px", hint: "e.g. 12px, 1rem" },
  { label: "Gap X", prefix: "gap-x", cssProperty: "column-gap", placeholder: "16px", hint: "e.g. 16px" },
  { label: "Gap Y", prefix: "gap-y", cssProperty: "row-gap", placeholder: "8px", hint: "e.g. 8px" },
  { label: "Grid Template Columns", prefix: "grid-cols", cssProperty: "grid-template-columns", placeholder: "repeat(3, 1fr)", hint: "e.g. repeat(3, 1fr)" },
  { label: "Grid Template Rows", prefix: "grid-rows", cssProperty: "grid-template-rows", placeholder: "repeat(2, minmax(0, 1fr))", hint: "e.g. repeat(2, 200px)" },
  { label: "Top", prefix: "top", cssProperty: "top", placeholder: "10px", hint: "e.g. 10px" },
  { label: "Right", prefix: "right", cssProperty: "right", placeholder: "10px", hint: "e.g. 10px" },
  { label: "Bottom", prefix: "bottom", cssProperty: "bottom", placeholder: "10px", hint: "e.g. 10px" },
  { label: "Left", prefix: "left", cssProperty: "left", placeholder: "10px", hint: "e.g. 10px" },
  { label: "Z-Index", prefix: "z", cssProperty: "z-index", placeholder: "50", hint: "e.g. 50, 100" },
  { label: "Opacity", prefix: "opacity", cssProperty: "opacity", placeholder: "0.75", hint: "e.g. 0.75" },
  { label: "Translate X", prefix: "translate-x", cssProperty: "transform: translateX", placeholder: "10px", hint: "e.g. 10px, -50%" },
  { label: "Translate Y", prefix: "translate-y", cssProperty: "transform: translateY", placeholder: "10px", hint: "e.g. 10px" },
  { label: "Rotate", prefix: "rotate", cssProperty: "transform: rotate", placeholder: "45deg", hint: "e.g. 45deg" },
  { label: "Scale", prefix: "scale", cssProperty: "transform: scale", placeholder: "1.5", hint: "e.g. 1.5" },
  { label: "Box Shadow", prefix: "shadow", cssProperty: "box-shadow", placeholder: "0 4px 6px rgba(0,0,0,0.1)", hint: "e.g. 0 4px 6px rgba(0,0,0,.1)" },
  { label: "Outline Width", prefix: "outline", cssProperty: "outline-width", placeholder: "2px", hint: "e.g. 2px" },
  { label: "Flex Basis", prefix: "basis", cssProperty: "flex-basis", placeholder: "200px", hint: "e.g. 200px, 33%" },
  { label: "Columns", prefix: "columns", cssProperty: "columns", placeholder: "3", hint: "e.g. 3, 200px" },
  { label: "Aspect Ratio", prefix: "aspect", cssProperty: "aspect-ratio", placeholder: "16/9", hint: "e.g. 16/9, 4/3" },
  { label: "Inset", prefix: "inset", cssProperty: "inset", placeholder: "0", hint: "e.g. 0, 10px" },
  { label: "Content", prefix: "content", cssProperty: "content", placeholder: "''", hint: "e.g. '' for pseudo" },
];

// --- CSS property name → Tailwind prefix (for batch mode) ---
const CSS_TO_TAILWIND: Record<string, string> = {
  "width": "w",
  "height": "h",
  "min-width": "min-w",
  "max-width": "max-w",
  "min-height": "min-h",
  "max-height": "max-h",
  "padding": "p",
  "padding-top": "pt",
  "padding-right": "pr",
  "padding-bottom": "pb",
  "padding-left": "pl",
  "margin": "m",
  "margin-top": "mt",
  "margin-right": "mr",
  "margin-bottom": "mb",
  "margin-left": "ml",
  "font-size": "text",
  "font-weight": "font",
  "line-height": "leading",
  "letter-spacing": "tracking",
  "color": "text",
  "background-color": "bg",
  "background-size": "bg-size",
  "border-radius": "rounded",
  "border-width": "border",
  "border-color": "border",
  "gap": "gap",
  "column-gap": "gap-x",
  "row-gap": "gap-y",
  "grid-template-columns": "grid-cols",
  "grid-template-rows": "grid-rows",
  "top": "top",
  "right": "right",
  "bottom": "bottom",
  "left": "left",
  "z-index": "z",
  "opacity": "opacity",
  "box-shadow": "shadow",
  "outline-width": "outline",
  "flex-basis": "basis",
  "columns": "columns",
  "aspect-ratio": "aspect",
  "inset": "inset",
  "content": "content",
};

// --- Reference table data ---
const REFERENCE_TABLE = [
  { css: "width: 123px", tw: "w-[123px]" },
  { css: "height: 80px", tw: "h-[80px]" },
  { css: "max-width: 1200px", tw: "max-w-[1200px]" },
  { css: "padding: 12px", tw: "p-[12px]" },
  { css: "padding-left: 24px", tw: "pl-[24px]" },
  { css: "margin: 0 auto", tw: "m-[0_auto]" },
  { css: "margin-top: -8px", tw: "-mt-[8px] (or mt-[-8px])" },
  { css: "font-size: 18px", tw: "text-[18px]" },
  { css: "font-weight: 600", tw: "font-[600]" },
  { css: "line-height: 1.8", tw: "leading-[1.8]" },
  { css: "color: #ff0000", tw: "text-[#ff0000]" },
  { css: "background-color: #1a1a2e", tw: "bg-[#1a1a2e]" },
  { css: "border-radius: 8px", tw: "rounded-[8px]" },
  { css: "border-width: 3px", tw: "border-[3px]" },
  { css: "gap: 12px", tw: "gap-[12px]" },
  { css: "grid-template-columns: repeat(3, 1fr)", tw: "grid-cols-[repeat(3,1fr)]" },
  { css: "z-index: 999", tw: "z-[999]" },
  { css: "opacity: 0.75", tw: "opacity-[75%] or opacity-[0.75]" },
  { css: "box-shadow: 0 4px 6px ...", tw: "shadow-[0_4px_6px_...]" },
  { css: "aspect-ratio: 16/9", tw: "aspect-[16/9]" },
];

function buildClass(prefix: string, value: string): string {
  // Tailwind arbitrary: spaces → underscores
  const sanitized = value.trim().replace(/\s+/g, "_");
  return `${prefix}-[${sanitized}]`;
}

function buildCss(cssProperty: string, value: string): string {
  return `${cssProperty}: ${value.trim()};`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// --- Batch parser ---
interface BatchResult {
  original: string;
  cssProperty: string;
  value: string;
  twClass: string;
  known: boolean;
}

function parseBatchCss(input: string): BatchResult[] {
  const results: BatchResult[] = [];
  const lines = input.split("\n");
  for (const line of lines) {
    const trimmed = line.trim().replace(/;$/, "").trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const val = trimmed.slice(colonIdx + 1).trim();
    if (!val) continue;
    const prefix = CSS_TO_TAILWIND[prop];
    const twClass = prefix ? buildClass(prefix, val) : `[${prop}]-[${val.replace(/\s+/g, "_")}]`;
    results.push({ original: trimmed, cssProperty: prop, value: val, twClass, known: !!prefix });
  }
  return results;
}

// --- Sub-components ---

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// --- Main component ---

export default function TailwindArbitrary() {
  const [selectedProp, setSelectedProp] = useState<PropertyDef>(PROPERTIES[0]);
  const [value, setValue] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  const twClass = value.trim() ? buildClass(selectedProp.prefix, value) : "";
  const cssEquiv = value.trim() ? buildCss(selectedProp.cssProperty, value) : "";

  const batchResults = batchInput.trim() ? parseBatchCss(batchInput) : [];

  const handlePropChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = PROPERTIES.find((p) => p.prefix + "|" + p.cssProperty === e.target.value);
    if (found) {
      setSelectedProp(found);
      setValue("");
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("single")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "single"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Single Property
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "batch"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Batch (paste CSS)
        </button>
      </div>

      {/* Single mode */}
      {activeTab === "single" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Property selector */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">CSS Property</label>
              <select
                value={selectedProp.prefix + "|" + selectedProp.cssProperty}
                onChange={handlePropChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PROPERTIES.map((p) => (
                  <option key={p.prefix + "|" + p.cssProperty} value={p.prefix + "|" + p.cssProperty}>
                    {p.label} ({p.cssProperty})
                  </option>
                ))}
              </select>
            </div>

            {/* Value input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Value</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={selectedProp.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400">{selectedProp.hint}</p>
            </div>
          </div>

          {/* Output */}
          {twClass ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">Tailwind Class</p>
                    <code className="text-lg font-mono font-bold text-indigo-700">{twClass}</code>
                  </div>
                  <CopyButton text={twClass} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Equivalent CSS</p>
                  <code className="text-sm font-mono text-gray-700">{cssEquiv}</code>
                </div>
                <CopyButton text={cssEquiv} />
              </div>

              {/* Tip: spaces → underscores */}
              {value.includes(" ") && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Spaces in values are replaced with underscores (<code className="font-mono">_</code>) per Tailwind arbitrary value syntax.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              Enter a value above to generate the Tailwind class
            </div>
          )}
        </div>
      )}

      {/* Batch mode */}
      {activeTab === "batch" && (
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Paste raw CSS declarations</label>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              rows={8}
              placeholder={`width: 123px;\nheight: 80px;\nfont-size: 18px;\ncolor: #ff0000;\nborder-radius: 8px;`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
            <p className="text-xs text-gray-400">One declaration per line. Selector blocks not needed — just the property: value pairs.</p>
          </div>

          {batchResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">{batchResults.length} result{batchResults.length !== 1 ? "s" : ""}</h3>
                <CopyButton text={batchResults.map((r) => r.twClass).join(" ")} />
              </div>
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {batchResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-mono truncate">{r.original};</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-sm font-mono font-semibold text-indigo-700">{r.twClass}</code>
                        {!r.known && (
                          <span className="text-xs text-amber-500 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">unknown prop</span>
                        )}
                      </div>
                    </div>
                    <CopyButton text={r.twClass} />
                  </div>
                ))}
              </div>
              {/* All-in-one copy */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-400 mb-1 font-medium">All classes combined</p>
                <code className="text-sm font-mono text-gray-700 break-all">
                  {batchResults.map((r) => r.twClass).join(" ")}
                </code>
              </div>
            </div>
          )}

          {batchInput.trim() && batchResults.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No valid CSS declarations found. Make sure each line is in the format <code className="font-mono">property: value</code>.</p>
          )}
        </div>
      )}

      {/* Reference table */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Common Conversions Reference</h2>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">CSS</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tailwind Arbitrary</th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {REFERENCE_TABLE.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{row.css}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-indigo-700">{row.tw}</td>
                  <td className="px-4 py-2.5">
                    <CopyButton text={row.tw.split(" ")[0]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Tailwind Arbitrary Value Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate Tailwind CSS arbitrary value classes for custom values. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Tailwind Arbitrary Value Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate Tailwind CSS arbitrary value classes for custom values. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Tailwind Arbitrary Value Generator",
  "description": "Generate Tailwind CSS arbitrary value classes for custom values",
  "url": "https://tools.loresync.dev/tailwind-arbitrary",
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
