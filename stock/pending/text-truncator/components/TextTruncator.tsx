"use client";

import { useState, useCallback, useMemo, useRef } from "react";

type TruncatePosition = "end" | "middle" | "start";
type TruncateMode = "chars" | "words";

function truncateByChars(
  text: string,
  maxChars: number,
  position: TruncatePosition,
  ellipsis: string
): string {
  if (text.length <= maxChars) return text;
  const ellipsisLen = ellipsis.length;
  const available = maxChars - ellipsisLen;
  if (available <= 0) return ellipsis.slice(0, maxChars);

  if (position === "end") {
    return text.slice(0, available) + ellipsis;
  } else if (position === "start") {
    return ellipsis + text.slice(text.length - available);
  } else {
    // middle
    const half = Math.floor(available / 2);
    const rest = available - half;
    return text.slice(0, half) + ellipsis + text.slice(text.length - rest);
  }
}

function truncateByWords(
  text: string,
  maxWords: number,
  position: TruncatePosition,
  ellipsis: string
): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;

  if (position === "end") {
    return words.slice(0, maxWords).join(" ") + ellipsis;
  } else if (position === "start") {
    return ellipsis + words.slice(words.length - maxWords).join(" ");
  } else {
    // middle
    const half = Math.floor(maxWords / 2);
    const rest = maxWords - half;
    return (
      words.slice(0, half).join(" ") +
      ellipsis +
      words.slice(words.length - rest).join(" ")
    );
  }
}

const DEFAULT_TEXT =
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.";

