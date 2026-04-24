"use client";

import { useState, useCallback } from "react";

type FormatType = "decimal" | "currency" | "percent" | "unit";
type Notation = "standard" | "scientific" | "engineering" | "compact";
type SignDisplay = "auto" | "always" | "never" | "exceptZero";

const LOCALES = [
  { value: "en-US", label: "en-US — English (US)" },
  { value: "en-GB", label: "en-GB — English (UK)" },
  { value: "ja-JP", label: "ja-JP — Japanese" },
  { value: "de-DE", label: "de-DE — German" },
  { value: "fr-FR", label: "fr-FR — French" },
  { value: "zh-CN", label: "zh-CN — Chinese (Simplified)" },
  { value: "ko-KR", label: "ko-KR — Korean" },
  { value: "ar-SA", label: "ar-SA — Arabic (Saudi)" },
  { value: "hi-IN", label: "hi-IN — Hindi" },
  { value: "pt-BR", label: "pt-BR — Portuguese (Brazil)" },
  { value: "es-ES", label: "es-ES — Spanish (Spain)" },
  { value: "it-IT", label: "it-IT — Italian" },
  { value: "ru-RU", label: "ru-RU — Russian" },
  { value: "tr-TR", label: "tr-TR — Turkish" },
  { value: "nl-NL", label: "nl-NL — Dutch" },
  { value: "pl-PL", label: "pl-PL — Polish" },
  { value: "sv-SE", label: "sv-SE — Swedish" },
  { value: "th-TH", label: "th-TH — Thai" },
];

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "KRW", label: "KRW — Korean Won" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "BRL", label: "BRL — Brazilian Real" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "AUD", label: "AUD — Australian Dollar" },
];

const UNITS = [
  { value: "kilometer", label: "kilometer" },
  { value: "kilogram", label: "kilogram" },
  { value: "celsius", label: "celsius" },
  { value: "liter", label: "liter" },
  { value: "meter", label: "meter" },
  { value: "gram", label: "gram" },
  { value: "mile", label: "mile" },
  { value: "pound", label: "pound" },
  { value: "gallon", label: "gallon" },
  { value: "hour", label: "hour" },
  { value: "minute", label: "minute" },
  { value: "second", label: "second" },
];

const COPY_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function buildOptions(
  formatType: FormatType,
  currency: string,
  unit: string,
  minFraction: number,
  maxFraction: number,
  notation: Notation,
  signDisplay: SignDisplay
): Intl.NumberFormatOptions {
  const opts: Intl.NumberFormatOptions = {
    style: formatType,
    notation,
    signDisplay,
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  };
  if (formatType === "currency") {
    opts.currency = currency;
  }
  if (formatType === "unit") {
    opts.unit = unit;
    opts.unitDisplay = "long";
  }
  // percent doesn't need extra props
  return opts;
}

function buildCodeSnippet(
  locale: string,
  opts: Intl.NumberFormatOptions,
  value: number
): string {
  const optsStr = JSON.stringify(opts, null, 2);
  return `const formatter = new Intl.NumberFormat("${locale}", ${optsStr});\nformatter.format(${value}); // → "${formatSafe(locale, opts, value)}"`;
}

