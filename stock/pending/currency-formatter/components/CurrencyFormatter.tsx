"use client";

import { useState, useCallback } from "react";

type CurrencyEntry = {
  currency: string;
  label: string;
  locale: string;
  flag: string;
  symbolPosition: "prefix" | "suffix";
};

const CURRENCIES: CurrencyEntry[] = [
  // Prefix group
  { currency: "USD", label: "US Dollar", locale: "en-US", flag: "🇺🇸", symbolPosition: "prefix" },
  { currency: "GBP", label: "British Pound", locale: "en-GB", flag: "🇬🇧", symbolPosition: "prefix" },
  { currency: "CAD", label: "Canadian Dollar", locale: "en-CA", flag: "🇨🇦", symbolPosition: "prefix" },
  { currency: "AUD", label: "Australian Dollar", locale: "en-AU", flag: "🇦🇺", symbolPosition: "prefix" },
  { currency: "HKD", label: "Hong Kong Dollar", locale: "zh-HK", flag: "🇭🇰", symbolPosition: "prefix" },
  { currency: "SGD", label: "Singapore Dollar", locale: "en-SG", flag: "🇸🇬", symbolPosition: "prefix" },
  { currency: "CHF", label: "Swiss Franc", locale: "de-CH", flag: "🇨🇭", symbolPosition: "prefix" },
  // Suffix group
  { currency: "EUR", label: "Euro", locale: "de-DE", flag: "🇪🇺", symbolPosition: "suffix" },
  { currency: "JPY", label: "Japanese Yen", locale: "ja-JP", flag: "🇯🇵", symbolPosition: "suffix" },
  { currency: "CNY", label: "Chinese Yuan", locale: "zh-CN", flag: "🇨🇳", symbolPosition: "suffix" },
  { currency: "KRW", label: "Korean Won", locale: "ko-KR", flag: "🇰🇷", symbolPosition: "suffix" },
  { currency: "INR", label: "Indian Rupee", locale: "hi-IN", flag: "🇮🇳", symbolPosition: "suffix" },
  { currency: "BRL", label: "Brazilian Real", locale: "pt-BR", flag: "🇧🇷", symbolPosition: "suffix" },
  { currency: "SEK", label: "Swedish Krona", locale: "sv-SE", flag: "🇸🇪", symbolPosition: "suffix" },
  { currency: "MXN", label: "Mexican Peso", locale: "es-MX", flag: "🇲🇽", symbolPosition: "suffix" },
  { currency: "RUB", label: "Russian Ruble", locale: "ru-RU", flag: "🇷🇺", symbolPosition: "suffix" },
  { currency: "THB", label: "Thai Baht", locale: "th-TH", flag: "🇹🇭", symbolPosition: "suffix" },
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

function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 20,
    }).format(amount);
  } catch {
    return "—";
  }
}

function getDecimalSeparator(locale: string): string {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
    return parts.find((p) => p.type === "decimal")?.value ?? ".";
  } catch {
    return ".";
  }
}

function getGroupSeparator(locale: string): string {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1000);
    return parts.find((p) => p.type === "group")?.value ?? ",";
  } catch {
    return ",";
  }
}

function getSeparatorLabel(sep: string): string {
  if (sep === ".") return "period (.)";
  if (sep === ",") return "comma (,)";
  if (sep === " " || sep === "\u00a0" || sep === "\u202f") return "space";
  if (sep === "'") return "apostrophe (')";
  return JSON.stringify(sep);
}