export default function TextTruncator() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [mode, setMode] = useState<TruncateMode>("chars");
  const [maxChars, setMaxChars] = useState(80);
  const [maxWords, setMaxWords] = useState(12);
  const [position, setPosition] = useState<TruncatePosition>("end");
  const [ellipsis, setEllipsis] = useState("…");
  const [copied, setCopied] = useState(false);
  const resizableRef = useRef<HTMLDivElement>(null);

  const truncated = useMemo(() => {
    if (!inputText) return "";
    if (mode === "chars") {
      return truncateByChars(inputText, maxChars, position, ellipsis);
    } else {
      return truncateByWords(inputText, maxWords, position, ellipsis);
    }
  }, [inputText, mode, maxChars, maxWords, position, ellipsis]);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const truncatedCharCount = truncated.length;
  const truncatedWordCount = truncated.trim()
    ? truncated.trim().split(/\s+/).length
    : 0;
  const isTruncated =
    mode === "chars"
      ? inputText.length > maxChars
      : wordCount > maxWords;

  const handleCopy = useCallback(async () => {
    if (!truncated) return;
    await navigator.clipboard.writeText(truncated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [truncated]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
        <h3 className="text-sm font-medium text-muted">Input Text</h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          placeholder="Paste or type your long text here…"
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-y font-mono leading-relaxed"
        />
        <div className="flex gap-4 text-xs text-muted">
          <span>{charCount} chars</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-5">
        <h3 className="text-sm font-medium text-muted">Controls</h3>

        {/* Mode toggle */}
        <div className="space-y-2">
          <p className="text-xs text-muted font-medium">Truncation mode</p>
          <div className="flex gap-2">
            {(["chars", "words"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  mode === m
                    ? "bg-accent text-white border-accent"
                    : "border-border text-foreground hover:border-accent/50"
                }`}
              >
                {m === "chars" ? "Characters" : "Words"}
              </button>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted font-medium">
              Max {mode === "chars" ? "characters" : "words"}
            </p>
            <span className="text-sm font-mono font-semibold text-foreground">
              {mode === "chars" ? maxChars : maxWords}
            </span>
          </div>
          {mode === "chars" ? (
            <input
              type="range"
              min={5}
              max={Math.max(200, charCount)}
              value={maxChars}
              onChange={(e) => setMaxChars(Number(e.target.value))}
              className="w-full accent-accent"
            />
          ) : (
            <input
              type="range"
              min={1}
              max={Math.max(50, wordCount)}
              value={maxWords}
              onChange={(e) => setMaxWords(Number(e.target.value))}
              className="w-full accent-accent"
            />
          )}
          <div className="flex justify-between text-[10px] text-muted">
            <span>{mode === "chars" ? "5" : "1"}</span>
            <span>{mode === "chars" ? Math.max(200, charCount) : Math.max(50, wordCount)}</span>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <p className="text-xs text-muted font-medium">Truncation position</p>
          <div className="flex gap-2 flex-wrap">
            {(["end", "middle", "start"] as const).map((pos) => (
              <label
                key={pos}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border cursor-pointer transition-colors ${
                  position === pos
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border text-foreground hover:border-accent/50"
                }`}
              >
                <input
                  type="radio"
                  name="position"
                  value={pos}
                  checked={position === pos}
                  onChange={() => setPosition(pos)}
                  className="accent-accent"
                />
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Ellipsis character */}
        <div className="space-y-2">
          <p className="text-xs text-muted font-medium">Ellipsis character</p>
          <input
            type="text"
            value={ellipsis}
            onChange={(e) => setEllipsis(e.target.value)}
            maxLength={10}
            placeholder="…"
            className="w-40 px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
          />
          <p className="text-[11px] text-muted">
            Try: <code className="font-mono">…</code> &nbsp;
            <code className="font-mono">...</code> &nbsp;
            <code className="font-mono"> [more]</code> &nbsp;
            <code className="font-mono">→</code>
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">
            Truncated Preview
            {isTruncated && (
              <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-accent/15 text-accent font-semibold">
                TRUNCATED
              </span>
            )}
            {!isTruncated && (
              <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-semibold">
                FITS
              </span>
            )}
          </h3>
          <button
            onClick={handleCopy}
            disabled={!truncated}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="px-4 py-3 bg-background rounded-lg border border-border text-sm text-foreground leading-relaxed break-all font-mono min-h-[3rem]">
          {truncated || <span className="text-muted italic">No text</span>}
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span>{truncatedCharCount} chars</span>
          <span>{truncatedWordCount} words</span>
          {isTruncated && (
            <span className="text-accent">
              {charCount - truncatedCharCount} chars removed
            </span>
          )}
        </div>
      </div>

      {/* CSS text-overflow demo */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-muted">CSS text-overflow Demo</h3>
          <p className="text-xs text-muted mt-0.5">
            Drag the right edge of the box to resize and see CSS overflow behavior
          </p>
        </div>
        <div
          ref={resizableRef}
          style={{
            resize: "horizontal",
            overflow: "hidden",
            minWidth: "120px",
            maxWidth: "100%",
            width: "100%",
          }}
          className="rounded-lg border border-border bg-background"
        >
          {/* single-line ellipsis */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] text-muted mb-1 font-medium uppercase tracking-wide">
              white-space: nowrap · text-overflow: ellipsis
            </p>
            <p
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="text-sm text-foreground"
            >
              {inputText || DEFAULT_TEXT}
            </p>
          </div>

          {/* clip */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] text-muted mb-1 font-medium uppercase tracking-wide">
              white-space: nowrap · text-overflow: clip
            </p>
            <p
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "clip",
              }}
              className="text-sm text-foreground"
            >
              {inputText || DEFAULT_TEXT}
            </p>
          </div>

          {/* multi-line clamp */}
          <div className="px-4 py-3">
            <p className="text-[10px] text-muted mb-1 font-medium uppercase tracking-wide">
              -webkit-line-clamp: 2
            </p>
            <p
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              className="text-sm text-foreground leading-relaxed"
            >
              {inputText || DEFAULT_TEXT}
            </p>
          </div>
        </div>

        {/* CSS snippet */}
        <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-3 overflow-x-auto leading-relaxed whitespace-pre">{`.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Multi-line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`}</pre>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Text Truncator & Ellipsis Tester tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Preview how text truncates at various lengths with ellipsis. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Text Truncator & Ellipsis Tester tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Preview how text truncates at various lengths with ellipsis. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Text Truncator & Ellipsis Tester",
  "description": "Preview how text truncates at various lengths with ellipsis",
  "url": "https://tools.loresync.dev/text-truncator",
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
