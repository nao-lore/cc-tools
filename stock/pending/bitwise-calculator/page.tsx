import BitwiseCalculator from "./components/BitwiseCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Bitwise Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Perform AND, OR, XOR, NOT, and bit shift operations on integers.
            View results in decimal, hex, and binary with visual bit diagrams.
          </p>
        </div>

        {/* Tool */}
        <BitwiseCalculator />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are Bitwise Operations?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Bitwise operations work directly on the individual bits of integer
            values rather than on their numeric meaning. Each bit in the first
            operand is paired with the corresponding bit in the second operand
            and the chosen logic gate is applied. The result is a new integer
            whose bits reflect the outcome of each gate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            AND, OR, XOR — Truth Tables
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>AND (&amp;)</strong> outputs 1 only when both input bits are
            1. It is most commonly used as a bitmask to isolate specific bits —
            for example, <code>value &amp; 0xFF</code> extracts the lowest byte.
            <strong> OR (|)</strong> outputs 1 when at least one input bit is 1,
            making it ideal for setting (turning on) individual flags in a
            bitfield. <strong>XOR (^)</strong> outputs 1 when the two input bits
            differ, which makes it useful for toggling bits and detecting
            differences between two values.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            NOT (~) — Bitwise Complement
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The NOT operator flips every bit in its operand. In a 32-bit signed
            integer, <code>~n</code> is equivalent to <code>-(n + 1)</code>
            because of two's-complement representation. For example,{" "}
            <code>~0</code> gives <code>-1</code> (all 32 bits set to 1) and{" "}
            <code>~1</code> gives <code>-2</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Left Shift (&lt;&lt;) and Right Shift (&gt;&gt;)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Left shift (&lt;&lt;)</strong> moves all bits toward the
            most-significant position by the specified number of places, filling
            vacated positions with zeros. Each step doubles the value, so{" "}
            <code>1 &lt;&lt; n</code> equals 2<sup>n</sup>. This is a very fast
            way to multiply by powers of two.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Right shift (&gt;&gt;)</strong> moves bits toward the
            least-significant position. In most languages this is an
            <em> arithmetic</em> right shift that preserves the sign bit, so
            negative numbers stay negative. Shifting right by <em>n</em> is
            equivalent to dividing by 2<sup>n</sup> and truncating toward
            negative infinity.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases in Programming
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Feature flags &amp; permissions</strong> — store multiple
              boolean flags in a single integer and test or toggle them with
              AND / OR / XOR.
            </li>
            <li>
              <strong>Color manipulation</strong> — extract R, G, B channels
              from a packed 32-bit RGBA value using masks and shifts.
            </li>
            <li>
              <strong>Networking</strong> — apply subnet masks with AND to
              determine the network portion of an IP address.
            </li>
            <li>
              <strong>Hash functions &amp; checksums</strong> — XOR and shifts
              are fundamental building blocks of fast non-cryptographic hash
              algorithms.
            </li>
            <li>
              <strong>Low-level hardware access</strong> — read and write
              individual control bits in memory-mapped device registers.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Bitwise Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://binary-converter-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Binary Converter</a>
              <a href="https://ip-calculator-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">IP Subnet Calculator</a>
              <a href="https://chmod-calculator-gules.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod Calculator</a>
              <a href="https://base64-tools-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="https://hash-generator-coral.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
