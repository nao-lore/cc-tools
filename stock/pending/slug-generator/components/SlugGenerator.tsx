"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Separator = "-" | "_" | ".";

interface Options {
  separator: Separator;
  lowercase: boolean;
  maxLength: number;
  transliterateAccents: boolean;
  removeStopWords: boolean;
  baseUrl: string;
}

// ─── Stop words ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","it","its","was","are","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "as","if","then","than","that","this","these","those","i","you","he",
  "she","we","they","what","which","who","whom","how","when","where","why",
]);

// ─── Accent map ───────────────────────────────────────────────────────────────

const ACCENT_MAP: Record<string, string> = {
  à:"a",á:"a",â:"a",ã:"a",ä:"a",å:"a",æ:"ae",
  è:"e",é:"e",ê:"e",ë:"e",
  ì:"i",í:"i",î:"i",ï:"i",
  ò:"o",ó:"o",ô:"o",õ:"o",ö:"o",ø:"o",
  ù:"u",ú:"u",û:"u",ü:"u",
  ý:"y",ÿ:"y",
  ñ:"n",ç:"c",ß:"ss",
  þ:"th",ð:"d",
  À:"a",Á:"a",Â:"a",Ã:"a",Ä:"a",Å:"a",Æ:"ae",
  È:"e",É:"e",Ê:"e",Ë:"e",
  Ì:"i",Í:"i",Î:"i",Ï:"i",
  Ò:"o",Ó:"o",Ô:"o",Õ:"o",Ö:"o",Ø:"o",
  Ù:"u",Ú:"u",Û:"u",Ü:"u",
  Ý:"y",
  Ñ:"n",Ç:"c",
};

// ─── Core slug function ───────────────────────────────────────────────────────