export default function CurrencyFormatter() {
  const [rawInput, setRawInput] = useState("1234567.89");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"symbol" | "none">("symbol");

  const amount = parseFloat(rawInput.replace(/,/g, ""));
  const isValid = !isNaN(amount) && isFinite(amount);

  const handleCopy = useCallback(async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const prefixCurrencies = CURRENCIES.filter((c) => c.symbolPosition === "prefix");
  const suffixCurrencies = CURRENCIES.filter((c) => c.symbolPosition === "suffix");

  function CurrencyRow({ entry }: { entry: CurrencyEntry }) {
    const formatted = isValid ? formatCurrency(amount, entry.currency, entry.locale) : "—";
    const decSep = getDecimalSeparator(entry.locale);
    const grpSep = getGroupSeparator(entry.locale);
    const copyKey = `row-${entry.currency}`;

    return (
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors rounded-lg group">
        <span className="text-xl shrink-0 w-8 text-center">{entry.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-gray-500 w-10 shrink-0">{entry.currency}</span>
            <span className="text-sm text-gray-700 truncate">{entry.label}</span>
          </div>
          <div className="flex gap-3 mt-0.5">
            <span className="text-xs text-gray-400">decimal: <span className="font-mono text-gray-500">{getSeparatorLabel(decSep)}</span></span>
            <span className="text-xs text-gray-400">thousands: <span className="font-mono text-gray-500">{getSeparatorLabel(grpSep)}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-base font-semibold text-gray-900 tabular-nums">
            {formatted}
          </span>
          {isValid && formatted !== "—" && (
            <button
              onClick={() => handleCopy(copyKey, formatted)}
              className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              title={`Copy ${entry.currency} formatted value`}
            >
              {copiedKey === copyKey ? CHECK_ICON : COPY_ICON}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Amount
            </label>
            <input
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. 1234567.89"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
              spellCheck={false}
              autoComplete="off"
            />
            {!isValid && rawInput !== "" && (
              <p className="mt-1 text-xs text-red-500">Not a valid number</p>
            )}
          </div>
          <div className="shrink-0">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Group by
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setGroupBy("symbol")}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  groupBy === "symbol"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Symbol position
              </button>
              <button
                onClick={() => setGroupBy("none")}
                className={`px-4 py-3 text-sm font-medium transition-colors border-l border-gray-300 ${
                  groupBy === "none"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                All currencies
              </button>
            </div>
          </div>
        </div>

        {isValid && (
          <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
            <span className="text-xs text-green-700 font-medium">Input amount:</span>
            <span className="font-mono text-sm font-bold text-green-800">
              {amount.toLocaleString("en-US", { maximumFractionDigits: 10 })}
            </span>
          </div>
        )}
      </div>

      {/* Currency grid */}
      {groupBy === "symbol" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prefix group */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 font-mono">
                $ 1,234
              </span>
              <span className="text-sm font-semibold text-gray-700">Symbol Prefix</span>
              <span className="text-xs text-gray-400 ml-auto">{prefixCurrencies.length} currencies</span>
            </div>
            <div className="divide-y divide-gray-50 px-2">
              {prefixCurrencies.map((entry) => (
                <CurrencyRow key={entry.currency} entry={entry} />
              ))}
            </div>
          </div>

          {/* Suffix group */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 font-mono">
                1.234 €
              </span>
              <span className="text-sm font-semibold text-gray-700">Symbol Suffix</span>
              <span className="text-xs text-gray-400 ml-auto">{suffixCurrencies.length} currencies</span>
            </div>
            <div className="divide-y divide-gray-50 px-2">
              {suffixCurrencies.map((entry) => (
                <CurrencyRow key={entry.currency} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">All Currencies</span>
            <span className="text-xs text-gray-400 ml-2">{CURRENCIES.length} currencies</span>
          </div>
          <div className="divide-y divide-gray-50 px-2">
            {CURRENCIES.map((entry) => (
              <CurrencyRow key={entry.currency} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Separator reference table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Separator Reference
          <span className="ml-2 text-xs font-normal text-gray-400">decimal · thousands separators by locale</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Currency</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Locale</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Decimal Sep.</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Thousands Sep.</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Example (1234.5)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {CURRENCIES.map((entry) => {
                const dec = getDecimalSeparator(entry.locale);
                const grp = getGroupSeparator(entry.locale);
                const ex = formatCurrency(1234.5, entry.currency, entry.locale);
                return (
                  <tr key={entry.currency} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold text-gray-800">{entry.currency}</span>
                      <span className="ml-2 text-xs text-gray-400">{entry.flag}</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-gray-500">{entry.locale}</td>
                    <td className="py-2 px-3 font-mono text-sm font-semibold text-orange-600">{getSeparatorLabel(dec)}</td>
                    <td className="py-2 px-3 font-mono text-sm font-semibold text-blue-600">{getSeparatorLabel(grp)}</td>
                    <td className="py-2 px-3 font-mono text-sm text-gray-900">{ex}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Currency Format Previewer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Preview how a number formats as currency in different locales. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Currency Format Previewer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Preview how a number formats as currency in different locales. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
