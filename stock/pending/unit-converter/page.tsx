import UnitConverter from "./components/UnitConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              ⇄
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Unit Converter</h1>
              <p className="text-xs text-gray-500">Length, Weight, Temperature, Volume, Area, Speed, Data Size & Time</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <UnitConverter />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Online Unit Converter</h2>
            <p>
              This unit converter supports 8 categories and dozens of units: length (mm, cm, m, km, inches, feet, yards, miles),
              weight (mg, g, kg, pounds, ounces, metric tons), temperature (Celsius, Fahrenheit, Kelvin),
              volume (ml, liters, gallons, quarts, pints, cups), area, speed, data size, and time.
              All conversions happen instantly in your browser — no server required.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Use</h2>
            <p>
              Select a category from the tabs at the top, then choose your source and target units from the dropdowns.
              Type a value in either field — both inputs are bidirectional, so you can enter from either side.
              Hit the swap button to reverse the conversion direction. The Quick Reference table below the converter
              shows your input value converted to all other units in the category at once.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Temperature Conversions</h2>
            <p>
              Unlike most unit categories, temperature conversions are not purely multiplicative — they require an offset.
              This tool correctly handles Celsius ↔ Fahrenheit (°F = °C × 9/5 + 32) and Kelvin (K = °C + 273.15).
              Absolute zero is −273.15 °C / −459.67 °F / 0 K.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Data Size Units</h2>
            <p>
              Data size conversions use binary prefixes (1 KB = 1,024 bytes, 1 MB = 1,048,576 bytes) as is standard in computing.
              Supported units range from bytes (B) up to petabytes (PB), covering everyday storage needs for files,
              databases, and network throughput calculations.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Unit Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://epoch-converter-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
              <a href="https://timezone-converter-rouge-two.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
              <a href="https://cron-generator-beryl.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Cron Generator</a>
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