function generateSlug(title: string, opts: Options): string {
  if (!title.trim()) return "";

  let s = title.trim();

  // Transliterate accents
  if (opts.transliterateAccents) {
    s = s.replace(/[^\u0000-\u007E]/g, (ch) => {
      if (ACCENT_MAP[ch]) return ACCENT_MAP[ch];
      // Attempt NFD decomposition for remaining accented chars
      const decomposed = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return /^[a-zA-Z0-9]$/.test(decomposed) ? decomposed : "";
    });
  }

  // Remove non-ASCII (CJK etc.) after transliteration
  s = s.replace(/[^\x00-\x7F]/g, " ");

  // Replace & with "and"
  s = s.replace(/&/g, " and ");

  // Replace non-alphanumeric with spaces
  s = s.replace(/[^a-zA-Z0-9\s]/g, " ");

  // Lowercase
  if (opts.lowercase) {
    s = s.toLowerCase();
  }

  // Split into words
  let words = s.split(/\s+/).filter(Boolean);

  // Remove stop words
  if (opts.removeStopWords && words.length > 1) {
    const filtered = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
    // Keep at least one word
    words = filtered.length > 0 ? filtered : words;
  }

  // Join with separator
  let slug = words.join(opts.separator);

  // Max length — cut at separator boundary
  if (opts.maxLength > 0 && slug.length > opts.maxLength) {
    slug = slug.slice(0, opts.maxLength);
    // Remove trailing separator
    const sep = opts.separator;
    if (slug.endsWith(sep)) {
      slug = slug.slice(0, slug.length - sep.length);
    }
  }

  return slug;
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shrink-0"
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

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs opacity-50">{hint}</span>}
      </span>
      <div
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5 rounded-full transition-colors shrink-0"
        style={{
          backgroundColor: checked ? "var(--primary)" : "var(--border)",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </div>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState<Options>({
    separator: "-",
    lowercase: true,
    maxLength: 80,
    transliterateAccents: true,
    removeStopWords: false,
    baseUrl: "https://example.com/blog/",
  });

  const setOpt = useCallback(
    <K extends keyof Options>(key: K, value: Options[K]) => {
      setOpts((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Detect multi-line (batch mode)
  const lines = useMemo(
    () => input.split("\n").filter((l) => l.trim()),
    [input]
  );
  const isBatch = lines.length > 1;

  // Single slug (live)
  const singleSlug = useMemo(
    () => (lines.length === 1 ? generateSlug(lines[0], opts) : ""),
    [lines, opts]
  );

  // Batch slugs
  const batchSlugs = useMemo(
    () =>
      isBatch
        ? lines.map((line) => ({
            title: line.trim(),
            slug: generateSlug(line, opts),
          }))
        : [],
    [lines, isBatch, opts]
  );

  const previewUrl = singleSlug ? opts.baseUrl + singleSlug : "";

  const cardStyle = {
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Input */}
      <div
        className="rounded-xl border p-5 sm:p-6 space-y-4"
        style={cardStyle}
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Title{isBatch ? "s" : ""}{" "}
            {isBatch && (
              <span className="text-xs opacity-50 font-normal">
                (one per line — batch mode)
              </span>
            )}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              "My Article Title\nAnother Post Title\nThird Title Here"
            }
            rows={isBatch ? Math.min(lines.length + 1, 8) : 3}
            className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        {/* Single result */}
        {!isBatch && singleSlug && (
          <div className="space-y-2">
            <div
              className="rounded-lg border p-3 font-mono text-sm break-all"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
              }}
            >
              {singleSlug}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-50">{singleSlug.length} chars</p>
              <CopyButton text={singleSlug} />
            </div>

            {/* URL preview */}
            <div className="pt-1">
              <p className="text-xs font-medium opacity-60 mb-1">Full URL preview</p>
              <div
                className="rounded-lg border px-3 py-2 text-xs font-mono break-all flex items-start gap-2"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
                }}
              >
                <span className="opacity-40 shrink-0">{opts.baseUrl}</span>
                <span className="font-semibold">{singleSlug}</span>
              </div>
              <div className="flex justify-end mt-1">
                <CopyButton text={previewUrl} label="Copy URL" />
              </div>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {!isBatch && !singleSlug && input.trim() === "" && (
          <p className="text-xs opacity-40 text-center py-2">
            Type a title above — slug appears instantly
          </p>
        )}
      </div>

      {/* Options */}
      <div
        className="rounded-xl border p-5 sm:p-6 space-y-4"
        style={cardStyle}
      >
        <h2 className="text-sm font-semibold opacity-70 uppercase tracking-wide">
          Options
        </h2>

        {/* Separator */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Separator</label>
          <div className="flex gap-2">
            {(["-", "_", "."] as Separator[]).map((sep) => (
              <button
                key={sep}
                onClick={() => setOpt("separator", sep)}
                className="flex-1 py-2 text-sm font-mono rounded-md border transition-colors"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor:
                    opts.separator === sep
                      ? "var(--primary)"
                      : "transparent",
                  color:
                    opts.separator === sep
                      ? "var(--primary-foreground)"
                      : "inherit",
                }}
              >
                {sep === "-" ? "hyphen (-)" : sep === "_" ? "underscore (_)" : "dot (.)"}
              </button>
            ))}
          </div>
        </div>

        {/* Max length */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Max length</label>
            <span className="text-sm font-mono opacity-70">
              {opts.maxLength === 0 ? "unlimited" : opts.maxLength}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={160}
            step={5}
            value={opts.maxLength}
            onChange={(e) => setOpt("maxLength", Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs opacity-40">
            <span>unlimited</span>
            <span>160</span>
          </div>
        </div>

        {/* Base URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Base URL{" "}
            <span className="text-xs font-normal opacity-50">(for preview)</span>
          </label>
          <input
            type="text"
            value={opts.baseUrl}
            onChange={(e) => setOpt("baseUrl", e.target.value)}
            placeholder="https://example.com/blog/"
            className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-1">
          <Toggle
            label="Lowercase"
            hint="Convert all characters to lowercase"
            checked={opts.lowercase}
            onChange={(v) => setOpt("lowercase", v)}
          />
          <Toggle
            label="Transliterate accents"
            hint="é→e, ü→u, ñ→n, ç→c …"
            checked={opts.transliterateAccents}
            onChange={(v) => setOpt("transliterateAccents", v)}
          />
          <Toggle
            label="Remove stop words"
            hint='Strip "the", "and", "of", "a" …'
            checked={opts.removeStopWords}
            onChange={(v) => setOpt("removeStopWords", v)}
          />
        </div>
      </div>

      {/* Batch results */}
      {isBatch && batchSlugs.length > 0 && (
        <div
          className="rounded-xl border p-5 sm:p-6 space-y-3"
          style={cardStyle}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold opacity-70 uppercase tracking-wide">
              Batch Results ({batchSlugs.length})
            </h2>
            <CopyButton
              text={batchSlugs.map((r) => r.slug).join("\n")}
              label="Copy All"
            />
          </div>

          <div className="space-y-2">
            {batchSlugs.map((row, i) => (
              <div
                key={i}
                className="rounded-lg border p-3 space-y-1"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-xs opacity-50 truncate">{row.title}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="flex-1 font-mono text-sm break-all rounded px-2 py-1"
                    style={{
                      backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
                    }}
                  >
                    {row.slug || <span className="opacity-30">—</span>}
                  </span>
                  {row.slug && <CopyButton text={row.slug} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this URL Slug Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert article titles to SEO-friendly URL slugs. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this URL Slug Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert article titles to SEO-friendly URL slugs. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "URL Slug Generator",
  "description": "Convert article titles to SEO-friendly URL slugs",
  "url": "https://tools.loresync.dev/slug-generator",
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
