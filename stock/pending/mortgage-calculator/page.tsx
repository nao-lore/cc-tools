import MortgageCalculator from "./components/MortgageCalculator";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              $
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mortgage Calculator</h1>
              <p className="text-xs text-gray-500">Monthly payment · Total interest · Amortization schedule</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <MortgageCalculator />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Online Mortgage Calculator</h2>
            <p>
              This mortgage calculator computes your monthly principal and interest payment, total amount
              paid over the life of the loan, and total interest charged. Optionally include property tax
              and homeowner's insurance to see your full monthly housing cost. The amortization table
              breaks down each year's principal and interest payments so you can see exactly how your
              loan balance decreases over time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How Monthly Mortgage Payments Are Calculated</h2>
            <p>
              The standard mortgage payment formula uses the loan principal (P), monthly interest rate
              (r = annual rate / 12), and number of payments (n = years × 12):
              M = P × [r(1+r)^n] / [(1+r)^n − 1]. This formula calculates the fixed monthly payment
              that fully amortizes the loan over the term. As you pay down the loan, a greater share of
              each payment goes toward principal and less toward interest.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Principal vs. Interest Over Time</h2>
            <p>
              In the early years of a mortgage, the majority of each payment covers interest. Over time,
              as the outstanding balance decreases, more of each payment reduces the principal. This is
              why extra early payments have a disproportionately large effect on total interest paid.
              The amortization schedule makes this shift visible year by year.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">30-Year vs. 15-Year Mortgages</h2>
            <p>
              A 30-year mortgage offers lower monthly payments but results in significantly more total
              interest paid. A 15-year mortgage typically comes with a lower interest rate and cuts
              total interest by more than half, but requires higher monthly payments. Use the term
              presets to compare the true cost of each option for your loan amount.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Mortgage Calculator — Free online tool. No signup required.</p>
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
