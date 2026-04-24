"use client";

import { useState, useCallback } from "react";

// ─── Case conversion utilities ────────────────────────────────────────────────

/**
 * Tokenize any case format into an array of lowercase words.
 * Handles: camelCase, PascalCase, snake_case, kebab-case,
 *          SCREAMING_SNAKE_CASE, Title Case, sentence case, acronyms.
 */
function tokenize(input: string): string[] {
  // Replace separators with spaces
  let s = input.replace(/[-_]+/g, " ");

  // Insert space before uppercase sequences followed by lowercase (XMLParser → XML Parser)
  s = s.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  // Insert space before uppercase letters preceded by lowercase (camelCase → camel Case)
  s = s.replace(/([a-z\d])([A-Z])/g, "$1 $2");

  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function toCamelCase(words: string[]): string {
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

function toPascalCase(words: string[]): string {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function toSnakeCase(words: string[]): string {
  return words.join("_");
}

function toKebabCase(words: string[]): string {
  return words.join("-");
}

function toScreamingSnakeCase(words: string[]): string {
  return words.join("_").toUpperCase();
}

function toTitleCase(words: string[]): string {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CaseResult {
  label: string;
  key: string;
  value: string;
  example: string;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="text-xs px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ label, value, example }: { label: string; value: string; example: string }) {
  return (
    <div className="border border-[var(--border)] rounded-lg p-4 flex flex-col gap-2 bg-[var(--background)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wide">
          {label}
        </span>
        <CopyButton text={value} />
      </div>
      <div className="font-mono text-sm text-[var(--foreground)] break-all min-h-[1.5rem]">
        {value || (
          <span className="text-[var(--muted-fg)] italic text-xs">{example}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TextCaseConverter() {
  const [input, setInput] = useState("");

  const words = tokenize(input);
  const hasInput = words.length > 0;

  const results: CaseResult[] = [
    {
      label: "camelCase",
      key: "camel",
      value: hasInput ? toCamelCase(words) : "",
      example: "helloWorldExample",
    },
    {
      label: "PascalCase",
      key: "pascal",
      value: hasInput ? toPascalCase(words) : "",
      example: "HelloWorldExample",
    },
    {
      label: "snake_case",
      key: "snake",
      value: hasInput ? toSnakeCase(words) : "",
      example: "hello_world_example",
    },
    {
      label: "kebab-case",
      key: "kebab",
      value: hasInput ? toKebabCase(words) : "",
      example: "hello-world-example",
    },
    {
      label: "SCREAMING_SNAKE_CASE",
      key: "screaming",
      value: hasInput ? toScreamingSnakeCase(words) : "",
      example: "HELLO_WORLD_EXAMPLE",
    },
    {
      label: "Title Case",
      key: "title",
      value: hasInput ? toTitleCase(words) : "",
      example: "Hello World Example",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <label
          htmlFor="case-input"
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          Input Text
        </label>
        <textarea
          id="case-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text here... e.g. hello world, XMLParser, my-variable-name"
          rows={4}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
        />
        {hasInput && (
          <p className="text-xs text-[var(--muted-fg)]">
            Detected {words.length} word{words.length !== 1 ? "s" : ""}:{" "}
            <span className="font-mono">{words.join(", ")}</span>
          </p>
        )}
      </div>

      {/* Output grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r) => (
          <ResultCard
            key={r.key}
            label={r.label}
            value={r.value}
            example={r.example}
          />
        ))}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Text Case Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert text between camelCase, snake_case, PascalCase, kebab-case. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Text Case Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert text between camelCase, snake_case, PascalCase, kebab-case. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Text Case Converter",
  "description": "Convert text between camelCase, snake_case, PascalCase, kebab-case",
  "url": "https://tools.loresync.dev/text-case-converter",
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
