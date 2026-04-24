"use client";

import { useState, useCallback } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Parse any reasonable number input: 123456, 1.23e5, 6.02×10²³, 1.23E+5 */
function parseInput(raw: string): number | null {
  if (!raw.trim()) return null;

  // Normalise superscript digits and minus in exponent position
  const superscriptMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-",
  };
  let s = raw.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (c) => superscriptMap[c] ?? c);

  // Replace × or * with "e" so "6.02×10^23" → "6.02e23"
  s = s.replace(/\s*[×x\*]\s*10\s*\^?\s*/i, "e");

  // Replace "10^" standalone
  s = s.replace(/10\s*\^\s*/i, "1e");

  // Collapse multiple spaces
  s = s.replace(/\s+/g, "");

  const n = Number(s);
  if (isNaN(n)) return null;
  return n;
}

/** Count significant figures in the raw input string */
function countSigFigs(raw: string): number | null {
  if (!raw.trim()) return null;

  // Strip sign
  let s = raw.trim().replace(/^[+-]/, "");

  // Handle E/e notation: only coefficient matters
  const eIdx = s.search(/[eE]/);
  if (eIdx !== -1) s = s.slice(0, eIdx);

  // Strip × notation coefficient
  const crossIdx = s.search(/[×x\*]/);
  if (crossIdx !== -1) s = s.slice(0, crossIdx);

  // Remove decimal point for digit analysis
  const hasDecimal = s.includes(".");
  const digits = s.replace(".", "");

  if (!hasDecimal) {
    // No decimal: trailing zeros are ambiguous — don't count them
    const trimmed = digits.replace(/0+$/, "");
    // Leading zeros not significant
    const meaningful = trimmed.replace(/^0+/, "");
    return meaningful.length || null;
  } else {
    // With decimal: all non-leading zeros are significant
    const meaningful = digits.replace(/^0+/, "");
    return meaningful.length || null;
  }
}

/** Format a number as standard decimal string without scientific notation */
function toStandard(n: number): string {
  if (!isFinite(n)) return "∞";
  // Use toPrecision to avoid floating point drift, then strip trailing zeros
  const abs = Math.abs(n);
  if (abs === 0) return "0";

  // For very large or very small, use enough precision
  const precision = 15;
  let s = n.toPrecision(precision);
  // Remove trailing zeros after decimal
  if (s.includes(".") && !s.includes("e") && !s.includes("E")) {
    s = s.replace(/\.?0+$/, "");
  }
  // If toPrecision still gave exponential form, convert manually
  if (s.includes("e") || s.includes("E")) {
    s = exponentialToFixed(n);
  }
  return s;
}

/** Convert a number to a plain decimal string (no exponential notation) */
function exponentialToFixed(n: number): string {
  if (n === 0) return "0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  // Use a high-precision representation
  const str = abs.toExponential(14);
  const [coeff, expStr] = str.split("e");
  const exp = parseInt(expStr, 10);
  const [intPart, fracPart = ""] = coeff.split(".");
  const digits = intPart + fracPart;
  const dotPos = intPart.length + exp; // position of decimal point in digits

  let result: string;
  if (dotPos <= 0) {
    result = "0." + "0".repeat(-dotPos) + digits;
  } else if (dotPos >= digits.length) {
    result = digits + "0".repeat(dotPos - digits.length);
  } else {
    result = digits.slice(0, dotPos) + "." + digits.slice(dotPos);
  }

  // Strip trailing zeros after decimal
  if (result.includes(".")) {
    result = result.replace(/\.?0+$/, "");
  }
  return sign + result;
}

interface ScientificParts {
  coefficient: string;
  exponent: number;
}

/** Decompose a number into coefficient × 10^exponent (coefficient in [1,10)) */
function toScientificParts(n: number): ScientificParts | null {
  if (!isFinite(n) || n === 0) return null;
  const abs = Math.abs(n);
  const exp = Math.floor(Math.log10(abs));
  const coeff = n / Math.pow(10, exp);
  // Round to 12 sig figs to avoid floating point drift
  const coeffStr = parseFloat(coeff.toPrecision(12)).toString();
  return { coefficient: coeffStr, exponent: exp };
}

/** Decompose for engineering notation (exponent multiple of 3) */
function toEngineeringParts(n: number): ScientificParts | null {
  if (!isFinite(n) || n === 0) return null;
  const abs = Math.abs(n);
  const exp = Math.floor(Math.log10(abs));
  const engExp = Math.floor(exp / 3) * 3;
  const coeff = n / Math.pow(10, engExp);
  const coeffStr = parseFloat(coeff.toPrecision(12)).toString();
  return { coefficient: coeffStr, exponent: engExp };
}

/** Convert integer exponent to superscript string */
function toSuperscript(exp: number): string {
  const map: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
  };
  return String(exp).split("").map((c) => map[c] ?? c).join("");
}

// ── sub-components ────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

interface OutputRowProps {
  label: string;
  sublabel: string;
  display: React.ReactNode;
  copyText: string;
}

