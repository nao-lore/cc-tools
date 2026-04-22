"use client";

import { useState, useMemo } from "react";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ResultCard({
  label,
  value,
  highlight,
  positive,
  negative,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  let bgClass = "bg-gray-50 border-gray-200";
  let textClass = "text-gray-800";
  if (highlight) {
    bgClass = "bg-green-50 border-green-200";
    textClass = "text-green-700";
  }
  if (positive) {
    bgClass = "bg-green-50 border-green-200";
    textClass = "text-green-700";
  }
  if (negative) {
    bgClass = "bg-red-50 border-red-200";
    textClass = "text-red-700";
  }

  return (
    <div className={`rounded-xl border px-5 py-4 flex flex-col gap-1 ${bgClass}`}>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-center">
        <span className={`text-2xl font-bold ${textClass}`}>{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [finalValue, setFinalValue] = useState("15000");
  const [duration, setDuration] = useState("5");
  const [benchmarkRate, setBenchmarkRate] = useState("10");

  const initial = parseFloat(initialInvestment);
  const final = parseFloat(finalValue);
  const years = parseFloat(duration);
  const benchmark = benchmarkRate === "" ? NaN : parseFloat(benchmarkRate);

  const valid =
    !isNaN(initial) &&
    initial > 0 &&
    !isNaN(final) &&
    final >= 0 &&
    !isNaN(years) &&
    years > 0;

  const results = useMemo(() => {
    if (!valid) return null;

    const gainLoss = final - initial;
    const simpleRoi = (gainLoss / initial) * 100;
    const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
    const gainLossPerYear = gainLoss / years;

    let benchmarkFinalValue: number | null = null;
    let beatsBenchmark: boolean | null = null;
    if (!isNaN(benchmark) && benchmark >= 0) {
      benchmarkFinalValue = initial * Math.pow(1 + benchmark / 100, years);
      beatsBenchmark = final >= benchmarkFinalValue;
    }

    return { gainLoss, simpleRoi, cagr, gainLossPerYear, benchmarkFinalValue, beatsBenchmark };
  }, [valid, initial, final, years, benchmark]);

  const isGain = results ? results.gainLoss >= 0 : true;

  const roiFormulaStr = valid
    ? `ROI = (${formatCurrency(final)} − ${formatCurrency(initial)}) / ${formatCurrency(initial)} × 100`
    : "";
  const cagrFormulaStr = valid
    ? `CAGR = (${formatCurrency(final)} / ${formatCurrency(initial)})^(1 / ${years}) − 1`
    : "";

  const copyResults = () => {
    if (!results) return;
    const lines = [
      `Simple ROI: ${formatPct(results.simpleRoi)}%`,
      `Annualized ROI (CAGR): ${formatPct(results.cagr)}%`,
      `Total Gain/Loss: $${formatCurrency(results.gainLoss)}`,
      `Gain/Loss per Year: $${formatCurrency(results.gainLossPerYear)}`,
    ];
    if (results.benchmarkFinalValue !== null && results.beatsBenchmark !== null) {
      lines.push(
        `Benchmark Final Value (${ formatPct(benchmark) }% / yr): $${formatCurrency(results.benchmarkFinalValue)}`,
        `Beat Benchmark: ${results.beatsBenchmark ? "Yes" : "No"}`
      );
    }
    navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Parameters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Investment ($)
            </label>
            <input
              type="number"
              min="0"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Final Value ($)
            </label>
            <input
              type="number"
              min="0"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (years)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benchmark Rate (%) <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={benchmarkRate}
              onChange={(e) => setBenchmarkRate(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {valid && results ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultCard
              label="Simple ROI"
              value={`${formatPct(results.simpleRoi)}%`}
              highlight={isGain}
              negative={!isGain}
            />
            <ResultCard
              label="Annualized ROI (CAGR)"
              value={`${formatPct(results.cagr)}%`}
              highlight={isGain}
              negative={!isGain}
            />
            <ResultCard
              label="Total Gain / Loss"
              value={`$${formatCurrency(results.gainLoss)}`}
              positive={isGain}
              negative={!isGain}
            />
            <ResultCard
              label="Gain / Loss per Year"
              value={`$${formatCurrency(results.gainLossPerYear)}`}
              positive={isGain}
              negative={!isGain}
            />
          </div>

          {/* Benchmark comparison */}
          {results.benchmarkFinalValue !== null && results.beatsBenchmark !== null && (
            <div
              className={`rounded-xl border px-5 py-4 ${
                results.beatsBenchmark
                  ? "bg-green-50 border-green-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Benchmark Comparison ({formatPct(benchmark)}% / yr)
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Benchmark final value:{" "}
                    <span className="font-semibold text-gray-800">
                      ${formatCurrency(results.benchmarkFinalValue)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Your final value:{" "}
                    <span className="font-semibold text-gray-800">${formatCurrency(final)}</span>
                  </p>
                </div>
                <div
                  className={`text-lg font-bold px-4 py-2 rounded-lg ${
                    results.beatsBenchmark
                      ? "bg-green-600 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {results.beatsBenchmark ? "Beat Benchmark" : "Below Benchmark"}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Difference:{" "}
                <span
                  className={`font-semibold ${
                    results.beatsBenchmark ? "text-green-700" : "text-orange-700"
                  }`}
                >
                  ${formatCurrency(final - results.benchmarkFinalValue)}
                </span>
              </p>
            </div>
          )}

          {/* Copy all results */}
          <div className="flex justify-end">
            <button
              onClick={copyResults}
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              Copy Results
            </button>
          </div>

          {/* Formula display */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formulas Used</p>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Simple ROI</p>
              <p className="text-sm text-gray-700 font-mono break-all">{roiFormulaStr}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Annualized ROI (CAGR)</p>
              <p className="text-sm text-gray-700 font-mono break-all">{cagrFormulaStr}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          Enter valid parameters above to see results
        </div>
      )}
    </div>
  );
}
