"use client";

import { useState, useMemo } from "react";

// Approximate US annual CPI inflation rates 1960–2025
// Sources: BLS / Federal Reserve historical data
const US_CPI_RATES: Record<number, number> = {
  1960: 1.46, 1961: 1.07, 1962: 1.20, 1963: 1.27, 1964: 1.31,
  1965: 1.59, 1966: 2.86, 1967: 3.09, 1968: 4.19, 1969: 5.46,
  1970: 5.72, 1971: 4.38, 1972: 3.21, 1973: 6.22, 1974: 11.04,
  1975: 9.14, 1976: 5.77, 1977: 6.50, 1978: 7.63, 1979: 11.25,
  1980: 13.55, 1981: 10.33, 1982: 6.16, 1983: 3.21, 1984: 4.32,
  1985: 3.56, 1986: 1.86, 1987: 3.65, 1988: 4.14, 1989: 4.82,
  1990: 5.40, 1991: 4.23, 1992: 3.03, 1993: 2.95, 1994: 2.61,
  1995: 2.81, 1996: 2.93, 1997: 2.34, 1998: 1.55, 1999: 2.19,
  2000: 3.38, 2001: 2.83, 2002: 1.59, 2003: 2.27, 2004: 2.68,
  2005: 3.39, 2006: 3.23, 2007: 2.85, 2008: 3.84, 2009: -0.36,
  2010: 1.64, 2011: 3.16, 2012: 2.07, 2013: 1.46, 2014: 1.62,
  2015: 0.12, 2016: 1.26, 2017: 2.13, 2018: 2.44, 2019: 1.81,
  2020: 1.23, 2021: 4.70, 2022: 8.00, 2023: 4.12, 2024: 2.90,
  2025: 2.40,
};

