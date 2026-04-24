"use client";

import { useState, useCallback, useMemo } from "react";

// ── Core conversion logic ────────────────────────────────────────────────────

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

const ORDINAL_ONES = [
  "", "first", "second", "third", "fourth", "fifth", "sixth", "seventh",
  "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth",
  "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth",
  "nineteenth",
];

const ORDINAL_TENS = [
  "", "", "twentieth", "thirtieth", "fortieth", "fiftieth",
  "sixtieth", "seventieth", "eightieth", "ninetieth",
];

function belowThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)];
    const o = ONES[n % 10];
    return o ? `${t}-${o}` : t;
  }
  const hundreds = ONES[Math.floor(n / 100)];
  const rest = belowThousand(n % 100);
  return rest ? `${hundreds} hundred ${rest}` : `${hundreds} hundred`;
}

function belowThousandOrdinal(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ORDINAL_ONES[n];
  if (n < 100) {
    const r = n % 10;
    if (r === 0) return ORDINAL_TENS[Math.floor(n / 10)];
    return `${TENS[Math.floor(n / 10)]}-${ORDINAL_ONES[r]}`;
  }
  const hundreds = ONES[Math.floor(n / 100)];
  const rest = n % 100;
  if (rest === 0) return `${hundreds} hundredth`;
  return `${hundreds} hundred ${belowThousandOrdinal(rest)}`;
}

const SCALES = ["", "thousand", "million", "billion", "trillion"];

function toCardinal(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return `negative ${toCardinal(-n)}`;

  const parts: string[] = [];
  let remaining = Math.floor(n);
  let scaleIdx = 0;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk !== 0) {
      const words = belowThousand(chunk);
      parts.unshift(scaleIdx > 0 ? `${words} ${SCALES[scaleIdx]}` : words);
    }
    remaining = Math.floor(remaining / 1000);
    scaleIdx++;
  }

  return parts.join(" ");
}

function toOrdinal(n: number): string {
  if (n === 0) return "zeroth";
  if (n < 0) return `negative ${toOrdinal(-n)}`;

  const floor = Math.floor(n);
  // Decompose into groups
  const groups: { chunk: number; scale: number }[] = [];
  let remaining = floor;
  let scaleIdx = 0;
  while (remaining > 0) {
    groups.unshift({ chunk: remaining % 1000, scale: scaleIdx });
    remaining = Math.floor(remaining / 1000);
    scaleIdx++;
  }

  if (groups.length === 0) return "zeroth";

  // All groups except last use cardinal; last group uses ordinal suffix
  const parts: string[] = [];
  for (let i = 0; i < groups.length - 1; i++) {
    const { chunk, scale } = groups[i];
    if (chunk !== 0) {
      const words = belowThousand(chunk);
      parts.push(scale > 0 ? `${words} ${SCALES[scale]}` : words);
    }
  }

  const last = groups[groups.length - 1];
  if (last.chunk === 0) {
    // e.g. 1,000,000 → "one millionth"
    const prevGroup = groups[groups.length - 2];
    if (prevGroup) {
      // Replace last cardinal part with ordinal scale
      parts.pop();
      const words = belowThousand(prevGroup.chunk);
      parts.push(`${words} ${SCALES[prevGroup.scale]}th`);
    }
  } else {
    const ordWords = belowThousandOrdinal(last.chunk);
    parts.push(last.scale > 0 ? `${ordWords} ${SCALES[last.scale]}th` : ordWords);
  }

  return parts.join(" ");
}

function toCurrency(n: number): string {
  if (isNaN(n)) return "";
  const negative = n < 0;
  const abs = Math.abs(n);
  const dollars = Math.floor(abs);
  const cents = Math.round((abs - dollars) * 100);

  const dollarWords = toCardinal(dollars);
  const dollarPart = `${dollarWords} ${dollars === 1 ? "dollar" : "dollars"}`;

  if (cents === 0) {
    return negative ? `negative ${dollarPart}` : dollarPart;
  }

  const centWords = toCardinal(cents);
  const centPart = `${centWords} ${cents === 1 ? "cent" : "cents"}`;
  const result = `${dollarPart} and ${centPart}`;
  return negative ? `negative ${result}` : result;
}

// ── MAX: 999,999,999,999,999 (999 trillion) ──────────────────────────────────
const MAX_VALUE = 999_999_999_999_999;

// ── Component ────────────────────────────────────────────────────────────────

type CopiedKey = "cardinal" | "ordinal" | "currency" | null;

export default function NumberToWords() {
  const [raw, setRaw] = useState("1234");
  const [copied, setCopied] = useState<CopiedKey>(null);

  const parsed = useMemo(() => {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "-") return null;
    const n = parseFloat(trimmed);
    if (isNaN(n)) return null;
    if (Math.abs(n) > MAX_VALUE) return null;
    return n;
  }, [raw]);

  const cardinal = useMemo(
    () => (parsed !== null ? toCardinal(parsed) : null),
    [parsed]
  );
  const ordinal = useMemo(
    () => (parsed !== null ? toOrdinal(Math.floor(Math.abs(parsed))) : null),
    [parsed]
  );
  const currency = useMemo(
    () => (parsed !== null ? toCurrency(parsed) : null),
    [parsed]
  );

  const copyText = useCallback(
    async (text: string, key: CopiedKey) => {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    },
    []
  );

  const isInvalid = raw.trim() !== "" && raw.trim() !== "-" && parsed === null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">Number</h3>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 1234 or 1234.56"
          className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none transition-colors ${
            isInvalid
              ? "border-red-400 focus:border-red-400"
              : "border-border focus:border-accent"
          }`}
          aria-label="Number input"
        />
        {isInvalid && (
          <p className="mt-1.5 text-xs text-red-500">
            Enter a number up to 999 trillion. Decimals supported for currency.
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted">
          Supports up to 999,999,999,999,999. Use a decimal for cents (e.g. 12.50).
        </p>
      </div>

      {/* Results */}
      {parsed !== null && (
        <>
          <OutputCard
            label="Cardinal"
            description="Standard number words"
            value={cardinal!}
            copied={copied === "cardinal"}
            onCopy={() => copyText(cardinal!, "cardinal")}
          />
          <OutputCard
            label="Ordinal"
            description="Position / ranking form (integer part only)"
            value={ordinal!}
            copied={copied === "ordinal"}
            onCopy={() => copyText(ordinal!, "ordinal")}
          />
          <OutputCard
            label="Currency"
            description="Dollar and cents form"
            value={currency!}
            copied={copied === "currency"}
            onCopy={() => copyText(currency!, "currency")}
          />
        </>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}

// ── Sub-component ────────────────────────────────────────────────────────────

interface OutputCardProps {
  label: string;
  description: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}

function OutputCard({ label, description, value, copied, onCopy }: OutputCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <button
          onClick={onCopy}
          className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-base text-foreground leading-relaxed break-words select-all font-mono">
        {value}
      </p>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Number to Words Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert numbers to English words. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Number to Words Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert numbers to English words. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
