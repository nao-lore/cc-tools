"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type OgType = "website" | "article" | "product";

interface OgFields {
  title: string;
  description: string;
  image: string;
  url: string;
  type: OgType;
  siteName: string;
  locale: string;
  // article-specific
  publishedTime: string;
  author: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OG_TYPES: { value: OgType; label: string }[] = [
  { value: "website", label: "website" },
  { value: "article", label: "article" },
  { value: "product", label: "product" },
];

const LOCALE_OPTIONS = [
  { value: "en_US", label: "en_US — English (US)" },
  { value: "en_GB", label: "en_GB — English (UK)" },
  { value: "ja_JP", label: "ja_JP — Japanese" },
  { value: "zh_CN", label: "zh_CN — Chinese (Simplified)" },
  { value: "de_DE", label: "de_DE — German" },
  { value: "fr_FR", label: "fr_FR — French" },
  { value: "es_ES", label: "es_ES — Spanish" },
  { value: "pt_BR", label: "pt_BR — Portuguese (BR)" },
  { value: "ko_KR", label: "ko_KR — Korean" },
];

const DEFAULT_FIELDS: OgFields = {
  title: "",
  description: "",
  image: "",
  url: "",
  type: "website",
  siteName: "",
  locale: "en_US",
  publishedTime: "",
  author: "",
};

// ─── Generate HTML ────────────────────────────────────────────────────────────

function buildMetaTags(fields: OgFields): string {
  const lines: string[] = [];

  const add = (property: string, content: string) => {
    if (content.trim()) {
      lines.push(`<meta property="${property}" content="${content}" />`);
    }
  };

  add("og:title", fields.title);
  add("og:description", fields.description);
  add("og:image", fields.image);
  add("og:url", fields.url);
  add("og:type", fields.type);
  add("og:site_name", fields.siteName);
  add("og:locale", fields.locale);

  if (fields.type === "article") {
    add("article:published_time", fields.publishedTime);
    add("article:author", fields.author);
  }

  return lines.join("\n");
}

function getWarnings(fields: OgFields): string[] {
  const warnings: string[] = [];

  if (!fields.title) warnings.push("og:title is required for all Open Graph pages.");
  if (!fields.description) warnings.push("og:description is missing — social platforms may pull arbitrary text instead.");
  if (!fields.image) warnings.push("og:image is missing — cards without images get much lower engagement.");
  if (fields.image && !fields.image.startsWith("http")) {
    warnings.push("og:image should be an absolute URL (starting with https://).");
  }
  if (fields.title && fields.title.length > 60) {
    warnings.push(`og:title is ${fields.title.length} characters — Facebook truncates after ~60.`);
  }
  if (fields.description && fields.description.length > 200) {
    warnings.push(`og:description is ${fields.description.length} characters — keep it under 200 to avoid truncation.`);
  }

  return warnings;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpenGraphBuilder() {
  const [fields, setFields] = useState<OgFields>(DEFAULT_FIELDS);
  const [showArticleFields, setShowArticleFields] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = useCallback(<K extends keyof OgFields>(key: K, value: OgFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const metaHtml = buildMetaTags(fields);
  const warnings = getWarnings(fields);

  const hasPreview = fields.title || fields.description || fields.image || fields.url;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(metaHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [metaHtml]);

  const reset = useCallback(() => {
    setFields(DEFAULT_FIELDS);
    setShowArticleFields(false);
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Live Preview ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Social Share Preview
        </h2>

        {/* Facebook-style card */}
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium">Facebook / LinkedIn</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden max-w-lg">
            {/* Image area */}
            {fields.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fields.image}
                alt="og:image preview"
                className="w-full h-48 object-cover bg-slate-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-sm">og:image preview</span>
              </div>
            )}
            {/* Card body */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
              {fields.url && (
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1 truncate">
                  {(() => {
                    try { return new URL(fields.url).hostname; } catch { return fields.url; }
                  })()}
                </p>
              )}
              <p className={`font-semibold text-slate-900 text-sm leading-snug line-clamp-2 ${!fields.title ? "text-slate-400 italic" : ""}`}>
                {fields.title || "og:title"}
              </p>
              <p className={`text-xs mt-1 line-clamp-2 ${!fields.description ? "text-slate-300 italic" : "text-slate-500"}`}>
                {fields.description || "og:description"}
              </p>
              {fields.siteName && (
                <p className="text-xs text-slate-400 mt-1">{fields.siteName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Twitter/X-style card */}
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium">X (Twitter) — Summary Large Image</p>
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-w-lg">
            {fields.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fields.image}
                alt="twitter card preview"
                className="w-full h-44 object-cover bg-slate-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-44 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-sm">og:image preview</span>
              </div>
            )}
            <div className="px-4 py-3">
              <p className={`font-bold text-sm text-slate-900 line-clamp-1 ${!fields.title ? "text-slate-400 italic" : ""}`}>
                {fields.title || "og:title"}
              </p>
              <p className={`text-xs mt-0.5 line-clamp-2 ${!fields.description ? "text-slate-300 italic" : "text-slate-500"}`}>
                {fields.description || "og:description"}
              </p>
              {fields.url && (
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {(() => {
                    try { return new URL(fields.url).hostname; } catch { return fields.url; }
                  })()}
                </p>
              )}
            </div>
          </div>
        </div>

        {!hasPreview && (
          <p className="text-xs text-slate-400 italic">Fill in fields below to see a live preview.</p>
        )}
      </section>

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <WarningIcon />
            <span className="text-sm font-semibold text-amber-800">Validation</span>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-amber-700 pl-6">{w}</p>
          ))}
        </section>
      )}

