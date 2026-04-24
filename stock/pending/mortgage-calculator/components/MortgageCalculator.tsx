"use client";

import { useState, useMemo } from "react";

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
      className={`rounded-xl border px-5 py-4 ${
        highlight ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center">
        <span
          className={`text-2xl font-bold ${
            highlight ? "text-green-700" : "text-gray-800"
          }`}
        >
          {value}
        </span>
        <CopyButton value={value} />
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

interface AmortizationRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCurrencyShort(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function computeAmortization(
  principal: number,
  annualRate: number,
  termYears: number
): { monthlyPI: number; rows: AmortizationRow[] } {
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;

  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = principal / n;
  } else {
    monthlyPI =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let y = 1; y <= termYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPI - interestPayment, balance);
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      balance -= principalPayment;
    }
    rows.push({
      year: y,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      remainingBalance: Math.max(balance, 0),
    });
  }

  return { monthlyPI, rows };
}

const TERM_PRESETS = [15, 20, 30];

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState("400000");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState("");
  const [insurance, setInsurance] = useState("");
  const [showAmortization, setShowAmortization] = useState(false);

  const results = useMemo(() => {
    const loan = parseFloat(loanAmount.replace(/,/g, ""));
    const down = parseFloat(downPayment.replace(/,/g, "")) || 0;
    const annualRate = parseFloat(rate);
    const termYears = term;
    const taxYear = parseFloat(propertyTax.replace(/,/g, "")) || 0;
    const insYear = parseFloat(insurance.replace(/,/g, "")) || 0;

    if (isNaN(loan) || loan <= 0 || isNaN(annualRate) || annualRate < 0 || termYears <= 0) {
      return null;
    }

    const principal = Math.max(loan - down, 0);
    if (principal <= 0) return null;

    const { monthlyPI, rows } = computeAmortization(principal, annualRate, termYears);
    const totalPI = monthlyPI * termYears * 12;
    const totalInterest = totalPI - principal;
    const monthlyTax = taxYear / 12;
    const monthlyIns = insYear / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyIns;

    return {
      principal,
      monthlyPI,
      totalMonthly,
      totalPayment: totalPI,
      totalInterest,
      monthlyTax,
      monthlyIns,
      rows,
    };
  }, [loanAmount, downPayment, rate, term, propertyTax, insurance]);

  const principalPct =
    results
      ? Math.round((results.principal / results.totalPayment) * 100)
      : 0;
  const interestPct = results ? 100 - principalPct : 0;

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Loan Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Loan Amount ($)</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="e.g. 400000"
              min="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Down Payment ($) <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="e.g. 80000"
              min="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Annual Interest Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 6.5"
              min="0"
              step="0.1"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Loan Term (years)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={term}
                onChange={(e) => setTerm(Math.max(1, parseInt(e.target.value) || 30))}
                min="1"
                max="50"
                className={inputCls}
              />
              <div className="flex gap-1 shrink-0">
                {TERM_PRESETS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`px-2 py-2 text-xs rounded-lg border font-medium transition-colors ${
                      term === t
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                    }`}
                  >
                    {t}yr
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Property Tax ($/year) <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              placeholder="e.g. 4800"
              min="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Home Insurance ($/year) <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              placeholder="e.g. 1200"
              min="0"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard
              label="Monthly Payment (P&I)"
              value={formatCurrency(results.monthlyPI)}
              sub={
                (results.monthlyTax > 0 || results.monthlyIns > 0)
                  ? `Total with tax & ins: ${formatCurrency(results.totalMonthly)}`
                  : undefined
              }
              highlight
            />
            <ResultCard
              label="Total Payment"
              value={formatCurrencyShort(results.totalPayment)}
              sub={`Over ${term} years`}
            />
            <ResultCard
              label="Total Interest"
              value={formatCurrencyShort(results.totalInterest)}
              sub={`${Math.round((results.totalInterest / results.principal) * 100)}% of principal`}
            />
          </div>

          {/* Principal vs Interest visual */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Principal vs. Interest
            </h2>
            <div className="flex rounded-lg overflow-hidden h-8 mb-3">
              <div
                className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold transition-all"
                style={{ width: `${principalPct}%` }}
              >
                {principalPct >= 15 ? `${principalPct}%` : ""}
              </div>
              <div
                className="bg-orange-400 flex items-center justify-center text-white text-xs font-semibold transition-all"
                style={{ width: `${interestPct}%` }}
              >
                {interestPct >= 15 ? `${interestPct}%` : ""}
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-green-500 shrink-0" />
                <span className="text-gray-600">
                  Principal:{" "}
                  <span className="font-semibold text-gray-800">
                    {formatCurrencyShort(results.principal)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-orange-400 shrink-0" />
                <span className="text-gray-600">
                  Interest:{" "}
                  <span className="font-semibold text-gray-800">
                    {formatCurrencyShort(results.totalInterest)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Amortization table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Amortization Schedule
              </h2>
              <button
                onClick={() => setShowAmortization((v) => !v)}
                className="text-xs text-green-600 hover:text-green-800 font-medium border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors"
              >
                {showAmortization ? "Hide" : "Show"} table
              </button>
            </div>

            {showAmortization && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Principal Paid</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Interest Paid</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, i) => (
                      <tr
                        key={row.year}
                        className={`border-b border-gray-100 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-3 font-medium text-gray-700">{row.year}</td>
                        <td className="py-2 px-3 text-right text-green-700 font-medium">
                          {formatCurrency(row.principalPaid)}
                        </td>
                        <td className="py-2 px-3 text-right text-orange-600">
                          {formatCurrency(row.interestPaid)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">
                          {formatCurrency(row.remainingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!showAmortization && (
              <p className="text-sm text-gray-400 text-center py-2">
                Click "Show table" to see year-by-year breakdown
              </p>
            )}
          </div>

          {/* Copy all results */}
          <div className="flex justify-end">
            <CopyButton
              value={[
                `Mortgage Summary`,
                `Loan Amount: ${formatCurrency(results.principal)}`,
                `Rate: ${rate}% | Term: ${term} years`,
                `Monthly Payment (P&I): ${formatCurrency(results.monthlyPI)}`,
                results.totalMonthly !== results.monthlyPI
                  ? `Total Monthly (with tax & ins): ${formatCurrency(results.totalMonthly)}`
                  : "",
                `Total Payment: ${formatCurrencyShort(results.totalPayment)}`,
                `Total Interest: ${formatCurrencyShort(results.totalInterest)}`,
              ]
                .filter(Boolean)
                .join("\n")}
            />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          Enter loan amount, interest rate, and term above to see results
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Mortgage Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate monthly mortgage payment, total interest, and amortization. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Mortgage Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate monthly mortgage payment, total interest, and amortization. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Mortgage Calculator",
  "description": "Calculate monthly mortgage payment, total interest, and amortization",
  "url": "https://tools.loresync.dev/mortgage-calculator",
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
