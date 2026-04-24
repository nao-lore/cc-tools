"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ContentType = "application/json" | "application/x-www-form-urlencoded";
type OutputTab = "curl" | "httpie" | "fetch";

interface KVRow {
  id: number;
  key: string;
  value: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "bg-emerald-600 border-emerald-600 text-white",
  POST:   "bg-blue-600 border-blue-600 text-white",
  PUT:    "bg-amber-500 border-amber-500 text-white",
  PATCH:  "bg-orange-500 border-orange-500 text-white",
  DELETE: "bg-red-600 border-red-600 text-white",
};

const METHOD_COLORS_INACTIVE = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";

const CONTENT_TYPE_OPTIONS: { label: string; value: ContentType }[] = [
  { label: "JSON (application/json)",                     value: "application/json" },
  { label: "Form (application/x-www-form-urlencoded)",   value: "application/x-www-form-urlencoded" },
];

let nextId = 1;
function makeRow(key = "", value = ""): KVRow {
  return { id: nextId++, key, value };
}

// ─── Build output strings ─────────────────────────────────────────────────────

function buildUrl(base: string, params: KVRow[]): string {
  const validParams = params.filter((p) => p.key.trim());
  if (!validParams.length) return base;
  const qs = validParams
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
  return `${base}${base.includes("?") ? "&" : "?"}${qs}`;
}

function buildCurl(
  method: HttpMethod,
  url: string,
  headers: KVRow[],
  params: KVRow[],
  body: string,
  contentType: ContentType,
  hasBody: boolean,
): string {
  const fullUrl = buildUrl(url || "https://example.com/api", params);
  const parts: string[] = [`curl -X ${method}`];

  const effectiveHeaders = [...headers.filter((h) => h.key.trim())];
  if (hasBody && body.trim()) {
    const alreadyHasCT = effectiveHeaders.some(
      (h) => h.key.toLowerCase() === "content-type",
    );
    if (!alreadyHasCT) {
      effectiveHeaders.unshift({ id: -1, key: "Content-Type", value: contentType });
    }
  }

  for (const h of effectiveHeaders) {
    parts.push(`  -H '${h.key}: ${h.value.replace(/'/g, "'\\''")}'`);
  }

  if (hasBody && body.trim()) {
    parts.push(`  -d '${body.replace(/'/g, "'\\''")}'`);
  }

  parts.push(`  '${fullUrl}'`);
  return parts.join(" \\\n");
}

function buildHttpie(
  method: HttpMethod,
  url: string,
  headers: KVRow[],
  params: KVRow[],
  body: string,
  contentType: ContentType,
  hasBody: boolean,
): string {
  const fullUrl = buildUrl(url || "https://example.com/api", params);
  const parts: string[] = [`http ${method} '${fullUrl}'`];

  const effectiveHeaders = [...headers.filter((h) => h.key.trim())];
  if (hasBody && body.trim()) {
    const alreadyHasCT = effectiveHeaders.some(
      (h) => h.key.toLowerCase() === "content-type",
    );
    if (!alreadyHasCT) {
      effectiveHeaders.unshift({ id: -1, key: "Content-Type", value: contentType });
    }
  }

  for (const h of effectiveHeaders) {
    parts.push(`  '${h.key}:${h.value}'`);
  }

  if (hasBody && body.trim()) {
    if (contentType === "application/json") {
      // Try to pass raw JSON body
      parts.push(`  --raw '${body.replace(/'/g, "'\\''")}'`);
    } else {
      // form fields
      try {
        const entries = [...new URLSearchParams(body)];
        for (const [k, v] of entries) {
          parts.push(`  '${k}=${v}'`);
        }
      } catch {
        parts.push(`  --raw '${body.replace(/'/g, "'\\''")}'`);
      }
    }
  }

  return parts.join(" \\\n");
}

