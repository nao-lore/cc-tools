"use client";

import { useState, useMemo, useId } from "react";

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"
  | "";

interface UrlEntry {
  id: string;
  url: string;
  lastmod: string;
  changefreq: ChangeFreq;
  priority: string;
  error: string;
}

const CHANGEFREQ_OPTIONS: ChangeFreq[] = [
  "",
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateXml(entries: UrlEntry[]): string {
  const valid = entries.filter((e) => e.url.trim() && !e.error);
  if (valid.length === 0) return "";

  const urlTags = valid
    .map((e) => {
      const lines: string[] = [`    <loc>${escapeXml(e.url.trim())}</loc>`];
      if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== "") lines.push(`    <priority>${parseFloat(e.priority).toFixed(1)}</priority>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>`;
}

let idCounter = 0;
function newId() {
  return `url-${++idCounter}`;
}

function makeEntry(overrides: Partial<UrlEntry> = {}): UrlEntry {
  return {
    id: newId(),
    url: "",
    lastmod: "",
    changefreq: "",
    priority: "0.5",
    error: "",
    ...overrides,
  };
}

function validateEntry(entry: UrlEntry): UrlEntry {
  if (!entry.url.trim()) return { ...entry, error: "" };
  if (!isValidUrl(entry.url.trim())) {
    return { ...entry, error: "Invalid URL — must start with http:// or https://" };
  }
  return { ...entry, error: "" };
}

export default function SitemapGenerator() {
  const [mode, setMode] = useState<"textarea" | "rows">("textarea");
  const [textInput, setTextInput] = useState("");
  const [entries, setEntries] = useState<UrlEntry[]>([makeEntry()]);
  const [copied, setCopied] = useState(false);

  // Bulk defaults
  const [bulkLastmod, setBulkLastmod] = useState("");
  const [bulkChangefreq, setBulkChangefreq] = useState<ChangeFreq>("");
  const [bulkPriority, setBulkPriority] = useState("0.5");

  // ---- textarea mode: parse on the fly ----
  const textEntries = useMemo<UrlEntry[]>(() => {
    if (mode !== "textarea") return [];
    const lines = textInput.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((url) =>
      validateEntry(
        makeEntry({
          url,
          lastmod: bulkLastmod,
          changefreq: bulkChangefreq,
          priority: bulkPriority,
        })
      )
    );
  }, [mode, textInput, bulkLastmod, bulkChangefreq, bulkPriority]);

  const activeEntries = mode === "textarea" ? textEntries : entries;

  const xml = useMemo(() => generateXml(activeEntries), [activeEntries]);

  // ---- row mode helpers ----
  const updateEntry = (id: string, patch: Partial<UrlEntry>) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...patch };
        return validateEntry(updated);
      })
    );
  };

  const addRow = () => setEntries((prev) => [...prev, makeEntry()]);

  const removeRow = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length === 0 ? [makeEntry()] : next;
    });
  };

  const applyBulkDefaults = () => {
    if (mode === "rows") {
      setEntries((prev) =>
        prev.map((e) =>
          validateEntry({
            ...e,
            lastmod: bulkLastmod || e.lastmod,
            changefreq: (bulkChangefreq || e.changefreq) as ChangeFreq,
            priority: bulkPriority !== "" ? bulkPriority : e.priority,
          })
        )
      );
    }
  };

  const handleCopy = () => {
    if (!xml) return;
    navigator.clipboard.writeText(xml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!xml) return;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = activeEntries.filter((e) => e.url.trim() && !e.error).length;
  const errorCount = activeEntries.filter((e) => e.error).length;

  // XML syntax coloring
  const colorizedXml = useMemo(() => {
    if (!xml) return [];
    return xml.split("\n").map((line) => {
      // tag names
      let colored = line
        .replace(
          /(&lt;|<)(\/?)(\w+)([\s>]|&gt;)/g,
          (_, open, slash, tag, rest) =>
            `<span class="text-blue-300">${open}${slash}</span><span class="text-green-300">${tag}</span><span class="text-blue-300">${rest}</span>`
        )
        // attribute values (content between tags)
        .replace(
          /(>)([^<]+)(<)/g,
          (_, gt, content, lt) =>
            `${gt}<span class="text-yellow-200">${content}</span>${lt}`
        )
        // XML declaration
        .replace(
          /(&lt;\?xml[^?]*\?&gt;|<\?xml[^?]*\?>)/g,
          (m) => `<span class="text-gray-400">${m}</span>`
        );
      return colored;
    });
  }, [xml]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode("textarea")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "textarea"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Paste URLs
        </button>
        <button
          onClick={() => setMode("rows")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "rows"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Row Editor
        </button>
      </div>

      {/* Bulk defaults */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            {mode === "textarea" ? "Defaults (applied to all URLs)" : "Bulk Defaults"}
          </h2>
          {mode === "rows" && (
            <button
              onClick={applyBulkDefaults}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Apply to all rows
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">lastmod</label>
            <input
              type="date"
              value={bulkLastmod}
              onChange={(e) => setBulkLastmod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">changefreq</label>
            <select
              value={bulkChangefreq}
              onChange={(e) => setBulkChangefreq(e.target.value as ChangeFreq)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {CHANGEFREQ_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "" ? "— none —" : opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              priority: <span className="font-semibold text-gray-700">{parseFloat(bulkPriority).toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={bulkPriority}
              onChange={(e) => setBulkPriority(e.target.value)}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0.0</span>
              <span>1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* URL input */}
      {mode === "textarea" ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URLs <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`https://example.com/\nhttps://example.com/about\nhttps://example.com/blog`}
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
          {errorCount > 0 && (
            <p className="mt-2 text-xs text-red-600">
              {errorCount} invalid URL{errorCount !== 1 ? "s" : ""} will be skipped.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">URL Rows</span>
            <button
              onClick={addRow}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add URL
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 mt-2.5 w-5 shrink-0 text-right">{idx + 1}</span>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={entry.url}
                      onChange={(e) => updateEntry(entry.id, { url: e.target.value })}
                      placeholder="https://example.com/page"
                      className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        entry.error ? "border-red-400 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {entry.error && (
                      <p className="mt-1 text-xs text-red-600">{entry.error}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeRow(entry.id)}
                    className="mt-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-7">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">lastmod</label>
                    <input
                      type="date"
                      value={entry.lastmod}
                      onChange={(e) => updateEntry(entry.id, { lastmod: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">changefreq</label>
                    <select
                      value={entry.changefreq}
                      onChange={(e) => updateEntry(entry.id, { changefreq: e.target.value as ChangeFreq })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {CHANGEFREQ_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === "" ? "— none —" : opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      priority: <span className="font-semibold text-gray-700">{parseFloat(entry.priority).toFixed(1)}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={entry.priority}
                      onChange={(e) => updateEntry(entry.id, { priority: e.target.value })}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>0.0</span>
                      <span>1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={addRow}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              + Add another URL
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      {validCount > 0 && (
        <div className="flex items-center gap-3 text-sm text-gray-600 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-indigo-700 font-medium">
            {validCount} valid URL{validCount !== 1 ? "s" : ""} ready
          </span>
          {errorCount > 0 && (
            <span className="text-red-600 ml-2">
              · {errorCount} invalid (skipped)
            </span>
          )}
        </div>
      )}

      {/* XML Preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">sitemap.xml Preview</span>
            {xml && (
              <span className="text-xs text-gray-400">
                {xml.split("\n").length} lines
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!xml}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                xml
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
              disabled={!xml}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                xml
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download sitemap.xml
            </button>
          </div>
        </div>

        {xml ? (
          <pre className="p-4 text-xs font-mono overflow-x-auto overflow-y-auto max-h-96 bg-gray-950 leading-relaxed">
            {colorizedXml.map((line, i) => (
              <span
                key={i}
                className="block text-gray-300"
                dangerouslySetInnerHTML={{ __html: line || " " }}
              />
            ))}
          </pre>
        ) : (
          <div className="p-8 text-center text-gray-400 bg-gray-950">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              Add URLs above to generate sitemap.xml
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
