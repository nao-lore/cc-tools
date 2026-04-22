"use client";

import { useState, useCallback } from "react";

// ─── Roman numeral data ────────────────────────────────────────────────────────

const ROMAN_SYMBOLS: { value: number; symbol: string }[] = [
  { value: 1000, symbol: "M" },
  { value: 900, symbol: "CM" },
  { value: 500, symbol: "D" },
  { value: 400, symbol: "CD" },
  { value: 100, symbol: "C" },
  { value: 90, symbol: "XC" },
  { value: 50, symbol: "L" },
  { value: 40, symbol: "XL" },
  { value: 10, symbol: "X" },
  { value: 9, symbol: "IX" },
  { value: 5, symbol: "V" },
  { value: 4, symbol: "IV" },
  { value: 1, symbol: "I" },
];

const REFERENCE_TABLE: { symbol: string; value: number }[] = [
  { symbol: "I", value: 1 },
  { symbol: "IV", value: 4 },
  { symbol: "V", value: 5 },
  { symbol: "IX", value: 9 },
  { symbol: "X", value: 10 },
  { symbol: "XL", value: 40 },
  { symbol: "L", value: 50 },
  { symbol: "XC", value: 90 },
  { symbol: "C", value: 100 },
  { symbol: "CD", value: 400 },
  { symbol: "D", value: 500 },
  { symbol: "CM", value: 900 },
  { symbol: "M", value: 1000 },
];

// ─── Conversion logic ──────────────────────────────────────────────────────────

function toRoman(n: number): { roman: string; breakdown: { symbol: string; value: number; count: number }[] } {
  const breakdown: { symbol: string; value: number; count: number }[] = [];
  let remaining = n;
  for (const { value, symbol } of ROMAN_SYMBOLS) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / value);
    if (count > 0) {
      breakdown.push({ symbol, value, count });
      remaining -= count * value;
    }
  }
  const roman = breakdown.map((b) => b.symbol.repeat(b.count)).join("");
  return { roman, breakdown };
}

function fromRoman(s: string): number | null {
  const str = s.toUpperCase().trim();
  if (!str) return null;
  const romanValues: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const curr = romanValues[str[i]];
    const next = romanValues[str[i + 1]];
    if (curr === undefined) return null;
    if (next && curr < next) {
      result += next - curr;
      i++;
    } else {
      result += curr;
    }
  }
  // Validate by converting back
  if (result < 1 || result > 3999) return null;
  const { roman } = toRoman(result);
  if (roman !== str) return null;
  return result;
}

function isLikelyRoman(input: string): boolean {
  return /^[IVXLCDMivxlcdm\s]+$/.test(input.trim()) && !/^\d/.test(input.trim());
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RomanNumeralConverter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const trimmed = input.trim();
  const isRomanInput = isLikelyRoman(trimmed) && trimmed.length > 0;
  const isArabicInput = /^\d+$/.test(trimmed);

  let arabicResult: number | null = null;
  let romanResult = "";
  let breakdown: { symbol: string; value: number; count: number }[] = [];
  let error = "";

  if (isArabicInput) {
    const n = parseInt(trimmed, 10);
    if (n < 1 || n > 3999) {
      error = "Enter a number between 1 and 3999.";
    } else {
      const result = toRoman(n);
      romanResult = result.roman;
      breakdown = result.breakdown;
      arabicResult = n;
    }
  } else if (isRomanInput) {
    const n = fromRoman(trimmed);
    if (n === null) {
      error = "Invalid Roman numeral. Check the reference table below.";
    } else {
      arabicResult = n;
      const result = toRoman(n);
      romanResult = result.roman;
      breakdown = result.breakdown;
    }
  }

  const hasResult = romanResult !== "" && arabicResult !== null;
  const copyText = isArabicInput ? romanResult : arabicResult?.toString() ?? "";

  const handleCopy = useCallback(async () => {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [copyText]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Enter Arabic number or Roman numeral
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1994 or MCMXCIV"
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            autoFocus
          />
          {hasResult && (
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] text-sm transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Result"}
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--muted-fg)]">
          Auto-detects input type — type a number (1–3999) or a Roman numeral (e.g. XIV, MMXXIV)
        </p>
      </div>

      {/* Error */}
      {trimmed.length > 0 && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {hasResult && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs text-[var(--muted-fg)] uppercase tracking-wide mb-1">Arabic</p>
              <p className="text-3xl font-bold text-[var(--foreground)] font-mono">{arabicResult}</p>
            </div>
            <div className="text-2xl text-[var(--muted-fg)] text-center">⇄</div>
            <div className="flex-1 text-center sm:text-right">
              <p className="text-xs text-[var(--muted-fg)] uppercase tracking-wide mb-1">Roman</p>
              <p className="text-3xl font-bold text-[var(--foreground)] font-mono tracking-wider">{romanResult}</p>
            </div>
          </div>

          {/* Breakdown */}
          {breakdown.length > 0 && (
            <div>
              <p className="text-xs text-[var(--muted-fg)] uppercase tracking-wide mb-2">Symbol Breakdown</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-1.5 px-2 font-medium text-[var(--muted-fg)]">Symbol</th>
                      <th className="text-right py-1.5 px-2 font-medium text-[var(--muted-fg)]">Value</th>
                      <th className="text-right py-1.5 px-2 font-medium text-[var(--muted-fg)]">Count</th>
                      <th className="text-right py-1.5 px-2 font-medium text-[var(--muted-fg)]">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((b, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-1.5 px-2 font-mono font-bold text-[var(--foreground)]">{b.symbol}</td>
                        <td className="py-1.5 px-2 text-right text-[var(--foreground)]">{b.value.toLocaleString()}</td>
                        <td className="py-1.5 px-2 text-right text-[var(--muted-fg)]">× {b.count}</td>
                        <td className="py-1.5 px-2 text-right font-medium text-[var(--foreground)]">{(b.value * b.count).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-[var(--background)]">
                      <td colSpan={3} className="py-1.5 px-2 font-medium text-[var(--muted-fg)]">Total</td>
                      <td className="py-1.5 px-2 text-right font-bold text-[var(--foreground)]">{arabicResult?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reference table */}
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Roman Numeral Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[var(--border)] rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left py-2 px-3 font-medium text-[var(--muted-fg)]">Symbol</th>
                <th className="text-right py-2 px-3 font-medium text-[var(--muted-fg)]">Value</th>
                <th className="text-left py-2 px-3 font-medium text-[var(--muted-fg)]">Symbol</th>
                <th className="text-right py-2 px-3 font-medium text-[var(--muted-fg)]">Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(REFERENCE_TABLE.length / 2) }, (_, i) => {
                const left = REFERENCE_TABLE[i];
                const right = REFERENCE_TABLE[i + Math.ceil(REFERENCE_TABLE.length / 2)];
                return (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-[var(--foreground)]">{left.symbol}</td>
                    <td className="py-2 px-3 text-right text-[var(--foreground)]">{left.value.toLocaleString()}</td>
                    {right ? (
                      <>
                        <td className="py-2 px-3 font-mono font-bold text-[var(--foreground)]">{right.symbol}</td>
                        <td className="py-2 px-3 text-right text-[var(--foreground)]">{right.value.toLocaleString()}</td>
                      </>
                    ) : (
                      <><td /><td /></>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