const MIN_YEAR = 1960;
const MAX_YEAR = 2025;

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(n: number, digits = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

interface YearRow {
  year: number;
  rate: number;
  value: number;
  powerChange: number; // cumulative % change from original
}

type Mode = "cpi" | "manual";

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
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 flex flex-col gap-1 ${
        highlight ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-center">
        <span className={`text-2xl font-bold ${highlight ? "text-blue-700" : "text-gray-800"}`}>
          {value}
        </span>
        <CopyButton value={value} />
      </div>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export default function InflationCalculator() {
  const [amount, setAmount] = useState("1000");
  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2025");
  const [mode, setMode] = useState<Mode>("cpi");
  const [manualRate, setManualRate] = useState("3");

  const amt = parseFloat(amount);
  const sy = parseInt(startYear, 10);
  const ey = parseInt(endYear, 10);
  const mr = parseFloat(manualRate);

  const valid =
    !isNaN(amt) &&
    amt > 0 &&
    !isNaN(sy) &&
    !isNaN(ey) &&
    sy !== ey &&
    (mode === "manual" ? !isNaN(mr) : true);

  const cpiModeValid =
    mode === "cpi" &&
    sy >= MIN_YEAR &&
    sy <= MAX_YEAR &&
    ey >= MIN_YEAR &&
    ey <= MAX_YEAR;

  const isForward = ey > sy;

  const { adjustedValue, cumulativeInflation, rows } = useMemo(() => {
    if (!valid) return { adjustedValue: 0, cumulativeInflation: 0, rows: [] };

    const fromY = Math.min(sy, ey);
    const toY = Math.max(sy, ey);
    const rowList: YearRow[] = [];

    let currentValue = amt;

    if (mode === "cpi") {
      for (let y = fromY; y < toY; y++) {
        const rate = US_CPI_RATES[y] ?? 2.5; // fallback if year missing
        const factor = 1 + rate / 100;
        currentValue = currentValue * factor;
        const powerChange = ((currentValue / amt) - 1) * 100;
        rowList.push({ year: y + 1, rate, value: currentValue, powerChange });
      }
    } else {
      for (let y = fromY; y < toY; y++) {
        const factor = 1 + mr / 100;
        currentValue = currentValue * factor;
        const powerChange = ((currentValue / amt) - 1) * 100;
        rowList.push({ year: y + 1, rate: mr, value: currentValue, powerChange });
      }
    }

    // For backward: divide by cumulative inflation factor to find original equivalent
    const adj = isForward ? currentValue : amt / (currentValue / amt);

    const cumPct = ((adj / amt) - 1) * 100;

    return { adjustedValue: adj, cumulativeInflation: cumPct, rows: rowList };
  }, [valid, amt, sy, ey, mode, mr, isForward]);

  // For display: purchasing power change (if forward, dollar buys less; if backward, dollar was worth more)
  const purchasingPowerChange = isForward
    ? ((1 / (adjustedValue / amt)) - 1) * 100  // negative = less power
    : ((adjustedValue / amt) - 1) * 100;

  const formulaStr =
    mode === "cpi"
      ? `Adjusted = ${amt.toLocaleString()} × ∏(1 + CPIᵢ) for ${Math.min(sy, ey)}–${Math.max(sy, ey)}`
      : `Adjusted = ${amt.toLocaleString()} × (1 + ${mr}%)^${Math.abs(ey - sy)}`;

  const copyResults = () => {
    const lines = [
      `Original Amount: $${formatCurrency(amt)} (${sy})`,
      `Adjusted Value: $${formatCurrency(adjustedValue)} (${ey})`,
      `Cumulative Inflation: ${formatPct(cumulativeInflation)}%`,
      `Purchasing Power Change: ${formatPct(purchasingPowerChange)}%`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  };

  const showTable = rows.length > 5;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Parameters</h2>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Year range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="e.g. 2025"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {mode === "cpi" && cpiModeValid === false && valid && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            CPI data is available for {MIN_YEAR}–{MAX_YEAR}. Switch to Manual Rate for other years.
          </p>
        )}

        {/* Mode toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Inflation Rate</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("cpi")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                mode === "cpi"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              US CPI Data (1960–2025)
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                mode === "manual"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              Manual Rate
            </button>
          </div>
        </div>

        {mode === "manual" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Inflation Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Results */}
      {valid && (mode === "manual" || cpiModeValid) && adjustedValue > 0 ? (
        <>
          {/* Direction label */}
          <div className="text-xs text-gray-500 text-center">
            {isForward
              ? `What $${formatCurrency(amt)} in ${sy} is worth in ${ey}`
              : `What $${formatCurrency(amt)} in ${sy} was worth in ${ey}`}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard
              label={`Adjusted Value (${ey})`}
              value={`$${formatCurrency(adjustedValue)}`}
              highlight
            />
            <ResultCard
              label="Cumulative Inflation"
              value={`${cumulativeInflation >= 0 ? "+" : ""}${formatPct(cumulativeInflation)}%`}
              sub={`over ${Math.abs(ey - sy)} year${Math.abs(ey - sy) !== 1 ? "s" : ""}`}
            />
            <ResultCard
              label="Purchasing Power"
              value={`${purchasingPowerChange >= 0 ? "+" : ""}${formatPct(purchasingPowerChange)}%`}
              sub={isForward ? "real value lost" : "real value gained"}
            />
          </div>

          {/* Copy results */}
          <div className="flex justify-end">
            <button
              onClick={copyResults}
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              Copy Results
            </button>
          </div>

          {/* Formula */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula Used</p>
            <p className="text-sm text-gray-700 font-mono break-all">{formulaStr}</p>
          </div>

          {/* Year-by-year erosion table (only if > 5 years) */}
          {showTable && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Year-by-Year Erosion Table
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left font-medium">Year</th>
                      <th className="px-4 py-3 text-right font-medium">Rate (%)</th>
                      <th className="px-4 py-3 text-right font-medium">Value ($)</th>
                      <th className="px-4 py-3 text-right font-medium">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">{row.year}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatPct(row.rate, 2)}%
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${formatCurrency(row.value)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${
                            row.powerChange >= 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {row.powerChange >= 0 ? "+" : ""}
                          {formatPct(row.powerChange)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual bar — purchasing power remaining */}
          {isForward && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Purchasing Power Remaining
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{sy}</span>
                  <span>{ey}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                  {(() => {
                    const remaining = Math.max(0, Math.min(100, (amt / adjustedValue) * 100));
                    return (
                      <div
                        className="h-6 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${remaining}%` }}
                      />
                    );
                  })()}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$1.00 original value</span>
                  <span className="text-blue-600 font-medium">
                    ${formatCurrency(amt / adjustedValue)} remaining purchasing power
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          {!valid
            ? "Enter valid parameters above to see results"
            : "CPI data available for 1960–2025. Use Manual Rate for other years."}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Inflation Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate the real value of money adjusted for inflation. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Inflation Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate the real value of money adjusted for inflation. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
