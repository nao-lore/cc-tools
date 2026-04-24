"use client";

import { useState, useMemo } from "react";

type LinkType = "internal" | "external" | "anchor" | "mailto" | "tel";
type LinkStatus = "ok" | "empty" | "javascript" | "malformed";

interface LinkEntry {
  text: string;
  url: string;
  type: LinkType;
  status: LinkStatus;
}

function classifyLink(href: string, baseUrl: string): { type: LinkType; status: LinkStatus } {
  const trimmed = href.trim();

  if (!trimmed) return { type: "external", status: "empty" };
  if (trimmed === "#" || trimmed.startsWith("#")) return { type: "anchor", status: "ok" };
  if (trimmed.toLowerCase().startsWith("javascript:")) return { type: "external", status: "javascript" };
  if (trimmed.toLowerCase().startsWith("mailto:")) return { type: "mailto", status: "ok" };
  if (trimmed.toLowerCase().startsWith("tel:")) return { type: "tel", status: "ok" };

  // Relative URLs — internal if no baseUrl or same origin
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("//")) {
    return { type: "internal", status: "ok" };
  }

  if (trimmed.startsWith("//")) {
    // Protocol-relative
    if (baseUrl) {
      try {
        const base = new URL(baseUrl);
        const linkHost = trimmed.replace("//", "").split("/")[0];
        if (linkHost === base.host) return { type: "internal", status: "ok" };
      } catch {
        // ignore
      }
    }
    return { type: "external", status: "ok" };
  }

  // Absolute URL
  try {
    const url = new URL(trimmed);
    if (baseUrl) {
      try {
        const base = new URL(baseUrl);
        if (url.hostname === base.hostname) return { type: "internal", status: "ok" };
      } catch {
        // ignore
      }
    }
    return { type: "external", status: "ok" };
  } catch {
    return { type: "external", status: "malformed" };
  }
}

function parseLinks(html: string, baseUrl: string): LinkEntry[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const anchors = Array.from(doc.querySelectorAll("a"));

  return anchors.map((a) => {
    const href = a.getAttribute("href") ?? "";
    const text = (a.textContent ?? "").trim().replace(/\s+/g, " ") || "(no text)";
    const { type, status } = classifyLink(href, baseUrl);
    return { text, url: href, type, status };
  });
}

const TYPE_COLORS: Record<LinkType, string> = {
  internal: "bg-green-100 text-green-800",
  external: "bg-blue-100 text-blue-800",
  anchor: "bg-purple-100 text-purple-800",
  mailto: "bg-yellow-100 text-yellow-800",
  tel: "bg-orange-100 text-orange-800",
};

const STATUS_COLORS: Record<LinkStatus, string> = {
  ok: "bg-gray-100 text-gray-600",
  empty: "bg-red-100 text-red-700",
  javascript: "bg-red-100 text-red-700",
  malformed: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<LinkStatus, string> = {
  ok: "OK",
  empty: "Empty href",
  javascript: "javascript:",
  malformed: "Malformed",
};

type FilterType = "all" | LinkType;

export default function LinkExtractor() {
  const [html, setHtml] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [copied, setCopied] = useState(false);

  const links = useMemo(() => {
    if (!html.trim()) return [];
    return parseLinks(html, baseUrl);
  }, [html, baseUrl]);

  const stats = useMemo(() => {
    const total = links.length;
    const internal = links.filter((l) => l.type === "internal").length;
    const external = links.filter((l) => l.type === "external").length;
    const anchors = links.filter((l) => l.type === "anchor").length;
    const mailto = links.filter((l) => l.type === "mailto").length;
    const tel = links.filter((l) => l.type === "tel").length;
    const issues = links.filter((l) => l.status !== "ok").length;
    return { total, internal, external, anchors, mailto, tel, issues };
  }, [links]);

  const filtered = useMemo(() => {
    if (filter === "all") return links;
    return links.filter((l) => l.type === filter);
  }, [links, filter]);

  const handleCopyUrls = () => {
    const urls = filtered.map((l) => l.url).join("\n");
    navigator.clipboard.writeText(urls).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filterBtns: { key: FilterType; label: string }[] = [
    { key: "all", label: `All (${stats.total})` },
    { key: "internal", label: `Internal (${stats.internal})` },
    { key: "external", label: `External (${stats.external})` },
    { key: "anchor", label: `Anchor (${stats.anchors})` },
    { key: "mailto", label: `Mailto (${stats.mailto})` },
    { key: "tel", label: `Tel (${stats.tel})` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Inputs */}
      <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div>
          <label className="block text-sm font-medium mb-1">Paste HTML</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", minHeight: "160px" }}
            placeholder="<html>...</html> or just paste the <body> section"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Base URL <span className="opacity-50 font-normal">(optional — for internal/external detection)</span>
            </label>
            <input
              type="url"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              placeholder="https://example.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {links.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Links", value: stats.total, color: "text-gray-700" },
            { label: "Internal", value: stats.internal, color: "text-green-700" },
            { label: "External", value: stats.external, color: "text-blue-700" },
            { label: "Issues", value: stats.issues, color: stats.issues > 0 ? "text-red-600" : "text-gray-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border p-3 text-center"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs opacity-60 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter + Copy */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filterBtns.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                style={filter !== key ? { borderColor: "var(--border)", color: "var(--foreground)" } : {}}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleCopyUrls}
            disabled={filtered.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors border"
            style={{ borderColor: "var(--border)" }}
          >
            {copied ? "Copied!" : `Copy ${filtered.length} URL${filtered.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Table */}
      {links.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide opacity-60" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                  <th className="px-4 py-3 w-8">#</th>
                  <th className="px-4 py-3">Link Text</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3 whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 hover:bg-black/5 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3 text-xs opacity-40">{i + 1}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="block truncate" title={link.text}>{link.text}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      {link.url ? (
                        <span className="block truncate font-mono text-xs opacity-80" title={link.url}>
                          {link.url}
                        </span>
                      ) : (
                        <span className="text-xs opacity-40 italic">(empty)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[link.type]}`}>
                        {link.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[link.status]}`}>
                        {STATUS_LABELS[link.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm opacity-40">No links match the selected filter.</div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!html.trim() && (
        <div
          className="rounded-xl border border-dashed py-16 text-center text-sm opacity-40"
          style={{ borderColor: "var(--border)" }}
        >
          Paste HTML above to extract and analyze all links
        </div>
      )}

      {html.trim() && links.length === 0 && (
        <div
          className="rounded-xl border border-dashed py-10 text-center text-sm opacity-40"
          style={{ borderColor: "var(--border)" }}
        >
          No &lt;a href&gt; tags found in the pasted HTML.
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Link Extractor & Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Extract all links from pasted HTML and categorize them. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Link Extractor & Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Extract all links from pasted HTML and categorize them. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