function OutputRow({ label, sublabel, display, copyText }: OutputRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-36 shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="block text-xs text-gray-400">{sublabel}</span>
      </div>
      <div className="flex-1 font-mono text-sm text-gray-800 break-all min-w-0">
        {copyText ? display : <span className="text-gray-300">—</span>}
      </div>
      <CopyButton text={copyText} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ScientificNotation() {
  const [input, setInput] = useState("");

  const value = parseInput(input);
  const hasValue = value !== null;
  const sigFigs = countSigFigs(input);

  const standard = hasValue ? toStandard(value) : "";

  const sciParts = hasValue ? toScientificParts(value) : null;
  const sciDisplay = sciParts
    ? `${sciParts.coefficient} × 10${toSuperscript(sciParts.exponent)}`
    : "";
  const sciCopy = sciParts ? `${sciParts.coefficient} × 10^${sciParts.exponent}` : "";

  const engParts = hasValue ? toEngineeringParts(value) : null;
  const engDisplay = engParts
    ? `${engParts.coefficient} × 10${toSuperscript(engParts.exponent)}`
    : "";
  const engCopy = engParts ? `${engParts.coefficient} × 10^${engParts.exponent}` : "";

  const eNotation = sciParts
    ? `${sciParts.coefficient}E${sciParts.exponent >= 0 ? "+" : ""}${sciParts.exponent}`
    : "";

  // SI prefix for engineering exponent
  const SI_PREFIXES: Record<number, string> = {
    24: "Y (yotta)", 21: "Z (zetta)", 18: "E (exa)", 15: "P (peta)",
    12: "T (tera)", 9: "G (giga)", 6: "M (mega)", 3: "k (kilo)",
    0: "(base unit)", "-3": "m (milli)", "-6": "μ (micro)", "-9": "n (nano)",
    "-12": "p (pico)", "-15": "f (femto)", "-18": "a (atto)",
  };
  const siPrefix = engParts ? SI_PREFIXES[engParts.exponent] ?? null : null;

  const isInvalid = input.trim() !== "" && !hasValue;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Input Number
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Accepts: <span className="font-mono">123456</span>,{" "}
          <span className="font-mono">1.23e5</span>,{" "}
          <span className="font-mono">6.02×10²³</span>,{" "}
          <span className="font-mono">1.23E+5</span>
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a number…"
          className={`w-full px-3 py-2.5 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            isInvalid ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
        />
        {isInvalid && (
          <p className="mt-1.5 text-xs text-red-500">Could not parse this input.</p>
        )}

        {/* Sig figs badge */}
        {hasValue && sigFigs !== null && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">Significant figures:</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono">
              {sigFigs}
            </span>
          </div>
        )}
      </div>

      {/* Outputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Converted Formats</h2>
        <div className="space-y-2">
          <OutputRow
            label="Standard"
            sublabel="Decimal form"
            display={<span>{standard}</span>}
            copyText={standard}
          />
          <OutputRow
            label="Scientific"
            sublabel="a×10ⁿ  (1≤|a|&lt;10)"
            display={
              sciParts ? (
                <span>
                  {sciParts.coefficient}{" "}
                  <span className="text-gray-500">×</span>{" "}
                  10<sup className="text-xs">{sciParts.exponent}</sup>
                </span>
              ) : null
            }
            copyText={sciCopy}
          />
          <OutputRow
            label="Engineering"
            sublabel="exponent mult. of 3"
            display={
              engParts ? (
                <span>
                  {engParts.coefficient}{" "}
                  <span className="text-gray-500">×</span>{" "}
                  10<sup className="text-xs">{engParts.exponent}</sup>
                  {siPrefix && (
                    <span className="ml-2 text-xs text-indigo-500 font-sans">
                      {siPrefix}
                    </span>
                  )}
                </span>
              ) : null
            }
            copyText={engCopy}
          />
          <OutputRow
            label="E-notation"
            sublabel="ASCII / spreadsheet"
            display={<span>{eNotation}</span>}
            copyText={eNotation}
          />
        </div>
      </div>

      {/* Sig figs detail */}
      {hasValue && sigFigs !== null && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Significant Figures Detail</h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 font-mono">{sigFigs}</div>
              <div className="text-xs text-gray-500 mt-1">sig figs</div>
            </div>
            <div className="flex-1 text-xs text-gray-500 space-y-1 leading-relaxed">
              <p>
                The coefficient in scientific notation has{" "}
                <span className="font-semibold text-gray-700">
                  {sciParts?.coefficient.replace(/[^0-9]/g, "").replace(/^0+/, "").length ?? "—"}
                </span>{" "}
                significant digits.
              </p>
              <p>
                Leading zeros are <span className="text-red-500">not</span> significant.
                Trailing zeros after a decimal point <span className="text-green-600">are</span> significant.
              </p>
            </div>
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Scientific Notation Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert numbers between standard and scientific notation. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Scientific Notation Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert numbers between standard and scientific notation. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Scientific Notation Converter",
  "description": "Convert numbers between standard and scientific notation",
  "url": "https://tools.loresync.dev/scientific-notation",
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
