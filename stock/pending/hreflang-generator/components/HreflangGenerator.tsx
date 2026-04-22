"use client";

import { useState, useCallback, useId } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LangRow {
  id: string;
  hreflang: string;
  url: string;
}

interface ValidationResult {
  warnings: string[];
  errors: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANG_OPTIONS = [
  { value: "en", label: "en — English" },
  { value: "en-US", label: "en-US — English (United States)" },
  { value: "en-GB", label: "en-GB — English (United Kingdom)" },
  { value: "en-AU", label: "en-AU — English (Australia)" },
  { value: "en-CA", label: "en-CA — English (Canada)" },
  { value: "ja", label: "ja — Japanese" },
  { value: "de", label: "de — German" },
  { value: "de-AT", label: "de-AT — German (Austria)" },
  { value: "de-CH", label: "de-CH — German (Switzerland)" },
  { value: "fr", label: "fr — French" },
  { value: "fr-CA", label: "fr-CA — French (Canada)" },
  { value: "fr-CH", label: "fr-CH — French (Switzerland)" },
  { value: "es", label: "es — Spanish" },
  { value: "es-MX", label: "es-MX — Spanish (Mexico)" },
  { value: "es-AR", label: "es-AR — Spanish (Argentina)" },
  { value: "pt", label: "pt — Portuguese" },
  { value: "pt-BR", label: "pt-BR — Portuguese (Brazil)" },
  { value: "zh", label: "zh — Chinese" },
  { value: "zh-Hans", label: "zh-Hans — Chinese (Simplified)" },
  { value: "zh-Hant", label: "zh-Hant — Chinese (Traditional)" },
  { value: "ko", label: "ko — Korean" },
  { value: "it", label: "it — Italian" },
  { value: "nl", label: "nl — Dutch" },
  { value: "ru", label: "ru — Russian" },
  { value: "pl", label: "pl — Polish" },
  { value: "tr", label: "tr — Turkish" },
  { value: "ar", label: "ar — Arabic" },
  { value: "hi", label: "hi — Hindi" },
  { value: "sv", label: "sv — Swedish" },
  { value: "da", label: "da — Danish" },
  { value: "fi", label: "fi — Finnish" },
  { value: "nb", label: "nb — Norwegian Bokmål" },
  { value: "cs", label: "cs — Czech" },
  { value: "hu", label: "hu — Hungarian" },
  { value: "ro", label: "ro — Romanian" },
  { value: "id", label: "id — Indonesian" },
  { value: "th", label: "th — Thai" },
  { value: "vi", label: "vi — Vietnamese" },
  { value: "uk", label: "uk — Ukrainian" },
  { value: "el", label: "el — Greek" },
  { value: "he", label: "he — Hebrew" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function normalizeUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  if (!/^https?:\/\//i.test(s)) return "https://" + s;
  return s;
}

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function buildHreflangTags(rows: LangRow[], xDefaultId: string): string {
  const lines: string[] = [];
  for (const row of rows) {
    if (!row.hreflang || !row.url) continue;
    const url = normalizeUrl(row.url);
    lines.push(`<link rel="alternate" hreflang="${row.hreflang}" href="${url}" />`);
  }
  const xDefault = rows.find((r) => r.id === xDefaultId);
  if (xDefault && xDefault.url) {
    const url = normalizeUrl(xDefault.url);
    lines.push(`<link rel="alternate" hreflang="x-default" href="${url}" />`);
  }
  return lines.join("\n");
}

function validate(rows: LangRow[], xDefaultId: string): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const filled = rows.filter((r) => r.hreflang && r.url.trim());

  // Check for duplicate hreflang values
  const langCounts: Record<string, number> = {};
  for (const row of filled) {
    langCounts[row.hreflang] = (langCounts[row.hreflang] || 0) + 1;
  }
  for (const [lang, count] of Object.entries(langCounts)) {
    if (count > 1) {
      errors.push(`Duplicate hreflang value: "${lang}" appears ${count} times.`);
    }
  }

  // Check for invalid URLs
  for (const row of filled) {
    const url = normalizeUrl(row.url);
    if (!isValidUrl(url)) {
      errors.push(`Invalid URL for "${row.hreflang}": ${row.url}`);
    }
  }

  // Self-referencing check: Google requires every page in the set to include
  // hreflang tags pointing to all other pages in the set, including itself.
  // Since this tool generates tags for a single page, we warn if < 2 variants.
  if (filled.length === 1) {
    warnings.push(
      "Only one language variant defined. Hreflang is only useful with 2 or more variants."
    );
  }

  // x-default should be set
  const xDefault = rows.find((r) => r.id === xDefaultId);
  if (!xDefault || !xDefault.url.trim()) {
    warnings.push(
      "x-default is not set. Select which URL should be the fallback for unmatched locales."
    );
  }

  // Warn if no https
  for (const row of filled) {
    const url = normalizeUrl(row.url);
    if (isValidUrl(url) && !url.startsWith("https://")) {
      warnings.push(
        `"${row.hreflang}" uses HTTP. Google recommends HTTPS for all hreflang URLs.`
      );
    }
  }

  // Remind about self-referencing requirement
  if (filled.length >= 2) {
    warnings.push(
      "Remember: every page in your set must include these same hreflang tags pointing to all variants (including itself)."
    );
  }

  return { warnings, errors };
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy HTML" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: "var(--border)",
        backgroundColor: copied ? "var(--primary)" : "var(--card)",
        color: copied ? "var(--primary-foreground)" : "inherit",
      }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HreflangGenerator() {
  const baseId = useId();

  const [rows, setRows] = useState<LangRow[]>([
    { id: uid(), hreflang: "en", url: "" },
    { id: uid(), hreflang: "ja", url: "" },
  ]);
  const [xDefaultId, setXDefaultId] = useState<string>(rows[0].id);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: uid(), hreflang: "", url: "" }]);
  }, []);

  const removeRow = useCallback(
    (id: string) => {
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== id);
        return next;
      });
      setXDefaultId((prev) => {
        // If we removed the x-default row, reset to first remaining
        if (prev === id) {
          const next = rows.filter((r) => r.id !== id);
          return next[0]?.id ?? "";
        }
        return prev;
      });
    },
    [rows]
  );

  const updateRow = useCallback(
    (id: string, field: "hreflang" | "url", value: string) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const filledRows = rows.filter((r) => r.hreflang && r.url.trim());
  const output = buildHreflangTags(rows, xDefaultId);
  const { warnings, errors } = validate(rows, xDefaultId);

  const cardStyle = {
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Rows */}
      <div className="rounded-xl border p-5 sm:p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Language Variants</h2>
          <span className="text-xs opacity-50">{rows.length} variant{rows.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-3 items-center">
          <span className="text-xs font-medium opacity-60 uppercase tracking-wide">Language</span>
          <span className="text-xs font-medium opacity-60 uppercase tracking-wide">URL</span>
          <span className="text-xs font-medium opacity-60 uppercase tracking-wide">x-default</span>
          <span className="sr-only">Remove</span>
        </div>

        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-3 items-center"
          >
            {/* Language select */}
            <select
              value={row.hreflang}
              onChange={(e) => updateRow(row.id, "hreflang", e.target.value)}
              aria-label={`Language for row ${idx + 1}`}
              className="rounded-md border px-2 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="">— select —</option>
              {LANG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>

            {/* URL input */}
            <input
              type="text"
              value={row.url}
              onChange={(e) => updateRow(row.id, "url", e.target.value)}
              placeholder="https://example.com/en/"
              aria-label={`URL for row ${idx + 1}`}
              className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: "var(--border)" }}
            />

            {/* x-default radio */}
            <div className="flex justify-center">
              <input
                type="radio"
                name={`${baseId}-xdefault`}
                checked={xDefaultId === row.id}
                onChange={() => setXDefaultId(row.id)}
                aria-label={`Set row ${idx + 1} as x-default`}
                className="w-4 h-4 cursor-pointer accent-blue-600"
              />
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              aria-label={`Remove row ${idx + 1}`}
              className="w-7 h-7 flex items-center justify-center rounded-md text-sm opacity-40 hover:opacity-80 hover:text-red-500 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--border)" }}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={addRow}
          className="mt-1 flex items-center gap-1.5 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="text-lg leading-none">+</span> Add variant
        </button>
      </div>

      {/* Validation */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-2">
          {errors.map((e, i) => (
            <div
              key={i}
              className="flex gap-2 items-start rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: "#fca5a5",
                backgroundColor: "rgba(239,68,68,0.06)",
                color: "#dc2626",
              }}
            >
              <span className="mt-0.5 shrink-0">✖</span>
              <span>{e}</span>
            </div>
          ))}
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex gap-2 items-start rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: "#fcd34d",
                backgroundColor: "rgba(234,179,8,0.06)",
                color: "#b45309",
              }}
            >
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output */}
      <div className="rounded-xl border p-5 sm:p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold">Generated Tags</h2>
          <CopyButton text={output} label="Copy HTML" />
        </div>

        {filledRows.length === 0 ? (
          <p className="text-sm opacity-40 italic">
            Fill in at least one language + URL to generate tags.
          </p>
        ) : (
          <pre
            className="rounded-lg border p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
            }}
          >
            {output}
          </pre>
        )}

        {output && (
          <p className="text-xs opacity-50">
            Paste these tags inside the <code className="font-mono">&lt;head&gt;</code> section of each page in your language set.
          </p>
        )}
      </div>
    </div>
  );
}
