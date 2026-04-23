import CompoundInterest from "./components/CompoundInterest";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              $
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Compound Interest Calculator</h1>
              <p className="text-xs text-gray-500">Growth chart · Year-by-year breakdown · Monthly contributions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <CompoundInterest />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Compound Interest Calculator</h2>
            <p>
              Compound interest is interest calculated on both the initial principal and the accumulated
              interest from previous periods. This calculator lets you see how investments grow over time
              with different compounding frequencies — from daily to annually — and supports optional
              monthly contributions to model regular savings plans.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Compound Interest Formula</h2>
            <p>
              The standard compound interest formula is <strong>A = P(1 + r/n)^(nt)</strong>, where P is
              the principal, r is the annual interest rate (decimal), n is the number of compounding
              periods per year, and t is time in years. When monthly contributions (PMT) are added,
              the future value includes both the lump-sum growth and the future value of an annuity:
              FV = P(1 + r/n)^(nt) + PMT × [(1 + r/n)^(nt) − 1] / (r/n).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Compounding Frequency Explained</h2>
            <p>
              More frequent compounding means interest is calculated and added to the principal more
              often, resulting in slightly higher returns. Daily compounding yields marginally more than
              annual compounding at the same nominal rate. For example, $10,000 at 5% for 10 years
              gives $16,288.95 annually vs $16,486.65 daily — a difference of $197.70.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">The Power of Regular Contributions</h2>
            <p>
              Adding even small monthly contributions dramatically increases long-term wealth. Contributing
              $200/month alongside a $10,000 principal at 7% for 30 years grows the balance from ~$76,122
              (principal only) to ~$319,394 — over four times more. Starting early and contributing
              consistently is the most effective wealth-building strategy available to most people.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Compound Interest Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://percentage-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Percentage Calculator</a>
              <a href="https://unit-converter-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Unit Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
