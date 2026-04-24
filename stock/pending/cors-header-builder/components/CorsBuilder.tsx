"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeaderInfo {
  name: string;
  value: string;
  explanation: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;
type HttpMethod = typeof HTTP_METHODS[number];

const ALLOWED_HEADER_PRESETS = [
  { label: "Content-Type",    value: "Content-Type" },
  { label: "Authorization",   value: "Authorization" },
  { label: "X-Requested-With",value: "X-Requested-With" },
  { label: "Accept",          value: "Accept" },
  { label: "Accept-Language", value: "Accept-Language" },
  { label: "Cache-Control",   value: "Cache-Control" },
];

const MAX_AGE_OPTIONS = [
  { label: "No cache (0s)",    value: 0 },
  { label: "1 minute",         value: 60 },
  { label: "5 minutes",        value: 300 },
  { label: "1 hour",           value: 3600 },
  { label: "24 hours",         value: 86400 },
  { label: "7 days",           value: 604800 },
];

// ─── Build output headers ─────────────────────────────────────────────────────

function buildHeaders(
  origins: string[],
  methods: HttpMethod[],
  allowedHeaders: string[],
  exposeHeaders: string[],
  credentials: boolean,
  maxAge: number,
): HeaderInfo[] {
  const headers: HeaderInfo[] = [];

  // Access-Control-Allow-Origin
  const originValue =
    origins.length === 0
      ? "*"
      : origins.length === 1
      ? origins[0]
      : origins[0]; // browsers only accept a single origin; builder shows the first
  headers.push({
    name: "Access-Control-Allow-Origin",
    value: originValue,
    explanation:
      origins.length === 0
        ? "Wildcard — allows any origin. Cannot be used with credentials."
        : origins.length > 1
        ? `Set dynamically per request from your allowlist. Showing first entry: ${origins[0]}`
        : `Allows requests from ${origins[0]} only.`,
  });

  // Access-Control-Allow-Methods
  if (methods.length > 0) {
    headers.push({
      name: "Access-Control-Allow-Methods",
      value: methods.join(", "),
      explanation:
        "Lists the HTTP methods permitted for cross-origin requests. Sent in response to a preflight OPTIONS request.",
    });
  }

  // Access-Control-Allow-Headers
  if (allowedHeaders.length > 0) {
    headers.push({
      name: "Access-Control-Allow-Headers",
      value: allowedHeaders.join(", "),
      explanation:
        "Specifies which request headers the browser is allowed to send. Must include any custom headers used by the client.",
    });
  }

  // Access-Control-Expose-Headers
  if (exposeHeaders.length > 0) {
    headers.push({
      name: "Access-Control-Expose-Headers",
      value: exposeHeaders.join(", "),
      explanation:
        "Makes these response headers accessible to the browser's JavaScript. By default only CORS-safelisted headers are exposed.",
    });
  }

  // Access-Control-Allow-Credentials
  if (credentials) {
    headers.push({
      name: "Access-Control-Allow-Credentials",
      value: "true",
      explanation:
        "Tells the browser to expose the response when credentials (cookies, HTTP auth, TLS certs) are included. Requires a specific origin — wildcard (*) is not allowed.",
    });
  }

  // Access-Control-Max-Age
  if (maxAge > 0) {
    headers.push({
      name: "Access-Control-Max-Age",
      value: String(maxAge),
      explanation:
        `Instructs the browser to cache the preflight response for ${maxAge} seconds, reducing OPTIONS round-trips.`,
    });
  }

  return headers;
}

