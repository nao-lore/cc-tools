"use client";

import { useState, useCallback } from "react";

type Mode = "request" | "response";

interface HeaderRow {
  id: number;
  name: string;
  value: string;
}

interface ValidationResult {
  type: "error" | "warning" | "info";
  message: string;
}

// Common headers per mode
const COMMON_REQUEST_HEADERS = [
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "Authorization",
  "Cache-Control",
  "Connection",
  "Content-Length",
  "Content-Type",
  "Cookie",
  "Host",
  "If-Modified-Since",
  "If-None-Match",
  "Origin",
  "Pragma",
  "Referer",
  "User-Agent",
  "X-Forwarded-For",
  "X-Requested-With",
  "Custom...",
];

const COMMON_RESPONSE_HEADERS = [
  "Access-Control-Allow-Credentials",
  "Access-Control-Allow-Headers",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Origin",
  "Age",
  "Cache-Control",
  "Connection",
  "Content-Encoding",
  "Content-Length",
  "Content-Security-Policy",
  "Content-Type",
  "ETag",
  "Expires",
  "Last-Modified",
  "Location",
  "Pragma",
  "Set-Cookie",
  "Strict-Transport-Security",
  "Vary",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "X-XSS-Protection",
  "Custom...",
];

// Quick-add presets
const PRESETS: Record<Mode, { label: string; headers: { name: string; value: string }[] }[]> = {
  request: [
    {
      label: "JSON API",
      headers: [
        { name: "Content-Type", value: "application/json" },
        { name: "Accept", value: "application/json" },
      ],
    },
    {
      label: "Bearer Auth",
      headers: [
        { name: "Authorization", value: "Bearer YOUR_TOKEN_HERE" },
      ],
    },
    {
      label: "No Cache",
      headers: [
        { name: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { name: "Pragma", value: "no-cache" },
      ],
    },
    {
      label: "CORS Preflight",
      headers: [
        { name: "Origin", value: "https://example.com" },
        { name: "Access-Control-Request-Method", value: "POST" },
        { name: "Access-Control-Request-Headers", value: "Content-Type, Authorization" },
      ],
    },
  ],
  response: [
    {
      label: "CORS Open",
      headers: [
        { name: "Access-Control-Allow-Origin", value: "*" },
        { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
        { name: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
    {
      label: "Security",
      headers: [
        { name: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { name: "X-Content-Type-Options", value: "nosniff" },
        { name: "X-Frame-Options", value: "DENY" },
        { name: "Content-Security-Policy", value: "default-src 'self'" },
      ],
    },
    {
      label: "Caching",
      headers: [
        { name: "Cache-Control", value: "public, max-age=31536000, immutable" },
        { name: "ETag", value: '"abc123"' },
        { name: "Vary", value: "Accept-Encoding" },
      ],
    },
    {
      label: "No Cache",
      headers: [
        { name: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { name: "Pragma", value: "no-cache" },
        { name: "Expires", value: "0" },
      ],
    },
  ],
};

// Validation rules
function validateHeader(name: string, value: string, mode: Mode): ValidationResult[] {
  const results: ValidationResult[] = [];
  if (!name || !value) return results;

  const nameLower = name.toLowerCase();

  // Deprecated headers
  if (nameLower === "pragma") {
    results.push({ type: "warning", message: "Pragma is deprecated. Use Cache-Control instead." });
  }
  if (nameLower === "expires" && mode === "response") {
    results.push({ type: "warning", message: "Expires is deprecated in HTTP/1.1. Use Cache-Control: max-age instead." });
  }
  if (nameLower === "x-xss-protection") {
    results.push({ type: "warning", message: "X-XSS-Protection is deprecated and removed in modern browsers. Use Content-Security-Policy instead." });
  }
  if (nameLower === "p3p") {
    results.push({ type: "warning", message: "P3P is deprecated and ignored by all modern browsers." });
  }
  if (nameLower === "x-ua-compatible") {
    results.push({ type: "info", message: "X-UA-Compatible is for IE compatibility and rarely needed today." });
  }

  // Format checks
  if (nameLower === "content-type") {
    const validMimes = [
      "application/json", "application/xml", "application/x-www-form-urlencoded",
      "application/octet-stream", "text/html", "text/plain", "text/css",
      "text/javascript", "multipart/form-data", "image/",
    ];
    const hasValidMime = validMimes.some((m) => value.toLowerCase().startsWith(m));
    if (!hasValidMime) {
      results.push({ type: "warning", message: "Unrecognized MIME type. Check for typos." });
    }
    if (value.toLowerCase().includes("application/json") && !value.includes("charset")) {
      results.push({ type: "info", message: "JSON is UTF-8 by default; charset is not required but can be explicit." });
    }
  }

  if (nameLower === "authorization") {
    if (!value.startsWith("Bearer ") && !value.startsWith("Basic ") && !value.startsWith("Digest ") && !value.startsWith("AWS4-HMAC-SHA256 ")) {
      results.push({ type: "warning", message: "Authorization should start with a scheme like Bearer, Basic, or Digest." });
    }
    if (value === "Bearer YOUR_TOKEN_HERE") {
      results.push({ type: "error", message: "Replace YOUR_TOKEN_HERE with an actual token." });
    }
  }

  if (nameLower === "access-control-allow-origin") {
    if (value === "*" && mode === "response") {
      results.push({ type: "info", message: "Wildcard (*) disallows credentials. Use a specific origin if cookies/auth are needed." });
    }
  }

  if (nameLower === "cache-control") {
    const directives = value.split(",").map((d) => d.trim().toLowerCase());
    if (directives.includes("no-cache") && directives.includes("no-store")) {
      results.push({ type: "info", message: "Both no-cache and no-store are set. no-store is stronger; no-cache is redundant." });
    }
    if (directives.includes("max-age=0") && !directives.includes("must-revalidate")) {
      results.push({ type: "info", message: "max-age=0 alone may be served stale. Add must-revalidate to force revalidation." });
    }
  }

  if (nameLower === "strict-transport-security") {
    if (!value.includes("max-age")) {
      results.push({ type: "error", message: "HSTS requires max-age directive." });
    }
    const match = value.match(/max-age=(\d+)/);
    if (match && parseInt(match[1]) < 86400) {
      results.push({ type: "warning", message: "HSTS max-age is very short. Recommended: at least 31536000 (1 year)." });
    }
  }

  if (nameLower === "x-frame-options") {
    const valid = ["DENY", "SAMEORIGIN"];
    if (!valid.includes(value.toUpperCase())) {
      results.push({ type: "warning", message: 'Valid values are DENY or SAMEORIGIN. ALLOW-FROM is deprecated.' });
    }
  }

  if (nameLower === "content-security-policy") {
    if (!value.includes("default-src") && !value.includes("script-src")) {
      results.push({ type: "info", message: "Consider adding default-src as a fallback directive." });
    }
    if (value.includes("'unsafe-inline'") || value.includes("'unsafe-eval'")) {
      results.push({ type: "warning", message: "unsafe-inline or unsafe-eval weakens CSP protection." });
    }
  }

  // Header name format check
  if (/\s/.test(name)) {
    results.push({ type: "error", message: "Header names must not contain spaces." });
  }
  if (/[^\x20-\x7E]/.test(name)) {
    results.push({ type: "error", message: "Header names must contain only ASCII characters." });
  }

  return results;
}

let nextId = 1;

function makeRow(name = "", value = ""): HeaderRow {
  return { id: nextId++, name, value };
}

export default function HttpHeaderBuilder() {
  const [mode, setMode] = useState<Mode>("request");
  const [rows, setRows] = useState<HeaderRow[]>([makeRow()]);
  const [customNames, setCustomNames] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const commonHeaders = mode === "request" ? COMMON_REQUEST_HEADERS : COMMON_RESPONSE_HEADERS;

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, makeRow()]);
  }, []);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setCustomNames((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateRow = useCallback((id: number, field: "name" | "value", val: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }, []);

  const handleNameSelect = useCallback((id: number, val: string) => {
    if (val === "Custom...") {
      setCustomNames((prev) => ({ ...prev, [id]: true }));
      updateRow(id, "name", "");
    } else {
      setCustomNames((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      updateRow(id, "name", val);
    }
  }, [updateRow]);

  const applyPreset = useCallback((preset: { name: string; value: string }[]) => {
    const newRows = preset.map((h) => makeRow(h.name, h.value));
    setRows((prev) => {
      // Remove empty rows then append preset
      const nonEmpty = prev.filter((r) => r.name || r.value);
      return [...nonEmpty, ...newRows];
    });
  }, []);

  const clearAll = useCallback(() => {
    setRows([makeRow()]);
    setCustomNames({});
  }, []);

  // Build output
  const validRows = rows.filter((r) => r.name && r.value);
  const outputLines = validRows.map((r) => `${r.name}: ${r.value}`);
  const outputText = outputLines.join("\n");

  const allValidations: { row: HeaderRow; results: ValidationResult[] }[] = rows
    .filter((r) => r.name && r.value)
    .map((r) => ({ row: r, results: validateHeader(r.name, r.value, mode) }))
    .filter((v) => v.results.length > 0);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = outputText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const validationBadgeColor: Record<ValidationResult["type"], string> = {
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const validationIcon: Record<ValidationResult["type"], string> = {
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(["request", "response"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer capitalize ${
              mode === m
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Quick-add presets */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Quick-add:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS[mode].map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.headers)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header rows */}
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-gray-500 px-1">
          <span>Header Name</span>
          <span>Value</span>
          <span className="w-8" />
        </div>

        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
            {/* Name: select or custom input */}
            {customNames[row.id] ? (
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                placeholder="Header-Name"
                spellCheck={false}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono"
              />
            ) : (
              <select
                value={row.name || ""}
                onChange={(e) => handleNameSelect(row.id, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
              >
                <option value="">-- select header --</option>
                {commonHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            )}

            {/* Value */}
            <input
              type="text"
              value={row.value}
              onChange={(e) => updateRow(row.id, "value", e.target.value)}
              placeholder="value"
              spellCheck={false}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono"
            />

            {/* Remove */}
            <button
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
              className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Remove header"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={addRow}
          className="mt-1 px-4 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer w-full"
        >
          + Add Header
        </button>
      </div>

      {/* Validation */}
      {allValidations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Validation</p>
          {allValidations.map(({ row, results }) =>
            results.map((r, i) => (
              <div
                key={`${row.id}-${i}`}
                className={`flex items-start gap-2 px-3 py-2 rounded-md border text-xs ${validationBadgeColor[r.type]}`}
              >
                <span className="font-bold shrink-0">{validationIcon[r.type]}</span>
                <span>
                  <span className="font-semibold">{row.name}:</span> {r.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Output */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            Output{" "}
            {validRows.length > 0 && (
              <span className="text-xs text-gray-400 font-normal ml-1">
                ({validRows.length} header{validRows.length !== 1 ? "s" : ""})
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {rows.some((r) => r.name || r.value) && (
              <button
                onClick={clearAll}
                className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="p-4 bg-white min-h-24 max-h-72 overflow-auto">
          {outputText ? (
            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-all">
              {outputLines.map((line, i) => {
                const colonIdx = line.indexOf(": ");
                const headerName = line.slice(0, colonIdx);
                const headerValue = line.slice(colonIdx + 2);
                return (
                  <span key={i}>
                    <span className="text-violet-700 font-semibold">{headerName}</span>
                    <span className="text-gray-500">: </span>
                    <span className="text-emerald-700">{headerValue}</span>
                    {"\n"}
                  </span>
                );
              })}
            </pre>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Add headers above to see the formatted output here.
            </p>
          )}
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this HTTP Header Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build and validate HTTP request/response headers. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this HTTP Header Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build and validate HTTP request/response headers. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HTTP Header Builder",
  "description": "Build and validate HTTP request/response headers",
  "url": "https://tools.loresync.dev/http-header-builder",
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
