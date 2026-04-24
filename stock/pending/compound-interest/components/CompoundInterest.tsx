"use client";

import { useState, useMemo } from "react";

type Frequency = "annually" | "semi-annually" | "quarterly" | "monthly" | "daily";

const FREQ_MAP: Record<Frequency, number> = {
  annually: 1,
  "semi-annually": 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

const FREQ_LABELS: { key: Frequency; label: string }[] = [
  { key: "annually", label: "Annually" },
  { key: "semi-annually", label: "Semi-Annually" },
  { key: "quarterly", label: "Quarterly" },
  { key: "monthly", label: "Monthly" },
  { key: "daily", label: "Daily" },
];

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface YearRow {
  year: number;
  contributions: number;
  interest: number;
  balance: number;
}

function computeSchedule(
  principal: number,
  annualRate: number,
  n: number,
  years: number,
  monthlyContrib: number
): YearRow[] {
  const r = annualRate / 100;
  const rows: YearRow[] = [];

  for (let t = 1; t <= years; t++) {
    // Balance at end of year t
    const principalGrowth = principal * Math.pow(1 + r / n, n * t);
    let contribGrowth = 0;
    if (r > 0 && monthlyContrib > 0) {
      // Convert monthly contribution to per-period and compute FV of annuity
      // Each monthly contribution compounds: we sum over 12*t months
      // FV of monthly contributions = PMT * [(1 + r/n)^(nt) - 1] / (r/n) * (n/12)
      // Simpler: accumulate month by month contribution at monthly rate
      // We use: FV_annuity with monthly rate = r/12, periods = 12*t
      const monthlyRate = r / 12;
      contribGrowth =
        monthlyContrib * ((Math.pow(1 + monthlyRate, 12 * t) - 1) / monthlyRate);
    } else if (r === 0 && monthlyContrib > 0) {
      contribGrowth = monthlyContrib * 12 * t;
    }

    const balance = principalGrowth + contribGrowth;
    const totalContributions = principal + monthlyContrib * 12 * t;
    const interest = balance - totalContributions;

    rows.push({
      year: t,
      contributions: totalContributions,
      interest: Math.max(0, interest),
      balance,
    });
  }

  return rows;
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
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 flex flex-col gap-1 ${
        highlight ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-center">
        <span className={`text-2xl font-bold ${highlight ? "text-green-700" : "text-gray-800"}`}>
          {value}
        </span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [freq, setFreq] = useState<Frequency>("annually");
  const [years, setYears] = useState("10");
  const [monthlyContrib, setMonthlyContrib] = useState("");

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const t = parseInt(years, 10);
  const mc = monthlyContrib === "" ? 0 : parseFloat(monthlyContrib);
  const n = FREQ_MAP[freq];

  const valid =
    !isNaN(p) &&
    p >= 0 &&
    !isNaN(r) &&
    r >= 0 &&
    !isNaN(t) &&
    t >= 1 &&
    t <= 50 &&
    !isNaN(mc) &&
    mc >= 0;

  const schedule = useMemo(() => {
    if (!valid) return [];
    return computeSchedule(p, r, n, t, mc);
  }, [valid, p, r, n, t, mc]);

  const finalBalance = schedule.length > 0 ? schedule[schedule.length - 1].balance : 0;
  const totalContribs = schedule.length > 0 ? schedule[schedule.length - 1].contributions : 0;
  const totalInterest = schedule.length > 0 ? schedule[schedule.length - 1].interest : 0;

  const maxBalance = schedule.length > 0 ? Math.max(...schedule.map((r) => r.balance)) : 1;

  const formulaStr =
    mc > 0
      ? `A = ${p.toLocaleString()} × (1 + ${r}/100 / 12)^(12 × ${t}) + ${mc} × [(1 + ${r}/100 / 12)^(12 × ${t}) − 1] / (${r}/100 / 12)`
      : `A = ${p.toLocaleString()} × (1 + ${r}/100 / ${n})^(${n} × ${t})`;

  const copyResults = () => {
    const text = [
      `Final Balance: $${formatCurrency(finalBalance)}`,
      `Total Contributions: $${formatCurrency(totalContribs)}`,
      `Total Interest Earned: $${formatCurrency(totalInterest)}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Parameters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Principal ($)
            </label>
            <input
              type="number"
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Rate (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 7"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (years)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Contribution ($) <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={monthlyContrib}
              onChange={(e) => setMonthlyContrib(e.target.value)}
              placeholder="e.g. 200"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compounding Frequency
          </label>
          <div className="flex flex-wrap gap-2">
            {FREQ_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFreq(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  freq === key
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {valid && schedule.length > 0 ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label="Final Balance" value={`$${formatCurrency(finalBalance)}`} highlight />
            <ResultCard label="Total Contributions" value={`$${formatCurrency(totalContribs)}`} />
            <ResultCard label="Total Interest Earned" value={`$${formatCurrency(totalInterest)}`} />
          </div>

          {/* Copy all results */}
          <div className="flex justify-end">
            <button
              onClick={copyResults}
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              Copy Results
            </button>
          </div>

          {/* Formula */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula Used</p>
            <p className="text-sm text-gray-700 font-mono break-all">{formulaStr}</p>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Growth Chart
            </h2>
            <div className="flex items-end gap-1 h-48">
              {schedule.map((row) => {
                const totalPct = (row.balance / maxBalance) * 100;
                const contribPct = (row.contributions / row.balance) * totalPct;
                const interestPct = totalPct - contribPct;
                return (
                  <div
                    key={row.year}
                    className="flex-1 flex flex-col justify-end group relative"
                    style={{ height: "100%" }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1">Year {row.year}</div>
                        <div>Balance: ${formatCurrency(row.balance)}</div>
                        <div>Contributions: ${formatCurrency(row.contributions)}</div>
                        <div>Interest: ${formatCurrency(row.interest)}</div>
                      </div>
                      <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                    </div>

                    {/* Stacked bars */}
                    <div className="w-full flex flex-col" style={{ height: `${totalPct}%` }}>
                      <div
                        className="w-full bg-green-300 rounded-t"
                        style={{ height: `${interestPct > 0 ? (interestPct / totalPct) * 100 : 0}%` }}
                      />
                      <div
                        className="w-full bg-green-600"
                        style={{ height: `${(contribPct / totalPct) * 100}%` }}
                      />
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Compound Interest Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate compound interest with monthly contribution support. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Compound Interest Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate compound interest with monthly contribution support. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1 mt-1">
              {schedule.map((row) => (
                <div key={row.year} className="flex-1 text-center text-xs text-gray-400">
                  {row.year % Math.max(1, Math.floor(t / 10)) === 0 || row.year === 1 || row.year === t
                    ? row.year
                    : ""}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-1">Year</p>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 justify-center text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-600" />
                <span>Contributions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-300" />
                <span>Interest</span>
              </div>
            </div>
          </div>

          {/* Year-by-year table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Year-by-Year Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-medium">Year</th>
                    <th className="px-4 py-3 text-right font-medium">Contributions</th>
                    <th className="px-4 py-3 text-right font-medium">Interest Earned</th>
                    <th className="px-4 py-3 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700">{row.year}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${formatCurrency(row.contributions)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        ${formatCurrency(row.interest)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        ${formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
