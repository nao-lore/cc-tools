"use client";

import { useState, useMemo } from "react";
import { GITIGNORE_TEMPLATES, TEMPLATE_CATEGORIES } from "../lib/gitignore-templates";

export default function GitignoreGenerator() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const allTemplateNames = Object.keys(GITIGNORE_TEMPLATES);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allTemplateNames.filter((name) => name.toLowerCase().includes(q));
  }, [search]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const generated = useMemo(() => {
    if (selected.size === 0) return "";
    const parts: string[] = [];
    for (const name of selected) {
      if (GITIGNORE_TEMPLATES[name]) {
        parts.push(`# ==========================================\n# ${name}\n# ==========================================\n\n${GITIGNORE_TEMPLATES[name].trim()}\n`);
      }
    }
    return parts.join("\n");
  }, [selected]);

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGrid = (names: string[]) => (
    <div className="flex flex-wrap gap-2">
      {names.map((name) => {
        const isSelected = selected.has(name);
        return (
          <button
            key={name}
            onClick={() => toggle(name)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              isSelected
                ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates (e.g. Python, Unity, VSCode...)"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Selection count + clear */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
          <span className="text-sm text-indigo-700 font-medium">
            {selected.size} template{selected.size !== 1 ? "s" : ""} selected: {Array.from(selected).join(", ")}
          </span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-indigo-500 hover:text-indigo-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search results */}
      {filtered !== null ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Search Results ({filtered.length})
          </h3>
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500">No templates found for &quot;{search}&quot;</p>
          ) : (
            renderGrid(filtered)
          )}
        </div>
      ) : (
        /* Category grid */
        <div className="space-y-5">
          {Object.entries(TEMPLATE_CATEGORIES).map(([category, names]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category}
              </h3>
              {renderGrid(names)}
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">.gitignore Preview</span>
            {generated && (
              <span className="text-xs text-gray-400">
                {generated.split("\n").length} lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!generated}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                generated
                  ? copied
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={!generated}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                generated
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .gitignore
            </button>
          </div>
        </div>

        {generated ? (
          <pre className="p-4 text-xs font-mono text-gray-800 overflow-x-auto overflow-y-auto max-h-96 bg-gray-950 text-green-300 leading-relaxed">
            {generated.split("\n").map((line, i) => {
              const isComment = line.startsWith("#");
              const isBlank = line.trim() === "";
              return (
                <span
                  key={i}
                  className={`block ${
                    isComment
                      ? "text-gray-500"
                      : isBlank
                      ? "text-transparent"
                      : "text-green-300"
                  }`}
                >
                  {line || " "}
                </span>
              );
            })}
          </pre>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Select templates above to generate your .gitignore file</p>
          </div>
        )}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this .gitignore Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate .gitignore files for any project type. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this .gitignore Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate .gitignore files for any project type. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": ".gitignore Generator",
  "description": "Generate .gitignore files for any project type",
  "url": "https://tools.loresync.dev/gitignore-generator",
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
