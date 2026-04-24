"use client";

import { useState, useMemo, useCallback } from "react";

type Entry = {
  cls: string;
  css: string;
};

type Category = {
  name: string;
  entries: Entry[];
};

const DATA: Category[] = [
  {
    name: "Layout",
    entries: [
      { cls: "block", css: "display: block" },
      { cls: "inline-block", css: "display: inline-block" },
      { cls: "inline", css: "display: inline" },
      { cls: "flex", css: "display: flex" },
      { cls: "inline-flex", css: "display: inline-flex" },
      { cls: "grid", css: "display: grid" },
      { cls: "inline-grid", css: "display: inline-grid" },
      { cls: "hidden", css: "display: none" },
      { cls: "flex-row", css: "flex-direction: row" },
      { cls: "flex-col", css: "flex-direction: column" },
      { cls: "flex-wrap", css: "flex-wrap: wrap" },
      { cls: "flex-nowrap", css: "flex-wrap: nowrap" },
      { cls: "flex-1", css: "flex: 1 1 0%" },
      { cls: "flex-auto", css: "flex: 1 1 auto" },
      { cls: "flex-none", css: "flex: none" },
      { cls: "items-start", css: "align-items: flex-start" },
      { cls: "items-center", css: "align-items: center" },
      { cls: "items-end", css: "align-items: flex-end" },
      { cls: "justify-start", css: "justify-content: flex-start" },
      { cls: "justify-center", css: "justify-content: center" },
      { cls: "justify-end", css: "justify-content: flex-end" },
      { cls: "justify-between", css: "justify-content: space-between" },
      { cls: "grid-cols-2", css: "grid-template-columns: repeat(2, minmax(0, 1fr))" },
      { cls: "grid-cols-3", css: "grid-template-columns: repeat(3, minmax(0, 1fr))" },
      { cls: "col-span-2", css: "grid-column: span 2 / span 2" },
      { cls: "gap-4", css: "gap: 1rem" },
      { cls: "gap-x-4", css: "column-gap: 1rem" },
      { cls: "gap-y-4", css: "row-gap: 1rem" },
      { cls: "container", css: "width: 100%; max-width varies by breakpoint" },
      { cls: "overflow-hidden", css: "overflow: hidden" },
      { cls: "overflow-auto", css: "overflow: auto" },
      { cls: "relative", css: "position: relative" },
      { cls: "absolute", css: "position: absolute" },
      { cls: "fixed", css: "position: fixed" },
      { cls: "sticky", css: "position: sticky" },
      { cls: "inset-0", css: "top: 0; right: 0; bottom: 0; left: 0" },
      { cls: "z-10", css: "z-index: 10" },
      { cls: "z-50", css: "z-index: 50" },
      { cls: "w-full", css: "width: 100%" },
      { cls: "h-full", css: "height: 100%" },
      { cls: "w-screen", css: "width: 100vw" },
      { cls: "h-screen", css: "height: 100vh" },
      { cls: "max-w-lg", css: "max-width: 32rem" },
      { cls: "max-w-xl", css: "max-width: 36rem" },
      { cls: "max-w-2xl", css: "max-width: 42rem" },
    ],
  },
  {
    name: "Spacing",
    entries: [
      { cls: "p-0", css: "padding: 0px" },
      { cls: "p-1", css: "padding: 0.25rem" },
      { cls: "p-2", css: "padding: 0.5rem" },
      { cls: "p-4", css: "padding: 1rem" },
      { cls: "p-6", css: "padding: 1.5rem" },
      { cls: "p-8", css: "padding: 2rem" },
      { cls: "px-4", css: "padding-left: 1rem; padding-right: 1rem" },
      { cls: "py-4", css: "padding-top: 1rem; padding-bottom: 1rem" },
      { cls: "pt-4", css: "padding-top: 1rem" },
      { cls: "pb-4", css: "padding-bottom: 1rem" },
      { cls: "m-0", css: "margin: 0px" },
      { cls: "m-auto", css: "margin: auto" },
      { cls: "m-4", css: "margin: 1rem" },
      { cls: "mx-auto", css: "margin-left: auto; margin-right: auto" },
      { cls: "my-4", css: "margin-top: 1rem; margin-bottom: 1rem" },
      { cls: "mt-4", css: "margin-top: 1rem" },
      { cls: "mb-4", css: "margin-bottom: 1rem" },
      { cls: "space-x-4", css: "& > * + * { margin-left: 1rem }" },
      { cls: "space-y-4", css: "& > * + * { margin-top: 1rem }" },
    ],
  },
  {
    name: "Typography",
    entries: [
      { cls: "text-xs", css: "font-size: 0.75rem; line-height: 1rem" },
      { cls: "text-sm", css: "font-size: 0.875rem; line-height: 1.25rem" },
      { cls: "text-base", css: "font-size: 1rem; line-height: 1.5rem" },
      { cls: "text-lg", css: "font-size: 1.125rem; line-height: 1.75rem" },
      { cls: "text-xl", css: "font-size: 1.25rem; line-height: 1.75rem" },
      { cls: "text-2xl", css: "font-size: 1.5rem; line-height: 2rem" },
      { cls: "text-3xl", css: "font-size: 1.875rem; line-height: 2.25rem" },
      { cls: "text-4xl", css: "font-size: 2.25rem; line-height: 2.5rem" },
      { cls: "font-thin", css: "font-weight: 100" },
      { cls: "font-light", css: "font-weight: 300" },
      { cls: "font-normal", css: "font-weight: 400" },
      { cls: "font-medium", css: "font-weight: 500" },
      { cls: "font-semibold", css: "font-weight: 600" },
      { cls: "font-bold", css: "font-weight: 700" },
      { cls: "font-extrabold", css: "font-weight: 800" },
      { cls: "text-left", css: "text-align: left" },
      { cls: "text-center", css: "text-align: center" },
      { cls: "text-right", css: "text-align: right" },
      { cls: "leading-tight", css: "line-height: 1.25" },
      { cls: "leading-normal", css: "line-height: 1.5" },
      { cls: "leading-relaxed", css: "line-height: 1.625" },
      { cls: "tracking-tight", css: "letter-spacing: -0.025em" },
      { cls: "tracking-wide", css: "letter-spacing: 0.025em" },
      { cls: "uppercase", css: "text-transform: uppercase" },
      { cls: "lowercase", css: "text-transform: lowercase" },
      { cls: "capitalize", css: "text-transform: capitalize" },
      { cls: "truncate", css: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap" },
      { cls: "whitespace-nowrap", css: "white-space: nowrap" },
      { cls: "break-words", css: "overflow-wrap: break-word" },
      { cls: "font-mono", css: "font-family: ui-monospace, monospace" },
    ],
  },
  {
    name: "Colors",
    entries: [
      { cls: "text-white", css: "color: rgb(255 255 255)" },
      { cls: "text-black", css: "color: rgb(0 0 0)" },
      { cls: "text-gray-500", css: "color: rgb(107 114 128)" },
      { cls: "text-gray-900", css: "color: rgb(17 24 39)" },
      { cls: "text-blue-500", css: "color: rgb(59 130 246)" },
      { cls: "text-red-500", css: "color: rgb(239 68 68)" },
      { cls: "text-green-500", css: "color: rgb(34 197 94)" },
      { cls: "bg-white", css: "background-color: rgb(255 255 255)" },
      { cls: "bg-black", css: "background-color: rgb(0 0 0)" },
      { cls: "bg-gray-100", css: "background-color: rgb(243 244 246)" },
      { cls: "bg-gray-900", css: "background-color: rgb(17 24 39)" },
      { cls: "bg-blue-500", css: "background-color: rgb(59 130 246)" },
      { cls: "bg-blue-600", css: "background-color: rgb(37 99 235)" },
      { cls: "bg-red-500", css: "background-color: rgb(239 68 68)" },
      { cls: "bg-green-500", css: "background-color: rgb(34 197 94)" },
      { cls: "bg-transparent", css: "background-color: transparent" },
      { cls: "opacity-0", css: "opacity: 0" },
      { cls: "opacity-50", css: "opacity: 0.5" },
      { cls: "opacity-100", css: "opacity: 1" },
    ],
  },
  {
    name: "Borders",
    entries: [
      { cls: "border", css: "border-width: 1px" },
      { cls: "border-0", css: "border-width: 0px" },
      { cls: "border-2", css: "border-width: 2px" },
      { cls: "border-t", css: "border-top-width: 1px" },
      { cls: "border-b", css: "border-bottom-width: 1px" },
      { cls: "border-gray-300", css: "border-color: rgb(209 213 219)" },
      { cls: "border-transparent", css: "border-color: transparent" },
      { cls: "border-solid", css: "border-style: solid" },
      { cls: "border-dashed", css: "border-style: dashed" },
      { cls: "rounded", css: "border-radius: 0.25rem" },
      { cls: "rounded-md", css: "border-radius: 0.375rem" },
      { cls: "rounded-lg", css: "border-radius: 0.5rem" },
      { cls: "rounded-xl", css: "border-radius: 0.75rem" },
      { cls: "rounded-2xl", css: "border-radius: 1rem" },
      { cls: "rounded-full", css: "border-radius: 9999px" },
      { cls: "rounded-none", css: "border-radius: 0px" },
      { cls: "divide-y", css: "& > * + * { border-top-width: 1px }" },
      { cls: "outline-none", css: "outline: 2px solid transparent; outline-offset: 2px" },
      { cls: "ring-1", css: "box-shadow: 0 0 0 1px rgb(var(--tw-ring-color))" },
      { cls: "ring-2", css: "box-shadow: 0 0 0 2px rgb(var(--tw-ring-color))" },
    ],
  },
  {
    name: "Effects",
    entries: [
      { cls: "shadow", css: "box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)" },
      { cls: "shadow-md", css: "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)" },
      { cls: "shadow-lg", css: "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)" },
      { cls: "shadow-xl", css: "box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1)" },
      { cls: "shadow-none", css: "box-shadow: none" },
      { cls: "blur", css: "filter: blur(8px)" },
      { cls: "blur-sm", css: "filter: blur(4px)" },
      { cls: "backdrop-blur", css: "backdrop-filter: blur(8px)" },
      { cls: "backdrop-blur-sm", css: "backdrop-filter: blur(4px)" },
      { cls: "grayscale", css: "filter: grayscale(100%)" },
      { cls: "cursor-pointer", css: "cursor: pointer" },
      { cls: "cursor-not-allowed", css: "cursor: not-allowed" },
      { cls: "pointer-events-none", css: "pointer-events: none" },
      { cls: "select-none", css: "user-select: none" },
      { cls: "resize-none", css: "resize: none" },
    ],
  },
  {
    name: "Transitions",
    entries: [
      { cls: "transition", css: "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms" },
      { cls: "transition-colors", css: "transition-property: color, background-color, border-color; transition-duration: 150ms" },
      { cls: "transition-opacity", css: "transition-property: opacity; transition-duration: 150ms" },
      { cls: "transition-transform", css: "transition-property: transform; transition-duration: 150ms" },
      { cls: "duration-150", css: "transition-duration: 150ms" },
      { cls: "duration-300", css: "transition-duration: 300ms" },
      { cls: "duration-500", css: "transition-duration: 500ms" },
      { cls: "ease-in", css: "transition-timing-function: cubic-bezier(0.4, 0, 1, 1)" },
      { cls: "ease-out", css: "transition-timing-function: cubic-bezier(0, 0, 0.2, 1)" },
      { cls: "ease-in-out", css: "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)" },
      { cls: "scale-95", css: "transform: scale(0.95)" },
      { cls: "scale-100", css: "transform: scale(1)" },
      { cls: "scale-105", css: "transform: scale(1.05)" },
      { cls: "rotate-45", css: "transform: rotate(45deg)" },
      { cls: "rotate-90", css: "transform: rotate(90deg)" },
      { cls: "translate-x-4", css: "transform: translateX(1rem)" },
      { cls: "translate-y-4", css: "transform: translateY(1rem)" },
      { cls: "animate-spin", css: "animation: spin 1s linear infinite" },
      { cls: "animate-pulse", css: "animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
      { cls: "animate-bounce", css: "animation: bounce 1s infinite" },
    ],
  },
];

const ALL_CATEGORIES = ["All", ...DATA.map((c) => c.name)];

export default function TailwindCheatsheet() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);

  const copyClass = useCallback(async (cls: string) => {
    await navigator.clipboard.writeText(cls);
    setCopied(cls);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return DATA.map((cat) => {
      if (activeCategory !== "All" && cat.name !== activeCategory) return null;
      const entries = q
        ? cat.entries.filter(
            (e) => e.cls.includes(q) || e.css.toLowerCase().includes(q)
          )
        : cat.entries;
      if (entries.length === 0) return null;
      return { ...cat, entries };
    }).filter(Boolean) as Category[];
  }, [search, activeCategory]);

  const totalCount = useMemo(
    () => filtered.reduce((acc, cat) => acc + cat.entries.length, 0),
    [filtered]
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Search Classes</h3>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="flex, padding, text-xl, display: flex..."
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
          aria-label="Search Tailwind classes"
        />
        <p className="text-xs text-muted">
          {totalCount} {totalCount === 1 ? "class" : "classes"} shown
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeCategory === cat
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center text-muted text-sm">
          No classes match &quot;{search}&quot;
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((cat) => (
            <div key={cat.name} className="bg-surface rounded-2xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-muted">{cat.name}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cat.entries.map((entry) => (
                  <button
                    key={entry.cls}
                    onClick={() => copyClass(entry.cls)}
                    title={`Click to copy: ${entry.cls}`}
                    className="flex items-start gap-3 text-left px-3 py-2.5 rounded-lg border border-border bg-background hover:border-accent transition-colors group"
                    aria-label={`Copy class ${entry.cls}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium text-foreground truncate">
                          {entry.cls}
                        </span>
                        {copied === entry.cls && (
                          <span className="text-[10px] text-accent font-medium shrink-0">
                            Copied!
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted leading-relaxed block mt-0.5 truncate">
                        {entry.css}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted group-hover:text-accent transition-colors shrink-0 mt-0.5">
                      copy
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Tailwind CSS Cheatsheet tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Searchable reference for all Tailwind CSS utility classes. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Tailwind CSS Cheatsheet tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Searchable reference for all Tailwind CSS utility classes. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