      {/* ── Generated HTML ── */}
      <section className="bg-slate-900 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Generated Meta Tags
          </h2>
          <button
            onClick={handleCopy}
            disabled={!metaHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-600"
          >
            {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy HTML</>}
          </button>
        </div>
        {metaHtml ? (
          <pre className="font-mono text-xs text-green-300 whitespace-pre-wrap break-all leading-relaxed">
            {metaHtml}
          </pre>
        ) : (
          <p className="font-mono text-sm text-slate-500 italic">
            Fill in fields below to generate tags.
          </p>
        )}
      </section>

      {/* ── Config header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Configuration
        </h2>
        <button
          onClick={reset}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer underline underline-offset-2"
        >
          Reset
        </button>
      </div>

      {/* ── og:type ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">og:type</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The type of content. Choosing <span className="font-mono">article</span> unlocks article-specific fields.
          </p>
        </div>
        <div className="flex gap-2">
          {OG_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                set("type", t.value);
                if (t.value === "article") setShowArticleFields(true);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg border font-mono font-semibold transition-colors cursor-pointer ${
                fields.type === t.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Core fields ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Core Fields</h3>

        <FieldInput
          label="og:title"
          placeholder="My Amazing Article"
          value={fields.title}
          onChange={(v) => set("title", v)}
          hint="Title as it appears in share cards. Keep under 60 characters."
          maxLength={90}
          showCount
        />

        <FieldTextarea
          label="og:description"
          placeholder="A brief description shown below the title in social share cards."
          value={fields.description}
          onChange={(v) => set("description", v)}
          hint="Aim for 1–2 sentences, under 200 characters."
          maxLength={300}
          showCount
        />

        <FieldInput
          label="og:image"
          placeholder="https://example.com/og-image.png"
          value={fields.image}
          onChange={(v) => set("image", v)}
          hint="Absolute URL. Recommended: 1200×630px, under 1MB. PNG or JPG."
          type="url"
        />

        <FieldInput
          label="og:url"
          placeholder="https://example.com/my-article"
          value={fields.url}
          onChange={(v) => set("url", v)}
          hint="Canonical URL of the page."
          type="url"
        />

        <FieldInput
          label="og:site_name"
          placeholder="My Site"
          value={fields.siteName}
          onChange={(v) => set("siteName", v)}
          hint="Name of your website or brand."
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600">
            og:locale
          </label>
          <select
            value={fields.locale}
            onChange={(e) => set("locale", e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 bg-white"
          >
            {LOCALE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400">Language and territory of the page content.</p>
        </div>
      </section>

      {/* ── Article fields toggle ── */}
      {fields.type === "article" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Article Fields</h3>
            <button
              onClick={() => setShowArticleFields((v) => !v)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              {showArticleFields ? "Hide" : "Show"}
            </button>
          </div>

          {showArticleFields && (
            <>
              <FieldInput
                label="article:published_time"
                placeholder="2024-06-01T12:00:00+00:00"
                value={fields.publishedTime}
                onChange={(v) => set("publishedTime", v)}
                hint="ISO 8601 datetime when the article was first published."
              />
              <FieldInput
                label="article:author"
                placeholder="https://example.com/authors/jane"
                value={fields.author}
                onChange={(v) => set("author", v)}
                hint="URL of the author's profile page."
                type="url"
              />
            </>
          )}

          {!showArticleFields && (
            <p className="text-xs text-slate-400">Click Show to add published_time and author fields.</p>
          )}
        </section>
      )}

      {/* ── Reference table ── */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Tag Reference</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Property</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Purpose</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["og:title", "Title shown in the share card", "Yes"],
                ["og:description", "Short description below the title", "Recommended"],
                ["og:image", "Preview image (1200×630px recommended)", "Recommended"],
                ["og:url", "Canonical URL of the page", "Recommended"],
                ["og:type", "Content type: website, article, product", "Yes"],
                ["og:site_name", "Name of the website", "Optional"],
                ["og:locale", "Language/territory (e.g. en_US)", "Optional"],
                ["article:published_time", "ISO 8601 publish date (article only)", "Optional"],
                ["article:author", "Profile URL of the author (article only)", "Optional"],
              ].map(([prop, purpose, req]) => (
                <tr key={prop} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold align-top whitespace-nowrap">{prop}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">{purpose}</td>
                  <td className="px-4 py-3 text-xs align-top">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      req === "Yes" ? "bg-red-100 text-red-700" :
                      req === "Recommended" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {req}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad placeholder */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

interface FieldInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
  maxLength?: number;
  showCount?: boolean;
}

function FieldInput({ label, placeholder, value, onChange, hint, type = "text", maxLength, showCount }: FieldInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600">{label}</label>
        {showCount && maxLength && (
          <span className={`text-xs tabular-nums ${value.length > maxLength * 0.85 ? "text-amber-500" : "text-slate-400"}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface FieldTextareaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

function FieldTextarea({ label, placeholder, value, onChange, hint, maxLength, showCount }: FieldTextareaProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600">{label}</label>
        {showCount && maxLength && (
          <span className={`text-xs tabular-nums ${value.length > maxLength * 0.85 ? "text-amber-500" : "text-slate-400"}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400 resize-y"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Open Graph Tag Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate Open Graph meta tags for articles, websites, and products. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Open Graph Tag Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate Open Graph meta tags for articles, websites, and products. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
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
