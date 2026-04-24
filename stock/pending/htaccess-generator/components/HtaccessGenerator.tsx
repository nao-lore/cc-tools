"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Redirect {
  id: string;
  from: string;
  to: string;
  code: "301" | "302";
}

interface ErrorPage {
  code: string;
  path: string;
}

interface Config {
  forceHttps: boolean;
  wwwRedirect: "none" | "add" | "remove";
  errorPages: { enabled: boolean; pages: ErrorPage[] };
  gzip: boolean;
  cacheControl: {
    enabled: boolean;
    images: string;
    css: string;
    js: string;
    fonts: string;
  };
  cors: { enabled: boolean; origin: string };
  blockIps: { enabled: boolean; ips: string };
  redirects: { enabled: boolean; list: Redirect[] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 0;
function nextId() {
  return String(++idCounter);
}

function defaultConfig(): Config {
  return {
    forceHttps: true,
    wwwRedirect: "none",
    errorPages: {
      enabled: false,
      pages: [
        { code: "404", path: "/404.html" },
        { code: "403", path: "/403.html" },
        { code: "500", path: "/500.html" },
      ],
    },
    gzip: true,
    cacheControl: {
      enabled: true,
      images: "1 year",
      css: "1 month",
      js: "1 month",
      fonts: "1 year",
    },
    cors: { enabled: false, origin: "*" },
    blockIps: { enabled: false, ips: "" },
    redirects: {
      enabled: false,
      list: [{ id: nextId(), from: "/old-page", to: "/new-page", code: "301" }],
    },
  };
}

function generateHtaccess(cfg: Config): string {
  const sections: string[] = [];

  // Force HTTPS
  if (cfg.forceHttps) {
    sections.push(
      "# Force HTTPS\n" +
      "RewriteEngine On\n" +
      "RewriteCond %{HTTPS} off\n" +
      "RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"
    );
  }

  // WWW redirect
  if (cfg.wwwRedirect === "add") {
    const rewriteOn = cfg.forceHttps ? "" : "RewriteEngine On\n";
    sections.push(
      "# Redirect to www\n" +
      rewriteOn +
      "RewriteCond %{HTTP_HOST} !^www\\. [NC]\n" +
      "RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"
    );
  } else if (cfg.wwwRedirect === "remove") {
    const rewriteOn = cfg.forceHttps ? "" : "RewriteEngine On\n";
    sections.push(
      "# Redirect to non-www\n" +
      rewriteOn +
      "RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]\n" +
      "RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]"
    );
  }

  // Custom error pages
  if (cfg.errorPages.enabled) {
    const lines = cfg.errorPages.pages
      .filter((p) => p.path.trim())
      .map((p) => `ErrorDocument ${p.code} ${p.path.trim()}`);
    if (lines.length > 0) {
      sections.push("# Custom Error Pages\n" + lines.join("\n"));
    }
  }

  // Gzip
  if (cfg.gzip) {
    sections.push(
      "# Gzip Compression\n" +
      "<IfModule mod_deflate.c>\n" +
      "  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css\n" +
      "  AddOutputFilterByType DEFLATE application/javascript application/x-javascript\n" +
      "  AddOutputFilterByType DEFLATE application/json application/xml\n" +
      "  AddOutputFilterByType DEFLATE image/svg+xml application/font-woff application/font-woff2\n" +
      "</IfModule>"
    );
  }

  // Cache control
  if (cfg.cacheControl.enabled) {
    const { images, css, js, fonts } = cfg.cacheControl;
    sections.push(
      "# Cache Control\n" +
      "<IfModule mod_expires.c>\n" +
      "  ExpiresActive On\n" +
      (images ? `  ExpiresByType image/jpeg "access plus ${images}"\n` +
                `  ExpiresByType image/png "access plus ${images}"\n` +
                `  ExpiresByType image/gif "access plus ${images}"\n` +
                `  ExpiresByType image/webp "access plus ${images}"\n` +
                `  ExpiresByType image/svg+xml "access plus ${images}"\n` +
                `  ExpiresByType image/x-icon "access plus ${images}"\n` : "") +
      (css    ? `  ExpiresByType text/css "access plus ${css}"\n` : "") +
      (js     ? `  ExpiresByType application/javascript "access plus ${js}"\n` +
                `  ExpiresByType application/x-javascript "access plus ${js}"\n` : "") +
      (fonts  ? `  ExpiresByType application/font-woff "access plus ${fonts}"\n` +
                `  ExpiresByType application/font-woff2 "access plus ${fonts}"\n` +
                `  ExpiresByType font/woff2 "access plus ${fonts}"\n` : "") +
      "</IfModule>"
    );
  }

  // CORS
  if (cfg.cors.enabled && cfg.cors.origin.trim()) {
    const origin = cfg.cors.origin.trim();
    sections.push(
      "# CORS Headers\n" +
      "<IfModule mod_headers.c>\n" +
      `  Header set Access-Control-Allow-Origin "${origin}"\n` +
      "  Header set Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\"\n" +
      "  Header set Access-Control-Allow-Headers \"Content-Type, Authorization\"\n" +
      "</IfModule>"
    );
  }

  // Block IPs
  if (cfg.blockIps.enabled && cfg.blockIps.ips.trim()) {
    const ips = cfg.blockIps.ips
      .split("\n")
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (ips.length > 0) {
      sections.push(
        "# Block IPs\n" +
        "<RequireAll>\n" +
        "  Require all granted\n" +
        ips.map((ip) => `  Require not ip ${ip}`).join("\n") + "\n" +
        "</RequireAll>"
      );
    }
  }

  // Custom redirects
  if (cfg.redirects.enabled && cfg.redirects.list.length > 0) {
    const validRedirects = cfg.redirects.list.filter(
      (r) => r.from.trim() && r.to.trim()
    );
    if (validRedirects.length > 0) {
      const lines = validRedirects.map(
        (r) => `Redirect ${r.code} ${r.from.trim()} ${r.to.trim()}`
      );
      sections.push("# Custom Redirects\n" + lines.join("\n"));
    }
  }

  if (sections.length === 0) return "# No modules enabled";
  return sections.join("\n\n");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ModuleHeader({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <Toggle checked={enabled} onChange={onToggle} label={label} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HtaccessGenerator() {
  const [cfg, setCfg] = useState<Config>(defaultConfig);
  const [copied, setCopied] = useState(false);

  const update = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }, []);

  const output = useMemo(() => generateHtaccess(cfg), [cfg]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".htaccess";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  // Redirect helpers
  const addRedirect = useCallback(() => {
    setCfg((prev) => ({
      ...prev,
      redirects: {
        ...prev.redirects,
        list: [
          ...prev.redirects.list,
          { id: nextId(), from: "", to: "", code: "301" },
        ],
      },
    }));
  }, []);

  const removeRedirect = useCallback((id: string) => {
    setCfg((prev) => ({
      ...prev,
      redirects: {
        ...prev.redirects,
        list: prev.redirects.list.filter((r) => r.id !== id),
      },
    }));
  }, []);

  const updateRedirect = useCallback(
    (id: string, field: keyof Omit<Redirect, "id">, value: string) => {
      setCfg((prev) => ({
        ...prev,
        redirects: {
          ...prev.redirects,
          list: prev.redirects.list.map((r) =>
            r.id === id ? { ...r, [field]: value } : r
          ),
        },
      }));
    },
    []
  );

  const inputCls =
    "w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const selectCls =
    "border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Controls ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Modules</h2>

          {/* Force HTTPS */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="Force HTTPS"
              enabled={cfg.forceHttps}
              onToggle={(v) => update("forceHttps", v)}
            />
            {cfg.forceHttps && (
              <p className="text-xs text-gray-500">
                Redirects all HTTP requests to HTTPS via a 301 permanent redirect using mod_rewrite.
              </p>
            )}
          </div>

          {/* WWW Redirect */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800">WWW Redirect</span>
            </div>
            <div className="flex gap-2">
              {(["none", "add", "remove"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => update("wwwRedirect", opt)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    cfg.wwwRedirect === opt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {opt === "none" ? "None" : opt === "add" ? "Add www" : "Remove www"}
                </button>
              ))}
            </div>
            {cfg.wwwRedirect !== "none" && (
              <p className="mt-2 text-xs text-gray-500">
                {cfg.wwwRedirect === "add"
                  ? "Redirects example.com → www.example.com (301)"
                  : "Redirects www.example.com → example.com (301)"}
              </p>
            )}
          </div>

          {/* Custom Error Pages */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="Custom Error Pages"
              enabled={cfg.errorPages.enabled}
              onToggle={(v) =>
                update("errorPages", { ...cfg.errorPages, enabled: v })
              }
            />
            {cfg.errorPages.enabled && (
              <div className="space-y-2">
                {cfg.errorPages.pages.map((page, i) => (
                  <div key={page.code} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 w-8 shrink-0">
                      {page.code}
                    </span>
                    <input
                      type="text"
                      value={page.path}
                      onChange={(e) => {
                        const pages = cfg.errorPages.pages.map((p, pi) =>
                          pi === i ? { ...p, path: e.target.value } : p
                        );
                        update("errorPages", { ...cfg.errorPages, pages });
                      }}
                      placeholder={`/error-${page.code}.html`}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gzip */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="Gzip Compression"
              enabled={cfg.gzip}
              onToggle={(v) => update("gzip", v)}
            />
            {cfg.gzip && (
              <p className="text-xs text-gray-500">
                Enables mod_deflate for HTML, CSS, JavaScript, JSON, XML, SVG, and font files.
              </p>
            )}
          </div>

          {/* Cache Control */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="Cache Control"
              enabled={cfg.cacheControl.enabled}
              onToggle={(v) =>
                update("cacheControl", { ...cfg.cacheControl, enabled: v })
              }
            />
            {cfg.cacheControl.enabled && (
              <div className="space-y-2">
                {(
                  [
                    { key: "images", label: "Images" },
                    { key: "css", label: "CSS" },
                    { key: "js", label: "JavaScript" },
                    { key: "fonts", label: "Fonts" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 w-20 shrink-0">
                      {label}
                    </label>
                    <select
                      value={cfg.cacheControl[key]}
                      onChange={(e) =>
                        update("cacheControl", {
                          ...cfg.cacheControl,
                          [key]: e.target.value,
                        })
                      }
                      className={selectCls + " flex-1"}
                    >
                      <option value="1 day">1 day</option>
                      <option value="1 week">1 week</option>
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="1 year">1 year</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CORS */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="CORS Headers"
              enabled={cfg.cors.enabled}
              onToggle={(v) => update("cors", { ...cfg.cors, enabled: v })}
            />
            {cfg.cors.enabled && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Allow-Origin
                </label>
                <input
                  type="text"
                  value={cfg.cors.origin}
                  onChange={(e) =>
                    update("cors", { ...cfg.cors, origin: e.target.value })
                  }
                  placeholder="* or https://example.com"
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* Block IPs */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="Block IPs"
              enabled={cfg.blockIps.enabled}
              onToggle={(v) =>
                update("blockIps", { ...cfg.blockIps, enabled: v })
              }
            />
            {cfg.blockIps.enabled && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  One IP or CIDR range per line
                </label>
                <textarea
                  value={cfg.blockIps.ips}
                  onChange={(e) =>
                    update("blockIps", { ...cfg.blockIps, ips: e.target.value })
                  }
                  placeholder={"192.168.1.1\n10.0.0.0/8"}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
              </div>
            )}
          </div>

          {/* Custom Redirects */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModuleHeader
              label="Custom Redirects"
              enabled={cfg.redirects.enabled}
              onToggle={(v) =>
                update("redirects", { ...cfg.redirects, enabled: v })
              }
            />
            {cfg.redirects.enabled && (
              <div className="space-y-2">
                {cfg.redirects.list.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={r.from}
                      onChange={(e) => updateRedirect(r.id, "from", e.target.value)}
                      placeholder="/old"
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-400 text-xs shrink-0">→</span>
                    <input
                      type="text"
                      value={r.to}
                      onChange={(e) => updateRedirect(r.id, "to", e.target.value)}
                      placeholder="/new"
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={r.code}
                      onChange={(e) =>
                        updateRedirect(r.id, "code", e.target.value as "301" | "302")
                      }
                      className={selectCls}
                    >
                      <option value="301">301</option>
                      <option value="302">302</option>
                    </select>
                    {cfg.redirects.list.length > 1 && (
                      <button
                        onClick={() => removeRedirect(r.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        title="Remove redirect"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addRedirect}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  + Add Redirect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Preview ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .htaccess
              </button>
            </div>
          </div>

          {/* Syntax highlighted preview */}
          <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 text-sm font-mono leading-relaxed min-h-[300px] overflow-x-auto whitespace-pre-wrap break-words">
            {output.split("\n").map((line, i) => {
              if (line.startsWith("#")) {
                return (
                  <span key={i} className="text-gray-400">
                    {line}{"\n"}
                  </span>
                );
              }
              if (
                line.startsWith("RewriteEngine") ||
                line.startsWith("RewriteCond") ||
                line.startsWith("RewriteRule")
              ) {
                return (
                  <span key={i} className="text-purple-300">
                    {line}{"\n"}
                  </span>
                );
              }
              if (
                line.startsWith("ErrorDocument") ||
                line.startsWith("Redirect ") ||
                line.startsWith("Header ") ||
                line.startsWith("Require")
              ) {
                return (
                  <span key={i} className="text-yellow-300">
                    {line}{"\n"}
                  </span>
                );
              }
              if (
                line.startsWith("<IfModule") ||
                line.startsWith("</IfModule") ||
                line.startsWith("<RequireAll") ||
                line.startsWith("</RequireAll")
              ) {
                return (
                  <span key={i} className="text-blue-300">
                    {line}{"\n"}
                  </span>
                );
              }
              if (
                line.startsWith("  AddOutputFilterByType") ||
                line.startsWith("  ExpiresByType") ||
                line.startsWith("  ExpiresActive") ||
                line.startsWith("  Require")
              ) {
                return (
                  <span key={i} className="text-green-300">
                    {line}{"\n"}
                  </span>
                );
              }
              return (
                <span key={i} className="text-gray-100">
                  {line || "\u00A0"}{"\n"}
                </span>
              );
            })}
          </pre>

          {/* Line count */}
          <p className="text-xs text-gray-400 text-right">
            {output.split("\n").length} lines · {new TextEncoder().encode(output).length} bytes
          </p>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this .htaccess Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate Apache .htaccess rules visually. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this .htaccess Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate Apache .htaccess rules visually. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
