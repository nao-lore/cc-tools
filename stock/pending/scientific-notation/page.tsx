import ScientificNotation from "./components/ScientificNotation";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              ×
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Scientific Notation Converter</h1>
              <p className="text-xs text-gray-500">Standard · Scientific · Engineering · E-notation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ScientificNotation />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Online Scientific Notation Converter</h2>
            <p>
              Enter any number — whether typed as a decimal (0.000602), with an E (6.02e23), or using the
              × symbol (6.02×10²³) — and instantly see all four representations: standard decimal, scientific
              notation, engineering notation, and E-notation. All conversions run locally in your browser —
              no data is sent to a server.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Notation Formats Explained</h2>
            <p>
              <strong>Scientific notation</strong> expresses a number as a coefficient between 1 and 10
              multiplied by a power of 10 (e.g. 1.23×10⁵).{" "}
              <strong>Engineering notation</strong> restricts the exponent to multiples of 3, aligning with
              SI prefixes like kilo (10³), mega (10⁶), and nano (10⁻⁹).{" "}
              <strong>E-notation</strong> (1.23E+5) is the computer-friendly ASCII version used in
              spreadsheets, programming languages, and scientific calculators.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Significant Figures</h2>
            <p>
              Significant figures (sig figs) indicate the precision of a measurement. The tool counts and
              displays the number of significant figures in your input so you can verify precision at a
              glance. Leading zeros are never significant; trailing zeros after a decimal point always are.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Common Use Cases</h2>
            <p>
              Avogadro&apos;s number (6.022×10²³), the speed of light (2.998×10⁸ m/s), Planck&apos;s
              constant (6.626×10⁻³⁴ J·s), and nanometer wavelengths (5.5×10⁻⁷ m) are all handled with
              full precision. Ideal for chemistry, physics, astronomy, and engineering calculations.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Scientific Notation Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">All Math & Science Tools</a>
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
