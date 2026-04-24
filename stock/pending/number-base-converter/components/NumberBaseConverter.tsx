"use client";

import { useState, useCallback } from "react";

const STANDARD_BASES = [
  { label: "Binary", base: 2, prefix: "0b" },
  { label: "Octal", base: 8, prefix: "0o" },
  { label: "Decimal", base: 10, prefix: "" },
  { label: "Hexadecimal", base: 16, prefix: "0x" },
] as const;

const BIT_LENGTHS = [
  { bits: 8, max: 255n },
  { bits: 16, max: 65535n },
  { bits: 32, max: 4294967295n },
  { bits: 64, max: 18446744073709551615n },
] as const;

const INPUT_BASE_OPTIONS = Array.from({ length: 35 }, (_, i) => i + 2);

function getBitLength(value: bigint): number | null {
  if (value < 0n) return null;
  for (const { bits, max } of BIT_LENGTHS) {
    if (value <= max) return bits;
  }
  return null;
}

function isValidForBase(input: string, base: number): boolean {
  if (input === "") return true;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, base);
  return input.toLowerCase().split("").every((c) => chars.includes(c));
}

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
  base: number;
  prefix: string;
  value: string;
}

function OutputRow({ label, base, prefix, value }: OutputRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-28 shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="block text-xs text-gray-400">Base {base}</span>
      </div>
      <div className="flex-1 font-mono text-sm text-gray-800 break-all">
        {value ? (
          <>
            {prefix && <span className="text-gray-400">{prefix}</span>}
            {value}
          </>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function NumberBaseConverter() {
  const [inputValue, setInputValue] = useState("");
  const [inputBase, setInputBase] = useState(10);
  const [customBase, setCustomBase] = useState(32);
  const [error, setError] = useState("");

  const parsedBigInt = useCallback((): bigint | null => {
    if (!inputValue) return null;
    if (!isValidForBase(inputValue, inputBase)) return null;
    try {
      return BigInt(parseInt(inputValue, inputBase));
    } catch {
      return null;
    }
  }, [inputValue, inputBase]);

  const decimal = parsedBigInt();

  const convert = (base: number): string => {
    if (decimal === null) return "";
    return decimal.toString(base).toUpperCase();
  };

  const handleInputChange = (val: string) => {
    const clean = val.trim().toLowerCase();
    setInputValue(clean);
    if (clean && !isValidForBase(clean, inputBase)) {
      setError(`Invalid characters for base ${inputBase}`);
    } else {
      setError("");
    }
  };

  const handleBaseChange = (base: number) => {
    setInputBase(base);
    setInputValue("");
    setError("");
  };

  const bitLength = decimal !== null && decimal >= 0n ? getBitLength(decimal) : null;

  const customOutput = convert(customBase);

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Input</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Enter a number in base ${inputBase}…`}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>
          <div>
            <select
              value={inputBase}
              onChange={(e) => handleBaseChange(Number(e.target.value))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {INPUT_BASE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  Base {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bit length display */}
        {decimal !== null && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">Bit length:</span>
            <div className="flex gap-1.5">
              {BIT_LENGTHS.map(({ bits }) => (
                <span
                  key={bits}
                  className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                    bitLength === bits
                      ? "bg-indigo-600 text-white"
                      : bits < (bitLength ?? 999)
                      ? "bg-red-100 text-red-400 line-through"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {bits}-bit
                </span>
              ))}
              {bitLength === null && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-500 font-semibold">
                  &gt;64-bit
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Standard outputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Standard Bases</h2>
        <div className="space-y-2">
          {STANDARD_BASES.map(({ label, base, prefix }) => (
            <OutputRow
              key={base}
              label={label}
              base={base}
              prefix={prefix}
              value={convert(base)}
            />
          ))}
        </div>
      </div>

      {/* Custom base */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Custom Base</h2>
          <select
            value={customBase}
            onChange={(e) => setCustomBase(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {INPUT_BASE_OPTIONS.map((b) => (
              <option key={b} value={b}>
                Base {b}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1 font-mono text-sm text-gray-800 break-all">
            {customOutput ? customOutput : <span className="text-gray-300">—</span>}
          </div>
          <CopyButton text={customOutput} />
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Number Base Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert numbers between binary, octal, decimal, hex, and custom bases. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Number Base Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert numbers between binary, octal, decimal, hex, and custom bases. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Number Base Converter",
  "description": "Convert numbers between binary, octal, decimal, hex, and custom bases",
  "url": "https://tools.loresync.dev/number-base-converter",
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
