import CurrencyFormatter from "./components/CurrencyFormatter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              $
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Currency Format Previewer</h1>
              <p className="text-xs text-gray-500">See how amounts format across 15+ currencies and locales</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <CurrencyFormatter />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Global Currency Formatting with Intl.NumberFormat</h2>
            <p>
              Currency formatting varies significantly across countries. The US formats dollars as $1,234.56 while Germany formats
              euros as 1.234,56 €, Japan uses ¥1,235 without decimals, and India groups digits as ₹12,34,567.89.
              This tool uses the browser-native <code className="bg-gray-100 px-1 rounded font-mono">Intl.NumberFormat</code> API
              to show exactly how your amount renders in each locale — the same result your users see in their browser.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Symbol Position: Prefix vs. Suffix</h2>
            <p>
              One of the most visible formatting differences is where the currency symbol appears.
              English-speaking countries (USD, GBP, CAD, AUD) typically prefix the symbol: $1,234.
              Most European and Asian currencies place the symbol after the number: 1.234 € or 1 234 ₽.
              This tool groups currencies by symbol position so you can compare at a glance.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Decimal and Thousands Separators</h2>
            <p>
              The US and UK use a period (.) as decimal separator and comma (,) as thousands separator.
              Germany, France, Brazil and many other countries do the opposite — comma for decimals, period or space for thousands.
              Switzerland uses an apostrophe. This matters for parsing: "1.000" means one thousand in Germany but one in the US.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Zero-Decimal Currencies</h2>
            <p>
              JPY (Japanese Yen) and KRW (Korean Won) are zero-decimal currencies — they have no fractional units.
              Intl.NumberFormat automatically omits decimals for these currencies regardless of the input value.
              This is important for payment processing: charging ¥1234 means 1234 yen, not 12.34 yen.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Currency Format Previewer — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://number-formatter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Number Formatter</a>
              <a href="https://unit-converter-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
              <a href="https://percentage-calculator-teal.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Percentage Calculator</a>
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