function getWarnings(
  origins: string[],
  credentials: boolean,
): string[] {
  const warnings: string[] = [];
  const isWildcard = origins.length === 0;

  if (isWildcard && credentials) {
    warnings.push(
      "Wildcard origin (*) cannot be used with credentials. Set a specific origin instead.",
    );
  }
  if (origins.some((o) => o === "null")) {
    warnings.push(
      '"null" origin is dangerous — it can be forged by sandboxed iframes and data: URIs.',
    );
  }
  if (origins.some((o) => o.endsWith("localhost") || o.includes("localhost:"))) {
    warnings.push(
      "localhost origins work for development only. Remove before deploying to production.",
    );
  }
  return warnings;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CorsBuilder() {
  // Origins
  const [origins, setOrigins] = useState<string[]>([]);
  const [originInput, setOriginInput] = useState("");
  const [useWildcard, setUseWildcard] = useState(true);

  // Methods
  const [methods, setMethods] = useState<HttpMethod[]>(["GET", "POST", "OPTIONS"]);

  // Allowed headers
  const [allowedHeaders, setAllowedHeaders] = useState<string[]>(["Content-Type"]);
  const [allowedHeaderInput, setAllowedHeaderInput] = useState("");

  // Expose headers
  const [exposeHeaders, setExposeHeaders] = useState<string[]>([]);
  const [exposeHeaderInput, setExposeHeaderInput] = useState("");

  // Credentials & max-age
  const [credentials, setCredentials] = useState(false);
  const [maxAge, setMaxAge] = useState(3600);

  // UI state
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Derived
  const effectiveOrigins = useWildcard ? [] : origins;
  const headers = buildHeaders(effectiveOrigins, methods, allowedHeaders, exposeHeaders, credentials, maxAge);
  const warnings = getWarnings(effectiveOrigins, credentials);

  // ── Origins ────────────────────────────────────────────────────────────────

  const addOrigin = useCallback(() => {
    const raw = originInput.trim();
    if (!raw || origins.includes(raw)) return;
    setOrigins((prev) => [...prev, raw]);
    setOriginInput("");
  }, [originInput, origins]);

  const removeOrigin = useCallback((origin: string) => {
    setOrigins((prev) => prev.filter((o) => o !== origin));
  }, []);

  // ── Methods ───────────────────────────────────────────────────────────────

  const toggleMethod = useCallback((method: HttpMethod) => {
    setMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  }, []);

  // ── Allowed headers ───────────────────────────────────────────────────────

  const toggleAllowedHeader = useCallback((header: string) => {
    setAllowedHeaders((prev) =>
      prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header],
    );
  }, []);

  const addAllowedHeader = useCallback(() => {
    const raw = allowedHeaderInput.trim();
    if (!raw || allowedHeaders.includes(raw)) return;
    setAllowedHeaders((prev) => [...prev, raw]);
    setAllowedHeaderInput("");
  }, [allowedHeaderInput, allowedHeaders]);

  const removeAllowedHeader = useCallback((header: string) => {
    setAllowedHeaders((prev) => prev.filter((h) => h !== header));
  }, []);

  // ── Expose headers ────────────────────────────────────────────────────────

  const addExposeHeader = useCallback(() => {
    const raw = exposeHeaderInput.trim();
    if (!raw || exposeHeaders.includes(raw)) return;
    setExposeHeaders((prev) => [...prev, raw]);
    setExposeHeaderInput("");
  }, [exposeHeaderInput, exposeHeaders]);

  const removeExposeHeader = useCallback((header: string) => {
    setExposeHeaders((prev) => prev.filter((h) => h !== header));
  }, []);

  // ── Copy ──────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    const text = headers.map((h) => `${h.name}: ${h.value}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [headers]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setOrigins([]);
    setOriginInput("");
    setUseWildcard(true);
    setMethods(["GET", "POST", "OPTIONS"]);
    setAllowedHeaders(["Content-Type"]);
    setAllowedHeaderInput("");
    setExposeHeaders([]);
    setExposeHeaderInput("");
    setCredentials(false);
    setMaxAge(3600);
    setTooltipOpen(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Output panel ── */}
      <section className="bg-slate-900 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Generated Headers
          </h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-600"
          >
            {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy all</>}
          </button>
        </div>

        {headers.length === 0 ? (
          <p className="font-mono text-sm text-slate-500 italic">
            Configure options below to generate headers.
          </p>
        ) : (
          <div className="space-y-2">
            {headers.map((h) => (
              <div key={h.name} className="group">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs text-slate-400 select-none pt-0.5 flex-shrink-0">
                    {h.name}:
                  </span>
                  <span className="font-mono text-sm text-green-300 break-all">{h.value}</span>
                  <button
                    onClick={() => setTooltipOpen(tooltipOpen === h.name ? null : h.name)}
                    className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex-shrink-0 mt-0.5 ml-1"
                    title="Show explanation"
                  >
                    <InfoIcon />
                  </button>
                </div>
                {tooltipOpen === h.name && (
                  <p className="mt-1.5 ml-2 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 leading-relaxed">
                    {h.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <WarningIcon />
            <span className="text-sm font-semibold text-amber-800">Warnings</span>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-amber-700 pl-6">
              {w}
            </p>
          ))}
        </section>
      )}

      {/* ── Config sections ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Configuration
        </h2>
        <button
          onClick={reset}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer underline underline-offset-2"
        >
          Reset to defaults
        </button>
      </div>

      {/* Allowed Origins */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Allowed Origins</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Which origins can send cross-origin requests to your server.
          </p>
        </div>

        {/* Wildcard toggle */}
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={useWildcard}
            onClick={() => setUseWildcard((v) => !v)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${useWildcard ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${useWildcard ? "translate-x-4" : "translate-x-0"}`}
            />
          </button>
          <span className="text-sm text-slate-700 font-mono">
            Use wildcard <span className="text-blue-600 font-bold">*</span>
          </span>
          <span className="text-xs text-slate-400">(allows all origins)</span>
        </div>

        {/* Specific origins */}
        {!useWildcard && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addOrigin(); }}
                placeholder="https://example.com"
                className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={addOrigin}
                className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {origins.length === 0 && (
              <p className="text-xs text-amber-600">No origins added — header will use * as fallback.</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {origins.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-mono bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {o}
                  <button
                    onClick={() => removeOrigin(o)}
                    className="hover:text-red-600 transition-colors cursor-pointer leading-none"
                    title={`Remove ${o}`}
                  >
                    <XSmallIcon />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* HTTP Methods */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Allowed Methods</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            HTTP methods the browser may use in cross-origin requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HTTP_METHODS.map((method) => {
            const active = methods.includes(method);
            return (
              <button
                key={method}
                onClick={() => toggleMethod(method)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-mono font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {method}
              </button>
            );
          })}
        </div>
      </section>

      {/* Allowed Headers */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Allowed Request Headers</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Headers the browser is permitted to send in cross-origin requests.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {ALLOWED_HEADER_PRESETS.map((h) => {
            const active = allowedHeaders.includes(h.value);
            return (
              <button
                key={h.value}
                onClick={() => toggleAllowedHeader(h.value)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {h.label}
              </button>
            );
          })}
        </div>

        {/* Custom header input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={allowedHeaderInput}
            onChange={(e) => setAllowedHeaderInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addAllowedHeader(); }}
            placeholder="X-Custom-Header"
            className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={addAllowedHeader}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>

        {/* Active pills */}
        {allowedHeaders.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allowedHeaders.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200"
              >
                {h}
                <button
                  onClick={() => removeAllowedHeader(h)}
                  className="hover:text-red-600 transition-colors cursor-pointer leading-none"
                  title={`Remove ${h}`}
                >
                  <XSmallIcon />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Expose Headers */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Expose Response Headers</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Response headers that JavaScript in the browser can read. Leave empty for default safelisted headers only.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={exposeHeaderInput}
            onChange={(e) => setExposeHeaderInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addExposeHeader(); }}
            placeholder="X-Request-Id"
            className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={addExposeHeader}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
        {exposeHeaders.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exposeHeaders.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200"
              >
                {h}
                <button
                  onClick={() => removeExposeHeader(h)}
                  className="hover:text-red-600 transition-colors cursor-pointer leading-none"
                  title={`Remove ${h}`}
                >
                  <XSmallIcon />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Credentials */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <button
            role="switch"
            aria-checked={credentials}
            onClick={() => setCredentials((v) => !v)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer mt-0.5 ${credentials ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${credentials ? "translate-x-4" : "translate-x-0"}`}
            />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-700">Allow Credentials</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Adds <span className="font-mono">Access-Control-Allow-Credentials: true</span>.
              Required when the client sends cookies, HTTP auth, or TLS certificates.
              Incompatible with wildcard origin.
            </p>
          </div>
        </div>
      </section>

      {/* Max-Age */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Preflight Cache Max-Age</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How long the browser caches the preflight response, reducing extra OPTIONS requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MAX_AGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMaxAge(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                maxAge === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Header explanations reference */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Header Reference</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Header</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Purpose</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Required for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">Access-Control-Allow-Origin</td>
                <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">Specifies which origin(s) may access the resource.</td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top">All cross-origin requests</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">Access-Control-Allow-Methods</td>
                <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">Lists HTTP methods allowed for cross-origin requests.</td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top">Preflight responses</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">Access-Control-Allow-Headers</td>
                <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">Declares which request headers are permitted.</td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top">Non-simple request headers</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">Access-Control-Expose-Headers</td>
                <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">Makes response headers readable by browser JS.</td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top">Custom response headers</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">Access-Control-Allow-Credentials</td>
                <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">Allows cookies and auth credentials in cross-origin requests.</td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top">Cookie / auth sessions</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">Access-Control-Max-Age</td>
                <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">Caches preflight result to reduce OPTIONS round-trips.</td>
                <td className="px-4 py-3 text-xs text-slate-500 align-top">Performance optimization</td>
              </tr>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CORS Header Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build correct CORS response headers for any scenario. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CORS Header Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build correct CORS response headers for any scenario. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
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
