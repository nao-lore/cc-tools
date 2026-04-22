import NumberBaseConverter from "./components/NumberBaseConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              #
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Number Base Converter</h1>
              <p className="text-xs text-gray-500">Binary, Octal, Decimal, Hex & Custom Bases</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <NumberBaseConverter />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Online Number Base Converter</h2>
            <p>
              Convert any integer between numeral systems instantly. Enter a value in any base from 2 (binary)
              to 36 (alphanumeric), and see simultaneous output in binary (base-2), octal (base-8),
              decimal (base-10), hexadecimal (base-16), and a custom base of your choice.
              All conversions run locally in your browser — no data is sent to a server.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Use</h2>
            <p>
              Select the input base from the dropdown (or leave it at decimal), then type your number.
              The four standard outputs update instantly. Use the custom base field to see the value in
              any base from 2 to 36. Click the copy button next to any output to copy it to your clipboard.
              The bit-length indicator shows how many bits are required to represent the value (8, 16, 32, or 64 bits).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Common Use Cases</h2>
            <p>
              Programmers use hexadecimal for memory addresses, color codes, and byte values.
              Binary is essential for bitwise operations and understanding CPU instructions.
              Octal appears in Unix file permissions (chmod 755). Base-36 is often used for
              compact URL slugs and identifiers. This tool covers all of these in one place.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Bit-Length Reference</h2>
            <p>
              An 8-bit (1-byte) integer can hold values 0–255. A 16-bit integer covers 0–65,535.
              A 32-bit integer covers 0–4,294,967,295, and 64-bit extends to 18,446,744,073,709,551,615.
              The bit-length display highlights which bucket your current value falls into.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Number Base Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">All Developer Tools</a>
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
