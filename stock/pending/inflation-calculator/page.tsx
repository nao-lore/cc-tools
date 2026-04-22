import InflationCalculator from "./components/InflationCalculator";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              %
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inflation Calculator</h1>
              <p className="text-xs text-gray-500">Purchasing power · CPI data 1960–2025 · Year-by-year erosion table</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <InflationCalculator />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Inflation Calculator</h2>
            <p>
              Inflation erodes the purchasing power of money over time. This calculator lets you
              see exactly how much a dollar amount from any year is worth in another year, using
              real US CPI (Consumer Price Index) historical rates from 1960 to 2025 — or enter
              a custom annual inflation rate for hypothetical scenarios.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How Inflation Is Calculated</h2>
            <p>
              The adjusted value is calculated using compound inflation: <strong>Adjusted Value = Original Amount × (1 + r)^n</strong>,
              where r is the annual inflation rate (as a decimal) and n is the number of years.
              Cumulative inflation is <strong>(Adjusted Value / Original Amount − 1) × 100%</strong>.
              The purchasing power change shows how much less (or more) the original amount buys
              in real terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">US CPI Historical Rates</h2>
            <p>
              The built-in CPI data reflects approximate annual US inflation rates sourced from
              Federal Reserve and BLS historical records. Notable periods include the high inflation
              of the 1970s oil crisis (peaking near 13.5% in 1979), the Volcker disinflation of
              the early 1980s, and the post-pandemic surge of 2021–2022. For years outside the
              1960–2025 range, use the manual rate input.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Why Purchasing Power Matters</h2>
            <p>
              Even modest inflation of 3% per year cuts purchasing power roughly in half over
              24 years (the Rule of 70). Understanding inflation is essential for retirement
              planning, salary negotiation, investment returns, and evaluating historical prices.
              $100 in 1980 required about $368 in 2025 to maintain the same purchasing power.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Inflation Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://compound-interest-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Compound Interest Calculator</a>
              <a href="https://percentage-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Percentage Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
