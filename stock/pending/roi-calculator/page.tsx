import RoiCalculator from "./components/RoiCalculator";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              %
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ROI Calculator</h1>
              <p className="text-xs text-gray-500">Simple ROI · Annualized CAGR · Benchmark comparison</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <RoiCalculator />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free ROI Calculator</h2>
            <p>
              Return on Investment (ROI) measures how much profit or loss an investment generates
              relative to its cost. This calculator computes both simple ROI and annualized ROI
              (CAGR), making it easy to compare investments held for different time periods on an
              equal footing.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">ROI Formula</h2>
            <p>
              Simple ROI is calculated as <strong>(Final Value − Initial Investment) / Initial
              Investment × 100</strong>. This gives the total percentage gain or loss over the
              entire holding period. For example, investing $10,000 that grows to $15,000 yields
              an ROI of 50%.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">CAGR — Annualized ROI</h2>
            <p>
              The Compound Annual Growth Rate (CAGR) normalizes ROI to a per-year figure using
              the formula <strong>(Final Value / Initial Investment)^(1 / Years) − 1</strong>.
              This lets you fairly compare a 3-year investment against a 10-year one. A 50% total
              ROI over 5 years equals approximately 8.45% CAGR — very different from 50% in 1 year.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Benchmark Comparison</h2>
            <p>
              Comparing your investment ROI against a benchmark rate (such as the S&P 500 average
              of ~10% annually or a savings account rate) shows whether your investment outperformed
              or underperformed a standard alternative. Enter any benchmark rate to see how your
              investment stacks up.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ROI Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://compound-interest-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Compound Interest Calculator</a>
              <a href="https://percentage-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Percentage Calculator</a>
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
