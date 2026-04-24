"use client";

import { useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Mode = "generate" | "check";

interface ExtractedTag {
  rel: string;
  href: string;
  hreflang?: string;
  raw: string;
}

interface Issue {
  level: "error" | "warning" | "info";
  message: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Prepend https:// if no protocol
  if (!/^https?:\/\//i.test(trimmed)) return "https://" + trimmed;
  return trimmed;
}

function generateTag(url: string): string {
  const normalized = normalizeUrl(url);
  if (!normalized) return "";
  return `<link rel="canonical" href="${normalized}" />`;
}

function extractTags(html: string): ExtractedTag[] {
  const results: ExtractedTag[] = [];
  // Match <link ... > tags (self-closing or not)
  const linkRe = /<link\b([^>]*?)\/?>(?:<\/link>)?/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html)) !== null) {
    const attrs = m[1];
    const relMatch = /\brel=["']([^"']*)["']/i.exec(attrs);
    const hrefMatch = /\bhref=["']([^"']*)["']/i.exec(attrs);
    const hreflangMatch = /\bhreflang=["']([^"']*)["']/i.exec(attrs);
    if (!relMatch || !hrefMatch) continue;
    const rel = relMatch[1].toLowerCase().trim();
    if (rel === "canonical" || rel === "alternate") {
      results.push({
        rel,
        href: hrefMatch[1].trim(),
        hreflang: hreflangMatch ? hreflangMatch[1] : undefined,
        raw: m[0],
      });
    }
  }
  return results;
}

