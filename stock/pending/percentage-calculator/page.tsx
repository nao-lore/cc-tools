import PercentageCalculator from "./components/PercentageCalculator";

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
              <h1 className="text-xl font-bold text-gray-900">Percentage Calculator</h1>
              <p className="text-xs text-gray-500">X% of Y · X is what % of Y · Percent change</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <PercentageCalculator />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Online Percentage Calculator</h2>
            <p>
              This calculator covers the three most common percentage problems: finding X% of a number,
              determining what percentage one number is of another, and calculating the percent change
              between two values. All calculations happen instantly in your browser with step-by-step
              explanations shown.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Calculate Percentages</h2>
            <p>
              A percentage is a ratio expressed as a fraction of 100. To find X% of Y, multiply Y by
              (X / 100). To find what percent X is of Y, divide X by Y and multiply by 100.
              Percent change measures the relative difference between an old and new value:
              ((new − old) / |old|) × 100. Negative results indicate a decrease.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Percent Change with Negatives</h2>
            <p>
              When the original value is negative, percent change is calculated using the absolute value
              of the original (|old|) to ensure the direction (increase vs. decrease) is correct.
              For example, going from −50 to −25 is a 50% increase, not a decrease, because the value
              moved closer to zero.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Common Percentage Examples</h2>
            <p>
              25% of 200 = 50. 15% of 80 = 12. 50 is 25% of 200. A price rising from $80 to $100 is a
              25% increase. A score dropping from 90 to 72 is a 20% decrease. These calculations apply
              to discounts, tax, tips, grade changes, population growth, and financial returns.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Percentage Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://unit-converter-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
              <a href="https://number-base-converter-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Number Base Converter</a>
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