function formatSafe(
  locale: string,
  opts: Intl.NumberFormatOptions,
  value: number
): string {
  try {
    return new Intl.NumberFormat(locale, opts).format(value);
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

export default function NumberFormatter() {
  const [rawInput, setRawInput] = useState("1234567.89");
  const [locale, setLocale] = useState("en-US");
  const [formatType, setFormatType] = useState<FormatType>("decimal");
  const [currency, setCurrency] = useState("USD");
  const [unit, setUnit] = useState("kilometer");
  const [minFraction, setMinFraction] = useState(2);
  const [maxFraction, setMaxFraction] = useState(2);
  const [notation, setNotation] = useState<Notation>("standard");
  const [signDisplay, setSignDisplay] = useState<SignDisplay>("auto");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const value = parseFloat(rawInput.replace(/,/g, ""));
  const isValid = !isNaN(value) && isFinite(value);

  const opts = isValid
    ? buildOptions(formatType, currency, unit, minFraction, maxFraction, notation, signDisplay)
    : null;

  const formatted = opts ? formatSafe(locale, opts, value) : "";
  const hasError = formatted.startsWith("Error:");

  const codeSnippet = opts && !hasError ? buildCodeSnippet(locale, opts, value) : "";

  const handleCopy = useCallback(async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  // Clamp maxFraction when minFraction changes
  const handleMinFraction = (v: number) => {
    setMinFraction(v);
    if (v > maxFraction) setMaxFraction(v);
  };

  const handleMaxFraction = (v: number) => {
    setMaxFraction(v);
    if (v < minFraction) setMinFraction(v);
  };

  // Live multi-locale preview
  const previewLocales = ["en-US", "de-DE", "ja-JP", "fr-FR", "ar-SA"];

  return (
    <div className="space-y-6">
      {/* Main input card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Number input */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Number
            </label>
            <input
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. 1234567.89"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              spellCheck={false}
              autoComplete="off"
            />
            {!isValid && rawInput !== "" && (
              <p className="mt-1 text-xs text-red-500">Not a valid number</p>
            )}
          </div>

          {/* Locale */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Locale
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format type */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Format Type
            </label>
            <select
              value={formatType}
              onChange={(e) => setFormatType(e.target.value as FormatType)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
            >
              <option value="decimal">Decimal</option>
              <option value="currency">Currency</option>
              <option value="percent">Percent</option>
              <option value="unit">Unit</option>
            </select>
          </div>

          {/* Currency selector */}
          {formatType === "currency" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Unit selector */}
          {formatType === "unit" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Options panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Intl.NumberFormat Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Min fraction digits */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Min Fraction Digits
              <span className="ml-1 font-mono text-blue-600">{minFraction}</span>
            </label>
            <input
              type="range"
              min={0}
              max={20}
              value={minFraction}
              onChange={(e) => handleMinFraction(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0</span><span>20</span>
            </div>
          </div>

          {/* Max fraction digits */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Max Fraction Digits
              <span className="ml-1 font-mono text-blue-600">{maxFraction}</span>
            </label>
            <input
              type="range"
              min={0}
              max={20}
              value={maxFraction}
              onChange={(e) => handleMaxFraction(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0</span><span>20</span>
            </div>
          </div>

          {/* Notation */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Notation
            </label>
            <select
              value={notation}
              onChange={(e) => setNotation(e.target.value as Notation)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
            >
              <option value="standard">standard</option>
              <option value="scientific">scientific</option>
              <option value="engineering">engineering</option>
              <option value="compact">compact</option>
            </select>
          </div>

          {/* Sign display */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Sign Display
            </label>
            <select
              value={signDisplay}
              onChange={(e) => setSignDisplay(e.target.value as SignDisplay)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
            >
              <option value="auto">auto</option>
              <option value="always">always</option>
              <option value="never">never</option>
              <option value="exceptZero">exceptZero</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output */}
      {isValid && (
        <>
          {/* Formatted result */}
          <div className={`border rounded-xl px-6 py-5 ${hasError ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-100"}`}>
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Formatted Output
            </p>
            <div className="flex items-center gap-3">
              <p className={`font-mono text-2xl sm:text-3xl font-bold break-all ${hasError ? "text-red-700" : "text-blue-800"}`}>
                {formatted || "—"}
              </p>
              {!hasError && formatted && (
                <button
                  onClick={() => handleCopy("result", formatted)}
                  className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors shrink-0"
                  title="Copy result"
                >
                  {copiedKey === "result" ? CHECK_ICON : COPY_ICON}
                </button>
              )}
            </div>
            {!hasError && (
              <p className="text-xs text-blue-500 mt-1">
                locale: <span className="font-mono">{locale}</span> · style:{" "}
                <span className="font-mono">{formatType}</span> · notation:{" "}
                <span className="font-mono">{notation}</span>
              </p>
            )}
          </div>

          {/* Code snippet */}
          {codeSnippet && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  JavaScript Code
                </h3>
                <button
                  onClick={() => handleCopy("code", codeSnippet)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 border border-gray-200 rounded-md"
                >
                  {copiedKey === "code" ? CHECK_ICON : COPY_ICON}
                  <span>{copiedKey === "code" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {codeSnippet}
              </pre>
            </div>
          )}

          {/* Multi-locale preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Multi-Locale Preview
              <span className="ml-2 text-xs font-normal text-gray-400">
                same options, different locales
              </span>
            </h3>
            <div className="space-y-2">
              {previewLocales.map((loc) => {
                if (!opts) return null;
                const previewFormatted = formatSafe(loc, opts, value);
                const isErr = previewFormatted.startsWith("Error:");
                return (
                  <div
                    key={loc}
                    className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-lg"
                  >
                    <span className="text-xs font-mono text-gray-500 w-16 shrink-0">
                      {loc}
                    </span>
                    <span
                      className={`font-mono text-sm font-semibold flex-1 text-right ${
                        isErr ? "text-red-500" : "text-gray-900"
                      }`}
                    >
                      {previewFormatted}
                    </span>
                    {!isErr && (
                      <button
                        onClick={() => handleCopy(`prev-${loc}`, previewFormatted)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-3 shrink-0"
                        title={`Copy ${loc} result`}
                      >
                        {copiedKey === `prev-${loc}` ? CHECK_ICON : COPY_ICON}
                      </button>
                    )}
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Number Formatter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Format numbers with locale-specific separators, currency, and units. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Number Formatter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Format numbers with locale-specific separators, currency, and units. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Quick reference table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Format Style Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Style</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Option</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Example (en-US)</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                { style: "decimal", opt: "style: 'decimal'", ex: "1,234,567.89", note: "Locale grouping & decimal separators" },
                { style: "currency", opt: "style: 'currency', currency: 'USD'", ex: "$1,234,567.89", note: "Symbol placement varies by locale" },
                { style: "percent", opt: "style: 'percent'", ex: "123,456,789%", note: "Value × 100 displayed" },
                { style: "unit", opt: "style: 'unit', unit: 'kilometer'", ex: "1,234,567.89 km", note: "Supports SI units" },
              ].map((row) => (
                <tr key={row.style} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-blue-700">{row.style}</td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-600">{row.opt}</td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-900">{row.ex}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