function analyzeIssues(tags: ExtractedTag[], expectedUrl: string): Issue[] {
  const issues: Issue[] = [];
  const canonicals = tags.filter((t) => t.rel === "canonical");

  if (canonicals.length === 0) {
    issues.push({ level: "error", message: "No canonical tag found in the HTML." });
    return issues;
  }

  if (canonicals.length > 1) {
    issues.push({
      level: "error",
      message: `Multiple canonical tags found (${canonicals.length}). Only one is valid — search engines may ignore all of them.`,
    });
  }

  for (const canon of canonicals) {
    const href = canon.href;

    // Relative URL
    if (!href.startsWith("http://") && !href.startsWith("https://")) {
      issues.push({
        level: "error",
        message: `Relative canonical URL detected: "${href}". Use an absolute URL (e.g. https://example.com/page).`,
      });
    }

    // HTTP instead of HTTPS
    if (href.startsWith("http://")) {
      issues.push({
        level: "warning",
        message: `Canonical uses HTTP: "${href}". Prefer HTTPS for security and SEO.`,
      });
    }

    // Trailing slash consistency check (only if absolute)
    if (href.startsWith("http")) {
      try {
        const u = new URL(href);
        const path = u.pathname;
        if (path !== "/" && path.endsWith("/")) {
          issues.push({
            level: "info",
            message: `Canonical URL has a trailing slash on the path ("${path}"). Ensure this matches your site's preferred URL format consistently.`,
          });
        }
      } catch {
        // invalid URL — already flagged by relative check
      }
    }

    // Expected URL mismatch
    if (expectedUrl) {
      const normExpected = normalizeUrl(expectedUrl);
      if (href !== normExpected) {
        issues.push({
          level: "error",
          message: `Canonical "${href}" does not match expected URL "${normExpected}".`,
        });
      } else {
        issues.push({
          level: "info",
          message: `Canonical matches expected URL.`,
        });
      }
    }
  }

  if (issues.length === 0 || issues.every((i) => i.level === "info")) {
    issues.push({ level: "info", message: "No critical issues detected." });
  }

  return issues;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

function IssueBadge({ level }: { level: Issue["level"] }) {
  const styles: Record<Issue["level"], string> = {
    error: "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };
  const labels: Record<Issue["level"], string> = {
    error: "Error",
    warning: "Warning",
    info: "OK",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function CanonicalChecker() {
  const [mode, setMode] = useState<Mode>("generate");

  // Generate state
  const [genUrl, setGenUrl] = useState("");

  // Check state
  const [html, setHtml] = useState("");
  const [expectedUrl, setExpectedUrl] = useState("");
  const [checked, setChecked] = useState(false);

  const generatedTag = generateTag(genUrl);

  const tags = checked ? extractTags(html) : [];
  const issues = checked ? analyzeIssues(tags, expectedUrl) : [];

  const canonicals = tags.filter((t) => t.rel === "canonical");
  const alternates = tags.filter((t) => t.rel === "alternate");

  const handleCheck = useCallback(() => {
    setChecked(true);
  }, []);

  const handleClearCheck = useCallback(() => {
    setHtml("");
    setExpectedUrl("");
    setChecked(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
        {(["generate", "check"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer capitalize ${
              mode === m
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m === "generate" ? "Generate" : "Check / Extract"}
          </button>
        ))}
      </div>

      {/* ── Generate Mode ── */}
      {mode === "generate" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page URL
            </label>
            <input
              type="text"
              value={genUrl}
              onChange={(e) => setGenUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              https:// is added automatically if omitted.
            </p>
          </div>

          {generatedTag && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Generated Tag
                </label>
                <CopyButton text={generatedTag} />
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap break-all">
                  {generatedTag}
                </pre>
              </div>
              <p className="text-xs text-gray-500">
                Paste this inside the <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> of your HTML document.
              </p>
            </div>
          )}

          {/* Common issues checklist */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Common Issues Checklist
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                { ok: genUrl ? !/^http:\/\//i.test(normalizeUrl(genUrl)) : null, text: "Uses HTTPS (not HTTP)" },
                { ok: genUrl ? /^https?:\/\//i.test(normalizeUrl(genUrl)) : null, text: "Absolute URL (not relative)" },
                {
                  ok: genUrl
                    ? (() => {
                        try {
                          const u = new URL(normalizeUrl(genUrl));
                          return u.pathname === "/" || !u.pathname.endsWith("/");
                        } catch {
                          return false;
                        }
                      })()
                    : null,
                  text: "No trailing slash on path (or intentional if required by site)",
                },
                { ok: genUrl ? !/[?#]/.test(normalizeUrl(genUrl)) : null, text: "No query parameters or fragments" },
                { ok: genUrl ? normalizeUrl(genUrl) === genUrl.trim() || !genUrl.trim().startsWith("http") : null, text: "No extra whitespace" },
              ].map(({ ok, text }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      ok === null
                        ? "bg-gray-200 text-gray-400"
                        : ok
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {ok === null ? "–" : ok ? "✓" : "✗"}
                  </span>
                  <span className={ok === false ? "text-red-600" : ""}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Check Mode ── */}
      {mode === "check" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Source
            </label>
            <textarea
              value={html}
              onChange={(e) => { setHtml(e.target.value); setChecked(false); }}
              placeholder={"Paste your page's HTML here (or just the <head> section)...\n\nExample:\n<link rel=\"canonical\" href=\"https://example.com/page\" />"}
              spellCheck={false}
              className="w-full h-48 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Canonical URL{" "}
              <span className="text-gray-400 font-normal">(optional — for validation)</span>
            </label>
            <input
              type="text"
              value={expectedUrl}
              onChange={(e) => { setExpectedUrl(e.target.value); setChecked(false); }}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheck}
              disabled={!html.trim()}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Check Tags
            </button>
            {html && (
              <button
                onClick={handleClearCheck}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          {checked && (
            <div className="space-y-4">
              {/* Canonical tags found */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    Canonical Tags Found
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    canonicals.length === 1
                      ? "bg-green-100 text-green-700"
                      : canonicals.length === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {canonicals.length === 0
                      ? "None"
                      : canonicals.length === 1
                      ? "1 — OK"
                      : `${canonicals.length} — Multiple!`}
                  </span>
                </div>
                {canonicals.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No <code>rel="canonical"</code> tags found in the pasted HTML.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {canonicals.map((tag, i) => (
                      <li key={i} className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-gray-900 break-all">{tag.href}</span>
                          <CopyButton text={tag.raw} label="Copy tag" />
                        </div>
                        <div className="font-mono text-xs text-gray-400 break-all">{tag.raw}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Alternate tags (hreflang) */}
              {alternates.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Alternate / hreflang Tags Found
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {alternates.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {alternates.map((tag, i) => (
                      <li key={i} className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {tag.hreflang && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200">
                              {tag.hreflang}
                            </span>
                          )}
                          <span className="font-mono text-sm text-gray-900 break-all">{tag.href}</span>
                        </div>
                        <div className="font-mono text-xs text-gray-400 break-all">{tag.raw}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Validation Results</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {issues.map((issue, i) => (
                    <li key={i} className="px-4 py-3 flex items-start gap-3">
                      <IssueBadge level={issue.level} />
                      <span className="text-sm text-gray-700 leading-relaxed">{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common issues checklist (context-aware after check) */}
              {canonicals.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Common Issues Checklist
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {canonicals.map((canon, ci) => {
                      const href = canon.href;
                      const isAbsolute = /^https?:\/\//i.test(href);
                      const isHttps = /^https:\/\//i.test(href);
                      let hasTrailingSlash = false;
                      try {
                        const u = new URL(href);
                        hasTrailingSlash = u.pathname !== "/" && u.pathname.endsWith("/");
                      } catch {
                        // invalid URL
                      }
                      const hasQuery = /\?/.test(href);
                      const hasFragment = /#/.test(href);
                      const items = [
                        { ok: isAbsolute, text: "Absolute URL" },
                        { ok: isHttps, text: "HTTPS (not HTTP)" },
                        { ok: !hasTrailingSlash, text: "No trailing slash" },
                        { ok: !hasQuery, text: "No query parameters" },
                        { ok: !hasFragment, text: "No URL fragments" },
                      ];
                      return (
                        <li key={ci}>
                          {canonicals.length > 1 && (
                            <p className="text-xs text-gray-400 mb-1 font-mono truncate">{href}</p>
                          )}
                          <ul className="space-y-1">
                            {items.map(({ ok, text }, j) => (
                              <li key={j} className="flex items-center gap-2">
                                <span
                                  className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                                    ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {ok ? "✓" : "✗"}
                                </span>
                                <span className={ok ? "" : "text-red-600"}>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Canonical Tag Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Validate and generate canonical link tags. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Canonical Tag Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Validate and generate canonical link tags. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
