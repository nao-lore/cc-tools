"use client";

import { useState, useCallback } from "react";

// ─── Format definitions ───────────────────────────────────────────────────────

type Format = "json" | "javascript" | "sql" | "html" | "regex" | "csv";
type Mode = "escape" | "unescape";

interface Segment {
  text: string;
  changed: boolean;
}

const FORMATS: { id: Format; label: string }[] = [
  { id: "json", label: "JSON" },
  { id: "javascript", label: "JavaScript" },
  { id: "sql", label: "SQL" },
  { id: "html", label: "HTML" },
  { id: "regex", label: "Regex" },
  { id: "csv", label: "CSV" },
];

// ─── Escape / unescape logic ──────────────────────────────────────────────────

function escapeJson(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\b/g, "\\b")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) => {
      return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
}

function unescapeJson(input: string): string {
  try {
    return JSON.parse('"' + input + '"');
  } catch {
    // fallback manual
    return input
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\f/g, "\f")
      .replace(/\\b/g, "\b")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}

function escapeJs(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\b/g, "\\b")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) => {
      return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
}

function unescapeJs(input: string): string {
  return input
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\f/g, "\f")
    .replace(/\\b/g, "\b")
    .replace(/\\`/g, "`")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function escapeSql(input: string): string {
  return input.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

function unescapeSql(input: string): string {
  return input.replace(/''/g, "'").replace(/\\\\/g, "\\");
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHtml(input: string): string {
  return input
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unescapeRegex(input: string): string {
  return input.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
}

function escapeCsv(input: string): string {
  if (/[,"\n\r]/.test(input)) {
    return '"' + input.replace(/"/g, '""') + '"';
  }
  return input;
}

function unescapeCsv(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"');
  }
  return input;
}

function applyFormat(input: string, format: Format, mode: Mode): string {
  if (mode === "escape") {
    switch (format) {
      case "json": return escapeJson(input);
      case "javascript": return escapeJs(input);
      case "sql": return escapeSql(input);
      case "html": return escapeHtml(input);
      case "regex": return escapeRegex(input);
      case "csv": return escapeCsv(input);
    }
  } else {
    switch (format) {
      case "json": return unescapeJson(input);
      case "javascript": return unescapeJs(input);
      case "sql": return unescapeSql(input);
      case "html": return unescapeHtml(input);
      case "regex": return unescapeRegex(input);
      case "csv": return unescapeCsv(input);
    }
  }
}

// ─── Diff segments for highlighting ──────────────────────────────────────────

/**
 * Produce segments marking which parts of `output` are different from `input`.
 * Uses a simple scan: wherever output has a substring not present at the same
 * position in input, mark it as changed.
 */
function diffSegments(input: string, output: string): Segment[] {
  if (input === output) return [{ text: output, changed: false }];

  const segments: Segment[] = [];
  let oi = 0;
  let ii = 0;

  while (oi < output.length) {
    // Try to match input chars at current position
    if (ii < input.length && output[oi] === input[ii]) {
      // Unchanged run
      let start = oi;
      while (oi < output.length && ii < input.length && output[oi] === input[ii]) {
        oi++;
        ii++;
      }
      segments.push({ text: output.slice(start, oi), changed: false });
    } else {
      // Changed run — advance output until we re-sync with input
      let start = oi;
      // Skip ahead in input to find next sync point
      let synced = false;
      for (let lookAhead = 1; lookAhead <= output.length - oi && lookAhead <= 20; lookAhead++) {
        const outChunk = output.slice(oi, oi + lookAhead);
        const inputIdx = input.indexOf(outChunk, ii);
        if (inputIdx !== -1) {
          // Everything before this chunk in output is changed
          segments.push({ text: output.slice(start, oi), changed: true });
          // Advance ii past any input chars we skipped
          ii = inputIdx;
          synced = true;
          break;
        }
      }
      if (!synced) {
        // Consume one output char as changed
        oi++;
        if (oi >= output.length || (ii < input.length && output[oi] === input[ii])) {
          segments.push({ text: output.slice(start, oi), changed: true });
        }
      }
    }
  }

  // Merge consecutive same-type segments
  const merged: Segment[] = [];
  for (const seg of segments) {
    if (seg.text === "") continue;
    if (merged.length > 0 && merged[merged.length - 1].changed === seg.changed) {
      merged[merged.length - 1].text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

// ─── Sample strings ───────────────────────────────────────────────────────────

const SAMPLES: Record<Format, string> = {
  json: `Hello "World"\nLine two\tTabbed`,
  javascript: `It's a "test"\nwith `+"`backticks`"+` and\ttabs`,
  sql: `O'Brien's "note" with backslash \\`,
  html: `<script>alert("XSS & more")</script>`,
  regex: `Price: $9.99 (plus tax). Amount: 100%`,
  csv: `Smith, John,"Manager, Senior",New York`,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function StringEscape() {
  const [format, setFormat] = useState<Format>("json");
  const [mode, setMode] = useState<Mode>("escape");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [copied, setCopied] = useState(false);
  const [changedCount, setChangedCount] = useState(0);

  const handleConvert = useCallback(() => {
    const result = applyFormat(input, format, mode);
    setOutput(result);
    const segs = diffSegments(input, result);
    setSegments(segs);
    setChangedCount(segs.filter((s) => s.changed).reduce((acc, s) => acc + s.text.length, 0));
  }, [input, format, mode]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSegments([]);
    setChangedCount(0);
    setCopied(false);
  };

  const handleSample = () => {
    setInput(SAMPLES[format]);
    setOutput("");
    setSegments([]);
    setChangedCount(0);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Format tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)]">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFormat(f.id);
              setOutput("");
              setSegments([]);
              setChangedCount(0);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              format === f.id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mode toggle + action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Escape / Unescape toggle */}
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-sm font-medium">
          <button
            onClick={() => {
              setMode("escape");
              setOutput("");
              setSegments([]);
              setChangedCount(0);
            }}
            className={`px-4 py-2 transition-colors ${
              mode === "escape"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            }`}
          >
            Escape
          </button>
          <button
            onClick={() => {
              setMode("unescape");
              setOutput("");
              setSegments([]);
              setChangedCount(0);
            }}
            className={`px-4 py-2 border-l border-[var(--border)] transition-colors ${
              mode === "unescape"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            }`}
          >
            Unescape
          </button>
        </div>

        <button
          onClick={handleConvert}
          className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Convert
        </button>
        <button
          onClick={handleSample}
          className="px-4 py-2 border border-[var(--border)] text-[var(--muted-fg)] rounded-lg hover:text-[var(--foreground)] transition-colors text-sm"
        >
          Sample
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-[var(--border)] text-[var(--muted-fg)] rounded-lg hover:text-[var(--foreground)] transition-colors text-sm"
        >
          Clear
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--muted-fg)]">
          Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-40 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-sm text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-fg)]"
          placeholder={`Paste your string here to ${mode}...`}
          spellCheck={false}
        />
      </div>

      {/* Output */}
      {output !== "" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[var(--muted-fg)]">
                Output
              </label>
              {changedCount > 0 ? (
                <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                  {changedCount} char{changedCount !== 1 ? "s" : ""} changed
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-fg)] rounded-full">
                  No changes
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                copied
                  ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20"
                  : "border-[var(--border)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Highlighted output */}
          <div className="w-full min-h-[10rem] p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-sm text-[var(--foreground)] overflow-auto whitespace-pre-wrap break-all">
            {segments.map((seg, i) =>
              seg.changed ? (
                <mark
                  key={i}
                  className="bg-amber-200/70 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 rounded-sm not-italic"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>

          {/* Plain textarea for easy selection */}
          <textarea
            readOnly
            value={output}
            className="mt-2 w-full h-24 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-xs text-[var(--muted-fg)] resize-y focus:outline-none"
            spellCheck={false}
          />
        </div>
      )}

      {/* Legend */}
      {output !== "" && (
        <div className="flex items-center gap-2 text-xs text-[var(--muted-fg)]">
          <mark className="bg-amber-200/70 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 rounded-sm px-1 not-italic">
            highlighted
          </mark>
          <span>= characters that were added or changed by {mode}ing</span>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this String Escape / Unescape tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Escape and unescape strings for JSON, JS, SQL, regex, and HTML. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this String Escape / Unescape tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Escape and unescape strings for JSON, JS, SQL, regex, and HTML. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "String Escape / Unescape",
  "description": "Escape and unescape strings for JSON, JS, SQL, regex, and HTML",
  "url": "https://tools.loresync.dev/string-escape",
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
