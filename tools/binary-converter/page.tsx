import BinaryConverter from "./components/BinaryConverter";

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
            Binary Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert between binary, decimal, hexadecimal, and octal in
            real-time. Type in any field and all others update instantly.
          </p>
        </div>

        {/* Converter Tool */}
        <BinaryConverter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Number Base?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A number base (or radix) determines how many unique digits are used
            to represent numbers. The most common bases in computing are binary
            (base 2), octal (base 8), decimal (base 10), and hexadecimal (base
            16). Each base has specific use cases in programming, networking,
            and digital electronics.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Binary (Base 2)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Binary uses only two digits: 0 and 1. It is the fundamental
            language of computers. Every piece of data in a computer is
            ultimately represented as a sequence of binary digits (bits). Each
            bit position represents a power of 2, from right to left: 1, 2, 4,
            8, 16, 32, and so on.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hexadecimal (Base 16)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Hexadecimal uses digits 0-9 and letters A-F. It is commonly used in
            programming to represent memory addresses, color codes (like
            #FF5733), and byte values. Each hex digit maps exactly to 4 binary
            bits, making it a compact way to write binary data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Octal (Base 8)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Octal uses digits 0-7. It is used in Unix/Linux file permissions
            (like chmod 755) and some legacy computing systems. Each octal digit
            represents exactly 3 binary bits.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Convert Between Number Bases
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Binary to Decimal:</strong> Multiply each bit by its
              positional power of 2, then sum the results. For example,
              1010 = 1&times;8 + 0&times;4 + 1&times;2 + 0&times;1 = 10.
            </li>
            <li>
              <strong>Decimal to Binary:</strong> Repeatedly divide by 2 and
              record the remainders from bottom to top.
            </li>
            <li>
              <strong>Binary to Hex:</strong> Group binary digits in sets of 4
              from right to left, then convert each group to its hex equivalent.
            </li>
            <li>
              <strong>Binary to Octal:</strong> Group binary digits in sets of 3
              from right to left, then convert each group.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Two&apos;s Complement
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Two&apos;s complement is the standard method for representing
            negative numbers in binary. To find the two&apos;s complement of a
            number, invert all the bits and add 1. For example, -5 in 8-bit
            two&apos;s complement is 11111011. This tool automatically shows
            two&apos;s complement representation when you enter a negative
            number.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Debugging memory addresses and register values in low-level
              programming.
            </li>
            <li>
              Understanding bit manipulation operations (AND, OR, XOR, shifts).
            </li>
            <li>
              Working with network subnets and IP address calculations.
            </li>
            <li>
              Converting color codes between hex and RGB values.
            </li>
            <li>
              Setting Unix file permissions using octal notation.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Binary Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/epoch-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
              <a href="/chmod-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod Calculator</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/color-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Converter</a>
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Binary Converter",
  "description": "Convert between binary, decimal, hexadecimal, and octal in\n            real-time. Type in any field and all others update instantly.",
  "url": "https://tools.loresync.dev/binary-converter",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