function buildFetch(
  method: HttpMethod,
  url: string,
  headers: KVRow[],
  params: KVRow[],
  body: string,
  contentType: ContentType,
  hasBody: boolean,
): string {
  const fullUrl = buildUrl(url || "https://example.com/api", params);

  const headersObj: Record<string, string> = {};
  for (const h of headers.filter((h) => h.key.trim())) {
    headersObj[h.key] = h.value;
  }
  if (hasBody && body.trim()) {
    if (!Object.keys(headersObj).some((k) => k.toLowerCase() === "content-type")) {
      headersObj["Content-Type"] = contentType;
    }
  }

  const options: string[] = [`  method: '${method}'`];

  if (Object.keys(headersObj).length) {
    const headerLines = Object.entries(headersObj)
      .map(([k, v]) => `    '${k}': '${v}'`)
      .join(",\n");
    options.push(`  headers: {\n${headerLines}\n  }`);
  }

  if (hasBody && body.trim()) {
    options.push(`  body: \`${body.replace(/`/g, "\\`")}\``);
  }

  return `fetch('${fullUrl}', {\n${options.join(",\n")}\n});`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HttpCurlBuilder() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<KVRow[]>([makeRow()]);
  const [params, setParams] = useState<KVRow[]>([makeRow()]);
  const [body, setBody] = useState("");
  const [contentType, setContentType] = useState<ContentType>("application/json");
  const [activeTab, setActiveTab] = useState<OutputTab>("curl");
  const [copied, setCopied] = useState(false);

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";

  // ── KV helpers ────────────────────────────────────────────────────────────

  const addHeader = useCallback(() => setHeaders((p) => [...p, makeRow()]), []);
  const removeHeader = useCallback(
    (id: number) => setHeaders((p) => p.filter((r) => r.id !== id)),
    [],
  );
  const updateHeader = useCallback(
    (id: number, field: "key" | "value", val: string) =>
      setHeaders((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r))),
    [],
  );

  const addParam = useCallback(() => setParams((p) => [...p, makeRow()]), []);
  const removeParam = useCallback(
    (id: number) => setParams((p) => p.filter((r) => r.id !== id)),
    [],
  );
  const updateParam = useCallback(
    (id: number, field: "key" | "value", val: string) =>
      setParams((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r))),
    [],
  );

  // ── Build outputs ─────────────────────────────────────────────────────────

  const output = useMemo(() => {
    const args = [method, url, headers, params, body, contentType, hasBody] as const;
    return {
      curl:    buildCurl(...args),
      httpie:  buildHttpie(...args),
      fetch:   buildFetch(...args),
    };
  }, [method, url, headers, params, body, contentType, hasBody]);

  const currentOutput = output[activeTab];

  // ── Copy ──────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentOutput);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = currentOutput;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentOutput]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setMethod("GET");
    setUrl("");
    setHeaders([makeRow()]);
    setParams([makeRow()]);
    setBody("");
    setContentType("application/json");
    setActiveTab("curl");
    setCopied(false);
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Method + URL ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Request</h3>

        {/* Method buttons */}
        <div className="flex flex-wrap gap-2">
          {HTTP_METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                method === m ? METHOD_COLORS[m] : METHOD_COLORS_INACTIVE
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* URL */}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/api/resource"
          className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
        />
      </section>

      {/* ── Headers ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Headers</h3>
          <p className="text-xs text-slate-500 mt-0.5">Key-value pairs added as -H flags.</p>
        </div>

        <KVTable
          rows={headers}
          onAdd={addHeader}
          onRemove={removeHeader}
          onUpdate={updateHeader}
          keyPlaceholder="Header-Name"
          valuePlaceholder="value"
        />
      </section>

      {/* ── Query Params ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Query Parameters</h3>
          <p className="text-xs text-slate-500 mt-0.5">Appended to the URL as ?key=value pairs.</p>
        </div>

        <KVTable
          rows={params}
          onAdd={addParam}
          onRemove={removeParam}
          onUpdate={updateParam}
          keyPlaceholder="param"
          valuePlaceholder="value"
        />
      </section>

      {/* ── Body ── */}
      {hasBody && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Request Body</h3>
            <p className="text-xs text-slate-500 mt-0.5">Sent as the request payload.</p>
          </div>

          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {CONTENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              contentType === "application/json"
                ? '{\n  "key": "value"\n}'
                : "key=value&other=data"
            }
            rows={6}
            spellCheck={false}
            className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 resize-y"
          />
        </section>
      )}

      {/* ── Output ── */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Tabs + copy */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1">
            {(["curl", "httpie", "fetch"] as OutputTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "curl" ? "cURL" : tab === "httpie" ? "HTTPie" : "Fetch API"}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
          </button>
        </div>

        {/* Code output */}
        <div className="p-4 bg-slate-900 min-h-28 overflow-auto">
          <pre className="font-mono text-sm text-slate-100 whitespace-pre-wrap break-all leading-relaxed">
            {currentOutput}
          </pre>
        </div>
      </section>

      {/* ── Reset ── */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer underline underline-offset-2"
        >
          Reset all
        </button>
      </div>

      {/* ── Ad placeholder ── */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    </div>
  );
}

// ─── KV Table ─────────────────────────────────────────────────────────────────

interface KVTableProps {
  rows: KVRow[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: "key" | "value", val: string) => void;
  keyPlaceholder: string;
  valuePlaceholder: string;
}

function KVTable({ rows, onAdd, onRemove, onUpdate, keyPlaceholder, valuePlaceholder }: KVTableProps) {
  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-slate-500 px-1">
          <span>Key</span>
          <span>Value</span>
          <span className="w-7" />
        </div>
      )}

      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <input
            type="text"
            value={row.key}
            onChange={(e) => onUpdate(row.id, "key", e.target.value)}
            placeholder={keyPlaceholder}
            spellCheck={false}
            className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => onUpdate(row.id, "value", e.target.value)}
            placeholder={valuePlaceholder}
            spellCheck={false}
            className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={() => onRemove(row.id)}
            disabled={rows.length === 1}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Remove row"
          >
            <XSmallIcon />
          </button>
        </div>
      ))}

      <button
        onClick={onAdd}
        className="w-full px-4 py-1.5 text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
      >
        + Add row
      </button>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this cURL Command Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build cURL commands with a form-based visual interface. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this cURL Command Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build cURL commands with a form-based visual interface. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function XSmallIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
