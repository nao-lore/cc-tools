"use client";

import { useState, useMemo } from "react";

// ── Pure statistics helpers ────────────────────────────────────────────────

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n % 2 === 1) return sorted[Math.floor(n / 2)];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function mode(nums: number[]): number[] {
  const freq: Record<number, number> = {};
  for (const n of nums) freq[n] = (freq[n] ?? 0) + 1;
  const maxFreq = Math.max(...Object.values(freq));
  if (maxFreq === 1) return []; // no repeated values → no mode
  return Object.entries(freq)
    .filter(([, f]) => f === maxFreq)
    .map(([v]) => Number(v))
    .sort((a, b) => a - b);
}

function variance(nums: number[], mu: number, sample: boolean): number {
  const denom = sample ? nums.length - 1 : nums.length;
  if (denom === 0) return 0;
  return nums.reduce((acc, n) => acc + (n - mu) ** 2, 0) / denom;
}

function quartile(sorted: number[], q: 0.25 | 0.75): number {
  // Inclusive quartile method (Moore & McCabe)
  const n = sorted.length;
  const pos = q * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (pos - lo) * (sorted[hi] - sorted[lo]);
}

// ── Histogram helper ───────────────────────────────────────────────────────

interface Bin {
  label: string;
  count: number;
}

function buildHistogram(sorted: number[], binCount: number): Bin[] {
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min === max) {
    return [{ label: String(min), count: sorted.length }];
  }
  const binWidth = (max - min) / binCount;
  const bins: Bin[] = Array.from({ length: binCount }, (_, i) => {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const loStr = lo % 1 === 0 ? String(lo) : lo.toFixed(2);
    const hiStr = hi % 1 === 0 ? String(hi) : hi.toFixed(2);
    return { label: `${loStr}–${hiStr}`, count: 0 };
  });
  for (const n of sorted) {
    let idx = Math.floor((n - min) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx].count += 1;
  }
  return bins;
}

// ── Formatting ─────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  // Up to 6 significant figures, strip trailing zeros
  return parseFloat(n.toPrecision(6)).toString();
}

// ── Stat row component ─────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-mono font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StatisticsCalculator() {
  const [input, setInput] = useState(
    "4, 7, 13, 2, 7, 8, 3, 12, 1, 7, 9, 15, 6, 4, 11"
  );
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const nums = parseNumbers(input);
    if (nums.length === 0) return null;

    const sorted = [...nums].sort((a, b) => a - b);
    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mu = mean(nums);
    const med = median(sorted);
    const modes = mode(nums);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    const popVar = variance(nums, mu, false);
    const sampVar = variance(nums, mu, true);
    const popStd = Math.sqrt(popVar);
    const sampStd = Math.sqrt(sampVar);
    const q1 = quartile(sorted, 0.25);
    const q3 = quartile(sorted, 0.75);
    const iqr = q3 - q1;
    const histogram = buildHistogram(sorted, 10);

    return {
      n,
      sum,
      mu,
      med,
      modes,
      min,
      max,
      range,
      popVar,
      sampVar,
      popStd,
      sampStd,
      q1,
      q3,
      iqr,
      sorted,
      histogram,
    };
  }, [input]);

  const handleCopy = () => {
    if (!stats) return;
    const lines = [
      `Count: ${stats.n}`,
      `Sum: ${fmt(stats.sum)}`,
      `Mean: ${fmt(stats.mu)}`,
      `Median: ${fmt(stats.med)}`,
      `Mode: ${stats.modes.length > 0 ? stats.modes.map(fmt).join(", ") : "None"}`,
      `Min: ${fmt(stats.min)}`,
      `Max: ${fmt(stats.max)}`,
      `Range: ${fmt(stats.range)}`,
      `Population Variance: ${fmt(stats.popVar)}`,
      `Sample Variance: ${fmt(stats.sampVar)}`,
      `Population Std Dev: ${fmt(stats.popStd)}`,
      `Sample Std Dev: ${fmt(stats.sampStd)}`,
      `Q1: ${fmt(stats.q1)}`,
      `Q3: ${fmt(stats.q3)}`,
      `IQR: ${fmt(stats.iqr)}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const maxBinCount = stats
    ? Math.max(...stats.histogram.map((b) => b.count))
    : 1;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Data Set
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Enter numbers separated by commas, spaces, or newlines.
        </p>
        <textarea
          className="w-full h-28 px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 4, 7, 13, 2, 7, 8..."
        />
        {stats && (
          <p className="text-xs text-gray-500 mt-1">
            {stats.n} valid number{stats.n !== 1 ? "s" : ""} detected
          </p>
        )}
      </div>

      {/* No data state */}
      {!stats && input.trim() !== "" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          No valid numbers found. Please enter numeric values.
        </div>
      )}

      {stats && (
        <>
          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Basic
              </h3>
              <StatRow label="Count" value={String(stats.n)} />
              <StatRow label="Sum" value={fmt(stats.sum)} />
              <StatRow label="Min" value={fmt(stats.min)} />
              <StatRow label="Max" value={fmt(stats.max)} />
              <StatRow label="Range" value={fmt(stats.range)} />
            </div>

            {/* Central Tendency */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Central Tendency
              </h3>
              <StatRow label="Mean" value={fmt(stats.mu)} />
              <StatRow label="Median" value={fmt(stats.med)} />
              <StatRow
                label="Mode"
                value={
                  stats.modes.length > 0
                    ? stats.modes.map(fmt).join(", ")
                    : "None"
                }
              />
            </div>

            {/* Spread */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Spread
              </h3>
              <StatRow label="Pop. Variance" value={fmt(stats.popVar)} />
              <StatRow label="Sample Variance" value={fmt(stats.sampVar)} />
              <StatRow label="Pop. Std Dev" value={fmt(stats.popStd)} />
              <StatRow label="Sample Std Dev" value={fmt(stats.sampStd)} />
            </div>

            {/* Quartiles */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Quartiles
              </h3>
              <StatRow label="Q1 (25th pct)" value={fmt(stats.q1)} />
              <StatRow label="Median (Q2)" value={fmt(stats.med)} />
              <StatRow label="Q3 (75th pct)" value={fmt(stats.q3)} />
              <StatRow label="IQR" value={fmt(stats.iqr)} />
            </div>
          </div>

          {/* Copy button */}
          <div className="flex justify-end">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {copied ? "Copied!" : "Copy All Stats"}
            </button>
          </div>

          {/* Histogram */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Distribution Histogram (10 bins)
            </h3>
            <div className="space-y-2">
              {stats.histogram.map((bin, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 w-28 shrink-0 text-right">
                    {bin.label}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className="h-5 bg-blue-500 rounded-sm transition-all duration-300 min-w-0"
                      style={{
                        width:
                          maxBinCount > 0
                            ? `${(bin.count / maxBinCount) * 100}%`
                            : "0%",
                      }}
                    />
                    <span className="text-xs text-gray-500 shrink-0">
                      {bin.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sorted data */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Sorted Data ({stats.n} values)
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {stats.sorted.map((n, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-700 rounded"
                >
                  {fmt(n)}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
